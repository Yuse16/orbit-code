import type { MissionState } from '../../mission-control/types.mts'
import type { Runtime } from '../../runtime/runtime.mts'
import type { WorkspaceSnapshot } from '../../runtime/adapters/workspace/snapshot.mts'
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

/** Proyección del snapshot del adaptador al dominio `workspace` del KernelContext. */
export function toWorkspaceContextState(snapshot: WorkspaceSnapshot): WorkspaceContextState {
  const structured = snapshot.detectedFiles.length > 0
  return {
    strategy:
      snapshot.monorepo !== 'none'
        ? `monorepo:${snapshot.monorepo}`
        : structured
          ? 'single-project'
          : 'sin-configurar',
    structureDetected: structured,
    indexedAt: snapshot.timestamp || null,
    index: snapshot.index,
  }
}

/** Proyección por defecto del dominio `workspace` cuando no hay adaptador real (DNA). */
export function toWorkspaceContextStateFromDna(
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
