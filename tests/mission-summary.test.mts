import assert from 'node:assert/strict'
import test from 'node:test'
import {
  createMockMissionControl,
  getMissionHeaderSummary,
} from '../lib/mission-control/index.mts'

test('resumen de Mission Control responde dónde estoy, qué ocurre y qué sigue', () => {
  const mission = createMockMissionControl({ now: () => '2026-08-05T14:00:00.000Z' })
  mission.services.project.open({
    id: 'orbit',
    name: 'Orbit Code',
    path: '/workspace/orbit-code',
    framework: 'Next.js + Tauri',
  })
  mission.services.git.updateStatus({ branch: 'orbit/implementation/phase-1-tauri-shell' })
  mission.services.providers.connect('codex')
  mission.services.providers.activate('codex')
  mission.services.build.start('pnpm build')

  const summary = getMissionHeaderSummary(mission.store.getSnapshot())
  assert.equal(summary.project, 'Orbit Code')
  assert.equal(summary.git, 'orbit/implementation/phase-1-tauri-shell')
  assert.equal(summary.framework, 'Next.js + Tauri')
  assert.equal(summary.operatingSystem, 'macOS')
  assert.equal(summary.provider, 'Codex')
  assert.deepEqual(summary.status, { label: 'En progreso', tone: 'primary' })

  mission.dispose()
})
