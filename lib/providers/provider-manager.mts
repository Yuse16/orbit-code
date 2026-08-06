import { MODEL_CATALOG, getModelInfo, getModelsByProvider } from './model-catalog.mts'
import { ProviderBudget } from './provider-budget.mts'
import { ProviderHealth } from './provider-health.mts'
import { getProviderPolicy } from './provider-policy.mts'
import { ProviderRegistry } from './provider-registry.mts'
import { ProviderSession } from './provider-session.mts'
import type {
  BudgetEstimate,
  BudgetInput,
  ModelId,
  ModelInfo,
  ProviderHealthSummary,
  ProviderId,
  ProviderManagerReadModel,
  ProviderPolicy,
  ProviderPolicyId,
  ProviderSessionSnapshot,
  ProviderSnapshot,
} from './types.mts'

/**
 * Fachada del Provider Manager. Todo es simulado. Expone operaciones de
 * escritura para la UI y un read model de solo lectura para el Director.
 */
export class ProviderManager {
  private readonly registry = new ProviderRegistry()
  private readonly sessions = new ProviderSession()
  private readonly budget = new ProviderBudget()
  private readonly health = new ProviderHealth()
  private policyId: ProviderPolicyId = 'balanced'

  // ---- Política ----

  setPolicy(id: ProviderPolicyId): void {
    this.policyId = id
  }

  policy(): ProviderPolicy {
    return getProviderPolicy(this.policyId)
  }

  // ---- Cuentas ----

  listProviders(): ReadonlyArray<ProviderSnapshot> {
    return this.registry.listSnapshots()
  }

  getProvider(id: ProviderId): ProviderSnapshot | null {
    return this.registry.get(id)?.toSnapshot() ?? null
  }

  getActiveProvider(): ProviderSnapshot | null {
    return this.registry.getActive()?.toSnapshot() ?? null
  }

  connect(id: ProviderId): void {
    this.registry.get(id)?.connect()
  }

  disconnect(id: ProviderId): void {
    const account = this.registry.get(id)
    if (!account) return
    this.sessions.logout(account)
  }

  // ---- Sesión ----

  login(id: ProviderId): ProviderSessionSnapshot | null {
    const account = this.registry.get(id)
    if (!account) return null
    return this.sessions.login(account)
  }

  logout(id: ProviderId): void {
    const account = this.registry.get(id)
    if (account) this.sessions.logout(account)
  }

  refresh(id: ProviderId): ProviderSessionSnapshot | null {
    const account = this.registry.get(id)
    return account ? this.sessions.refresh(account) : null
  }

  session(id: ProviderId): ProviderSessionSnapshot | null {
    const account = this.registry.get(id)
    return account ? this.sessions.snapshotFor(id) : null
  }

  // ---- Catálogo ----

  listModels(): ReadonlyArray<ModelInfo> {
    return allModels()
  }

  getModel(id: ModelId): ModelInfo | null {
    return getModelInfo(id)
  }

  modelsByProvider(id: ProviderId): ReadonlyArray<ModelInfo> {
    return getModelsByProvider(id)
  }

  // ---- Presupuesto ----

  estimateBudget(input: BudgetInput): BudgetEstimate {
    const model = input.modelId ? getModelInfo(input.modelId) : null
    const provider = input.providerId ? this.registry.get(input.providerId) : null
    return this.budget.estimate(input, model, this.policy().constraints, provider?.creditsAvailable ?? null)
  }

  // ---- Salud ----

  healthSummary(): ProviderHealthSummary {
    return this.health.summarize(this.listProviders())
  }

  // ---- Read model para el Director (solo lectura) ----

  readModel(): ProviderManagerReadModel {
    return {
      listProviders: () => this.listProviders(),
      getProvider: (id: ProviderId) => this.getProvider(id),
      getActiveProvider: () => this.getActiveProvider(),
      listModels: () => this.listModels(),
      getModel: (id: ModelId) => this.getModel(id),
      modelsByProvider: (id: ProviderId) => this.modelsByProvider(id),
      healthSummary: () => this.healthSummary(),
      policy: () => this.policy(),
      estimateBudget: (input: BudgetInput) => this.estimateBudget(input),
      session: (id: ProviderId) => this.session(id),
    }
  }
}

function allModels(): ReadonlyArray<ModelInfo> {
  return [...MODEL_CATALOG]
}

export type { BudgetInput, ModelId, ModelInfo, ProviderId, ProviderPolicy, ProviderSnapshot }
