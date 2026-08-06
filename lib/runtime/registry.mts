import type { RuntimeAdapter } from './adapter.mts'
import type { RuntimeEventBus } from './event-bus.mts'
import type { RuntimeAdapterId, RuntimeAdapterSnapshot } from './types.mts'

/** Registro explícito de adaptadores; no usa reflexión ni descubrimiento. */
export class RuntimeRegistry {
  private readonly adapters = new Map<RuntimeAdapterId, RuntimeAdapter>()
  private readonly events: RuntimeEventBus

  constructor(events: RuntimeEventBus) {
    this.events = events
  }

  register(adapter: RuntimeAdapter): void {
    if (this.adapters.has(adapter.id)) return
    this.adapters.set(adapter.id, adapter)
    this.events.emit('AdapterRegistered', { adapterId: adapter.id })
  }

  get(id: RuntimeAdapterId): RuntimeAdapter | undefined {
    return this.adapters.get(id)
  }

  has(id: RuntimeAdapterId): boolean {
    return this.adapters.has(id)
  }

  list(): ReadonlyArray<RuntimeAdapter> {
    return [...this.adapters.values()]
  }

  snapshots(): ReadonlyArray<RuntimeAdapterSnapshot> {
    return this.list().map((adapter) => adapter.status())
  }
}
