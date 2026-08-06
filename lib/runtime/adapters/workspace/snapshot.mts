export type WorkspaceDetectionValue = string

/** Perfil tecnológico del proyecto abierto, generado por WorkspaceDiscovery. */
export interface WorkspaceSnapshot {
  projectName: string
  root: string
  framework: WorkspaceDetectionValue
  language: WorkspaceDetectionValue
  packageManager: WorkspaceDetectionValue
  buildSystem: WorkspaceDetectionValue
  frontend: WorkspaceDetectionValue
  backend: WorkspaceDetectionValue
  desktop: WorkspaceDetectionValue
  database: WorkspaceDetectionValue
  testing: WorkspaceDetectionValue
  lint: WorkspaceDetectionValue
  formatter: WorkspaceDetectionValue
  deployment: WorkspaceDetectionValue
  monorepo: WorkspaceDetectionValue
  detectedFiles: ReadonlyArray<string>
  confidence: number
  timestamp: string
}

/** Valores por defecto para un proyecto sin señales detectadas. */
export const UNKNOWN = 'unknown'
export const NONE = 'none'

export function createEmptyWorkspaceSnapshot(
  options: Partial<WorkspaceSnapshot> & Pick<WorkspaceSnapshot, 'root'> = { root: '' },
): WorkspaceSnapshot {
  return {
    projectName: '',
    framework: UNKNOWN,
    language: UNKNOWN,
    packageManager: UNKNOWN,
    buildSystem: UNKNOWN,
    frontend: NONE,
    backend: NONE,
    desktop: NONE,
    database: NONE,
    testing: NONE,
    lint: NONE,
    formatter: NONE,
    deployment: NONE,
    monorepo: NONE,
    detectedFiles: [],
    confidence: 0,
    timestamp: '',
    ...options,
    root: options.root,
  }
}

export function isWorkspaceSnapshot(value: unknown): value is WorkspaceSnapshot {
  if (!value || typeof value !== 'object') return false
  const snapshot = value as Record<string, unknown>
  return (
    typeof snapshot.projectName === 'string' &&
    typeof snapshot.root === 'string' &&
    typeof snapshot.framework === 'string' &&
    typeof snapshot.language === 'string' &&
    typeof snapshot.packageManager === 'string' &&
    typeof snapshot.buildSystem === 'string' &&
    typeof snapshot.frontend === 'string' &&
    typeof snapshot.backend === 'string' &&
    typeof snapshot.desktop === 'string' &&
    typeof snapshot.database === 'string' &&
    typeof snapshot.testing === 'string' &&
    typeof snapshot.lint === 'string' &&
    typeof snapshot.formatter === 'string' &&
    typeof snapshot.deployment === 'string' &&
    typeof snapshot.monorepo === 'string' &&
    Array.isArray(snapshot.detectedFiles) &&
    typeof snapshot.confidence === 'number' &&
    typeof snapshot.timestamp === 'string'
  )
}
