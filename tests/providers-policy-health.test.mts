import assert from 'node:assert/strict'
import test from 'node:test'
import {
  PROVIDER_POLICIES,
  getProviderPolicy,
  listProviderPolicies,
  ProviderHealth,
  ProviderRegistry,
} from '../lib/providers/index.mts'

test('PROVIDER_POLICIES define las seis políticas con restricciones', () => {
  assert.deepEqual(
    PROVIDER_POLICIES.map((policy) => policy.id),
    ['balanced', 'minimum-cost', 'maximum-quality', 'offline', 'safe', 'fast'],
  )
  for (const policy of PROVIDER_POLICIES) {
    assert.ok(policy.label.length > 0)
    assert.ok(policy.description.length > 0)
    assert.ok(policy.constraints.monthlyBudgetCredits >= 0)
    assert.ok(policy.constraints.maxProvidersActive >= 1)
  }
})

test('La política offline solo permite modelos locales', () => {
  const constraints = getProviderPolicy('offline').constraints
  assert.equal(constraints.allowExternalModels, false)
  assert.equal(constraints.preferLocalModels, true)
})

test('La política safe exige aprobación y restringe proveedores externos', () => {
  const constraints = getProviderPolicy('safe').constraints
  assert.equal(constraints.requireApproval, true)
  assert.equal(constraints.allowExternalModels, false)
  assert.equal(constraints.maxProvidersActive, 1)
})

test('La política fast baja el umbral de aprobación y no exige aprobación', () => {
  const constraints = getProviderPolicy('fast').constraints
  assert.equal(constraints.requireApproval, false)
  assert.equal(constraints.approvalThreshold, 10)
})

test('listProviderPolicies y getProviderPolicy con fallback', () => {
  assert.equal(listProviderPolicies().length, 6)
  assert.equal(getProviderPolicy('unknown' as never).id, 'balanced')
})

test('ProviderHealth resume el registro por defecto como warning', () => {
  const health = new ProviderHealth()
  const snapshots = new ProviderRegistry().listSnapshots()
  const summary = health.summarize(snapshots)
  assert.equal(summary.status, 'warning')
  assert.equal(summary.connectedCount, 2)
  assert.equal(summary.authenticatedCount, 2)
  assert.equal(summary.total, 13)
})

test('ProviderHealth marca offline cuando nada está conectado', () => {
  const health = new ProviderHealth()
  const snapshots = new ProviderRegistry().listSnapshots().map((snapshot) => ({
    ...snapshot,
    connected: false,
    authenticated: false,
    health: 'offline' as const,
  }))
  const summary = health.summarize(snapshots)
  assert.equal(summary.status, 'offline')
  assert.equal(summary.connectedCount, 0)
})

test('ProviderHealth marca warning cuando conecta menos de la mitad', () => {
  const health = new ProviderHealth()
  const snapshots = new ProviderRegistry().listSnapshots().map((snapshot, index) => ({
    ...snapshot,
    connected: index < 6,
    authenticated: index < 6,
    health: (index < 6 ? 'healthy' : 'offline') as 'healthy' | 'offline',
  }))
  const summary = health.summarize(snapshots)
  assert.equal(summary.status, 'warning')
})

test('ProviderHealth marca healthy cuando todos conectan', () => {
  const health = new ProviderHealth()
  const snapshots = new ProviderRegistry().listSnapshots().map((snapshot) => ({
    ...snapshot,
    connected: true,
    authenticated: true,
    health: 'healthy' as const,
  }))
  const summary = health.summarize(snapshots)
  assert.equal(summary.status, 'healthy')
  assert.equal(summary.connectedCount, 13)
})

test('ProviderHealth maneja un conjunto vacío', () => {
  const health = new ProviderHealth()
  const summary = health.summarize([])
  assert.equal(summary.status, 'error')
  assert.ok(summary.message.includes('Sin proveedores'))
})
