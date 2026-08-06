import assert from 'node:assert/strict'
import test from 'node:test'
import {
  DECISION_POLICIES,
  isDecisionPolicyId,
  POLICY_IDS,
  resolvePolicy,
} from '../lib/director/index.mts'

test('DECISION_POLICIES define las seis políticas', () => {
  assert.deepEqual(POLICY_IDS, ['minimum-cost', 'maximum-quality', 'balanced', 'offline', 'fast', 'safe'])
  for (const id of POLICY_IDS) {
    const policy = DECISION_POLICIES[id]
    assert.equal(policy.id, id)
    assert.ok(policy.label.length > 0)
    assert.ok(policy.description.length > 0)
    assert.ok(policy.constraints.maxDistinctModels >= 1)
  }
})

test('resolvePolicy devuelve la política solicitada', () => {
  assert.equal(resolvePolicy('safe').label, 'Modo Seguro')
  assert.equal(resolvePolicy('offline').label, 'Modo Offline')
})

test('La política safe exige aprobación y evita modelos externos', () => {
  const safe = resolvePolicy('safe').constraints
  assert.equal(safe.requireApproval, true)
  assert.equal(safe.allowExternalModels, false)
})

test('La política fast minimiza el tiempo', () => {
  const fast = resolvePolicy('fast').constraints
  assert.equal(fast.preferSpeed, true)
  assert.equal(fast.maxDistinctModels, 1)
})

test('La política offline usa solo modelos locales', () => {
  const offline = resolvePolicy('offline').constraints
  assert.equal(offline.allowExternalModels, false)
  assert.equal(offline.preferLocalModels, true)
})

test('La política balanced permite modelos externos sin exigir aprobación', () => {
  const balanced = resolvePolicy('balanced').constraints
  assert.equal(balanced.allowExternalModels, true)
  assert.equal(balanced.requireApproval, false)
})

test('isDecisionPolicyId valida identificadores', () => {
  assert.equal(isDecisionPolicyId('balanced'), true)
  assert.equal(isDecisionPolicyId('unknown'), false)
  assert.equal(isDecisionPolicyId(42), false)
})
