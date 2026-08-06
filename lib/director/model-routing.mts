import type { DecisionPolicy } from './decision-policy.mts'
import type { DirectorComplexity, DirectorModelId, DirectorTaskKind } from './types.mts'

export interface ModelRoute {
  kind: DirectorTaskKind
  complexity: DirectorComplexity
  model: DirectorModelId
  reason: string
}

export interface ModelRouter {
  route(kind: DirectorTaskKind, complexity: DirectorComplexity): ModelRoute
}

/**
 * Reglas simuladas de ruteo de modelos (MODEL_SELECTION.md).
 * Ninguna llama a APIs reales: es una tabla determinista.
 */
export const MODEL_ROUTES: ReadonlyArray<ModelRoute> = [
  { kind: 'frontend', complexity: 'complex', model: 'v0', reason: 'Frontend complejo: V0.' },
  { kind: 'frontend', complexity: 'high', model: 'v0', reason: 'Frontend de alta complejidad: V0.' },
  { kind: 'frontend', complexity: 'medium', model: 'v0', reason: 'Frontend de media complejidad: V0.' },
  { kind: 'frontend', complexity: 'low', model: 'opencode', reason: 'Frontend pequeño: OpenCode.' },
  { kind: 'backend', complexity: 'complex', model: 'codex', reason: 'Backend complejo: Codex.' },
  { kind: 'backend', complexity: 'high', model: 'codex', reason: 'Backend de alta complejidad: Codex.' },
  { kind: 'backend', complexity: 'medium', model: 'codex', reason: 'Backend de media complejidad: Codex.' },
  { kind: 'backend', complexity: 'low', model: 'opencode', reason: 'Backend pequeño: OpenCode.' },
  { kind: 'database', complexity: 'high', model: 'codex', reason: 'Base de datos compleja: Codex.' },
  { kind: 'database', complexity: 'complex', model: 'codex', reason: 'Base de datos compleja: Codex.' },
  { kind: 'database', complexity: 'medium', model: 'codex', reason: 'Base de datos: Codex.' },
  { kind: 'database', complexity: 'low', model: 'opencode', reason: 'Base de datos pequeña: OpenCode.' },
  { kind: 'refactor', complexity: 'complex', model: 'codex', reason: 'Refactor complejo: Codex.' },
  { kind: 'refactor', complexity: 'high', model: 'codex', reason: 'Refactor grande: Codex.' },
  { kind: 'refactor', complexity: 'medium', model: 'opencode', reason: 'Refactor de tamaño medio: OpenCode.' },
  { kind: 'refactor', complexity: 'low', model: 'opencode', reason: 'Refactor pequeño: OpenCode.' },
  { kind: 'explanation', complexity: 'low', model: 'chatgpt', reason: 'Explicación: ChatGPT.' },
  { kind: 'explanation', complexity: 'medium', model: 'chatgpt', reason: 'Explicación: ChatGPT.' },
  { kind: 'explanation', complexity: 'high', model: 'chatgpt', reason: 'Explicación: ChatGPT.' },
  { kind: 'explanation', complexity: 'complex', model: 'chatgpt', reason: 'Explicación: ChatGPT.' },
  { kind: 'repetitive', complexity: 'low', model: 'local-model', reason: 'Código repetitivo: modelo local.' },
  { kind: 'repetitive', complexity: 'medium', model: 'local-model', reason: 'Código repetitivo: modelo local.' },
  { kind: 'repetitive', complexity: 'high', model: 'opencode', reason: 'Repetitivo extenso: OpenCode.' },
  { kind: 'documentation', complexity: 'low', model: 'opencode', reason: 'Documentación: OpenCode.' },
  { kind: 'documentation', complexity: 'medium', model: 'opencode', reason: 'Documentación: OpenCode.' },
  { kind: 'documentation', complexity: 'high', model: 'opencode', reason: 'Documentación extensa: OpenCode.' },
  { kind: 'tests', complexity: 'high', model: 'codex', reason: 'Pruebas complejas: Codex.' },
  { kind: 'tests', complexity: 'complex', model: 'codex', reason: 'Pruebas complejas: Codex.' },
  { kind: 'tests', complexity: 'medium', model: 'opencode', reason: 'Pruebas: OpenCode.' },
  { kind: 'tests', complexity: 'low', model: 'opencode', reason: 'Pruebas pequeñas: OpenCode.' },
]

const DEFAULT_ROUTE: ModelRoute = {
  kind: 'generic',
  complexity: 'medium',
  model: 'opencode',
  reason: 'Tarea general: OpenCode.',
}

export class SimulatedModelRouter implements ModelRouter {
  route(kind: DirectorTaskKind, complexity: DirectorComplexity): ModelRoute {
    return (
      MODEL_ROUTES.find((route) => route.kind === kind && route.complexity === complexity) ??
      MODEL_ROUTES.find((route) => route.kind === kind) ??
      DEFAULT_ROUTE
    )
  }
}

export const PAID_MODELS: ReadonlySet<DirectorModelId> = new Set<DirectorModelId>([
  'v0',
  'codex',
  'chatgpt',
  'claude',
  'gemini',
])

export const LOCAL_MODELS: ReadonlySet<DirectorModelId> = new Set<DirectorModelId>(['local-model'])

/** Ajusta la ruta según las restricciones de la política (simulado). */
export function applyPolicyToRoute(route: ModelRoute, policy: DecisionPolicy): ModelRoute {
  const constraints = policy.constraints
  if (!constraints.allowExternalModels) {
    return {
      ...route,
      model: 'local-model',
      reason: `${route.reason} [política ${policy.label}: modelo local.]`,
    }
  }
  if (constraints.preferSpeed) {
    return { ...route, model: 'opencode', reason: `${route.reason} [política ${policy.label}: rapidez.]` }
  }
  if (!constraints.allowPaidModels && PAID_MODELS.has(route.model)) {
    return {
      ...route,
      model: constraints.preferLocalModels ? 'local-model' : 'opencode',
      reason: `${route.reason} [política ${policy.label}: evita modelos de pago.]`,
    }
  }
  return route
}
