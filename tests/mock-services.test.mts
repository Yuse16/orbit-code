import assert from 'node:assert/strict'
import test from 'node:test'
import { createMissionControl, MockDesktopClient } from '../lib/mission-control/index.mts'
import { createMockKernel } from '../lib/kernel/index.mts'

const fixedNow = () => '2026-08-05T12:00:00.000Z'

test('Mission Control solicita cambios al Kernel sin acceder a servicios', () => {
  const mission = createMissionControl(createMockKernel({ now: fixedNow }))

  mission.actions.openProject({
    id: 'orbit-code',
    name: 'Orbit Code',
    path: '/workspace/orbit-code',
    framework: 'Next.js + Tauri',
  })
  mission.actions.updateGitStatus({
    branch: 'orbit/implementation/phase-1-tauri-shell',
    worktree: 'orbit-code-phase1',
    pendingChanges: 3,
    status: 'changes-pending',
  })
  mission.actions.connectProvider('codex', 'Simulado')
  mission.actions.activateProvider('codex')

  const state = mission.store.getSnapshot()
  assert.equal(state.project.name, 'Orbit Code')
  assert.equal(state.git.branch, 'orbit/implementation/phase-1-tauri-shell')
  assert.equal(state.providers.primaryProviderId, 'codex')
  assert.equal(mission.getKernelContext().state.lifecycle, 'running')
  assert.equal('services' in mission, false)
  mission.dispose()
})

test('DesktopClient permanece detrás del Kernel antes de que React consuma Mission Control', () => {
  const mission = createMissionControl(createMockKernel({
    desktopClient: new MockDesktopClient({
      platform: 'windows',
      platformLabel: 'Windows',
      appVersion: '0.2.0-test',
    }),
  }))

  const state = mission.store.getSnapshot()
  assert.equal(state.desktop.platform, 'windows')
  assert.equal(state.desktop.platformLabel, 'Windows')
  assert.equal(state.desktop.appVersion, '0.2.0-test')
  mission.dispose()
})

test('catálogo de providers inicia desconectado hasta una solicitud al Kernel', () => {
  const mission = createMissionControl(createMockKernel())
  const providers = mission.store.getSnapshot().providers

  assert.equal(providers.providers.length, 10)
  assert.equal(providers.primaryProviderId, null)
  assert.ok(providers.providers.every((provider) => provider.status === 'disconnected'))
  mission.dispose()
})

test('Kernel comunica errores de salud a consumidores sin ejecutar builds reales', () => {
  const kernel = createMockKernel({ now: fixedNow })
  const mission = createMissionControl(kernel)
  kernel.health.error('Simulación de fallo')

  assert.equal(mission.getKernelContext().state.health, 'error')
  mission.dispose()
})
