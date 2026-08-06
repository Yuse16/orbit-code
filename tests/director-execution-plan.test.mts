import assert from 'node:assert/strict'
import test from 'node:test'
import { createExecutionPlan, isExecutionPlan } from '../lib/director/index.mts'

test('createExecutionPlan rellena valores por defecto', () => {
  const plan = createExecutionPlan({ objective: 'Construir el login' })
  assert.equal(plan.objective, 'Construir el login')
  assert.equal(plan.id, '')
  assert.equal(plan.policy, 'balanced')
  assert.deepEqual(plan.recommendedModels, [])
  assert.equal(plan.estimatedTokens, 0)
  assert.equal(plan.approvalRequired, false)
})

test('createExecutionPlan preserva opciones provistas', () => {
  const plan = createExecutionPlan({
    objective: 'Prueba',
    id: 'plan-x',
    policy: 'offline',
    estimatedTokens: 1000,
    approvalRequired: true,
  })
  assert.equal(plan.id, 'plan-x')
  assert.equal(plan.policy, 'offline')
  assert.equal(plan.estimatedTokens, 1000)
  assert.equal(plan.approvalRequired, true)
})

test('isExecutionPlan valida la forma de un plan', () => {
  const plan = createExecutionPlan({ objective: 'Prueba' })
  assert.equal(isExecutionPlan(plan), true)
  assert.equal(isExecutionPlan({ objective: 'Prueba' }), false)
  assert.equal(isExecutionPlan(null), false)
  assert.equal(isExecutionPlan('plan'), false)
})
