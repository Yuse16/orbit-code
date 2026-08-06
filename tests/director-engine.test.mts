import assert from 'node:assert/strict'
import test from 'node:test'
import { DecisionEngine } from '../lib/director/index.mts'
import { createDecisionContext } from '../lib/director/index.mts'
import type { DirectorRequest } from '../lib/director/index.mts'
import { buildKernelReader } from './director-test-helpers.mts'

const NOW = '2026-01-01T00:00:00.000Z'

const buildContext = (request: DirectorRequest, options: Parameters<typeof buildKernelReader>[0] = {}) =>
  createDecisionContext(buildKernelReader(options), request, {}, () => NOW)

test('DecisionEngine decide un plan completo para solicitudes genéricas', () => {
  const engine = new DecisionEngine({ now: () => NOW })
  const plan = engine.decide(buildContext({ objective: 'Construir la aplicación completa' }))

  assert.equal(plan.objective, 'Construir la aplicación completa')
  assert.ok(plan.id.startsWith('plan-'))
  assert.equal(plan.policy, 'balanced')
  assert.equal(plan.parallelTasks.length, 1)
  assert.equal(plan.sequentialTasks.length, 4)
  assert.equal(plan.recommendedModels.length, 5)
  assert.deepEqual(
    plan.recommendedModels.map((r) => r.kind),
    ['frontend', 'backend', 'database', 'tests', 'documentation'],
  )
  assert.deepEqual(
    plan.recommendedModels.map((r) => r.model),
    ['v0', 'codex', 'codex', 'opencode', 'opencode'],
  )
  assert.equal(plan.estimatedTokens, 64400)
  assert.equal(plan.estimatedCost, 55.44)
  assert.equal(plan.estimatedTimeMinutes, 273)
  assert.equal(plan.approvalRequired, false)
  assert.ok(plan.reasons.length >= 8)
  assert.ok(plan.reasoningSummary.length >= 5)
  assert.ok(plan.fallbackPlan.length > 0)
  assert.ok(plan.recommendedAdapters.includes('workspace'))
  assert.ok(plan.recommendedAdapters.includes('localhost'))
  assert.ok(plan.recommendedAdapters.includes('terminal'))
  assert.ok(plan.recommendedAdapters.includes('sqlite'))
})

test('DecisionEngine respeta la complejidad explícita', () => {
  const engine = new DecisionEngine({ now: () => NOW })
  const plan = engine.decide(
    buildContext({ objective: 'Implementar la API de pagos', kind: 'backend', complexity: 'low' }),
  )
  assert.equal(plan.parallelTasks.length, 1)
  assert.equal(plan.estimatedTokens, 16000)
  assert.equal(plan.estimatedCost, 2.4)
  assert.equal(plan.estimatedTimeMinutes, 60)
})

test('La política offline fuerza modelo local y costo cero', () => {
  const engine = new DecisionEngine({ now: () => NOW })
  const plan = engine.decide(
    buildContext({ objective: 'Construir la aplicación completa', policy: 'offline' }),
  )
  assert.ok(plan.recommendedModels.every((r) => r.model === 'local-model'))
  assert.equal(plan.estimatedCost, 0)
  assert.ok(plan.fallbackPlan.includes('aprobación'))
})

test('La política safe exige aprobación', () => {
  const engine = new DecisionEngine({ now: () => NOW })
  const plan = engine.decide(
    buildContext({ objective: 'Construir la aplicación completa', policy: 'safe' }),
  )
  assert.equal(plan.approvalRequired, true)
  assert.ok(plan.recommendedModels.every((r) => r.model === 'local-model'))
})

test('La política fast reduce el tiempo estimado y usa opencode', () => {
  const engine = new DecisionEngine({ now: () => NOW })
  const plan = engine.decide(
    buildContext({ objective: 'Construir la aplicación completa', policy: 'fast' }),
  )
  assert.equal(plan.estimatedTimeMinutes, 191)
  assert.ok(plan.recommendedModels.every((r) => r.model === 'opencode'))
})

test('DecisionEngine sube la confianza con DNA presente', () => {
  const engine = new DecisionEngine({ now: () => NOW })
  const plan = engine.decide(buildContext({ objective: 'Construir la aplicación completa' }, { withDna: true }))
  assert.equal(plan.confidence, 0.8)
})

test('DecisionEngine baja la confianza con runtime en error', () => {
  const engine = new DecisionEngine({ now: () => NOW })
  const plan = engine.decide(
    buildContext({ objective: 'Construir la aplicación completa' }, { health: 'error' }),
  )
  assert.equal(plan.confidence, 0.3)
  assert.ok(plan.reasons.some((reason) => reason.detail.includes('runtime está en error')))
})

test('DecisionEngine nunca devuelve modelos fuera del catálogo', () => {
  const engine = new DecisionEngine({ now: () => NOW })
  for (const policy of ['balanced', 'minimum-cost', 'maximum-quality', 'offline', 'fast', 'safe'] as const) {
    const plan = engine.decide(
      buildContext({ objective: 'Construir la aplicación completa', policy }),
    )
    for (const recommendation of plan.recommendedModels) {
      assert.ok(
        ['v0', 'codex', 'opencode', 'chatgpt', 'claude', 'gemini', 'local-model'].includes(recommendation.model),
        `Modelo desconocido: ${recommendation.model}`,
      )
    }
  }
})
