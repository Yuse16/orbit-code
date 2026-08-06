import assert from 'node:assert/strict'
import test from 'node:test'
import { aggregateAdapterHealth } from '../lib/runtime/index.mts'
import type { RuntimeAdapterSnapshot } from '../lib/runtime/index.mts'
import { buildRuntime } from './test-helpers.mts'

const snapshot = (health: RuntimeAdapterSnapshot['health']): RuntimeAdapterSnapshot => ({
  id: 'git',
  name: 'Git',
  status: health === 'stopped' ? 'stopped' : 'running',
  health,
  startedAt: null,
  message: 'simulado',
  capabilities: [],
})

test('RuntimeHealth agrega los cinco estados de salud', () => {
  assert.deepEqual(aggregateAdapterHealth([]), { status: 'stopped', message: 'Runtime detenido.' })
  assert.equal(aggregateAdapterHealth([snapshot('healthy')]).status, 'healthy')
  assert.equal(aggregateAdapterHealth([snapshot('healthy'), snapshot('warning')]).status, 'warning')
  assert.equal(aggregateAdapterHealth([snapshot('healthy'), snapshot('error')]).status, 'error')
  assert.equal(
    aggregateAdapterHealth([snapshot('healthy'), snapshot('initializing')]).status,
    'initializing',
  )
  assert.equal(aggregateAdapterHealth([snapshot('stopped')]).status, 'stopped')
})

test('Runtime queda healthy cuando todos los adaptadores inician bien', () => {
  const runtime = buildRuntime([
    { id: 'desktop', name: 'Desktop', capabilities: [] },
    { id: 'git', name: 'Git', capabilities: [] },
  ])
  const changes: string[] = []
  runtime.events.on('HealthChanged', ({ payload }) => changes.push(payload.status))

  runtime.start()
  assert.equal(runtime.getSnapshot().health, 'healthy')
  runtime.stop()
  assert.equal(runtime.getSnapshot().health, 'stopped')
  runtime.dispose()
})

test('Runtime queda warning cuando un adaptador inicia con advertencia', () => {
  const runtime = buildRuntime([
    { id: 'desktop', name: 'Desktop', capabilities: [], warnOnStart: true },
    { id: 'git', name: 'Git', capabilities: [] },
  ])
  runtime.start()
  assert.equal(runtime.getSnapshot().health, 'warning')
  runtime.dispose()
})

test('Runtime queda error cuando un adaptador falla al iniciar', () => {
  const runtime = buildRuntime([
    {
      id: 'docker',
      name: 'Docker',
      capabilities: [{ id: 'ListContainers', name: 'Listar contenedores' }],
      failOnStart: true,
      failureMessage: 'Docker no disponible (simulado).',
    },
    { id: 'git', name: 'Git', capabilities: [] },
  ])
  runtime.start()
  assert.equal(runtime.getSnapshot().health, 'error')
  assert.equal(
    runtime.registry.get('docker')?.status().health,
    'error',
  )
  runtime.dispose()
})

test('RuntimeHealth emite HealthChanged solo cuando cambia el estado agregado', () => {
  const runtime = buildRuntime([
    { id: 'desktop', name: 'Desktop', capabilities: [], warnOnStart: true },
    { id: 'git', name: 'Git', capabilities: [] },
  ])
  const changes: string[] = []
  runtime.events.on('HealthChanged', ({ payload }) => changes.push(payload.status))

  runtime.start()
  runtime.start()
  runtime.stop()
  assert.deepEqual(changes, ['warning', 'stopped'])
  runtime.dispose()
})
