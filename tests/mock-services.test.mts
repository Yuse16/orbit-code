import assert from 'node:assert/strict'
import test from 'node:test'
import { createMockMissionControl, MockDesktopClient } from '../lib/mission-control/index.mts'

const fixedNow = () => '2026-08-05T12:00:00.000Z'

test('servicios simulados actualizan MissionState únicamente mediante eventos', () => {
  const mission = createMockMissionControl({ now: fixedNow })

  mission.services.project.open({
    id: 'orbit-code',
    name: 'Orbit Code',
    path: '/workspace/orbit-code',
    framework: 'Next.js + Tauri',
  })
  mission.services.git.updateStatus({
    branch: 'orbit/implementation/phase-1-tauri-shell',
    worktree: 'orbit-code-phase1',
    pendingChanges: 3,
    status: 'changes-pending',
  })
  mission.services.localhost.start('http://127.0.0.1:1420', 1420)
  mission.services.providers.connect('codex', 'Simulado')
  mission.services.providers.activate('codex')
  mission.services.agents.start('director', 'task-1', 'Planificando')
  mission.services.memory.save()

  const state = mission.store.getSnapshot()
  assert.equal(state.project.name, 'Orbit Code')
  assert.equal(state.git.branch, 'orbit/implementation/phase-1-tauri-shell')
  assert.equal(state.localhost.status, 'active')
  assert.equal(state.providers.primaryProviderId, 'codex')
  assert.equal(state.agents.activeCount, 1)
  assert.equal(state.memory.status, 'saved')

  mission.dispose()
})

test('DesktopClient abstrae la plataforma antes de que React consuma el estado', () => {
  const mission = createMockMissionControl({
    desktopClient: new MockDesktopClient({
      platform: 'windows',
      platformLabel: 'Windows',
      appVersion: '0.2.0-test',
    }),
  })

  const state = mission.store.getSnapshot()
  assert.equal(state.desktop.platform, 'windows')
  assert.equal(state.desktop.platformLabel, 'Windows')
  assert.equal(state.desktop.appVersion, '0.2.0-test')

  mission.dispose()
})

test('observadores reaccionan al fallo de build sin crear dependencias circulares', () => {
  const mission = createMockMissionControl({ now: fixedNow })

  mission.services.build.start('pnpm build')
  mission.services.build.finish('failed', 'Simulación de fallo')

  const state = mission.store.getSnapshot()
  assert.equal(state.build.status, 'failed')
  assert.equal(state.notifications.items.at(-1)?.level, 'error')
  assert.equal(state.guidance.risks[0], 'El estado de compilación requiere atención.')

  mission.dispose()
})
