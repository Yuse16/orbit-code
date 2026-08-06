import { KernelEventBus } from './event-bus.mts'
import { CAPABILITY_CATALOG, type CapabilityDescriptor, type CapabilityId } from './types.mts'

const unavailableCapability = (
  capability: Pick<CapabilityDescriptor, 'id' | 'name'>,
): CapabilityDescriptor => ({
  ...capability,
  status: 'unavailable',
  version: null,
  provider: null,
  available: false,
  reason: 'Aún no descubierto: arquitectura simulada.',
  lastCheckedAt: null,
})

/** Registro declarativo; la detección real se añadirá mediante adaptadores. */
export class CapabilityRegistry {
  private readonly capabilities = new Map<CapabilityId, CapabilityDescriptor>()
  private readonly events: KernelEventBus

  constructor(events: KernelEventBus) {
    this.events = events
    CAPABILITY_CATALOG.forEach((capability) => this.register(unavailableCapability(capability)))
  }

  list(): ReadonlyArray<CapabilityDescriptor> {
    return CAPABILITY_CATALOG.map(({ id }) => this.capabilities.get(id)!).filter(Boolean)
  }

  get(id: CapabilityId): CapabilityDescriptor | undefined {
    return this.capabilities.get(id)
  }

  register(capability: CapabilityDescriptor): void {
    const exists = this.capabilities.has(capability.id)
    this.capabilities.set(capability.id, capability)
    this.events.emit(exists ? 'CapabilityChanged' : 'CapabilityRegistered', { capability })
  }

  update(id: CapabilityId, changes: Partial<Omit<CapabilityDescriptor, 'id' | 'name'>>): void {
    const current = this.capabilities.get(id)
    if (!current) return
    this.register({ ...current, ...changes })
  }

  requestDiscovery(id: CapabilityId): void {
    this.events.emit('CapabilityDiscoveryRequested', { capabilityId: id })
    this.update(id, { status: 'discovering', reason: 'Descubrimiento simulado pendiente.' })
  }
}
