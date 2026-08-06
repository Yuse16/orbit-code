import type { DecisionContext } from './decision-context.mts'
import { createReason } from './decision-reason.mts'
import type { DecisionReason } from './decision-reason.mts'
import { resolvePolicy, type DecisionPolicy } from './decision-policy.mts'
import { createExecutionPlan, type ExecutionPlan } from './execution-plan.mts'
import { applyPolicyToRoute, SimulatedModelRouter, type ModelRouter } from './model-routing.mts'
import {
  inferComplexity,
  TaskPlanner,
} from './task-planner.mts'
import type {
  DirectorComplexity,
  DirectorModelId,
  DirectorTaskKind,
  ModelRecommendation,
  PlannedTask,
} from './types.mts'

const TASK_BASE_TOKENS: Readonly<Record<DirectorTaskKind, number>> = {
  frontend: 12000,
  backend: 16000,
  database: 6000,
  tests: 8000,
  documentation: 4000,
  refactor: 5000,
  explanation: 3000,
  repetitive: 2000,
  generic: 10000,
}

const TASK_BASE_MINUTES: Readonly<Record<DirectorTaskKind, number>> = {
  frontend: 45,
  backend: 60,
  database: 30,
  tests: 40,
  documentation: 20,
  refactor: 25,
  explanation: 10,
  repetitive: 10,
  generic: 50,
}

const COMPLEXITY_MULTIPLIER: Readonly<Record<DirectorComplexity, number>> = {
  low: 1,
  medium: 1.4,
  high: 1.8,
  complex: 2.4,
}

const MODEL_COST_PER_1K: Readonly<Record<DirectorModelId, number>> = {
  v0: 1.5,
  codex: 0.9,
  chatgpt: 0.3,
  claude: 1.2,
  gemini: 0.5,
  opencode: 0.15,
  'local-model': 0,
}

const TASK_CAPABILITIES: Readonly<Record<DirectorTaskKind, ReadonlyArray<string>>> = {
  frontend: ['framework', 'preview'],
  backend: ['node', 'shell'],
  database: ['database', 'sqlite'],
  tests: ['testing', 'build'],
  documentation: ['workspace', 'memory'],
  refactor: ['git', 'shell'],
  explanation: ['memory'],
  repetitive: ['filesystem', 'shell'],
  generic: ['workspace', 'build', 'preview'],
}

const CAPABILITY_TO_ADAPTER: Readonly<Record<string, string>> = {
  framework: 'workspace',
  preview: 'localhost',
  node: 'terminal',
  shell: 'terminal',
  database: 'sqlite',
  sqlite: 'sqlite',
  testing: 'terminal',
  build: 'terminal',
  workspace: 'workspace',
  memory: 'sqlite',
  git: 'git',
  filesystem: 'filesystem',
}

const INTERNET_CAPABILITIES: ReadonlyArray<string> = [
  'github',
  'vercel',
  'supabase',
  'deploy',
  'ai',
  'mcp',
  'docker',
]

export interface DecisionEngineOptions {
  planner?: TaskPlanner
  router?: ModelRouter
  now?: () => string
}

const round2 = (value: number): number => Math.round(value * 100) / 100

/**
 * Motor de decisión puro: recibe un DecisionContext y devuelve un
 * ExecutionPlan. Nunca ejecuta acciones ni llama modelos.
 */
export class DecisionEngine {
  private readonly planner: TaskPlanner
  private readonly router: ModelRouter
  private readonly now: () => string

  constructor(options: DecisionEngineOptions = {}) {
    this.planner = options.planner ?? new TaskPlanner()
    this.router = options.router ?? new SimulatedModelRouter()
    this.now = options.now ?? (() => new Date().toISOString())
  }

  decide(context: DecisionContext): ExecutionPlan {
    const policy = resolvePolicy(context.request.policy ?? 'balanced')
    const request = context.request
    const complexity = request.complexity ?? inferComplexity(request.objective)
    const tasks = this.planner.plan(request)
    const multiplier = COMPLEXITY_MULTIPLIER[complexity]

    const recommendations = this.assignModels(tasks, complexity, policy)
    const usedModels = recommendations.map((r) => r.model)

    const capabilities = this.requiredCapabilities(tasks, policy)
    const adapters = this.recommendedAdapters(capabilities)

    let tokens = 0
    let cost = 0
    let minutes = 0
    tasks.forEach((task) => {
      const baseTokens = TASK_BASE_TOKENS[task.kind]
      const taskTokens = Math.round(baseTokens * multiplier)
      tokens += taskTokens
      const model = recommendations.find((r) => r.taskId === task.id)?.model ?? 'opencode'
      cost += (taskTokens / 1000) * MODEL_COST_PER_1K[model]
      minutes += TASK_BASE_MINUTES[task.kind] * multiplier
    })
    if (policy.constraints.preferSpeed) minutes = Math.round(minutes * 0.7)

    const parallelTasks = tasks.filter((task) => task.dependencies.length === 0)
    const sequentialTasks = tasks.filter((task) => task.dependencies.length > 0)
    const approvalRequired = policy.constraints.requireApproval
    const confidence = this.computeConfidence(context)
    const reasons = this.buildReasons(request.objective, policy, recommendations, context, complexity)
    const reasoningSummary = recommendations.map((recommendation) => recommendation.reason)

    return createExecutionPlan({
      id: `plan-${this.now()}`,
      objective: request.objective,
      createdAt: this.now(),
      policy: policy.id,
      recommendedModels: recommendations,
      recommendedAdapters: adapters,
      requiredCapabilities: capabilities,
      estimatedTokens: tokens,
      estimatedCost: round2(cost),
      estimatedTimeMinutes: Math.round(minutes),
      approvalRequired,
      parallelTasks,
      sequentialTasks,
      fallbackPlan: this.fallbackPlan(policy, usedModels, context),
      confidence,
      reasoningSummary,
      reasons,
    })
  }

