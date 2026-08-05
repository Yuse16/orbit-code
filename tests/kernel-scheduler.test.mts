import assert from 'node:assert/strict'
import test from 'node:test'
import { createMockKernel } from '../lib/kernel/index.mts'

const fixedNow = () => '2026-08-05T13:00:00.000Z'

test('Kernel inicializa contexto, módulos, DNA y health simulados', () => {
  const kernel = createMockKernel({ now: fixedNow })
  const state = kernel.getSnapshot()

  assert.equal(state.lifecycle, 'running')
  assert.equal(state.health, 'healthy')
  assert.equal(state.dna?.projectName, 'Sin proyecto abierto')
  assert.ok(state.modules.every((module) => module.status === 'started'))
  assert.equal(kernel.getContext().environment, 'simulated')

  kernel.dispose()
})

test('Scheduler conserva prioridades, dependencias, espera, reintentos y cancelación sin ejecutar', () => {
  const kernel = createMockKernel({ now: fixedNow })
  kernel.scheduler.enqueue({ id: 'verify', title: 'Verificar', priority: 'low', maxRetries: 1 })
  kernel.scheduler.enqueue({
    id: 'build',
    title: 'Compilar',
    priority: 'critical',
    dependencies: ['setup'],
    assignedAgent: 'verificador',
  })

  assert.deepEqual(kernel.getSnapshot().scheduler.queue.map((task) => task.id), ['build', 'verify'])
  assert.equal(kernel.getSnapshot().scheduler.queue[0]?.status, 'waiting')
  kernel.scheduler.markReady('build')
  kernel.scheduler.retry('verify')
  kernel.scheduler.requestCancellation('build')

  const queue = kernel.getSnapshot().scheduler.queue
  assert.equal(queue.find((task) => task.id === 'build')?.cancellationRequested, true)
  assert.equal(queue.find((task) => task.id === 'verify')?.retryCount, 1)
  kernel.dispose()
})
