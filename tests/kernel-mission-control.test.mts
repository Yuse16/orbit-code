import assert from 'node:assert/strict'
import test from 'node:test'
import { createDefaultMissionControl, createMissionControl } from '../lib/mission-control/index.mts'
import { createMockKernel } from '../lib/kernel/index.mts'

test('Mission Control consume el Kernel y sus comandos no exponen servicios', () => {
  const kernel = createMockKernel()
  const mission = createMissionControl(kernel)
  mission.actions.setStage('pruebas')

  assert.equal(mission.store.getSnapshot().tasks.currentStage, 'pruebas')
  assert.equal('services' in mission, false)
  assert.equal(mission.getKernelContext().state.lifecycle, 'running')
  mission.dispose()
})

test('createDefaultMissionControl compone Kernel y Mission Control sin exponer el runtime', () => {
  const mission = createDefaultMissionControl()
  mission.actions.setStage('correccion')

  assert.equal(mission.store.getSnapshot().tasks.currentStage, 'correccion')
  assert.equal(mission.getKernelContext().state.lifecycle, 'running')
  assert.equal('services' in mission, false)
  assert.equal('events' in mission, false)
  mission.dispose()
})
