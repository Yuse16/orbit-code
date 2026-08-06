import { KernelEventBus } from './event-bus.mts'
import type { KernelLifecycleStatus } from './types.mts'

/** Emite transiciones de ciclo de vida; no inicia recursos del sistema. */
export class KernelLifecycle {
  private status: KernelLifecycleStatus = 'stopped'
  private readonly events: KernelEventBus
  private readonly now: () => string

  constructor(events: KernelEventBus, now: () => string) {
    this.events = events
    this.now = now
  }

  getStatus(): KernelLifecycleStatus {
    return this.status
  }

  start(): void {
    if (this.status === 'running') return
    this.status = 'starting'
    this.events.emit('KernelStarted', { startedAt: this.now() })
    this.status = 'running'
  }

  stop(): void {
    if (this.status === 'stopped') return
    this.status = 'stopping'
    this.events.emit('KernelStopped', { stoppedAt: this.now() })
    this.status = 'stopped'
  }
}
