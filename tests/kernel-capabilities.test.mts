import assert from 'node:assert/strict'
import test from 'node:test'
import {
  CapabilityRegistry,
  createMockOrbitDNA,
  KernelEventBus,
} from '../lib/kernel/index.mts'

test('CapabilityRegistry registra el catálogo simulado y comunica cambios', () => {
  const events = new KernelEventBus()
  const changes: string[] = []
  events.on('CapabilityChanged', ({ payload }) => changes.push(payload.capability.id))
  const registry = new CapabilityRegistry(events)

  assert.equal(registry.list().length, 22)
  assert.equal(registry.get('git')?.available, false)

  registry.requestDiscovery('git')
  assert.equal(registry.get('git')?.status, 'discovering')
  assert.deepEqual(changes, ['git'])
})

test('OrbitDNA conserva una descripción simulada de proyecto sin leer el disco', () => {
  const dna = createMockOrbitDNA({
    projectName: 'Orbit Code',
    framework: 'Next.js + Tauri',
    preferences: { locale: 'es-MX' },
  })

  assert.equal(dna.projectName, 'Orbit Code')
  assert.equal(dna.preferences.locale, 'es-MX')
  assert.equal(dna.database, 'No configurada')
})
