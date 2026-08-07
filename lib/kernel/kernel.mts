import { CapabilityRegistry } from './capability-registry.mts'
import { KernelEventBus } from './event-bus.mts'
import { eventToHealth, type KernelEvent } from './events.mts'
import { KernelHealth } from './kernel-health.mts'
import { KernelLifecycle } from './kernel-lifecycle.mts'
import { KernelRegistry } from './kernel-registry.mts'
import { Scheduler } from './scheduler.mts'
import { createKernelMissionRuntime, type KernelMissionRuntime } from './mission-runtime.mts'
import type { Runtime } from '../runtime/runtime.mts'
import type { RuntimeRegistry } from '../runtime/registry.mts'
import type { WorkspaceAdapter } from '../runtime/adapters/workspace/index.mts'
import type { ProcessManager, ProcessRecord } from '../runtime/process-manager.mts'
import type { DesktopSystemAdapter } from '../runtime/adapters/system/index.mts'
import type { DesktopClient } from '../mission-control/desktop-client.mts'
import type {
  GitState,
  MissionGuidance,
  ProjectDescriptor,
  ProjectStage,
  ProviderId,
} from '../mission-control/types.mts'
import type { KernelContext as LegacyKernelContext, KernelState, OrbitDNA } from './types.mts'
import { KernelContext } from './context/context.mts'
import type { KernelSnapshot } from './context/types.mts'
import type { WorkspaceContextState } from './context/types.mts'
import { KernelContextReader } from './context/reader.mts'
import { KernelContextPublisher } from './context/publisher.mts'
import {
  CapabilityPublisher,
  HealthPublisher,
  MemoryPublisher,
  MissionPublisher,
  NotificationPublisher,
  ProviderPublisher,
  RuntimePublisher,
  SchedulerPublisher,
  SystemPublisher,
  WorkspacePublisher,
} from './context/publishers.mts'
import { createInitialDnaState } from './context/states.mts'
import {
  toCapabilitiesContextState,
  toMissionContextState,
  toRuntimeContextState,
  toSchedulerContextState,
  toWorkspaceContextState,
  toWorkspaceContextStateFromDna,
} from './context/mappers.mts'

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
  private readonly runtime: Runtime | null
  private readonly context: KernelContext
  private readonly runtimePublisher: RuntimePublisher
  private readonly systemPublisher: SystemPublisher
  private readonly missionPublisher: MissionPublisher
  private readonly schedulerPublisher: SchedulerPublisher
  private readonly capabilityPublisher: CapabilityPublisher
  private readonly providerPublisher: ProviderPublisher
  private readonly memoryPublisher: MemoryPublisher
  private readonly notificationPublisher: NotificationPublisher
  private readonly workspacePublisher: WorkspacePublisher
  private readonly healthPublisher: HealthPublisher
  private readonly dnaPublisher: KernelContextPublisher<'dna'>
  private readonly workspaceAdapter: WorkspaceAdapter | null
  private workspaceState: WorkspaceContextState | null = null
  private readonly stopContextPublishing: () => void
  private readonly stopMissionContext: () => void
  private stopRuntimeContext: (() => void) | null = null
  private state: KernelState
  private startedAt: string | null = null
  private permissionSequence = 0
  private readonly processManager: ProcessManager | null
  private readonly stopProcessManager: (() => void) | null
  private readonly listeners = new Set<KernelStateListener>()
  private readonly stopObserving: () => void
  private readonly now: () => string

  constructor(
    now: () => string = () => new Date().toISOString(),
    options: {
      desktopClient?: DesktopClient
      guidance?: MissionGuidance
      runtime?: Runtime
      systemAdapter?: DesktopSystemAdapter
      workspaceAdapter?: WorkspaceAdapter
      processManager?: ProcessManager
    } = {},
  ) {
    this.now = now
    this.events = new KernelEventBus()
    this.capabilities = new CapabilityRegistry(this.events)
    this.scheduler = new Scheduler(this.events)
    this.lifecycle = new KernelLifecycle(this.events, now)
    this.health = new KernelHealth(this.events)
    this.registry = new KernelRegistry()
    this.runtime = options.runtime ?? null
    this.processManager = options.processManager ?? null
    this.stopProcessManager = this.processManager
      ? this.processManager.subscribe((process) => {
          this.mission.events.emit('ProcessUpdated', { process })
        })
      : null
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
    this.context = new KernelContext(now)
    this.runtimePublisher = new RuntimePublisher(this.context)
    this.systemPublisher = new SystemPublisher(this.context)
    this.missionPublisher = new MissionPublisher(this.context)
    this.schedulerPublisher = new SchedulerPublisher(this.context)
    this.capabilityPublisher = new CapabilityPublisher(this.context)
    this.providerPublisher = new ProviderPublisher(this.context)
    this.memoryPublisher = new MemoryPublisher(this.context)
    this.notificationPublisher = new NotificationPublisher(this.context)
    this.workspacePublisher = new WorkspacePublisher(this.context)
    this.workspaceAdapter = options.workspaceAdapter ?? null
    if (this.workspaceAdapter) this.workspaceAdapter.connect(this.workspacePublisher)
    if (options.systemAdapter) options.systemAdapter.connect(this.systemPublisher)
    this.healthPublisher = new HealthPublisher(this.context)
    this.dnaPublisher = new KernelContextPublisher<'dna'>(this.context, 'dna', createInitialDnaState())
    this.stopContextPublishing = this.events.onAny((event) => this.publishFromEvent(event))
    this.stopMissionContext = this.mission.store.subscribe(() => this.publishMission())
    const runtime = this.runtime
    if (runtime) {
      this.stopRuntimeContext = runtime.events.onAny(() => {
        this.runtimePublisher.publish(toRuntimeContextState(runtime))
      })
    }
    this.publishInitialContext()
  }

  getSnapshot = (): KernelState => this.state

  getContext = (): LegacyKernelContext => ({
    state: this.state,
    startedAt: this.startedAt,
    environment: 'simulated',
  })

  getKernelContext = (): KernelContext => this.context

  getContextSnapshot = (): KernelSnapshot => this.context.getSnapshot()

  getContextReader = (): KernelContextReader => this.context.createReader()

  getMissionStore = () => this.mission.store

  getRuntimeRegistry = (): RuntimeRegistry | null => this.runtime?.registry ?? null

  openProject(project: ProjectDescriptor): void {
    this.mission.services.project.open(project)
  }

  async openFolder(): Promise<void> {
    const result = await this.mission.services.desktop.client.openFolder()
    if (!result) return
    this.workspaceState = {
      strategy: 'single-project',
      structureDetected: true,
      indexedAt: result.index.indexedAt,
      index: result.index,
    }
    this.openProject({
      id: `workspace:${result.root}`,
      name: result.projectName,
      path: result.root,
      framework: result.stack.framework,
      packageJson: result.packageJson,
    })
    this.workspacePublisher.publish(this.workspaceState)
    await this.refreshGitStatus(result.root)
  }

  async refreshGitStatus(root: string): Promise<void> {
    try {
      const git = await this.mission.services.desktop.client.readGitStatus(root)
      this.updateGitStatus(git)
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      this.updateGitStatus({
        branch: '—',
        worktree: root,
        status: 'clean',
        pendingChanges: 0,
        lastSummary: `Git no disponible: ${message}`,
        changes: [],
      })
    }
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

  requestCommand(command: string, cwd: string): void {
    const trimmed = command.trim()
    if (!trimmed) return
    this.mission.events.emit('PermissionRequested', {
      id: `permission-${++this.permissionSequence}`,
      action: 'run-command',
      command: trimmed,
      cwd,
      status: 'pending',
      createdAt: this.now(),
    })
  }

  async approveCommand(id: string): Promise<ProcessRecord | null> {
    const request = this.mission.store.getSnapshot().permissionRequests.find(
      (candidate) => candidate.id === id,
    )
    if (!request || request.status !== 'pending') return null
    this.mission.events.emit('PermissionResolved', { id, status: 'approved' })
    if (!this.processManager) return null
    return this.processManager.start({ command: request.command, cwd: request.cwd, timeoutMs: 300_000 })
  }

  rejectCommand(id: string): void {
    const request = this.mission.store.getSnapshot().permissionRequests.find(
      (candidate) => candidate.id === id,
    )
    if (!request || request.status !== 'pending') return
    this.mission.events.emit('PermissionResolved', { id, status: 'rejected' })
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
    this.runtime?.start()
    this.refreshModules()
    this.health.healthy()
  }

  stop(): void {
    this.scheduler.stop()
    this.registry.setStatus('scheduler', 'stopped')
    this.registry.setStatus('capabilities', 'stopped')
    this.registry.setStatus('dna', 'stopped')
    this.registry.setStatus('mission-control', 'stopped')
    this.runtime?.stop()
    this.refreshModules()
    this.lifecycle.stop()
  }

  loadDNA(dna: OrbitDNA): void {
    this.events.emit('DNALoaded', { dna })
  }

  dispose(): void {
    this.stop()
    this.mission.dispose()
    this.runtime?.dispose()
    this.stopObserving()
    this.stopContextPublishing()
    this.stopMissionContext()
    this.stopProcessManager?.()
    this.stopRuntimeContext?.()
    this.context.dispose()
    this.listeners.clear()
  }

  private publishInitialContext(): void {
    this.publishMission()
    this.schedulerPublisher.publish(
      toSchedulerContextState(this.scheduler, this.state.scheduler.status),
    )
    this.capabilityPublisher.publish(
      toCapabilitiesContextState(this.capabilities, this.state.capabilities.lastDiscoveryAt),
    )
    this.healthPublisher.publish({ status: 'unknown', message: 'Kernel no iniciado.' })
    const runtime = this.runtime
    if (runtime) this.runtimePublisher.publish(toRuntimeContextState(runtime))
    this.publishWorkspace()
  }

  private publishFromEvent(event: KernelEvent): void {
    switch (event.type) {
      case 'SchedulerStarted':
      case 'SchedulerStopped':
      case 'SchedulerTaskQueued':
      case 'SchedulerTaskChanged':
        this.schedulerPublisher.publish(
          toSchedulerContextState(this.scheduler, this.state.scheduler.status),
        )
        break
      case 'CapabilityRegistered':
      case 'CapabilityChanged':
      case 'CapabilityDiscoveryRequested':
        this.capabilityPublisher.publish(
          toCapabilitiesContextState(this.capabilities, this.state.capabilities.lastDiscoveryAt),
        )
        break
      case 'DNALoaded':
        this.dnaPublisher.update({ dna: event.payload.dna })
        this.publishWorkspace()
        break
      default: {
        const healthStatus = eventToHealth[event.type]
        if (healthStatus && 'message' in event.payload) {
          this.healthPublisher.update({ status: healthStatus, message: event.payload.message })
        }
      }
    }
  }

  private publishMission(): void {
    const mission = this.mission.store.getSnapshot()
    this.missionPublisher.publish(toMissionContextState(mission))
    this.providerPublisher.publish(mission.providers)
    this.memoryPublisher.publish(mission.memory)
    this.notificationPublisher.publish(mission.notifications)
  }

  private publishWorkspace(): void {
    const snapshot = this.workspaceAdapter?.getSnapshot() ?? null
    if (snapshot) {
      this.workspacePublisher.publish(toWorkspaceContextState(snapshot))
      return
    }
    if (this.workspaceState) {
      this.workspacePublisher.publish(this.workspaceState)
      return
    }
    const dna = this.context.read('dna')?.dna ?? null
    this.workspacePublisher.publish(
      toWorkspaceContextStateFromDna(dna, dna ? this.now() : null),
    )
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
