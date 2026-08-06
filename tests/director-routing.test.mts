import assert from 'node:assert/strict'
import test from 'node:test'
import {
  applyPolicyToRoute,
  LOCAL_MODELS,
  PAID_MODELS,
  resolvePolicy,
  SimulatedModelRouter,
} from '../lib/director/index.mts'

test('SimulatedModelRouter asigna v0 a frontend complejo', () => {
  const router = new SimulatedModelRouter()
  const route = router.route('frontend', 'complex')
  assert.equal(route.model, 'v0')
})

test('SimulatedModelRouter asigna codex a backend complejo', () => {
  const router = new SimulatedModelRouter()
  assert.equal(router.route('backend', 'complex').model, 'codex')
})

test('SimulatedModelRouter asigna opencode a tareas pequeñas', () => {
  const router = new SimulatedModelRouter()
  assert.equal(router.route('frontend', 'low').model, 'opencode')
  assert.equal(router.route('documentation', 'medium').model, 'opencode')
})

test('SimulatedModelRouter asigna chatgpt a explicaciones', () => {
  const router = new SimulatedModelRouter()
  assert.equal(router.route('explanation', 'high').model, 'chatgpt')
})

test('SimulatedModelRouter cae a opencode para combinaciones sin tabla', () => {
  const router = new SimulatedModelRouter()
  const route = router.route('generic', 'complex')
  assert.equal(route.model, 'opencode')
  assert.ok(route.reason.length > 0)
})

test('applyPolicyToRoute fuerza modelo local cuando no hay modelos externos', () => {
  const route = { kind: 'frontend' as const, complexity: 'complex' as const, model: 'v0' as const, reason: 'V0' }
  const offline = applyPolicyToRoute(route, resolvePolicy('offline'))
  assert.equal(offline.model, 'local-model')
})

test('applyPolicyToRoute evita modelos de pago con política de costo mínimo', () => {
  const route = { kind: 'frontend' as const, complexity: 'complex' as const, model: 'v0' as const, reason: 'V0' }
  const minimum = applyPolicyToRoute(route, resolvePolicy('minimum-cost'))
  assert.notEqual(minimum.model, 'v0')
  assert.ok(minimum.reason.includes('evita modelos de pago'))
})

test('applyPolicyToRoute fuerza opencode con política rápida', () => {
  const route = { kind: 'backend' as const, complexity: 'complex' as const, model: 'codex' as const, reason: 'Codex' }
  const fast = applyPolicyToRoute(route, resolvePolicy('fast'))
  assert.equal(fast.model, 'opencode')
})

test('applyPolicyToRoute preserva la ruta con política equilibrada', () => {
  const route = { kind: 'backend' as const, complexity: 'complex' as const, model: 'codex' as const, reason: 'Codex' }
  const balanced = applyPolicyToRoute(route, resolvePolicy('balanced'))
  assert.equal(balanced.model, 'codex')
})

test('PAID_MODELS y LOCAL_MODELS están bien definidos', () => {
  assert.ok(PAID_MODELS.has('codex'))
  assert.ok(PAID_MODELS.has('v0'))
  assert.ok(LOCAL_MODELS.has('local-model'))
  assert.ok(!PAID_MODELS.has('local-model'))
})
