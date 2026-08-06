import type { DecisionPolicyId } from './types.mts'

export interface DecisionPolicyConstraints {
  maxDistinctModels: number
  allowExternalModels: boolean
  allowPaidModels: boolean
  preferLocalModels: boolean
  requireApproval: boolean
  preferSpeed: boolean
}

export interface DecisionPolicy {
  id: DecisionPolicyId
  label: string
  description: string
  constraints: DecisionPolicyConstraints
}

export const DECISION_POLICIES: Readonly<Record<DecisionPolicyId, DecisionPolicy>> = {
  balanced: {
    id: 'balanced',
    label: 'Equilibrado',
    description: 'Equilibrio entre costo, calidad y velocidad.',
    constraints: {
      maxDistinctModels: 3,
      allowExternalModels: true,
      allowPaidModels: true,
      preferLocalModels: false,
      requireApproval: false,
      preferSpeed: false,
    },
  },
  'minimum-cost': {
    id: 'minimum-cost',
    label: 'Costo mínimo',
    description: 'Prioriza el menor costo posible.',
    constraints: {
      maxDistinctModels: 2,
      allowExternalModels: true,
      allowPaidModels: false,
      preferLocalModels: true,
      requireApproval: false,
      preferSpeed: false,
    },
  },
  'maximum-quality': {
    id: 'maximum-quality',
    label: 'Calidad máxima',
    description: 'Prioriza la máxima calidad posible.',
    constraints: {
      maxDistinctModels: 4,
      allowExternalModels: true,
      allowPaidModels: true,
      preferLocalModels: false,
      requireApproval: false,
      preferSpeed: false,
    },
  },
  offline: {
    id: 'offline',
    label: 'Modo Offline',
    description: 'Usa únicamente modelos locales.',
    constraints: {
      maxDistinctModels: 1,
      allowExternalModels: false,
      allowPaidModels: false,
      preferLocalModels: true,
      requireApproval: false,
      preferSpeed: false,
    },
  },
  fast: {
    id: 'fast',
    label: 'Modo Rápido',
    description: 'Minimiza el tiempo de ejecución.',
    constraints: {
      maxDistinctModels: 1,
      allowExternalModels: true,
      allowPaidModels: true,
      preferLocalModels: false,
      requireApproval: false,
      preferSpeed: true,
    },
  },
  safe: {
    id: 'safe',
    label: 'Modo Seguro',
    description: 'Requiere aprobación y evita modelos externos.',
    constraints: {
      maxDistinctModels: 1,
      allowExternalModels: false,
      allowPaidModels: false,
      preferLocalModels: true,
      requireApproval: true,
      preferSpeed: false,
    },
  },
}

export const POLICY_IDS: ReadonlyArray<DecisionPolicyId> = [
  'minimum-cost',
  'maximum-quality',
  'balanced',
  'offline',
  'fast',
  'safe',
]

export function resolvePolicy(id: DecisionPolicyId): DecisionPolicy {
  return DECISION_POLICIES[id]
}

export function isDecisionPolicyId(value: unknown): value is DecisionPolicyId {
  return typeof value === 'string' && (POLICY_IDS as ReadonlyArray<string>).includes(value)
}
