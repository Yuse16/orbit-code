import type { MissionState } from '../../mission-control/types.mts'
import type { Runtime } from '../../runtime/runtime.mts'
import type { CapabilityRegistry } from '../capability-registry.mts'
import type { Scheduler } from '../scheduler.mts'
import type { CapabilityState, OrbitDNA, SchedulerState, SchedulerStatus } from '../types.mts'
import type {
  MissionContextState,
  RuntimeContextState,
  WorkspaceContextState,
} from './types.mts'

/** Proyecciones puras que el Kernel usa para alimentar a los Publishers. */
export function toRuntimeContextState(runtime: Runtime): RuntimeContextState {
  const snapshot = runtime.getSnapshot()
  const capabilities = runtime.getCapabilities()
  return {
    lifecycle: snapshot.lifecycle,
    health: snapshot.health,
    startedAt: snapshot.startedAt,
    adapters: snapshot.adapters,
    availableCapabilities: capabilities.availableCount,
    totalCapabilities: capabilities.totalCount,
  }
}

export function toMissionContextState(state: MissionState): MissionContextState {
  return {
    project: state.project,
    git: state.git,
    localhost: state.localhost,
    agents: state.agents,
    tasks: state.tasks,
    desktop: state.desktop,
    build: state.build,
    guidance: state.guidance,
  }
}

export function toSchedulerContextState(
  scheduler: Scheduler,
  status: SchedulerStatus,
): SchedulerState {
  return { status, queue: scheduler.list() }
}

export function toCapabilitiesContextState(
  registry: CapabilityRegistry,
  lastDiscoveryAt: string | null,
): CapabilityState {
  return { items: registry.list(), lastDiscoveryAt }
}

export function toWorkspaceContextState(
  dna: OrbitDNA | null,
  indexedAt: string | null,
): WorkspaceContextState {
  return {
    strategy: dna?.workspaceStrategy ?? 'sin-configurar',
    structureDetected: Boolean(dna),
    indexedAt,
    index: null,
  }
}
