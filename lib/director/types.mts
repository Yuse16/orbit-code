import type { TaskPriority } from '../kernel/types.mts'
import type { ProjectStage } from '../mission-control/types.mts'

export type DirectorTaskKind =
  | 'frontend'
  | 'backend'
  | 'database'
  | 'refactor'
  | 'explanation'
  | 'repetitive'
  | 'documentation'
  | 'tests'
  | 'generic'

export type DirectorComplexity = 'low' | 'medium' | 'high' | 'complex'

export type DirectorModelId =
  | 'v0'
  | 'codex'
  | 'opencode'
  | 'chatgpt'
  | 'claude'
  | 'gemini'
  | 'local-model'

export type DecisionPolicyId =
  | 'minimum-cost'
  | 'maximum-quality'
  | 'balanced'
  | 'offline'
  | 'fast'
  | 'safe'

export interface DirectorRequest {
  objective: string
  kind?: DirectorTaskKind
  complexity?: DirectorComplexity
  policy?: DecisionPolicyId
  allowParallel?: boolean
}

export interface PlannedTask {
  id: string
  title: string
  kind: DirectorTaskKind
  stage: ProjectStage
  priority: TaskPriority
  dependencies: ReadonlyArray<string>
  rationale: string
}

export interface ModelRecommendation {
  taskId: string
  taskTitle: string
  kind: DirectorTaskKind
  model: DirectorModelId
  reason: string
}
