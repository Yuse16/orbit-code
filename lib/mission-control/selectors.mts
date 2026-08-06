import type { MissionState, ProviderConnection } from './types.mts'

export interface MissionHeaderSummary {
  project: string
  projectPath: string
  git: string
  framework: string
  operatingSystem: string
  provider: string
  status: {
    label: string
    tone: 'success' | 'warning' | 'danger' | 'primary'
  }
}

export function getActiveProvider(state: MissionState): ProviderConnection | null {
  const id = state.providers.primaryProviderId
  return id ? state.providers.providers.find((provider) => provider.id === id) ?? null : null
}

/** Datos compactos para superficies de UI; conserva el estado completo en MissionStore. */
export function getMissionHeaderSummary(state: MissionState): MissionHeaderSummary {
  const activeProvider = getActiveProvider(state)

  if (state.build.status === 'failed' || state.localhost.status === 'error') {
    return createHeaderSummary(state, activeProvider, 'Requiere atención', 'danger')
  }
  if (state.build.status === 'running' || state.localhost.status === 'starting' || state.agents.activeCount > 0) {
    return createHeaderSummary(state, activeProvider, 'En progreso', 'primary')
  }
  if (state.git.pendingChanges > 0 || state.git.status === 'changes-pending') {
    return createHeaderSummary(state, activeProvider, 'Cambios pendientes', 'warning')
  }
  return createHeaderSummary(state, activeProvider, 'Listo', 'success')
}

function createHeaderSummary(
  state: MissionState,
  activeProvider: ProviderConnection | null,
  label: MissionHeaderSummary['status']['label'],
  tone: MissionHeaderSummary['status']['tone'],
): MissionHeaderSummary {
  return {
    project: state.project.name,
    projectPath: state.project.path,
    git: state.git.branch,
    framework: state.project.framework,
    operatingSystem: state.desktop.platformLabel,
    provider: activeProvider?.label ?? 'Sin proveedor',
    status: { label, tone },
  }
}
