import { KernelEventBus } from './event-bus.mts'

/** Canal explícito de salud para que los consumidores no inspeccionen módulos. */
export class KernelHealth {
  private readonly events: KernelEventBus

  constructor(events: KernelEventBus) {
    this.events = events
  }

  healthy(message = 'Kernel listo (simulado).'): void {
    this.events.emit('KernelHealthy', { message })
  }

  warn(message: string): void {
    this.events.emit('KernelWarning', { message })
  }

  error(message: string): void {
    this.events.emit('KernelError', { message })
  }
}
