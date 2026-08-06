import assert from 'node:assert/strict'
import test from 'node:test'
import { createDirector } from '../lib/director/index.mts'
import { ProviderManager } from '../lib/providers/index.mts'
import { buildKernelReader } from './director-test-helpers.mts'

const NOW = '2026-01-03T00:00:00.000Z'

test('El Director consulta al ProviderManager y registra la decisión', () => {
  const manager = new ProviderManager()
  manager.login('openai')
  const director = createDirector({ providers: manager.readModel(), now: () => NOW })

  const plan = director.decide({
    request: { objective: 'Construir la aplicación completa' },
    kernel: buildKernelReader(),
  })

  assert.ok(plan.reasons.some((reason) => reason.source === 'providers'))
  assert.ok(plan.reasons.some((reason) => reason.source === 'budget'))
  assert.ok(plan.fallbackPlan.includes('OpenAI'))
})

test('El Director no altera el presupuesto si no hay proveedor activo', () => {
  const manager = new ProviderManager()
  const director = createDirector({ providers: manager.readModel(), now: () => NOW })

  const plan = director.decide({
    request: { objective: 'Construir la aplicación completa' },
    kernel: buildKernelReader(),
  })

  assert.equal(plan.estimatedCost, 55.44)
  assert.equal(plan.approvalRequired, false)
  assert.ok(plan.reasons.some((reason) => reason.source === 'providers'))
})

test('El Director usa la estimación de presupuesto del proveedor activo', () => {
  const manager = new ProviderManager()
  manager.login('anthropic')
  const director = createDirector({ providers: manager.readModel(), now: () => NOW })

  const plan = director.decide({
    request: { objective: 'Construir la aplicación completa' },
    kernel: buildKernelReader(),
  })

  const budgetReason = plan.reasons.find((reason) => reason.source === 'budget')
  assert.ok(budgetReason)
  assert.ok(budgetReason.detail.includes('Anthropic'))
})

test('El Director funciona igual sin ProviderManager (retrocompatibilidad)', () => {
  const director = createDirector({ now: () => NOW })
  const plan = director.decide({
    request: { objective: 'Construir la aplicación completa' },
    kernel: buildKernelReader(),
  })
  assert.equal(plan.estimatedCost, 55.44)
  assert.equal(plan.reasons.some((reason) => reason.source === 'providers'), false)
  assert.equal(plan.reasons.some((reason) => reason.source === 'budget'), false)
})

test('El Director nunca muta el ProviderManager al decidir', () => {
  const manager = new ProviderManager()
  manager.login('openai')
  const director = createDirector({ providers: manager.readModel(), now: () => NOW })

  director.decide({
    request: { objective: 'Construir la aplicación completa' },
    kernel: buildKernelReader(),
  })

  const provider = manager.getProvider('openai')
  assert.equal(provider?.estimatedCost, 0)
  assert.equal(provider?.connected, true)
  assert.equal(provider?.authenticated, true)
})
