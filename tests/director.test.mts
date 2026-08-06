import assert from 'node:assert/strict'
import test from 'node:test'
import { createDirector, Director, isExecutionPlan } from '../lib/director/index.mts'
import { buildKernelReader } from './director-test-helpers.mts'

const NOW = '2026-01-02T00:00:00.000Z'

test('Director devuelve un ExecutionPlan válido', () => {
  const director = createDirector({ now: () => NOW })
  const plan = director.decide({
    request: { objective: 'Implementar la API de pagos', kind: 'backend' },
    kernel: buildKernelReader(),
  })
  assert.equal(isExecutionPlan(plan), true)
  assert.equal(plan.id, 'plan-2026-01-02T00:00:00.000Z')
  assert.equal(plan.policy, 'balanced')
  assert.equal(plan.objective, 'Implementar la API de pagos')
  assert.equal(director.history.size, 1)
})

test('Director usa la política por defecto configurada', () => {
  const director = new Director({ policy: 'offline', now: () => NOW })
  const plan = director.decide({
    request: { objective: 'Construir la aplicación completa' },
    kernel: buildKernelReader(),
  })
  assert.equal(plan.policy, 'offline')
  assert.ok(plan.recommendedModels.every((r) => r.model === 'local-model'))
})

test('Director permite sobreescribir la política por solicitud', () => {
  const director = createDirector({ now: () => NOW })
  const plan = director.decide({
    request: { objective: 'Construir la aplicación completa', policy: 'safe' },
    kernel: buildKernelReader(),
  })
  assert.equal(plan.policy, 'safe')
  assert.equal(plan.approvalRequired, true)
})

test('Director guarda el historial y recupera el último plan', () => {
  const director = createDirector({ now: () => NOW })
  assert.equal(director.getLatestPlan(), null)
  const kernel = buildKernelReader()
  director.decide({ request: { objective: 'Tarea uno' }, kernel })
  director.decide({ request: { objective: 'Tarea dos' }, kernel })
  assert.equal(director.history.size, 2)
  assert.equal(director.getLatestPlan()?.objective, 'Tarea dos')
  assert.deepEqual(
    director.history.list().map((record) => record.request.objective),
    ['Tarea uno', 'Tarea dos'],
  )
})

test('Director.dispose limpia el historial', () => {
  const director = createDirector({ now: () => NOW })
  director.decide({ request: { objective: 'Tarea uno' }, kernel: buildKernelReader() })
  assert.equal(director.history.size, 1)
  director.dispose()
  assert.equal(director.history.size, 0)
  assert.equal(director.getLatestPlan(), null)
})

test('Director no ejecuta acciones: solo produce un plan', () => {
  const director = createDirector({ now: () => NOW })
  const kernel = buildKernelReader()
  const plan = director.decide({ request: { objective: 'Construir la aplicación completa' }, kernel })
  assert.equal(plan.parallelTasks.length, 1)
  assert.equal(plan.sequentialTasks.length, 4)
})
