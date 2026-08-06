import assert from 'node:assert/strict'
import test from 'node:test'
import {
  WorkspaceDetector,
  WorkspaceScanner,
} from '../lib/runtime/adapters/workspace/index.mts'
import { NEXT_TAURI_FILES, virtualLister } from './workspace-fixtures.mts'

test('WorkspaceDetector genera un snapshot completo y emite eventos en orden', () => {
  const detector = new WorkspaceDetector({
    scanner: new WorkspaceScanner({ lister: virtualLister(NEXT_TAURI_FILES) }),
    now: () => '2026-08-05T14:00:00.000Z',
  })
  const events: string[] = []
  let detectedSnapshot: unknown = null
  detector.events.on('WorkspaceScanStarted', () => events.push('started'))
  detector.events.on('WorkspaceScanCompleted', ({ payload }) => events.push(`completed:${payload.detectedFiles.length}`))
  detector.events.on('WorkspaceDetected', ({ payload }) => {
    detectedSnapshot = payload.snapshot
    events.push('detected')
  })

  const snapshot = detector.detect({ root: '/proyectos/orbit-code', projectName: 'orbit-code' })

  assert.equal(snapshot.projectName, 'orbit-code')
  assert.equal(snapshot.root, '/proyectos/orbit-code')
  assert.equal(snapshot.framework, 'next')
  assert.equal(snapshot.language, 'typescript')
  assert.equal(snapshot.packageManager, 'pnpm')
  assert.equal(snapshot.timestamp, '2026-08-05T14:00:00.000Z')
  assert.ok(snapshot.detectedFiles.includes('next.config.ts'))
  assert.equal(snapshot.confidence > 0, true)
  assert.deepEqual(events, ['started', 'completed:9', 'detected'])
  assert.deepEqual(detectedSnapshot, snapshot)
})

test('WorkspaceDetector usa el nombre del proyecto desde la raíz', () => {
  const detector = new WorkspaceDetector({
    scanner: new WorkspaceScanner({ lister: virtualLister(NEXT_TAURI_FILES) }),
  })
  const snapshot = detector.detect({ root: '/var/proyectos/tienda' })
  assert.equal(snapshot.projectName, 'tienda')
})

test('WorkspaceDetector emite WorkspaceScanFailed y relanza si el escaneo falla', () => {
  const failingLister = () => {
    throw new Error('root no legible')
  }
  const detector = new WorkspaceDetector({
    scanner: new WorkspaceScanner({ lister: failingLister }),
  })
  let failed = ''
  detector.events.on('WorkspaceScanFailed', ({ payload }) => {
    failed = payload.error
  })
  assert.throws(() => detector.detect({ root: '/inaccesible' }), /root no legible/)
  assert.equal(failed, 'root no legible')
})

test('WorkspaceDetector genera snapshot vacío para proyecto sin señales', () => {
  const detector = new WorkspaceDetector({
    scanner: new WorkspaceScanner({ lister: virtualLister([]) }),
  })
  const snapshot = detector.detect({ root: '/vacio' })
  assert.equal(snapshot.framework, 'unknown')
  assert.equal(snapshot.confidence, 0)
  assert.deepEqual(snapshot.detectedFiles, [])
})
