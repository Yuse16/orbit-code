import type { DesktopClient } from './desktop-client.mts'
import type { EventBus } from './event-bus.mts'
import type {
  BuildService,
  DesktopService,
  GitService,
  LocalhostService,
  MemoryService,
  NotificationService,
  ProjectService,
  ProviderService,
  AgentService,
  TaskService,
  MissionServices,
} from './contracts.mts'

export function createMockServices(
  events: EventBus,
  desktopClient: DesktopClient,
  now: () => string = () => new Date().toISOString(),
): MissionServices {
  const project: ProjectService = {
    open: (project) => events.emit('ProjectOpened', { project, openedAt: now() }),
    close: () => events.emit('ProjectClosed', {}),
  }

  const git: GitService = {
    updateStatus: (git) => events.emit('GitStatusChanged', { git }),
  }

  const localhost: LocalhostService = {
    start: (url, port) => events.emit('LocalhostStarted', { url, port }),
    stop: (reason) => events.emit('LocalhostStopped', { reason }),
    setStatus: (status, error) => events.emit('LocalhostStatusChanged', { status, error }),
  }

  const providers: ProviderService = {
    connect: (providerId, detail) => events.emit('ProviderConnected', { providerId, detail }),
    disconnect: (providerId, detail) => events.emit('ProviderDisconnected', { providerId, detail }),
    setStatus: (providerId, status, detail) =>
      events.emit('ProviderStatusChanged', { providerId, status, detail }),
    activate: (primaryProviderId, secondaryProviderId) =>
      events.emit('ProviderActivated', { primaryProviderId, secondaryProviderId }),
  }

  const agents: AgentService = {
    start: (agentId, taskId, activity) => events.emit('AgentStarted', { agentId, taskId, activity }),
    finish: (agentId, status, activity) => events.emit('AgentFinished', { agentId, status, activity }),
  }

  const desktop: DesktopService = {
    client: desktopClient,
    detect: () => events.emit('DesktopDetected', desktopClient.getSnapshot()),
  }

  const memory: MemoryService = {
    save: () => events.emit('MemorySaved', { savedAt: now() }),
  }

  const tasks: TaskService = {
    setStage: (stage) => events.emit('StageChanged', { stage }),
    complete: (taskId) => events.emit('TaskCompleted', { taskId }),
  }

  const build: BuildService = {
    start: (command) => events.emit('BuildStarted', { command, startedAt: now() }),
    finish: (status, error) => events.emit('BuildFinished', { status, finishedAt: now(), error }),
  }

  const notifications: NotificationService = {
    raise: (level, message) => events.emit('NotificationRaised', { level, message, createdAt: now() }),
  }

  return {
    project,
    git,
    localhost,
    providers,
    agents,
    desktop,
    memory,
    tasks,
    build,
    notifications,
  }
}
