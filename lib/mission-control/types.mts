export type ProjectStage =
  | 'exploracion'
  | 'diseno'
  | 'implementacion'
  | 'correccion'
  | 'pruebas'
  | 'publicacion'
  | 'auditoria'

export type HostPlatform = 'macos' | 'windows' | 'linux'
export type LocalhostStatus = 'stopped' | 'starting' | 'active' | 'error'
export type BuildStatus = 'idle' | 'running' | 'succeeded' | 'failed'
export type GitWorktreeStatus = 'clean' | 'changes-pending' | 'conflicted'
export type ProviderConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error'
export type AgentStatus = 'idle' | 'working' | 'completed' | 'failed'
export type NotificationLevel = 'info' | 'success' | 'warning' | 'error'

export type ProviderId =
  | 'chatgpt'
  | 'codex'
  | 'opencode'
  | 'openrouter'
  | 'claude'
  | 'gemini'
  | 'v0'
  | 'builder'
  | 'figma'
  | 'local-model'

export type AgentRole =
  | 'director'
  | 'constructor'
  | 'investigador'
  | 'verificador'
  | 'documentador'

export interface ProjectDescriptor {
  id: string
  name: string
  path: string
  framework: string
}

export interface ProjectState extends ProjectDescriptor {
  status: 'open' | 'closed'
  openedAt: string | null
}

export interface GitState {
  branch: string
  worktree: string
  status: GitWorktreeStatus
  pendingChanges: number
  lastSummary: string
}

export interface LocalhostState {
  status: LocalhostStatus
  url: string | null
  port: number | null
  error: string | null
}

export interface ProviderConnection {
  id: ProviderId
  label: string
  status: ProviderConnectionStatus
  detail: string
}

export interface ProviderState {
  providers: ProviderConnection[]
  primaryProviderId: ProviderId | null
  secondaryProviderId: ProviderId | null
}

export interface AgentSnapshot {
  id: AgentRole
  label: string
  status: AgentStatus
  activity: string
  taskId: string | null
}

export interface AgentState {
  agents: AgentSnapshot[]
  activeCount: number
}

export interface MemoryState {
  status: 'idle' | 'saving' | 'saved' | 'error'
  lastSavedAt: string | null
  summaryAvailable: boolean
}

export interface TaskSnapshot {
  id: string
  title: string
  status: 'pending' | 'active' | 'completed' | 'blocked'
}

export interface TaskState {
  currentStage: ProjectStage
  currentTaskId: string | null
  tasks: TaskSnapshot[]
}

export interface DesktopState {
  platform: HostPlatform
  platformLabel: string
  appVersion: string
  windowLabel: string
}

export interface BuildState {
  status: BuildStatus
  command: string | null
  startedAt: string | null
  finishedAt: string | null
  error: string | null
}

export interface MissionNotification {
  id: string
  level: NotificationLevel
  message: string
  createdAt: string
}

export interface NotificationState {
  items: MissionNotification[]
  unreadCount: number
}

export interface MissionGuidance {
  recommendedAction: string
  risks: string[]
  warnings: string[]
  pending: string[]
}

export interface MissionState {
  project: ProjectState
  recentProjects: ProjectDescriptor[]
  git: GitState
  localhost: LocalhostState
  providers: ProviderState
  agents: AgentState
  memory: MemoryState
  tasks: TaskState
  desktop: DesktopState
  build: BuildState
  notifications: NotificationState
  guidance: MissionGuidance
}

export const PROVIDER_CATALOG: ReadonlyArray<Pick<ProviderConnection, 'id' | 'label'>> = [
  { id: 'chatgpt', label: 'ChatGPT' },
  { id: 'codex', label: 'Codex' },
  { id: 'opencode', label: 'OpenCode' },
  { id: 'openrouter', label: 'OpenRouter' },
  { id: 'claude', label: 'Claude' },
  { id: 'gemini', label: 'Gemini' },
  { id: 'v0', label: 'v0' },
  { id: 'builder', label: 'Builder.io' },
  { id: 'figma', label: 'Figma' },
  { id: 'local-model', label: 'Modelo local' },
]

export const AGENT_CATALOG: ReadonlyArray<Pick<AgentSnapshot, 'id' | 'label'>> = [
  { id: 'director', label: 'Director' },
  { id: 'constructor', label: 'Constructor' },
  { id: 'investigador', label: 'Investigador' },
  { id: 'verificador', label: 'Verificador' },
  { id: 'documentador', label: 'Documentador' },
]
