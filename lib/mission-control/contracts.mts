import type { DesktopClient } from './desktop-client.mts'
import type {
  AgentRole,
  AgentStatus,
  BuildStatus,
  GitState,
  LocalhostStatus,
  MissionGuidance,
  NotificationLevel,
  ProjectDescriptor,
  ProjectStage,
  ProviderConnectionStatus,
  ProviderId,
} from './types.mts'

export interface ProjectService {
  open(project: ProjectDescriptor): void
  close(): void
}

export interface GitService {
  updateStatus(git: Partial<GitState>): void
}

export interface LocalhostService {
  start(url: string, port: number): void
  stop(reason?: string): void
  setStatus(status: LocalhostStatus, error?: string | null): void
}

export interface ProviderService {
  connect(providerId: ProviderId, detail?: string): void
  disconnect(providerId: ProviderId, detail?: string): void
  setStatus(providerId: ProviderId, status: ProviderConnectionStatus, detail?: string): void
  activate(primaryProviderId: ProviderId | null, secondaryProviderId?: ProviderId | null): void
}

export interface AgentService {
  start(agentId: AgentRole, taskId: string, activity: string): void
  finish(agentId: AgentRole, status: Extract<AgentStatus, 'completed' | 'failed'>, activity: string): void
}

export interface DesktopService {
  readonly client: DesktopClient
  detect(): void
}

export interface MemoryService {
  save(): void
}

export interface TaskService {
  setStage(stage: ProjectStage): void
  complete(taskId: string): void
}

export interface BuildService {
  start(command: string): void
  finish(status: Extract<BuildStatus, 'succeeded' | 'failed'>, error?: string): void
}

export interface NotificationService {
  raise(level: NotificationLevel, message: string): void
}

export interface MissionServices {
  project: ProjectService
  git: GitService
  localhost: LocalhostService
  providers: ProviderService
  agents: AgentService
  desktop: DesktopService
  memory: MemoryService
  tasks: TaskService
  build: BuildService
  notifications: NotificationService
}

export interface MissionControl {
  readonly events: import('./event-bus.mts').EventBus
  readonly store: import('./store.mts').MissionStore
  readonly services: MissionServices
  dispose(): void
}

export interface MissionControlOptions {
  desktopClient?: DesktopClient
  now?: () => string
  guidance?: MissionGuidance
}
