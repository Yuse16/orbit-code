import assert from 'node:assert/strict'
import test from 'node:test'
import { RuntimeEventBus } from '../lib/runtime/index.mts'

test('RuntimeEventBus entrega eventos tipados y onAny', () => {
  const bus = new RuntimeEventBus()
  const seen: string[] = []
  bus.on('AdapterFailed', ({ payload }) => seen.push(`typed:${payload.adapterId}`))
  bus.onAny((event) => seen.push(`any:${event.type}`))

  bus.emit('AdapterFailed', { adapterId: 'docker', message: 'boom' })
  bus.emit('AdapterStopped', { adapterId: 'git' })
  assert.deepEqual(seen, ['typed:docker', 'any:AdapterFailed', 'any:AdapterStopped'])
})

test('RuntimeEventBus permite desuscribirse', () => {
  const bus = new RuntimeEventBus()
  let count = 0
  const off = bus.on('HealthChanged', () => {
    count += 1
  })

  bus.emit('HealthChanged', { status: 'healthy', message: 'ok' })
  off()
  bus.emit('HealthChanged', { status: 'warning', message: 'warn' })
  assert.equal(count, 1)
})

test('RuntimeEventBus conserva el payload tipado del evento', () => {
  const bus = new RuntimeEventBus()
  const received: string[] = []
  bus.on('CapabilityChanged', ({ payload }) =>
    received.push(`${payload.adapterId}:${payload.capability.id}:${payload.capability.available}`),
  )
  bus.emit('CapabilityChanged', {
    adapterId: 'git',
    capability: { id: 'Status', name: 'Ver estado', available: true, reason: 'simulado' },
  })
  assert.deepEqual(received, ['git:Status:true'])
})
