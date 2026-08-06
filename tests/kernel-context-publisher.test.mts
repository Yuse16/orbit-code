import assert from 'node:assert/strict'
import test from 'node:test'
import {
  HealthPublisher,
  KernelContext,
  MissionPublisher,
  RuntimePublisher,
} from '../lib/kernel/context/index.mts'

test('Los Publishers publican, actualizan, eliminan y leen solo su dominio', () => {
  const context = new KernelContext()
  const runtime = new RuntimePublisher(context)
  const mission = new MissionPublisher(context)
  const health = new HealthPublisher(context)

  runtime.publish({
    lifecycle: 'running',
    health: 'healthy',
    startedAt: 't0',
    adapters: [],
    availableCapabilities: 0,
    totalCapabilities: 0,
  })
  assert.equal(runtime.snapshot()?.lifecycle, 'running')
  assert.equal(context.read('runtime')?.lifecycle, 'running')

  runtime.update({ health: 'warning' })
  assert.equal(runtime.snapshot()?.health, 'warning')
  assert.equal(runtime.snapshot()?.lifecycle, 'running')

  assert.equal(mission.snapshot()?.project.status, 'closed')
  assert.equal(health.snapshot()?.status, 'unknown')

  runtime.remove()
  assert.equal(context.read('runtime'), undefined)
  assert.equal(context.getSnapshot().runtime.lifecycle, 'stopped')
  context.dispose()
})

test('Un Publisher no afecta dominios ajenos', () => {
  const context = new KernelContext()
  const health = new HealthPublisher(context)
  const mission = new MissionPublisher(context)
  health.update({ status: 'healthy', message: 'ok' })

  assert.equal(health.snapshot()?.status, 'healthy')
  assert.equal(mission.snapshot()?.project.status, 'closed')
  assert.equal(context.read('health')?.status, 'healthy')
  context.dispose()
})
