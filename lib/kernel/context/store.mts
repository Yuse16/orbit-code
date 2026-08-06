import type { KernelContextEventBus } from './event-bus.mts'
import {
  createInitialCapabilitiesState,
  createInitialDnaState,
  createInitialHealthState,
  createInitialMemoryState,
  createInitialMissionContextState,
  createInitialNotificationState,
  createInitialProviderState,
  createInitialRuntimeState,
  createInitialSchedulerState,
  createInitialSystemState,
  createInitialWorkspaceState,
} from './states.mts'
import type {
  KernelContextListener,
  KernelDomainId,
  KernelDomainState,
  KernelSnapshot,
  KernelState,
} from './types.mts'

/**
 * Guarda el estado por dominio y genera snapshots versionados.
 * Los Publishers solo escriben su propio dominio aquí.
 */
export class KernelContextStore {
  private readonly domains = new Map<KernelDomainId, KernelDomainState>()
  private readonly listeners = new Set<KernelContextListener>()
  private readonly events: KernelContextEventBus
  private readonly now: () => string
  private version = 0
  private cachedSnapshot: KernelSnapshot | null = null
  private cachedVersion = -1

  constructor(events: KernelContextEventBus, now: () => string) {
    this.events = events
    this.now = now
  }

  register<D extends KernelDomainId>(domain: D, initialState: KernelState[D]): void {
    if (this.domains.has(domain)) return
    this.domains.set(domain, initialState)
    this.cachedSnapshot = null
    this.events.emit('PublisherRegistered', { domain, registeredAt: this.now() })
  }

  publish<D extends KernelDomainId>(domain: D, state: KernelState[D]): void {
    this.domains.set(domain, state)
    this.events.emit('PublisherUpdated', { domain, updatedAt: this.now() })
    this.afterChange([domain])
  }

  update<D extends KernelDomainId>(domain: D, changes: Partial<KernelState[D]>): void {
    const current = this.readDomain(domain)
    if (!current) return
    this.domains.set(domain, { ...current, ...changes })
    this.events.emit('PublisherUpdated', { domain, updatedAt: this.now() })
    this.afterChange([domain])
  }

  remove(domain: KernelDomainId): void {
    if (!this.domains.has(domain)) return
    this.domains.delete(domain)
    this.events.emit('PublisherRemoved', { domain, removedAt: this.now() })
    this.afterChange([domain])
  }

  read<D extends KernelDomainId>(domain: D): KernelState[D] | undefined {
    return this.readDomain(domain)
  }

  getVersion(): number {
    return this.version
  }

  getSnapshot(): KernelSnapshot {
    if (this.cachedSnapshot && this.cachedVersion === this.version) {
      return this.cachedSnapshot
    }
    const snapshot: KernelSnapshot = {
      runtime: this.readDomain('runtime') ?? createInitialRuntimeState(),
      system: this.readDomain('system') ?? createInitialSystemState(),
      mission: this.readDomain('mission') ?? createInitialMissionContextState(),
      scheduler: this.readDomain('scheduler') ?? createInitialSchedulerState(),
      workspace: this.readDomain('workspace') ?? createInitialWorkspaceState(),
      providers: this.readDomain('providers') ?? createInitialProviderState(),
      memory: this.readDomain('memory') ?? createInitialMemoryState(),
      notifications: this.readDomain('notifications') ?? createInitialNotificationState(),
      capabilities: this.readDomain('capabilities') ?? createInitialCapabilitiesState(),
      health: this.readDomain('health') ?? createInitialHealthState(),
      dna: this.readDomain('dna') ?? createInitialDnaState(),
      timestamp: this.now(),
      version: this.version,
    }
    this.cachedSnapshot = snapshot
    this.cachedVersion = this.version
    return snapshot
  }

  subscribe(listener: KernelContextListener): () => void {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  dispose(): void {
    this.listeners.clear()
  }

  private readDomain<D extends KernelDomainId>(domain: D): KernelState[D] | undefined {
    return this.domains.get(domain) as KernelState[D] | undefined
  }

  private afterChange(changedDomains: ReadonlyArray<KernelDomainId>): void {
    const created = this.version === 0
    this.version += 1
    const snapshot = this.getSnapshot()
    if (created) {
      this.events.emit('SnapshotCreated', { snapshot, version: this.version })
    } else {
      this.events.emit('SnapshotUpdated', { snapshot, version: this.version, changedDomains })
    }
    this.events.emit('ContextChanged', { version: this.version, changedDomains })
    this.listeners.forEach((listener) => listener())
  }
}
