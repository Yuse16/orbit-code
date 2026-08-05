import assert from 'node:assert/strict'
import test from 'node:test'
import { createMissionControl, getMissionHeaderSummary } from '../lib/mission-control/index.mts'
import { createMockKernel } from '../lib/kernel/index.mts'

test('resumen de Mission Control responde dónde estoy, qué ocurre y qué sigue', () => {
  const mission = createMissionControl(createMockKernel({ now: () => '2026-08-05T14:00:00.000Z' }))
  mission.actions.openProject({
    id: 'orbit',
    name: 'Orbit Code',
    path: '/workspace/orbit',
    framework: 'Next.js',
  })
  mission.actions.updateGitStatus({ branch: 'orbit/implementation/phase-1-tauri-shell' })
  mission.actions.connectProvider('codex')
  mission.actions.activateProvider('codex')

  const summary = getMissionHeaderSummary(mission.store.getSnapshot())
  assert.equal(summary.project, 'Orbit Code')
  assert.equal(summary.provider, 'Codex')
  assert.equal(summary.status.label, 'Listo')
  mission.dispose()
})
