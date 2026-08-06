import assert from 'node:assert/strict'
import test from 'node:test'
import { EventBus } from '../lib/mission-control/event-bus.mts'

test('EventBus entrega cada evento solo a sus observadores', () => {
  const events = new EventBus()
  const received: string[] = []

  events.on('ProjectOpened', (event) => received.push(event.payload.project.name))
  events.on('BuildStarted', () => received.push('build'))

  events.emit('ProjectOpened', {
    project: { id: 'orbit', name: 'Orbit Code', path: '/workspace/orbit', framework: 'Next.js' },
    openedAt: '2026-08-05T10:00:00.000Z',
  })

  assert.deepEqual(received, ['Orbit Code'])
})

test('EventBus deja de notificar después de cancelar la suscripción', () => {
  const events = new EventBus()
  let calls = 0
  const unsubscribe = events.on('StageChanged', () => calls++)

  events.emit('StageChanged', { stage: 'implementacion' })
  unsubscribe()
  events.emit('StageChanged', { stage: 'pruebas' })

  assert.equal(calls, 1)
})
