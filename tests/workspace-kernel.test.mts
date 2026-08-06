import assert from 'node:assert/strict'
import test from 'node:test'
import { Kernel } from '../lib/kernel/index.mts'
import {
  WorkspaceAdapter,
  WorkspaceDetector,
  WorkspaceScanner,
} from '../lib/runtime/adapters/workspace/index.mts'
import { NEXT_TAURI_FILES, virtualLister } from './workspace-fixtures.mts'

const realAdapter = (): WorkspaceAdapter =>
  new WorkspaceAdapter({
    detector: new WorkspaceDetector({
      scanner: new WorkspaceScanner({ lister: virtualLister(NEXT_TAURI_FILES) }),
      now: () => '2026-01-01T00:00:00.000Z',
    }),
    root: '/proyectos/orbit-code',
    projectName: 'orbit-code',
    now: () => '2026-01-01T00:00:00.000Z',
  })

test('El Kernel conecta el WorkspaceAdapter al WorkspacePublisher', () => {
  const adapter = realAdapter()
  const kernel = new Kernel(() => 'now', { workspaceAdapter: adapter })
  kernel.start()
  adapter.detect()

  const workspace = kernel.getContextSnapshot().workspace
  assert.equal(workspace.structureDetected, true)
  assert.equal(workspace.strategy, 'monorepo:pnpm-workspace')
  assert.ok(workspace.indexedAt)
  assert.equal(adapter.getSnapshot()?.framework, 'next')
  assert.equal(adapter.getSnapshot()?.language, 'typescript')
  kernel.dispose()
})

test('El Kernel sin adaptador mantiene el workspace derivado del DNA', () => {
  const kernel = new Kernel(() => 'now', {})
  kernel.start()
  const workspace = kernel.getContextSnapshot().workspace
  assert.equal(workspace.structureDetected, false)
  kernel.dispose()
})

test('WorkspaceScanner lee el proyecto real de solo lectura', () => {
  const scanner = new WorkspaceScanner()
  const result = scanner.scan(process.cwd())
  assert.ok(result.detectedFiles.includes('package.json'))
  assert.ok(result.detectedFiles.length > 0)
})
