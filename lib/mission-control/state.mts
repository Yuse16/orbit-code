import type { MissionEvent } from './events.mts'
import {
  AGENT_CATALOG,
  PROVIDER_CATALOG,
  type AgentSnapshot,
  type MissionState,
  type ProjectDescriptor,
  type ProviderConnection,
} from './types.mts'

const initialGuidance = {
  recommendedAction: 'Revisar el proyecto antes de iniciar una tarea.',
  risks: [],
  warnings: [],
  pending: ['Seleccionar una acción para continuar.'],
}

const MAX_RECENT_PROJECTS = 5

export function createInitialMissionState(): MissionState {
  return {
    project: {
      id: 'no-project',
      name: 'Sin proyecto abierto',
      path: '—',
      framework: 'No detectado',
      status: 'closed',
      openedAt: null,
    },
    recentProjects: [],
    git: {
      branch: '—',
      worktree: '—',
      status: 'clean',
      pendingChanges: 0,
      lastSummary: 'Sin repositorio abierto',
    },
    localhost: { status: 'stopped', url: null, port: null, error: null },
    providers: {
      providers: PROVIDER_CATALOG.map((provider) => ({
        ...provider,
        status: 'disconnected',
        detail: 'No conectado',
      })),
      primaryProviderId: null,
      secondaryProviderId: null,
    },
    agents: {
      agents: AGENT_CATALOG.map((agent) => ({
        ...agent,
        status: 'idle',
        activity: 'En espera',
        taskId: null,
      })),
      activeCount: 0,
    },
    memory: { status: 'idle', lastSavedAt: null, summaryAvailable: false },
    tasks: { currentStage: 'exploracion', currentTaskId: null, tasks: [] },
    desktop: {
      platform: 'macos',
      platformLabel: 'macOS',
      appVersion: '0.2.0',
      windowLabel: 'main',
    },
    build: { status: 'idle', command: null, startedAt: null, finishedAt: null, error: null },
    notifications: { items: [], unreadCount: 0 },
    guidance: initialGuidance,
  }
}

function updateRecentProjects(
  projects: ProjectDescriptor[],
  project: ProjectDescriptor,
): ProjectDescriptor[] {
  return [project, ...projects.filter((candidate) => candidate.id !== project.id)].slice(
    0,
    MAX_RECENT_PROJECTS,
  )
}

function updateProvider(
  providers: ProviderConnection[],
  providerId: ProviderConnection['id'],
  update: Partial<ProviderConnection>,
): ProviderConnection[] {
  return providers.map((provider) =>
    provider.id === providerId ? { ...provider, ...update } : provider,
  )
}

function updateAgent(
  agents: AgentSnapshot[],
  agentId: AgentSnapshot['id'],
  update: Partial<AgentSnapshot>,
): AgentSnapshot[] {
  return agents.map((agent) => (agent.id === agentId ? { ...agent, ...update } : agent))
}

function countActiveAgents(agents: AgentSnapshot[]): number {
  return agents.filter((agent) => agent.status === 'working').length
}

