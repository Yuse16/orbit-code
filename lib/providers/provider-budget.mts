import type { BudgetEstimate, BudgetInput, ModelInfo, ProviderPolicyConstraints } from './types.mts'

/**
 * Presupuesto simulado. Solo estimaciones deterministas a partir del
 * catálogo y de la política activa; nunca consume ni consulta APIs reales.
 */
export class ProviderBudget {
  /**
   * Estima el coste/consumo de una tarea sin ejecutarla.
   * @param input      tokens de entrada/salida estimados.
   * @param model      modelo a cotizar; si falta, se usa un modelo genérico.
   * @param policy     restricciones de la política activa.
   * @param credits    créditos disponibles (null = sin créditos aplicables).
   */
  estimate(
    input: BudgetInput,
    model: ModelInfo | null,
    policy: ProviderPolicyConstraints,
    credits: number | null,
  ): BudgetEstimate {
    const inputTokens = Math.max(0, input.inputTokens)
    const outputTokens = Math.max(0, input.outputTokens ?? 0)
    const pricing = model?.pricing
    const estimatedCost = pricing
      ? round((pricing.per1kInput * inputTokens) / 1000 + (pricing.per1kOutput * outputTokens) / 1000)
      : 0
    const estimatedCredits = pricing
      ? round((pricing.creditsPer1kInput * inputTokens) / 1000)
      : 0
    const estimatedTokens = inputTokens + outputTokens
    const remainingBudget = credits === null ? Infinity : Math.max(0, credits - estimatedCredits)
    const approvalRequired = policy.requireApproval && estimatedCost >= policy.approvalThreshold

    return {
      estimatedCost,
      estimatedCredits,
      estimatedTokens,
      remainingBudget,
      approvalRequired,
    }
  }
}

function round(value: number): number {
  return Math.round(value * 10000) / 10000
}
