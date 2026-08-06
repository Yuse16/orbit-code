export type KernelLifecycleStatus = 'stopped' | 'starting' | 'running' | 'stopping'
export type KernelHealthStatus = 'unknown' | 'healthy' | 'warning' | 'error'
export type CapabilityStatus = 'unavailable' | 'discovering' | 'available' | 'warning' | 'error'
export type SchedulerStatus = 'stopped' | 'running'
export type ScheduledTaskStatus = 'queued' | 'waiting' | 'ready' | 'running' | 'completed' | 'failed' | 'cancelled'
export type TaskPriority = 'critical' | 'high' | 'normal' | 'low'

export type CapabilityId =
  | 'git'
  | 'desktop'
  | 'node'
  | 'pnpm'
  | 'framework'
  | 'database'
  | 'docker'
  | 'ai'
  | 'preview'
  | 'build'
  | 'deploy'
  | 'testing'
  | 'memory'
  | 'workspace'
  | 'github'
  | 'vercel'
  | 'supabase'
  | 'tauri'
  | 'mcp'
  | 'plugins'
  | 'filesystem'
  | 'shell'

export type KernelModuleId =
  | 'capabilities'
  | 'scheduler'
  | 'dna'
  | 'mission-control'

export interface CapabilityDescriptor {
  id: CapabilityId
  name: string
  status: CapabilityStatus
  version: string | null
  provider: string | null
  available: boolean
  reason: string
  lastCheckedAt: string | null
}

export interface CapabilityState {
  items: ReadonlyArray<CapabilityDescriptor>
  lastDiscoveryAt: string | null
}

export interface OrbitDNA {
  projectName: string
  framework: string
  language: string
  database: string
  preferredAiProvider: string
  deployment: string
  testing: string
  branchStrategy: string
  workspaceStrategy: string
  preferences: Readonly<Record<string, string>>
}

export interface SchedulerTask {
  id: string
  title: string
  priority: TaskPriority
  dependencies: ReadonlyArray<string>
  status: ScheduledTaskStatus
  retryCount: number
  maxRetries: number
  waitReason: string | null
  assignedAgent: KernelAgentRole | null
  cancellationRequested: boolean
}

export interface SchedulerState {
  status: SchedulerStatus
  queue: ReadonlyArray<SchedulerTask>
}

export type KernelAgentRole =
  | 'director'
  | 'constructor'
  | 'investigador'
  | 'verificador'
  | 'documentador'

export interface KernelModuleRegistration {
  id: KernelModuleId
  status: 'registered' | 'started' | 'stopped'
}

export interface KernelState {
  lifecycle: KernelLifecycleStatus
  health: KernelHealthStatus
  healthMessage: string
  capabilities: CapabilityState
  scheduler: SchedulerState
  dna: OrbitDNA | null
  modules: ReadonlyArray<KernelModuleRegistration>
}

export interface KernelContext {
  readonly state: KernelState
  readonly startedAt: string | null
  readonly environment: 'simulated'
}

export const CAPABILITY_CATALOG: ReadonlyArray<Pick<CapabilityDescriptor, 'id' | 'name'>> = [
  { id: 'git', name: 'Git' },
  { id: 'desktop', name: 'Desktop' },
  { id: 'node', name: 'Node' },
  { id: 'pnpm', name: 'pnpm' },
  { id: 'framework', name: 'Framework' },
  { id: 'database', name: 'Database' },
  { id: 'docker', name: 'Docker' },
  { id: 'ai', name: 'AI' },
  { id: 'preview', name: 'Preview' },
  { id: 'build', name: 'Build' },
  { id: 'deploy', name: 'Deploy' },
  { id: 'testing', name: 'Testing' },
  { id: 'memory', name: 'Memory' },
  { id: 'workspace', name: 'Workspace' },
  { id: 'github', name: 'GitHub' },
  { id: 'vercel', name: 'Vercel' },
  { id: 'supabase', name: 'Supabase' },
  { id: 'tauri', name: 'Tauri' },
  { id: 'mcp', name: 'MCP' },
  { id: 'plugins', name: 'Plugins' },
  { id: 'filesystem', name: 'Filesystem' },
  { id: 'shell', name: 'Shell' },
]

export const KERNEL_AGENT_CATALOG: ReadonlyArray<KernelAgentRole> = [
  'director',
  'constructor',
  'investigador',
  'verificador',
  'documentador',
]
