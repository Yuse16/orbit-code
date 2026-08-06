export type RuntimeLifecycleStatus = 'stopped' | 'starting' | 'running' | 'stopping'

export type RuntimeHealthStatus = 'healthy' | 'warning' | 'error' | 'initializing' | 'stopped'

export type AdapterLifecycleStatus = 'stopped' | 'initializing' | 'running' | 'stopping' | 'error'

export type RuntimeAdapterId =
  | 'desktop'
  | 'git'
  | 'localhost'
  | 'terminal'
  | 'filesystem'
  | 'providers'
  | 'sqlite'
  | 'docker'
  | 'mcp'
  | 'github'
  | 'vercel'
  | 'supabase'
  | 'browser'
  | 'workspace'

export interface RuntimeCapabilityDescriptor {
  id: string
  name: string
  available: boolean
  reason: string
}

export interface RuntimeAdapterSnapshot {
  id: RuntimeAdapterId
  name: string
  status: AdapterLifecycleStatus
  health: RuntimeHealthStatus
  startedAt: string | null
  message: string
  capabilities: ReadonlyArray<RuntimeCapabilityDescriptor>
}

export interface RuntimeCapabilities {
  items: ReadonlyArray<RuntimeCapabilityDescriptor>
  availableCount: number
  totalCount: number
  updatedAt: string | null
}

export interface RuntimeContext {
  readonly lifecycle: RuntimeLifecycleStatus
  readonly health: RuntimeHealthStatus
  readonly healthMessage: string
  readonly startedAt: string | null
  readonly adapters: ReadonlyArray<RuntimeAdapterSnapshot>
  readonly environment: 'simulated'
}
