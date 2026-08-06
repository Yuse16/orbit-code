import type { ExecutionPlan } from './execution-plan.mts'
import type { DirectorRequest } from './types.mts'

export interface DecisionRecord {
  id: string
  createdAt: string
  request: DirectorRequest
  plan: ExecutionPlan
}

const MAX_RECORDS = 50

/** Historial en memoria de las decisiones del Director. */
export class DecisionHistory {
  private readonly records: DecisionRecord[] = []

  push(record: DecisionRecord): void {
    this.records.push(record)
    if (this.records.length > MAX_RECORDS) this.records.shift()
  }

  list(): ReadonlyArray<DecisionRecord> {
    return [...this.records]
  }

  latest(): DecisionRecord | null {
    return this.records[this.records.length - 1] ?? null
  }

  get size(): number {
    return this.records.length
  }

  clear(): void {
    this.records.length = 0
  }
}
