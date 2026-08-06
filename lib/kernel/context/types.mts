import type {
  AgentState,
  BuildState,
  DesktopState,
  GitState,
  LocalhostState,
  MemoryState,
  MissionGuidance,
  NotificationState,
  ProjectState,
  ProviderState,
  TaskState,
} from '../../mission-control/types.mts'
import type {
  RuntimeAdapterSnapshot,
  RuntimeHealthStatus,
  RuntimeLifecycleStatus,
} from '../../runtime/types.mts'
import type { SystemInfo } from '../../runtime/adapters/system/index.mts'
import type { WorkspaceIndexSnapshot } from '../../runtime/adapters/workspace/indexer.mts'
import type {
  CapabilityState,
  KernelHealthStatus,
  OrbitDNA,
  SchedulerState,
} from '../types.mts'

export type KernelDomainId =
  | 'runtime'
  | 'system'
  | 'mission'
  | 'scheduler'
  | 'workspace'
  | 'providers'
  | 'memory'
  | 'notifications'
  | 'capabilities'
  | 'health'
  | 'dna'

export interface RuntimeContextState {
  lifecycle: RuntimeLifecycleStatus
  health: RuntimeHealthStatus
  startedAt: string | null
  adapters: ReadonlyArray<RuntimeAdapterSnapshot>
  availableCapabilities: number
  totalCapabilities: number
}

export type SystemContextState = SystemInfo

export interface MissionContextState {
  project: ProjectState
  git: GitState
  localhost: LocalhostState
  agents: AgentState
  tasks: TaskState
  desktop: DesktopState
  build: BuildState
  guidance: MissionGuidance
}

export interface WorkspaceContextState {
  strategy: string
  structureDetected: boolean
  indexedAt: string | null
  /** Índice de archivos del workspace publicado por el adaptador real. */
  index: WorkspaceIndexSnapshot | null
}

export interface HealthContextState {
  status: KernelHealthStatus
  message: string
}

export interface DnaContextState {
  dna: OrbitDNA | null
}

/** Registro dominio -> estado: la fuente de verdad unificada de Orbit. */
export interface KernelState {
  runtime: RuntimeContextState
  system: SystemContextState
  mission: MissionContextState
  scheduler: SchedulerState
  workspace: WorkspaceContextState
  providers: ProviderState
  memory: MemoryState
  notifications: NotificationState
  capabilities: CapabilityState
  health: HealthContextState
  dna: DnaContextState
}

export interface KernelSnapshot extends KernelState {
  timestamp: string
  version: number
}

export type KernelDomainState = KernelState[KernelDomainId]

export type KernelContextListener = () => void
