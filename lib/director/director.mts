import type { KernelContextReader } from '../kernel/context/reader.mts'
import type { ProjectStage } from '../mission-control/types.mts'
import type { WorkspaceSnapshot } from '../runtime/adapters/workspace/snapshot.mts'
import { createDecisionContext, type DecisionContext } from './decision-context.mts'
import { DecisionEngine } from './decision-engine.mts'
import { DecisionHistory } from './decision-history.mts'
import type { ExecutionPlan } from './execution-plan.mts'
import type { DecisionPolicyId, DirectorRequest } from './types.mts'

export interface DirectorDecideInput {
  request: DirectorRequest
  kernel: KernelContextReader
  workspaceSnapshot?: WorkspaceSnapshot | null
  currentStage?: ProjectStage | null
}

export interface DirectorOptions {
  engine?: DecisionEngine
  history?: DecisionHistory
  policy?: DecisionPolicyId
  now?: () => string
}

/**
 * El Director es el único responsable de decidir qué hacer. No ejecuta
 * acciones, no llama modelos, no toca Git/terminal/archivos: solo devuelve
 * un ExecutionPlan a partir de lo que puede leer.
 */
export class Director {
  readonly engine: DecisionEngine
  readonly history: DecisionHistory
  private readonly defaultPolicy: DecisionPolicyId
  private readonly now: () => string

  constructor(options: DirectorOptions = {}) {
    this.engine = options.engine ?? new DecisionEngine({ now: options.now })
    this.history = options.history ?? new DecisionHistory()
    this.defaultPolicy = options.policy ?? 'balanced'
    this.now = options.now ?? (() => new Date().toISOString())
  }

  decide(input: DirectorDecideInput): ExecutionPlan {
    const request: DirectorRequest = {
      ...input.request,
      policy: input.request.policy ?? this.defaultPolicy,
    }
    const context: DecisionContext = createDecisionContext(
      input.kernel,
      request,
      {
        workspaceSnapshot: input.workspaceSnapshot ?? null,
        currentStage: input.currentStage ?? null,
      },
      this.now,
    )
    const plan = this.engine.decide(context)
    this.history.push({ id: plan.id, createdAt: plan.createdAt, request, plan })
    return plan
  }

  getLatestPlan(): ExecutionPlan | null {
    return this.history.latest()?.plan ?? null
  }

  dispose(): void {
    this.history.clear()
  }
}

export function createDirector(options: DirectorOptions = {}): Director {
  return new Director(options)
}
