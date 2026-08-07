import assert from 'node:assert/strict'
import test from 'node:test'
import { EventBus, MissionStore } from '../lib/mission-control/index.mts'

test('MissionStore es la fuente de verdad para contexto de proyecto y etapa', () => {
  const events = new EventBus()
  const store = new MissionStore(events)
  let changes = 0
  const unsubscribe = store.subscribe(() => changes++)

  events.emit('ProjectOpened', {
    project: {
      id: 'orbit-code',
      name: 'Orbit Code',
      path: '/Users/jorge/Desktop/orbit-code-phase1',
      framework: 'Next.js + Tauri',
    },
    openedAt: '2026-08-05T10:00:00.000Z',
  })
  events.emit('StageChanged', { stage: 'implementacion' })

  const state = store.getSnapshot()
  assert.equal(state.project.name, 'Orbit Code')
  assert.equal(state.project.status, 'open')
  assert.deepEqual(state.recentProjects.map((project) => project.id), ['orbit-code'])
  assert.equal(state.tasks.currentStage, 'implementacion')
  assert.equal(changes, 2)

  unsubscribe()
  store.dispose()
})

test('MissionStore ordena recientes, elimina duplicados y conserva máximo cinco', () => {
  const events = new EventBus()
  const store = new MissionStore(events)
  const open = (id: string) =>
    events.emit('ProjectOpened', {
      project: { id, name: id, path: `/projects/${id}`, framework: 'unknown' },
      openedAt: '2026-08-05T10:00:00.000Z',
    })

  open('one')
  open('two')
  open('three')
  open('four')
  open('five')
  open('six')
  open('three')

  assert.deepEqual(
    store.getSnapshot().recentProjects.map((project) => project.id),
    ['three', 'six', 'five', 'four', 'two'],
  )
  store.dispose()
})

test('MissionStore actualiza providers y build mediante eventos', () => {
  const events = new EventBus()
  const store = new MissionStore(events)

  events.emit('ProviderConnected', { providerId: 'codex', detail: 'Simulado' })
  events.emit('ProviderActivated', { primaryProviderId: 'codex', secondaryProviderId: null })
  events.emit('BuildStarted', { command: 'pnpm build', startedAt: '2026-08-05T10:01:00.000Z' })
  events.emit('BuildFinished', { status: 'succeeded', finishedAt: '2026-08-05T10:02:00.000Z' })

  const state = store.getSnapshot()
  assert.equal(state.providers.primaryProviderId, 'codex')
  assert.equal(state.providers.providers.find((provider) => provider.id === 'codex')?.status, 'connected')
  assert.equal(state.build.status, 'succeeded')

  store.dispose()
})
