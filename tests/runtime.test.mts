import assert from 'node:assert/strict'
import test from 'node:test'
import { createDefaultRuntime } from '../lib/runtime/index.mts'

test('createDefaultRuntime registra 14 adaptadores y arranca con salud healthy', () => {
  const runtime = createDefaultRuntime()
  assert.equal(runtime.registry.list().length, 14)
  runtime.start()

  const snapshot = runtime.getSnapshot()
  assert.equal(snapshot.lifecycle, 'running')
  assert.equal(snapshot.health, 'healthy')
  assert.equal(snapshot.environment, 'simulated')
  assert.equal(snapshot.adapters.length, 14)
  assert.ok(snapshot.startedAt)
  runtime.dispose()
})

test('Runtime agrega capacidades simuladas y las activa al arrancar', () => {
  const runtime = createDefaultRuntime()
  const before = runtime.getCapabilities()
  assert.equal(before.totalCount, 36)
  assert.equal(before.availableCount, 0)

  runtime.start()
  const after = runtime.getCapabilities()
  assert.equal(after.availableCount, after.totalCount)
  runtime.dispose()
})
