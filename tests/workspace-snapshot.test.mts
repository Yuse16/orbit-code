import assert from 'node:assert/strict'
import test from 'node:test'
import {
  createEmptyWorkspaceSnapshot,
  isWorkspaceSnapshot,
} from '../lib/runtime/adapters/workspace/index.mts'

test('createEmptyWorkspaceSnapshot devuelve un snapshot con valores por defecto', () => {
  const snapshot = createEmptyWorkspaceSnapshot({ root: '/proyecto' })
  assert.equal(snapshot.root, '/proyecto')
  assert.equal(snapshot.projectName, '')
  assert.equal(snapshot.framework, 'unknown')
  assert.equal(snapshot.language, 'unknown')
  assert.equal(snapshot.packageManager, 'unknown')
  assert.equal(snapshot.buildSystem, 'unknown')
  assert.equal(snapshot.frontend, 'none')
  assert.equal(snapshot.backend, 'none')
  assert.equal(snapshot.desktop, 'none')
  assert.equal(snapshot.database, 'none')
  assert.equal(snapshot.testing, 'none')
  assert.equal(snapshot.lint, 'none')
  assert.equal(snapshot.formatter, 'none')
  assert.equal(snapshot.deployment, 'none')
  assert.equal(snapshot.monorepo, 'none')
  assert.deepEqual(snapshot.detectedFiles, [])
  assert.equal(snapshot.confidence, 0)
  assert.equal(snapshot.timestamp, '')
})

test('createEmptyWorkspaceSnapshot permite sobreescribir campos', () => {
  const snapshot = createEmptyWorkspaceSnapshot({
    root: '/p',
    projectName: 'app',
    framework: 'next',
    detectedFiles: ['package.json'],
  })
  assert.equal(snapshot.projectName, 'app')
  assert.equal(snapshot.framework, 'next')
  assert.deepEqual(snapshot.detectedFiles, ['package.json'])
})

test('isWorkspaceSnapshot valida snapshots completos', () => {
  assert.equal(isWorkspaceSnapshot(null), false)
  assert.equal(isWorkspaceSnapshot({}), false)
  assert.equal(
    isWorkspaceSnapshot(
      createEmptyWorkspaceSnapshot({ root: '/proyecto', projectName: 'p', timestamp: 't' }),
    ),
    true,
  )
})
