import assert from 'node:assert/strict'
import test from 'node:test'
import {
  createInitialDnaState,
  createInitialHealthState,
  createInitialRuntimeState,
  KernelContextEventBus,
  KernelContextStore,
} from '../lib/kernel/context/index.mts'

test('KernelContextStore registra, publica, actualiza y elimina dominios', () => {
  const events = new KernelContextEventBus()
  const store = new KernelContextStore(events, () => 'now')
  store.register('runtime', createInitialRuntimeState())
  store.register('health', createInitialHealthState())
  store.register('dna', createInitialDnaState())

  assert.equal(store.read('runtime')?.lifecycle, 'stopped')
  assert.equal(store.getVersion(), 0)

  store.update('runtime', { lifecycle: 'running' })
  assert.equal(store.read('runtime')?.lifecycle, 'running')
  assert.equal(store.getVersion(), 1)

  store.publish('health', { status: 'healthy', message: 'ok' })
  assert.equal(store.read('health')?.status, 'healthy')
  assert.equal(store.getVersion(), 2)

  store.remove('dna')
  assert.equal(store.read('dna'), undefined)
  assert.equal(store.getVersion(), 3)

  const snapshot = store.getSnapshot()
  assert.equal(snapshot.runtime.lifecycle, 'running')
  assert.equal(snapshot.dna.dna, null)
  assert.equal(snapshot.version, 3)
})

test('KernelContextStore registra una sola vez y versiona cada cambio', () => {
  const events = new KernelContextEventBus()
  const store = new KernelContextStore(events, () => 'now')
  const registered: string[] = []
  events.on('PublisherRegistered', ({ payload }) => registered.push(payload.domain))

  store.register('health', createInitialHealthState())
  store.register('health', createInitialHealthState())
  assert.deepEqual(registered, ['health'])

  store.update('health', { message: 'a' })
  store.update('health', { message: 'b' })
  store.update('health', { message: 'c' })
  assert.equal(store.getVersion(), 3)
})

test('KernelContextStore notifica a los listeners suscritos', () => {
  const events = new KernelContextEventBus()
  const store = new KernelContextStore(events, () => 'now')
  store.register('health', createInitialHealthState())
  let notified = 0
  const off = store.subscribe(() => {
    notified += 1
  })
  store.publish('health', { status: 'healthy', message: 'ok' })
  assert.equal(notified, 1)
  off()
  store.publish('health', { status: 'warning', message: 'w' })
  assert.equal(notified, 1)
})
