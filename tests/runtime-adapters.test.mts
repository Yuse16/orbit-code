import assert from 'node:assert/strict'
import test from 'node:test'
import {
  createAdapterHost,
  createSimulatedAdapter,
  DEFAULT_ADAPTER_SPECS,
  RuntimeEventBus,
} from '../lib/runtime/index.mts'

const hostFor = (events: RuntimeEventBus, now = () => '2026-01-01T00:00:00.000Z') =>
  createAdapterHost(events, now)

test('SimulatedAdapter publica capacidades y transiciona su ciclo de vida', () => {
  const events = new RuntimeEventBus()
  const host = hostFor(events)
  const started: string[] = []
  const changes: string[] = []
  events.on('AdapterStarted', ({ payload }) => started.push(payload.adapterId))
  events.on('CapabilityChanged', ({ payload }) => changes.push(payload.capability.id))

  const git = createSimulatedAdapter(DEFAULT_ADAPTER_SPECS[1], host)
  assert.equal(git.health(), 'stopped')
  assert.equal(git.status().status, 'stopped')

  git.start()
  assert.equal(git.health(), 'healthy')
  assert.equal(git.status().status, 'running')
  assert.equal(git.status().startedAt, '2026-01-01T00:00:00.000Z')
  assert.equal(git.status().capabilities.filter((c) => c.available).length, 6)
  assert.deepEqual(started, ['git'])
  assert.equal(changes.length, 6)

  git.stop()
  assert.equal(git.health(), 'stopped')
  assert.equal(git.status().status, 'stopped')
  assert.equal(git.status().capabilities.filter((c) => c.available).length, 0)
  git.dispose()
})

test('SimulatedAdapter fallido emite AdapterFailed y queda en error', () => {
  const events = new RuntimeEventBus()
  const host = hostFor(events)
  const failures: string[] = []
  events.on('AdapterFailed', ({ payload }) => failures.push(payload.message))

  const docker = createSimulatedAdapter(
    {
      id: 'docker',
      name: 'Docker',
      capabilities: [{ id: 'ListContainers', name: 'Listar contenedores' }],
      failOnStart: true,
      failureMessage: 'Docker no disponible (simulado).',
    },
    host,
  )
  docker.start()
  assert.equal(docker.health(), 'error')
  assert.equal(docker.status().status, 'error')
  assert.equal(docker.status().capabilities.filter((c) => c.available).length, 0)
  assert.deepEqual(failures, ['Docker no disponible (simulado).'])
})

test('SimulatedAdapter advertido queda en warning sin fallar', () => {
  const events = new RuntimeEventBus()
  const host = hostFor(events)
  const git = createSimulatedAdapter(
    { ...DEFAULT_ADAPTER_SPECS[1], warnOnStart: true, warningMessage: 'Git lento (simulado).' },
    host,
  )
  git.start()
  assert.equal(git.health(), 'warning')
  assert.equal(git.status().status, 'running')
  assert.equal(git.status().message, 'Git lento (simulado).')
})

test('SimulatedAdapter initialize no arranca y dispose detiene', () => {
  const events = new RuntimeEventBus()
  const host = hostFor(events)
  const stopped: string[] = []
  events.on('AdapterStopped', ({ payload }) => stopped.push(payload.adapterId))

  const desktop = createSimulatedAdapter(DEFAULT_ADAPTER_SPECS[0], host)
  desktop.initialize()
  assert.equal(desktop.status().status, 'initializing')
  assert.equal(desktop.status().capabilities.filter((c) => c.available).length, 0)

  desktop.start()
  desktop.dispose()
  assert.equal(desktop.health(), 'stopped')
  assert.deepEqual(stopped, ['desktop'])
})
