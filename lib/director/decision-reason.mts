export type DecisionReasonSource =
  | 'request'
  | 'context'
  | 'routing'
  | 'policy'
  | 'providers'
  | 'budget'

/** Justificación de una decisión del Director, trazable para DecisionHistory. */
export interface DecisionReason {
  id: string
  source: DecisionReasonSource
  summary: string
  detail: string
}

export function createReason(
  source: DecisionReasonSource,
  summary: string,
  detail: string,
  index = 0,
): DecisionReason {
  return { id: `reason-${index}`, source, summary, detail }
}
