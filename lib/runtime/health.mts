import type { RuntimeEventBus } from './event-bus.mts'
import type { RuntimeAdapterSnapshot, RuntimeHealthStatus } from './types.mts'

export interface HealthAggregation {
  status: RuntimeHealthStatus
  message: string
}

const statusRank: Record<RuntimeHealthStatus, number> = {
  error: 0,
  warning: 1,
  initializing: 2,
  healthy: 3,
  stopped: 4,
}

/** Agrega la salud de los adaptadores y emite HealthChanged en cada cambio. */
export class RuntimeHealth {
  private status: RuntimeHealthStatus = 'stopped'
  private message = 'Runtime detenido.'
  private readonly events: RuntimeEventBus

  constructor(events: RuntimeEventBus) {
    this.events = events
  }

  getStatus(): RuntimeHealthStatus {
    return this.status
  }

  getMessage(): string {
    return this.message
  }

  refresh(adapters: ReadonlyArray<RuntimeAdapterSnapshot>): void {
    const next = aggregateAdapterHealth(adapters)
    if (next.status === this.status && next.message === this.message) return
    this.status = next.status
    this.message = next.message
    this.events.emit('HealthChanged', { status: next.status, message: next.message })
  }
}

export function aggregateAdapterHealth(
  adapters: ReadonlyArray<RuntimeAdapterSnapshot>,
): HealthAggregation {
  if (adapters.length === 0) return { status: 'stopped', message: 'Runtime detenido.' }
  const healths = adapters.map((adapter) => adapter.health)
  const order = (status: RuntimeHealthStatus) => statusRank[status] ?? statusRank.stopped
  const worst = [...healths].sort((left, right) => order(left) - order(right))[0]

  switch (worst) {
    case 'error':
      return {
        status: 'error',
        message: `Runtime en error: ${adapters.filter((a) => a.health === 'error').map((a) => a.name).join(', ')}.`,
      }
    case 'warning':
      return {
        status: 'warning',
        message: `Runtime con advertencias: ${adapters.filter((a) => a.health === 'warning').map((a) => a.name).join(', ')}.`,
      }
    case 'initializing':
      return { status: 'initializing', message: 'Runtime inicializando adaptadores.' }
    case 'healthy':
      return { status: 'healthy', message: 'Runtime listo: todos los adaptadores operativos (simulado).' }
    default:
      return { status: 'stopped', message: 'Runtime detenido.' }
  }
}
