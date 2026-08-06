import type { DecisionPolicyId } from './types.mts'
import type { ModelRecommendation, PlannedTask } from './types.mts'
import type { DecisionReason } from './decision-reason.mts'

/**
 * Único output del Director. Describe qué hacer y con qué recursos, pero
 * nunca ejecuta nada.
 */
export interface ExecutionPlan {
  id: string
  objective: string
  createdAt: string
  policy: DecisionPolicyId
  recommendedModels: ReadonlyArray<ModelRecommendation>
  recommendedAdapters: ReadonlyArray<string>
  requiredCapabilities: ReadonlyArray<string>
  estimatedTokens: number
  estimatedCost: number
  estimatedTimeMinutes: number
  approvalRequired: boolean
  parallelTasks: ReadonlyArray<PlannedTask>
  sequentialTasks: ReadonlyArray<PlannedTask>
  fallbackPlan: string
  confidence: number
  reasoningSummary: ReadonlyArray<string>
  reasons: ReadonlyArray<DecisionReason>
}

export function createExecutionPlan(
  options: Partial<ExecutionPlan> & Pick<ExecutionPlan, 'objective'>,
): ExecutionPlan {
  return {
    id: '',
    createdAt: '',
    policy: 'balanced',
    recommendedModels: [],
    recommendedAdapters: [],
    requiredCapabilities: [],
    estimatedTokens: 0,
    estimatedCost: 0,
    estimatedTimeMinutes: 0,
    approvalRequired: false,
    parallelTasks: [],
    sequentialTasks: [],
    fallbackPlan: '',
    confidence: 0,
    reasoningSummary: [],
    reasons: [],
    ...options,
    objective: options.objective,
  }
}

export function isExecutionPlan(value: unknown): value is ExecutionPlan {
  if (!value || typeof value !== 'object') return false
  const plan = value as Record<string, unknown>
  return (
    typeof plan.id === 'string' &&
    typeof plan.objective === 'string' &&
    typeof plan.estimatedTokens === 'number' &&
    typeof plan.estimatedCost === 'number' &&
    typeof plan.estimatedTimeMinutes === 'number' &&
    typeof plan.approvalRequired === 'boolean' &&
    typeof plan.confidence === 'number' &&
    Array.isArray(plan.recommendedModels) &&
    Array.isArray(plan.recommendedAdapters) &&
    Array.isArray(plan.requiredCapabilities) &&
    Array.isArray(plan.parallelTasks) &&
    Array.isArray(plan.sequentialTasks)
  )
}
