import assert from 'node:assert/strict'
import test from 'node:test'
import { createMockKernel } from '../lib/kernel/index.mts'

test('El Kernel publica todos los subsistemas en KernelContext', () => {
  const kernel = createMockKernel()
  const snapshot = kernel.getContextSnapshot()

  assert.equal(snapshot.runtime.lifecycle, 'running')
  assert.equal(snapshot.runtime.adapters.length, 14)
  assert.equal(snapshot.mission.project.status, 'closed')
  assert.equal(snapshot.scheduler.status, 'running')
  assert.equal(snapshot.capabilities.items.length, 22)
  assert.equal(snapshot.health.status, 'healthy')
  assert.equal(snapshot.dna.dna?.projectName, 'Sin proyecto abierto')
  assert.equal(snapshot.providers.providers.length, 10)
  assert.equal(snapshot.notifications.unreadCount, 0)
  assert.equal(snapshot.memory.status, 'idle')
  assert.equal(snapshot.workspace.structureDetected, true)
  assert.equal(snapshot.version >= 1, true)
  assert.ok(snapshot.timestamp)
  kernel.dispose()
})

test('Las acciones de Mission Control se reflejan en KernelContext', () => {
  const kernel = createMockKernel()
  kernel.setStage('pruebas')
  assert.equal(kernel.getContextSnapshot().mission.tasks.currentStage, 'pruebas')

  kernel.updateGitStatus({ branch: 'feat/x', pendingChanges: 3 })
  const mission = kernel.getContextSnapshot().mission
  assert.equal(mission.git.branch, 'feat/x')
  assert.equal(mission.git.pendingChanges, 3)
  kernel.dispose()
})

test('El Scheduler se publica en el dominio scheduler', () => {
  const kernel = createMockKernel()
  kernel.scheduler.enqueue({ id: 'build', title: 'Build', priority: 'high' })

  const scheduler = kernel.getContextSnapshot().scheduler
  assert.equal(scheduler.queue[0]?.id, 'build')
  assert.equal(scheduler.queue[0]?.status, 'queued')
  kernel.dispose()
})

test('Mission Runtime y Runtime no se consultan entre sí: ambos publican estado', () => {
  const kernel = createMockKernel()
  const snapshot = kernel.getContextSnapshot()

  assert.equal('adapters' in snapshot.mission, false)
  assert.equal('project' in snapshot.runtime, false)
  assert.equal(snapshot.mission.project.status, 'closed')
  assert.equal(snapshot.runtime.adapters.length, 14)
  kernel.dispose()
})

test('El Kernel expone un reader de solo lectura del contexto', () => {
  const kernel = createMockKernel()
  const reader = kernel.getContextReader()
  assert.equal(reader.read('health')?.status, 'healthy')
  assert.equal('publish' in reader, false)
  kernel.dispose()
})
