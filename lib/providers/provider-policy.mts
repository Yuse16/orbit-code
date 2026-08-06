import type {
  ProviderPolicy,
  ProviderPolicyConstraints,
  ProviderPolicyId,
} from './types.mts'

/**
 * Políticas de uso de proveedores. Son reglas simuladas que el Director
 * consulta antes de construir un plan; no ejecutan ninguna llamada.
 */
export const PROVIDER_POLICIES: ReadonlyArray<ProviderPolicy> = [
  {
    id: 'balanced',
    label: 'Equilibrado',
    description: 'Balance entre coste, velocidad y calidad.',
    constraints: { ...defaultConstraints(), maxProvidersActive: 3 },
  },
  {
    id: 'minimum-cost',
    label: 'Coste mínimo',
    description: 'Prioriza modelos gratuitos o de bajo coste.',
    constraints: { ...defaultConstraints(), approvalThreshold: 5 },
  },
  {
    id: 'maximum-quality',
    label: 'Máxima calidad',
    description: 'Prioriza modelos de máxima calidad percibida.',
    constraints: { ...defaultConstraints(), approvalThreshold: 1 },
  },
  {
    id: 'offline',
    label: 'Offline',
    description: 'Solo modelos locales, sin envío de datos.',
    constraints: {
      ...defaultConstraints(),
      allowExternalModels: false,
      preferLocalModels: true,
      monthlyBudgetCredits: 0,
    },
  },
  {
    id: 'safe',
    label: 'Segura',
    description: 'Exige aprobación y restringe proveedores externos.',
    constraints: {
      ...defaultConstraints(),
      allowExternalModels: false,
      requireApproval: true,
      maxProvidersActive: 1,
    },
  },
  {
    id: 'fast',
    label: 'Rápida',
    description: 'Prioriza velocidad sobre calidad y coste.',
    constraints: { ...defaultConstraints(), requireApproval: false, approvalThreshold: 10 },
  },
]

/** Política por defecto usada por el ProviderManager. */
export const DEFAULT_PROVIDER_POLICY_ID: ProviderPolicyId = 'balanced'

export function getProviderPolicy(id: ProviderPolicyId): ProviderPolicy {
  const policy = PROVIDER_POLICIES.find((candidate) => candidate.id === id)
  return policy ?? PROVIDER_POLICIES[0]
}

export function listProviderPolicies(): ReadonlyArray<ProviderPolicy> {
  return PROVIDER_POLICIES
}

function defaultConstraints(): ProviderPolicyConstraints {
  return {
    allowExternalModels: true,
    allowPaidModels: true,
    preferLocalModels: false,
    maxProvidersActive: 2,
    requireApproval: true,
    monthlyBudgetCredits: 500,
    approvalThreshold: 2,
  }
}
