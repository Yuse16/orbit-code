import { KernelContextEventBus } from './event-bus.mts'
import { KernelContextReader } from './reader.mts'
import { KernelContextStore } from './store.mts'
import type { KernelContextListener, KernelDomainId, KernelSnapshot, KernelState } from './types.mts'

/**
 * Fachada pública de la fuente de verdad unificada de Orbit.
 * Es el único lugar donde puede leerse el estado de los subsistemas.
 */
export class KernelContext {
  readonly events: KernelContextEventBus
  private readonly store: KernelContextStore
  private readonly now: () => string

  constructor(now: () => string = () => new Date().toISOString()) {
    this.now = now
    this.events = new KernelContextEventBus()
    this.store = new KernelContextStore(this.events, now)
  }

  register<D extends KernelDomainId>(domain: D, initialState: KernelState[D]): void {
    this.store.register(domain, initialState)
  }

  publish<D extends KernelDomainId>(domain: D, state: KernelState[D]): void {
    this.store.publish(domain, state)
  }

  update<D extends KernelDomainId>(domain: D, changes: Partial<KernelState[D]>): void {
    this.store.update(domain, changes)
  }

  remove(domain: KernelDomainId): void {
    this.store.remove(domain)
  }

  read<D extends KernelDomainId>(domain: D): KernelState[D] | undefined {
    return this.store.read(domain)
  }

  getSnapshot(): KernelSnapshot {
    return this.store.getSnapshot()
  }

  getVersion(): number {
    return this.store.getVersion()
  }

  subscribe(listener: KernelContextListener): () => void {
    return this.store.subscribe(listener)
  }

  createReader(): KernelContextReader {
    return new KernelContextReader(this)
  }

  dispose(): void {
    this.store.dispose()
  }
}
