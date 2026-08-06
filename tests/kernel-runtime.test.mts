import assert from 'node:assert/strict'
import test from 'node:test'
import { createMockKernel, Kernel } from '../lib/kernel/index.mts'

test('createMockKernel arranca el runtime dentro del grafo y expone solo el registry', () => {
  const kernel = createMockKernel()
  const registry = kernel.getRuntimeRegistry()
  assert.ok(registry)
  assert.equal(registry.list().length, 14)
  assert.equal(registry.get('git')?.status().status, 'running')
  assert.equal(registry.get('git')?.status().capabilities.filter((c) => c.available).length, 6)

  kernel.stop()
  assert.equal(registry.get('git')?.status().status, 'stopped')
  kernel.dispose()
})

test('Kernel sin runtime expone registry null', () => {
  const kernel = new Kernel(() => 'now', {})
  assert.equal(kernel.getRuntimeRegistry(), null)
  kernel.dispose()
})

test('El runtime no se expone como adaptador en el kernel: solo registry', () => {
  const kernel = createMockKernel()
  const registry = kernel.getRuntimeRegistry()
  const anyKernel = kernel as unknown as Record<string, unknown>
  assert.ok(registry)
  assert.equal(anyKernel['adapters'], undefined)
  kernel.dispose()
})
