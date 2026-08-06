import type { RuntimeAdapter, RuntimeAdapterHost } from './adapter.mts'
import { createAdapterHost } from './adapter.mts'
import { createDefaultAdapters } from './adapters.mts'
import { RuntimeEventBus } from './event-bus.mts'
import { RuntimeHealth } from './health.mts'
import { RuntimeRegistry } from './registry.mts'
import type { RuntimeCapabilities, RuntimeContext, RuntimeLifecycleStatus } from './types.mts'

export interface RuntimeOptions {
  adapters?: ReadonlyArray<RuntimeAdapter>
  events?: RuntimeEventBus
  now?: () => string
}

/**
 * Única capa autorizada para hablar con el SO (simulada).
 * Expone únicamente RuntimeRegistry; los consumidores nunca ven adaptadores concretos.
 */
export class Runtime {
  readonly events: RuntimeEventBus
  readonly registry: RuntimeRegistry
  readonly health: RuntimeHealth
  private readonly adapters: ReadonlyArray<RuntimeAdapter>
  private readonly now: () => string
  private lifecycle: RuntimeLifecycleStatus = 'stopped'
  private startedAt: string | null = null

  constructor(options: RuntimeOptions = {}) {
    this.events = options.events ?? new RuntimeEventBus()
    this.now = options.now ?? (() => new Date().toISOString())
    const host: RuntimeAdapterHost = createAdapterHost(this.events, this.now)
    this.adapters = options.adapters ?? createDefaultAdapters(host)
    this.health = new RuntimeHealth(this.events)
    this.registry = new RuntimeRegistry(this.events)
    this.adapters.forEach((adapter) => this.registry.register(adapter))
  }

  getSnapshot = (): RuntimeContext => ({
    lifecycle: this.lifecycle,
    health: this.health.getStatus(),
    healthMessage: this.health.getMessage(),
    startedAt: this.startedAt,
    adapters: this.registry.snapshots(),
    environment: 'simulated',
  })

  getCapabilities = (): RuntimeCapabilities => {
    const items = this.registry.list().flatMap((adapter) => adapter.status().capabilities)
    return {
      items,
      availableCount: items.filter((capability) => capability.available).length,
      totalCount: items.length,
      updatedAt: this.startedAt,
    }
  }

  start(): void {
    if (this.lifecycle === 'running') return
    this.lifecycle = 'starting'
    this.adapters.forEach((adapter) => adapter.start())
    this.lifecycle = 'running'
    this.startedAt = this.now()
    this.events.emit('RuntimeStarted', { startedAt: this.startedAt })
    this.health.refresh(this.registry.snapshots())
  }

  stop(): void {
    if (this.lifecycle === 'stopped') return
    this.lifecycle = 'stopping'
    this.adapters.forEach((adapter) => adapter.stop())
    this.lifecycle = 'stopped'
    this.events.emit('RuntimeStopped', { stoppedAt: this.now() })
    this.health.refresh(this.registry.snapshots())
  }

  dispose(): void {
    this.stop()
    this.adapters.forEach((adapter) => adapter.dispose())
  }
}

export function createDefaultRuntime(options: Omit<RuntimeOptions, 'adapters'> = {}): Runtime {
  return new Runtime(options)
}