export function reduceMissionState(state: MissionState, event: MissionEvent): MissionState {
  switch (event.type) {
    case 'ProjectOpened':
      return {
        ...state,
        project: { ...event.payload.project, status: 'open', openedAt: event.payload.openedAt },
        recentProjects: updateRecentProjects(state.recentProjects, event.payload.project),
      }
    case 'ProjectClosed':
      return { ...state, project: createInitialMissionState().project }
    case 'GitStatusChanged':
      return { ...state, git: { ...state.git, ...event.payload.git } }
    case 'LocalhostStarted':
      return {
        ...state,
        localhost: { status: 'active', url: event.payload.url, port: event.payload.port, error: null },
      }
    case 'LocalhostStopped':
      return {
        ...state,
        localhost: { status: 'stopped', url: null, port: null, error: event.payload.reason ?? null },
      }
    case 'LocalhostStatusChanged':
      return {
        ...state,
        localhost: { ...state.localhost, status: event.payload.status, error: event.payload.error ?? null },
      }
    case 'ProviderConnected':
      return {
        ...state,
        providers: {
          ...state.providers,
          providers: updateProvider(state.providers.providers, event.payload.providerId, {
            status: 'connected',
            detail: event.payload.detail ?? 'Conectado',
          }),
        },
      }
    case 'ProviderDisconnected':
      return {
        ...state,
        providers: {
          ...state.providers,
          providers: updateProvider(state.providers.providers, event.payload.providerId, {
            status: 'disconnected',
            detail: event.payload.detail ?? 'Desconectado',
          }),
          primaryProviderId:
            state.providers.primaryProviderId === event.payload.providerId
              ? null
              : state.providers.primaryProviderId,
          secondaryProviderId:
            state.providers.secondaryProviderId === event.payload.providerId
              ? null
              : state.providers.secondaryProviderId,
        },
      }
    case 'ProviderStatusChanged':
      return {
        ...state,
        providers: {
          ...state.providers,
          providers: updateProvider(state.providers.providers, event.payload.providerId, {
            status: event.payload.status,
            detail: event.payload.detail ?? state.providers.providers.find((item) => item.id === event.payload.providerId)?.detail ?? '',
          }),
        },
      }
    case 'ProviderActivated':
      return {
        ...state,
        providers: {
          ...state.providers,
          primaryProviderId: event.payload.primaryProviderId,
          secondaryProviderId: event.payload.secondaryProviderId ?? state.providers.secondaryProviderId,
        },
      }
    case 'AgentStarted': {
      const agents = updateAgent(state.agents.agents, event.payload.agentId, {
        status: 'working',
        activity: event.payload.activity,
        taskId: event.payload.taskId,
      })
      return { ...state, agents: { agents, activeCount: countActiveAgents(agents) } }
    }
    case 'AgentFinished': {
      const agents = updateAgent(state.agents.agents, event.payload.agentId, {
        status: event.payload.status,
        activity: event.payload.activity,
        taskId: null,
      })
      return { ...state, agents: { agents, activeCount: countActiveAgents(agents) } }
    }
    case 'BuildStarted':
      return {
        ...state,
        build: {
          status: 'running',
          command: event.payload.command,
          startedAt: event.payload.startedAt,
          finishedAt: null,
          error: null,
        },
      }
    case 'BuildFinished':
      return {
        ...state,
        build: {
          ...state.build,
          status: event.payload.status,
          finishedAt: event.payload.finishedAt,
          error: event.payload.error ?? null,
        },
      }
    case 'TaskCompleted':
      return {
        ...state,
        tasks: {
          ...state.tasks,
          currentTaskId:
            state.tasks.currentTaskId === event.payload.taskId ? null : state.tasks.currentTaskId,
          tasks: state.tasks.tasks.map((task) =>
            task.id === event.payload.taskId ? { ...task, status: 'completed' } : task,
          ),
        },
      }
    case 'StageChanged':
      return { ...state, tasks: { ...state.tasks, currentStage: event.payload.stage } }
    case 'MemorySaved':
      return {
        ...state,
        memory: { status: 'saved', lastSavedAt: event.payload.savedAt, summaryAvailable: true },
      }
    case 'DesktopDetected':
      return {
        ...state,
        desktop: {
          ...state.desktop,
          platform: event.payload.platform,
          platformLabel: event.payload.platformLabel,
          appVersion: event.payload.appVersion,
        },
      }
    case 'GuidanceChanged':
      return { ...state, guidance: event.payload.guidance }
    case 'NotificationRaised': {
      const items = [...state.notifications.items, { id: `notice-${event.payload.createdAt}`, ...event.payload }].slice(-20)
      return {
        ...state,
        notifications: { items, unreadCount: state.notifications.unreadCount + 1 },
      }
    }
  }
}
