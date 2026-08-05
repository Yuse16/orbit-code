import { CapabilityRegistry } from './capability-registry.mts'
import { KernelEventBus } from './event-bus.mts'
import { eventToHealth, type KernelEvent } from './events.mts'
import { KernelHealth } from './kernel-health.mts'
import { KernelLifecycle } from './kernel-lifecycle.mts'
import { KernelRegistry } from './kernel-registry.mts'
import { Scheduler } from './scheduler.mts'
import { createKernelMissionRuntime, type KernelMissionRuntime } from './mission-runtime.mts'
import type { DesktopClient } from '../mission-control/desktop-client.mts'
import type {
  GitState,
  MissionGuidance,
  ProjectDescriptor,
  ProjectStage,
  ProviderId,
} from '../mission-control/types.mts'
import type { KernelContext, KernelState, OrbitDNA } from './types.mts'

export type KernelStateListener = () => void

const initialState = (): KernelState => ({
  lifecycle: 'stopped',
  health: 'unknown',
  healthMessage: 'Kernel no iniciado.',
  capabilities: { items: [], lastDiscoveryAt: null },
  scheduler: { status: 'stopped', queue: [] },
  dna: null,
  modules: [],
})

/** Coordinador absoluto de módulos simulados, independiente de React. */
export class Kernel {
  readonly events: KernelEventBus
  readonly capabilities: CapabilityRegistry
  readonly scheduler: Scheduler
  readonly lifecycle: KernelLifecycle
  readonly health: KernelHealth
  readonly registry: KernelRegistry
  private readonly mission: KernelMissionRuntime
  private state: KernelState
  private startedAt: string | null = null
  private readonly listeners = new Set<KernelStateListener>()
  private readonly stopObserving: () => void
  private readonly now: () => string

  constructor(
    now: () => string = () => new Date().toISOString(),
    options: { desktopClient?: DesktopClient; guidance?: MissionGuidance } = {},
  ) {
    this.now = now
    this.events = new KernelEventBus()
    this.capabilities = new CapabilityRegistry(this.events)
    this.scheduler = new Scheduler(this.events)
    this.lifecycle = new KernelLifecycle(this.events, now)
    this.health = new KernelHealth(this.events)
    this.registry = new KernelRegistry()
    this.mission = createKernelMissionRuntime({ ...options, now })
    ;(['capabilities', 'scheduler', 'dna', 'mission-control'] as const).forEach((module) =>
      this.registry.register(module),
    )
    this.state = {
      ...initialState(),
      capabilities: { items: this.capabilities.list(), lastDiscoveryAt: null },
      modules: this.registry.list(),
    }
    this.stopObserving = this.events.onAny((event) => this.apply(event))
  }

  getSnapshot = (): KernelState => this.state

  getContext = (): KernelContext => ({
    state: this.state,
    startedAt: this.startedAt,
    environment: 'simulated',
  })

  getMissionStore = () => this.mission.store

  openProject(project: ProjectDescriptor): void {
    this.mission.services.project.open(project)
  }

  updateGitStatus(git: Partial<GitState>): void {
    this.mission.services.git.updateStatus(git)
  }

  setStage(stage: ProjectStage): void {
    this.mission.services.tasks.setStage(stage)
  }

  activateProvider(primaryProviderId: ProviderId | null, secondaryProviderId?: ProviderId | null): void {
    this.mission.services.providers.activate(primaryProviderId, secondaryProviderId)
  }

  connectProvider(providerId: ProviderId, detail?: string): void {
    this.mission.services.providers.connect(providerId, detail)
  }

  disconnectProvider(providerId: ProviderId, detail?: string): void {
    this.mission.services.providers.disconnect(providerId, detail)
  }

  subscribe = (listener: KernelStateListener): (() => void) => {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  start(): void {
    this.mission.services.desktop.detect()
    this.lifecycle.start()
    this.registry.setStatus('capabilities', 'started')
    this.registry.setStatus('dna', 'started')
    this.registry.setStatus('mission-control', 'started')
    this.scheduler.start()
    this.refreshModules()
    this.health.healthy()
  }

  stop(): void {
    this.scheduler.stop()
    this.registry.setStatus('scheduler', 'stopped')
    this.registry.setStatus('capabilities', 'stopped')
    this.registry.setStatus('dna', 'stopped')
    this.registry.setStatus('mission-control', 'stopped')
    this.refreshModules()
    this.lifecycle.stop()
  }

  loadDNA(dna: OrbitDNA): void {
    this.events.emit('DNALoaded', { dna })
  }

  dispose(): void {
    this.stop()
    this.mission.dispose()
    this.stopObserving()
    this.listeners.clear()
  }

  private apply(event: KernelEvent): void {
    let next = this.state
    switch (event.type) {
      case 'KernelStarted':
        this.startedAt = event.payload.startedAt
        next = { ...next, lifecycle: 'running' }
        break
      case 'KernelStopped':
        next = { ...next, lifecycle: 'stopped' }
        break
      case 'CapabilityRegistered':
      case 'CapabilityChanged':
        next = {
          ...next,
          capabilities: { items: this.capabilities.list(), lastDiscoveryAt: this.now() },
        }
        break
      case 'SchedulerStarted':
        this.registry.setStatus('scheduler', 'started')
        next = { ...next, scheduler: { ...next.scheduler, status: 'running' } }
        break
      case 'SchedulerStopped':
        next = { ...next, scheduler: { ...next.scheduler, status: 'stopped' } }
        break
      case 'SchedulerTaskQueued':
      case 'SchedulerTaskChanged':
        next = { ...next, scheduler: { ...next.scheduler, queue: this.scheduler.list() } }
        break
      case 'DNALoaded':
        next = { ...next, dna: event.payload.dna }
        break
      default: {
        const health = eventToHealth[event.type]
        if (health && 'message' in event.payload) {
          next = { ...next, health, healthMessage: event.payload.message }
        }
      }
    }
    if (next === this.state) return
    this.state = next
    this.listeners.forEach((listener) => listener())
  }

  private refreshModules(): void {
    this.state = { ...this.state, modules: this.registry.list() }
    this.listeners.forEach((listener) => listener())
  }
}
