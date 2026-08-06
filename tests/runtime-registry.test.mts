import assert from 'node:assert/strict'
import test from 'node:test'
import {
  createAdapterHost,
  createSimulatedAdapter,
  DEFAULT_ADAPTER_SPECS,
  RuntimeEventBus,
  RuntimeRegistry,
} from '../lib/runtime/index.mts'

test('RuntimeRegistry registra explícitamente sin duplicar', () => {
  const events = new RuntimeEventBus()
  const host = createAdapterHost(events, () => 'now')
  const registry = new RuntimeRegistry(events)
  const registered: string[] = []
  events.on('AdapterRegistered', ({ payload }) => registered.push(payload.adapterId))

  const git = createSimulatedAdapter(DEFAULT_ADAPTER_SPECS[1], host)
  registry.register(git)
  registry.register(git)

  assert.equal(registry.list().length, 1)
  assert.equal(registry.has('git'), true)
  assert.equal(registry.get('git'), git)
  assert.deepEqual(registered, ['git'])
})

test('RuntimeRegistry no usa reflexión: solo adaptadores registrados', () => {
  const events = new RuntimeEventBus()
  const host = createAdapterHost(events, () => 'now')
  const registry = new RuntimeRegistry(events)
  assert.equal(registry.has('docker'), false)
  registry.register(createSimulatedAdapter(DEFAULT_ADAPTER_SPECS[6], host))
  assert.equal(registry.has('sqlite'), true)
  assert.equal(registry.has('docker'), false)
  assert.equal(registry.snapshots().length, 1)
})
