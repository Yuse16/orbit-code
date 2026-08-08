import type {
  AgentRole,
  BuildStatus,
  GitState,
  HostPlatform,
  LocalhostStatus,
  MissionGuidance,
  NotificationLevel,
  PermissionRequest,
  ProjectDescriptor,
  ProjectStage,
  ProviderConnectionStatus,
  ProviderId,
} from './types.mts'

export interface MissionEventMap {
  ProjectOpened: { project: ProjectDescriptor; openedAt: string }
  ProjectClosed: Record<string, never>
  GitStatusChanged: { git: Partial<GitState> }
  LocalhostStarted: { url: string; port: number }
  LocalhostStopped: { reason?: string }
  LocalhostStatusChanged: { status: LocalhostStatus; error?: string | null }
  ProviderConnected: { providerId: ProviderId; detail?: string }
  ProviderDisconnected: { providerId: ProviderId; detail?: string }
  ProviderStatusChanged: {
    providerId: ProviderId
    status: ProviderConnectionStatus
    detail?: string
  }
  ProviderActivated: { primaryProviderId: ProviderId | null; secondaryProviderId?: ProviderId | null }
  AgentStarted: { agentId: AgentRole; taskId: string; activity: string }
  AgentFinished: { agentId: AgentRole; status: 'completed' | 'failed'; activity: string }
  BuildStarted: { command: string; startedAt: string }
  BuildFinished: { status: Extract<BuildStatus, 'succeeded' | 'failed'>; finishedAt: string; error?: string }
  TaskCompleted: { taskId: string }
  StageChanged: { stage: ProjectStage }
  MemorySaved: { savedAt: string }
  DesktopDetected: { platform: HostPlatform; platformLabel: string; appVersion: string }
  GuidanceChanged: { guidance: MissionGuidance }
  NotificationRaised: { level: NotificationLevel; message: string; createdAt: string }
  PermissionRequested: PermissionRequest
}

export type MissionEventType = keyof MissionEventMap

export type MissionEvent = {
  [Type in MissionEventType]: {
    type: Type
    payload: MissionEventMap[Type]
  }
}[MissionEventType]
