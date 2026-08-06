import assert from 'node:assert/strict'
import test from 'node:test'
import { createDefaultRuntime } from '../lib/runtime/index.mts'
import { buildRuntime } from './test-helpers.mts'

test('Runtime transiciona stopped -> starting -> running -> stopped', () => {
  const runtime = createDefaultRuntime()
  assert.equal(runtime.getSnapshot().lifecycle, 'stopped')

  runtime.start()
  assert.equal(runtime.getSnapshot().lifecycle, 'running')
  runtime.start()
  assert.equal(runtime.getSnapshot().lifecycle, 'running')

  runtime.stop()
  assert.equal(runtime.getSnapshot().lifecycle, 'stopped')
  runtime.stop()
  assert.equal(runtime.getSnapshot().lifecycle, 'stopped')
  runtime.dispose()
})

test('Runtime emite RuntimeStarted y RuntimeStopped', () => {
  const runtime = createDefaultRuntime()
  const seen: string[] = []
  runtime.events.on('RuntimeStarted', ({ payload }) => seen.push(`start:${payload.startedAt}`))
  runtime.events.on('RuntimeStopped', ({ payload }) => seen.push(`stop:${payload.stoppedAt}`))

  runtime.start()
  runtime.stop()
  assert.equal(seen.length, 2)
  assert.ok(seen[0]?.startsWith('start:'))
  assert.ok(seen[1]?.startsWith('stop:'))
  runtime.dispose()
})

test('Runtime arranca los adaptadores registrados en orden de registro', () => {
  const runtime = buildRuntime([
    { id: 'desktop', name: 'Desktop', capabilities: [{ id: 'Notify', name: 'Notificar' }] },
    { id: 'git', name: 'Git', capabilities: [{ id: 'Status', name: 'Ver estado' }] },
  ])
  const started: string[] = []
  runtime.events.on('AdapterStarted', ({ payload }) => started.push(payload.adapterId))

  runtime.start()
  assert.deepEqual(started, ['desktop', 'git'])
  runtime.dispose()
})