  private assignModels(
    tasks: ReadonlyArray<PlannedTask>,
    complexity: DirectorComplexity,
    policy: DecisionPolicy,
  ): ReadonlyArray<ModelRecommendation> {
    const used = new Set<DirectorModelId>()
    return tasks.map((task) => {
      const route = this.router.route(task.kind, complexity)
      const adjusted = applyPolicyToRoute(route, policy)
      let model = adjusted.model
      let reason = adjusted.reason
      if (!used.has(model) && used.size >= policy.constraints.maxDistinctModels) {
        model = 'opencode'
        reason = `${adjusted.reason} [política ${policy.label}: límite de modelos.]`
      }
      used.add(model)
      return {
        taskId: task.id,
        taskTitle: task.title,
        kind: task.kind,
        model,
        reason,
      }
    })
  }

  private requiredCapabilities(
    tasks: ReadonlyArray<PlannedTask>,
    policy: DecisionPolicy,
  ): ReadonlyArray<string> {
    const all = new Set<string>()
    tasks.forEach((task) => TASK_CAPABILITIES[task.kind].forEach((capability) => all.add(capability)))
    if (!policy.constraints.allowExternalModels) {
      INTERNET_CAPABILITIES.forEach((capability) => all.delete(capability))
    }
    return [...all]
  }

  private recommendedAdapters(capabilities: ReadonlyArray<string>): ReadonlyArray<string> {
    const adapters = new Set<string>()
    capabilities.forEach((capability) => {
      const adapter = CAPABILITY_TO_ADAPTER[capability]
      if (adapter) adapters.add(adapter)
    })
    return [...adapters]
  }

  private computeConfidence(context: DecisionContext): number {
    let confidence = 0.5
    if (context.dna) confidence += 0.2
    const workspace = context.workspaceSnapshot
    if (workspace && workspace.confidence > 0) confidence += 0.1
    if (context.runtimeHealth === 'healthy') confidence += 0.1
    if (context.runtimeHealth === 'error') confidence -= 0.2
    return round2(Math.min(1, Math.max(0, confidence)))
  }

  private buildReasons(
    objective: string,
    policy: DecisionPolicy,
    recommendations: ReadonlyArray<ModelRecommendation>,
    context: DecisionContext,
    complexity: DirectorComplexity,
  ): ReadonlyArray<DecisionReason> {
    const reasons: DecisionReason[] = [
      createReason('request', 'Solicitud recibida', objective, 0),
      createReason(
        'context',
        'Complejidad inferida',
        `Complejidad simulada: ${complexity}.`,
        1,
      ),
      createReason('policy', 'Política aplicada', `${policy.label}: ${policy.description}`, 2),
    ]
    recommendations.forEach((recommendation, index) => {
      reasons.push(
        createReason(
          'routing',
          `Modelo para ${recommendation.kind}`,
          recommendation.reason,
          index + 3,
        ),
      )
    })
    if (context.runtimeHealth === 'error') {
      reasons.push(
        createReason('context', 'Runtime con errores', 'El runtime está en error; se baja la confianza.', reasons.length),
      )
    }
    return reasons
  }

  private fallbackPlan(
    policy: DecisionPolicy,
    usedModels: ReadonlyArray<DirectorModelId>,
    context: DecisionContext,
  ): string {
    const primary = usedModels[0] ?? 'opencode'
    if (!policy.constraints.allowExternalModels) {
      return 'Si el modelo local no responde, pausar la tarea y solicitar aprobación del usuario.'
    }
    const offlineFallback = context.dna
      ? `si ${primary} no está disponible, usar el modelo local y avisar al usuario.`
      : `si ${primary} no está disponible, usar OpenCode.`
    return `Ejecutar con ${primary}; ${offlineFallback} En caso de error, reintentar una vez y reportar.`
  }
}
