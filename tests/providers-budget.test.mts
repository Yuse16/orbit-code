import assert from 'node:assert/strict'
import test from 'node:test'
import { ProviderBudget, getProviderPolicy, getModelInfo } from '../lib/providers/index.mts'
import type { ProviderPolicyConstraints } from '../lib/providers/index.mts'

const balanced = getProviderPolicy('balanced').constraints

test('ProviderBudget estima coste, créditos y tokens sin ejecutar nada', () => {
  const budget = new ProviderBudget()
  const model = getModelInfo('gpt-4o')
  assert.ok(model)
  const estimate = budget.estimate({ inputTokens: 1000, outputTokens: 500 }, model, balanced, 100)

  assert.equal(estimate.estimatedTokens, 1500)
  assert.equal(estimate.estimatedCost, 0.0125)
  assert.equal(estimate.estimatedCredits, 0.5)
  assert.equal(estimate.remainingBudget, 99.5)
  assert.equal(estimate.approvalRequired, false)
})

test('ProviderBudget con modelo gratuito devuelve coste y créditos cero', () => {
  const budget = new ProviderBudget()
  const model = getModelInfo('llama-3.1')
  assert.ok(model)
  const estimate = budget.estimate({ inputTokens: 100000 }, model, balanced, 50)
  assert.equal(estimate.estimatedCost, 0)
  assert.equal(estimate.estimatedCredits, 0)
  assert.equal(estimate.remainingBudget, 50)
})

test('ProviderBudget sin modelo devuelve estimación genérica a coste cero', () => {
  const budget = new ProviderBudget()
  const estimate = budget.estimate({ inputTokens: 1000 }, null, balanced, null)
  assert.equal(estimate.estimatedCost, 0)
  assert.equal(estimate.estimatedCredits, 0)
  assert.equal(estimate.remainingBudget, Infinity)
  assert.equal(estimate.approvalRequired, false)
})

test('ProviderBudget exige aprobación cuando supera el umbral de la política', () => {
  const budget = new ProviderBudget()
  const model = getModelInfo('claude-sonnet-4')
  assert.ok(model)
  const policy: ProviderPolicyConstraints = { ...balanced, approvalThreshold: 0.001 }
  const estimate = budget.estimate({ inputTokens: 1000 }, model, policy, null)
  assert.equal(estimate.estimatedCost, 0.003)
  assert.equal(estimate.approvalRequired, true)
})

test('ProviderBudget no niega créditos por debajo de cero', () => {
  const budget = new ProviderBudget()
  const model = getModelInfo('gpt-4o')
  assert.ok(model)
  const estimate = budget.estimate({ inputTokens: 5000 }, model, balanced, 1)
  assert.equal(estimate.estimatedCredits, 2.5)
  assert.equal(estimate.remainingBudget, 0)
})
