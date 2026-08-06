import assert from 'node:assert/strict'
import test from 'node:test'
import {
  ProviderManager,
  PROVIDER_CATALOG,
  MODEL_CATALOG,
} from '../lib/providers/index.mts'

test('ProviderManager.listProviders expone los 13 proveedores con los campos requeridos', () => {
  const manager = new ProviderManager()
  const providers = manager.listProviders()
  assert.equal(providers.length, 13)
  for (const provider of providers) {
    assert.equal(typeof provider.name, 'string')
    assert.equal(typeof provider.connected, 'boolean')
    assert.equal(typeof provider.authenticated, 'boolean')
    assert.ok(provider.limit >= 0)
    assert.ok(provider.estimatedCost >= 0)
    assert.ok(provider.estimatedSpeed >= 1)
    assert.ok(provider.estimatedQuality >= 1)
    assert.ok(provider.models.length > 0)
  }
})

test('ProviderManager.getProvider y getActiveProvider', () => {
  const manager = new ProviderManager()
  assert.equal(manager.getProvider('openai')?.id, 'openai')
  assert.equal(manager.getProvider('unknown' as never), null)
  assert.equal(manager.getActiveProvider()?.id, 'ollama')

  manager.login('openai')
  assert.equal(manager.getActiveProvider()?.id, 'openai')
})

test('ProviderManager.login/logout/refresh/session simulan el ciclo de vida', () => {
  const manager = new ProviderManager()
  assert.equal(manager.session('openai'), null)

  const session = manager.login('openai')
  assert.equal(session?.authenticated, true)
  assert.equal(manager.getProvider('openai')?.authenticated, true)

  const refreshed = manager.refresh('openai')
  assert.equal(refreshed?.status, 'authenticated')

  manager.logout('openai')
  assert.equal(manager.session('openai'), null)
  assert.equal(manager.getProvider('openai')?.authenticated, false)
})

test('ProviderManager.login solo funciona con proveedores del catálogo', () => {
  const manager = new ProviderManager()
  assert.equal(manager.login('unknown' as never), null)
  assert.equal(manager.refresh('unknown' as never), null)
})

test('ProviderManager.estimateBudget estima a partir del catálogo y la cuenta', () => {
  const manager = new ProviderManager()
  manager.login('openai')
  const estimate = manager.estimateBudget({ modelId: 'gpt-4o', inputTokens: 1000 })
  assert.equal(estimate.estimatedCost, 0.005)
  assert.equal(estimate.estimatedCredits, 0.5)
  assert.equal(estimate.estimatedTokens, 1000)
  assert.equal(estimate.approvalRequired, false)
})

test('ProviderManager.setPolicy cambia la política activa', () => {
  const manager = new ProviderManager()
  assert.equal(manager.policy().id, 'balanced')
  manager.setPolicy('offline')
  assert.equal(manager.policy().id, 'offline')
  assert.equal(manager.policy().constraints.allowExternalModels, false)
})

test('ProviderManager.healthSummary agrega el estado de todos los proveedores', () => {
  const manager = new ProviderManager()
  manager.login('openai')
  const summary = manager.healthSummary()
  assert.equal(summary.total, 13)
  assert.ok(summary.connectedCount >= 3)
  assert.ok(summary.status === 'healthy' || summary.status === 'warning')
})

test('ProviderManager.readModel es de solo lectura y compatible con el catálogo', () => {
  const manager = new ProviderManager()
  manager.login('anthropic')
  const read = manager.readModel()

  assert.equal(read.listModels().length, MODEL_CATALOG.length)
  assert.equal(read.getModel('claude-sonnet-4')?.provider, 'anthropic')
  assert.equal(read.getModel('claude-sonnet-4')?.name, 'Claude Sonnet 4')
  assert.equal(read.modelsByProvider('openai').length, 3)
  assert.equal(read.policy().id, 'balanced')
  assert.equal(read.getActiveProvider()?.id, 'anthropic')
  assert.equal(read.session('anthropic')?.authenticated, true)
  assert.ok(read.healthSummary().total === PROVIDER_CATALOG.length)
})

test('ProviderManager no ejecuta ninguna acción: solo estado simulado', () => {
  const manager = new ProviderManager()
  manager.login('openai')
  const provider = manager.getProvider('openai')
  assert.equal(provider?.connected, true)
  assert.equal(provider?.authenticated, true)
})
