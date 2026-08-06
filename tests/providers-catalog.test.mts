import assert from 'node:assert/strict'
import test from 'node:test'
import {
  MODEL_CATALOG,
  PROVIDER_CATALOG,
  getModelInfo,
  getProviderDescriptor,
  ProviderRegistry,
} from '../lib/providers/index.mts'

test('PROVIDER_CATALOG registra los 13 proveedores simulados', () => {
  assert.equal(PROVIDER_CATALOG.length, 13)
  const ids = PROVIDER_CATALOG.map((provider) => provider.id)
  assert.deepEqual(ids, [
    'openai',
    'anthropic',
    'google',
    'openrouter',
    'ollama',
    'lm-studio',
    'azure-openai',
    'v0',
    'github-models',
    'mistral',
    'together',
    'groq',
    'deepseek',
  ])
})

test('Cada proveedor del catálogo expone los campos requeridos', () => {
  for (const provider of PROVIDER_CATALOG) {
    assert.equal(provider.name.length > 0, true, provider.id)
    assert.ok(provider.speed >= 1 && provider.speed <= 5, provider.id)
    assert.ok(provider.quality >= 1 && provider.quality <= 5, provider.id)
    assert.ok(provider.models.length > 0, provider.id)
    assert.ok(provider.monthlyLimit >= 0, provider.id)
    assert.equal(provider.detail.length > 0, true, provider.id)
  }
})

test('ProviderRegistry crea una cuenta por proveedor', () => {
  const registry = new ProviderRegistry()
  assert.equal(registry.size, 13)
  for (const provider of PROVIDER_CATALOG) {
    assert.equal(registry.has(provider.id), true)
    const account = registry.get(provider.id)
    assert.equal(account?.id, provider.id)
    assert.deepEqual(account?.descriptor.models, provider.models)
  }
})

test('ProviderRegistry: los proveedores locales están conectados sin autenticación', () => {
  const registry = new ProviderRegistry()
  const ollama = registry.get('ollama')
  assert.equal(ollama?.connected, true)
  assert.equal(ollama?.authenticated, true)
  assert.equal(ollama?.creditsAvailable, null)
  assert.equal(registry.get('openai')?.connected, false)
})

test('ProviderRegistry.getActive devuelve el primer proveedor conectado y autenticado', () => {
  const registry = new ProviderRegistry()
  assert.equal(registry.getActive()?.id, 'ollama')

  const openai = registry.get('openai')
  openai?.connect()
  openai?.setAuthenticated()
  assert.equal(registry.getActive(), openai)
})

test('MODEL_CATALOG cubre todos los proveedores con modelos coherentes', () => {
  assert.ok(MODEL_CATALOG.length >= 20)
  for (const provider of PROVIDER_CATALOG) {
    for (const modelId of provider.models) {
      const model = getModelInfo(modelId)
      assert.equal(model?.provider, provider.id, `Modelo ${modelId} fuera de ${provider.id}`)
      assert.ok(model, `Falta el modelo ${modelId} del catálogo`)
    }
  }
})

test('Cada modelo del catálogo expone los campos requeridos', () => {
  for (const model of MODEL_CATALOG) {
    assert.equal(model.name.length > 0, true, model.id)
    assert.ok(model.capabilities.reasoning >= 1 && model.capabilities.reasoning <= 5, model.id)
    assert.ok(model.capabilities.coding >= 1 && model.capabilities.coding <= 5, model.id)
    assert.ok(model.capabilities.frontend >= 1 && model.capabilities.frontend <= 5, model.id)
    assert.ok(model.capabilities.backend >= 1 && model.capabilities.backend <= 5, model.id)
    assert.ok(model.contextWindow > 0, model.id)
    assert.ok(model.speed >= 1 && model.speed <= 5, model.id)
    assert.ok(model.pricing.per1kInput >= 0, model.id)
    assert.ok(model.pricing.per1kOutput >= 0, model.id)
    assert.equal(model.pricing.currency, 'USD', model.id)
  }
})

test('getProviderDescriptor y getModelInfo fallan con ids desconocidos', () => {
  assert.equal(getProviderDescriptor('unknown' as never), null)
  assert.equal(getModelInfo('unknown' as never), null)
})
