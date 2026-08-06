import assert from 'node:assert/strict'
import test from 'node:test'
import { HealthPublisher, KernelContext } from '../lib/kernel/context/index.mts'

test('KernelContextReader es de solo lectura y se suscribe a cambios', () => {
  const context = new KernelContext()
  const health = new HealthPublisher(context)
  const reader = context.createReader()

  let notified = 0
  const off = reader.subscribe(() => {
    notified += 1
  })

  health.update({ status: 'healthy', message: 'ok' })
  assert.equal(notified, 1)
  assert.equal(reader.read('health')?.status, 'healthy')
  assert.equal(reader.getVersion(), 1)
  assert.equal(reader.getSnapshot().health.status, 'healthy')

  off()
  health.update({ message: 'otro' })
  assert.equal(notified, 1)
  context.dispose()
})

test('KernelContextReader expone snapshot y versiones sin mutar el contexto', () => {
  const context = new KernelContext()
  const reader = context.createReader()
  const snapshot = reader.getSnapshot()

  assert.equal('publish' in reader, false)
  assert.equal('update' in reader, false)
  assert.equal(snapshot.version, 0)
  context.dispose()
})
