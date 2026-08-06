/**
 * Tipos de dominio del Provider Manager.
 * Toda la capa es simulada: ningún valor proviene de APIs reales.
 */

export type ProviderId =
  | 'openai'
  | 'anthropic'
  | 'google'
  | 'openrouter'
  | 'ollama'
  | 'lm-studio'
  | 'azure-openai'
  | 'v0'
  | 'github-models'
  | 'mistral'
  | 'together'
  | 'groq'
  | 'deepseek'

export type ProviderCategory = 'cloud' | 'local' | 'visual' | 'aggregator'

export type ProviderStatus = 'available' | 'limited' | 'unavailable'

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error'

export type AuthStatus = 'none' | 'pending' | 'authenticated' | 'expired'

export type ProviderHealthStatus = 'healthy' | 'warning' | 'error' | 'offline'

/** Metadata estática de un proveedor del catálogo. */
export interface ProviderDescriptor {
  id: ProviderId
  name: string
  category: ProviderCategory
  /** Clasificación simulada de velocidad (1 = lento, 5 = muy rápido). */
  speed: number
  /** Clasificación simulada de calidad (1 = baja, 5 = excelente). */
  quality: number
  /** Modelos que el catálogo expone para este proveedor. */
  models: ReadonlyArray<ModelId>
  /** Límite mensual simulado en créditos. */
  monthlyLimit: number
  /** Requiere autenticación para operar. */
  requiresAuth: boolean
  /** Proveedor externo (envía datos fuera de la máquina). */
  isExternal: boolean
  detail: string
}

export type ModelType = 'chat' | 'reasoning' | 'code' | 'embedding' | 'image'

/** Capacidades de un modelo (1-5 o booleano). Simulado. */
export interface ModelCapability {
  reasoning: number
  coding: number
  frontend: number
  backend: number
  documentation: number
  vision: boolean
  tools: boolean
}

export type ModelId =
  | 'gpt-4o'
  | 'gpt-4.1'
  | 'o3-mini'
  | 'claude-sonnet-4'
  | 'claude-haiku-4'
  | 'gemini-2.5-pro'
  | 'gemini-2.5-flash'
  | 'openrouter-auto'
  | 'deepseek-r1'
  | 'deepseek-v3'
  | 'mistral-large'
  | 'codestral'
  | 'groq-llama-3.3'
  | 'groq-mixtral'
  | 'llama-3.1'
  | 'llama-4-scout'
  | 'qwen-coder'
  | 'gpt-image'
  | 'azure-gpt-4o'
  | 'github-gpt-4o-mini'

/** Precio simulado por cada 1000 tokens. */
export interface PricingInfo {
  currency: string
  per1kInput: number
  per1kOutput: number
  /** Créditos equivalentes por cada 1000 tokens de entrada (simulado). */
  creditsPer1kInput: number
}

/** Descripción completa de un modelo del catálogo. */
export interface ModelInfo {
  id: ModelId
  name: string
  provider: ProviderId
  type: ModelType
  capabilities: ModelCapability
  /** Ventana de contexto en tokens. */
  contextWindow: number
  /** Velocidad simulada (1-5). */
  speed: number
  pricing: PricingInfo
}

/** Estado mutable de la cuenta de un proveedor. */
export interface ProviderAccountState {
  id: ProviderId
  connection: ConnectionStatus
  auth: AuthStatus
  /** Créditos simulados disponibles; null = no aplica (p. ej. local). */
  creditsAvailable: number | null
  /** Costo estimado acumulado en la moneda del presupuesto. */
  estimatedCost: number
  /** Conjunto de modelos disponibles (de lo que la cuenta permite). */
  availableModels: ReadonlyArray<ModelId>
}

/** Snapshot plano que consume la UI y el Director. */
export interface ProviderSnapshot extends ProviderDescriptor {
  status: ProviderStatus
  connected: boolean
  authenticated: boolean
  creditsAvailable: number | null
  limit: number
  estimatedCost: number
  models: ReadonlyArray<ModelId>
  estimatedSpeed: number
  estimatedQuality: number
  health: ProviderHealthStatus
}

export interface ProviderSessionSnapshot {
  providerId: ProviderId
  status: AuthStatus
  authenticated: boolean
  authenticatedAt: string | null
  expiresAt: string | null
  tokenPreview: string | null
}

/** Resumen de salud agregado de todos los proveedores. */
export interface ProviderHealthSummary {
  status: ProviderHealthStatus
  connectedCount: number
  authenticatedCount: number
  total: number
  message: string
}

/** Entrada para el cálculo de presupuesto (solo estimaciones). */
export interface BudgetInput {
  modelId?: ModelId
  providerId?: ProviderId
  /** Tokens de entrada estimados. */
  inputTokens: number
  /** Tokens de salida estimados (por defecto 0). */
  outputTokens?: number
}

export interface BudgetEstimate {
  estimatedCost: number
  estimatedCredits: number
  estimatedTokens: number
  remainingBudget: number
  approvalRequired: boolean
}

export type ProviderPolicyId =
  | 'balanced'
  | 'minimum-cost'
  | 'maximum-quality'
  | 'offline'
  | 'safe'
  | 'fast'

export interface ProviderPolicyConstraints {
  allowExternalModels: boolean
  allowPaidModels: boolean
  preferLocalModels: boolean
  maxProvidersActive: number
  requireApproval: boolean
  /** Tope mensual simulado en créditos. */
  monthlyBudgetCredits: number
  /** Umbral de costo por tarea para exigir aprobación. */
  approvalThreshold: number
}

export interface ProviderPolicy {
  id: ProviderPolicyId
  label: string
  description: string
  constraints: ProviderPolicyConstraints
}

/** Acceso de solo lectura al ProviderManager (lo que el Director puede usar). */
export interface ProviderManagerReadModel {
  listProviders(): ReadonlyArray<ProviderSnapshot>
  getProvider(id: ProviderId): ProviderSnapshot | null
  getActiveProvider(): ProviderSnapshot | null
  listModels(): ReadonlyArray<ModelInfo>
  getModel(id: ModelId): ModelInfo | null
  modelsByProvider(id: ProviderId): ReadonlyArray<ModelInfo>
  healthSummary(): ProviderHealthSummary
  policy(): ProviderPolicy
  estimateBudget(input: BudgetInput): BudgetEstimate
  session(id: ProviderId): ProviderSessionSnapshot | null
}
