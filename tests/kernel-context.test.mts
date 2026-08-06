import assert from 'node:assert/strict'
import test from 'node:test'
import {
  CapabilityPublisher,
  createInitialDnaState,
  HealthPublisher,
  KernelContext,
  KernelContextPublisher,
  MemoryPublisher,
  MissionPublisher,
  NotificationPublisher,
  ProviderPublisher,
  RuntimePublisher,
  SchedulerPublisher,
  WorkspacePublisher,
} from '../lib/kernel/context/index.mts'

test('KernelContext registra los 10 dominios y produce un snapshot único', () => {
  const context = new KernelContext(() => '2026-01-01T00:00:00.000Z')
  new RuntimePublisher(context)
  new MissionPublisher(context)
  new SchedulerPublisher(context)
  new WorkspacePublisher(context)
  new ProviderPublisher(context)
  new MemoryPublisher(context)
  new NotificationPublisher(context)
  new CapabilityPublisher(context)
  new HealthPublisher(context)
  new KernelContextPublisher<'dna'>(context, 'dna', createInitialDnaState())

  const snapshot = context.getSnapshot()
  assert.deepEqual(Object.keys(snapshot).sort(), [
    'capabilities',
    'dna',
    'health',
    'memory',
    'mission',
    'notifications',
    'providers',
    'runtime',
    'scheduler',
    'timestamp',
    'version',
    'workspace',
  ])
  assert.equal(snapshot.version, 0)
  assert.equal(snapshot.timestamp, '2026-01-01T00:00:00.000Z')
  assert.equal(context.getVersion(), 0)
  assert.equal(context.read('scheduler')?.status, 'stopped')
  assert.equal(context.read('dna')?.dna, null)
  context.dispose()
})

test('KernelContext publica, actualiza, lee y elimina por dominio', () => {
  const context = new KernelContext()
  const runtime = new RuntimePublisher(context)
  assert.equal(context.read('runtime')?.lifecycle, 'stopped')

  runtime.update({ lifecycle: 'running' })
  assert.equal(context.read('runtime')?.lifecycle, 'running')
  assert.equal(context.getSnapshot().runtime.health, 'stopped')

  runtime.publish({
    lifecycle: 'running',
    health: 'healthy',
    startedAt: 't0',
    adapters: [],
    availableCapabilities: 1,
    totalCapabilities: 1,
  })
  assert.equal(context.read('runtime')?.health, 'healthy')

  context.remove('runtime')
  assert.equal(context.read('runtime'), undefined)
  context.dispose()
})
