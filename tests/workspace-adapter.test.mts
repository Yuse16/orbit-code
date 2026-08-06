import assert from 'node:assert/strict'
import test from 'node:test'
import { KernelContext, WorkspacePublisher } from '../lib/kernel/context/index.mts'
import {
  WorkspaceAdapter,
  WorkspaceDetector,
  WorkspaceScanner,
} from '../lib/runtime/adapters/workspace/index.mts'
import type { WorkspaceAdapterOptions } from '../lib/runtime/adapters/workspace/index.mts'
import type { RuntimeAdapterHost } from '../lib/runtime/adapter.mts'
import type { RuntimeEventMap, RuntimeEventType } from '../lib/runtime/index.mts'
import { NEXT_TAURI_FILES, VITE_REACT_FILES, virtualLister } from './workspace-fixtures.mts'

const hostFor = (): { host: RuntimeAdapterHost; started: string[]; stopped: string[] } => {
  const started: string[] = []
  const stopped: string[] = []
  return {
    host: {
      now: () => '2026-01-01T00:00:00.000Z',
      emit: (type: RuntimeEventType, payload: RuntimeEventMap[RuntimeEventType]) => {
        if (type === 'AdapterStarted' && 'adapterId' in payload) started.push(payload.adapterId)
        if (type === 'AdapterStopped' && 'adapterId' in payload) stopped.push(payload.adapterId)
      },
    },
    started,
    stopped,
  }
}

const adapterFor = (
  files: ReadonlyArray<string>,
  overrides: Partial<WorkspaceAdapterOptions> = {},
): WorkspaceAdapter =>
  new WorkspaceAdapter({
    detector: new WorkspaceDetector({
      scanner: new WorkspaceScanner({ lister: virtualLister(files) }),
      now: () => '2026-01-01T00:00:00.000Z',
    }),
    root: '/proyectos/orbit-code',
    now: () => '2026-01-01T00:00:00.000Z',
    ...overrides,
  })

test('WorkspaceAdapter sigue el contrato de RuntimeAdapter', () => {
  const { host, started, stopped } = hostFor()
  const adapter = adapterFor(NEXT_TAURI_FILES, { host })
  assert.equal(adapter.id, 'workspace')
  assert.equal(adapter.name, 'Workspace')
  assert.equal(adapter.health(), 'stopped')
  assert.equal(adapter.status().status, 'stopped')

  adapter.initialize()
  assert.equal(adapter.status().status, 'initializing')

  adapter.start()
  assert.equal(adapter.health(), 'healthy')
  assert.equal(adapter.status().status, 'running')
  assert.equal(adapter.status().startedAt, '2026-01-01T00:00:00.000Z')
  assert.equal(adapter.status().capabilities.filter((c) => c.available).length, 2)
  assert.deepEqual(started, ['workspace'])
  assert.ok(adapter.getSnapshot())

  adapter.stop()
  assert.equal(adapter.health(), 'stopped')
  assert.equal(adapter.status().status, 'stopped')
  assert.equal(adapter.status().capabilities.filter((c) => c.available).length, 0)
  assert.deepEqual(stopped, ['workspace'])
  adapter.dispose()
})

test('WorkspaceAdapter sin proyecto arranca en warning y no publica', () => {
  const context = new KernelContext()
  const publisher = new WorkspacePublisher(context)
  const adapter = new WorkspaceAdapter({ publisher })
  adapter.start()
  assert.equal(adapter.health(), 'warning')
  assert.equal(adapter.status().status, 'running')
  assert.equal(adapter.getSnapshot(), null)
  assert.equal(context.read('workspace')?.structureDetected, false)
  context.dispose()
})

test('WorkspaceAdapter detecta y publica mediante WorkspacePublisher', () => {
  const context = new KernelContext()
  const publisher = new WorkspacePublisher(context)
  const adapter = adapterFor(VITE_REACT_FILES, {
    root: '/app/vite',
    projectName: 'vite-app',
    publisher,
  })

  const snapshot = adapter.detect()
  assert.ok(snapshot)
  assert.equal(snapshot.framework, 'vite')
  assert.equal(snapshot.language, 'typescript')

  const workspace = context.read('workspace')
  assert.equal(workspace?.structureDetected, true)
  assert.equal(workspace?.strategy, 'single-project')
  assert.equal(workspace?.indexedAt, '2026-01-01T00:00:00.000Z')
  assert.equal(context.getSnapshot().workspace.structureDetected, true)
  context.dispose()
})

test('WorkspaceAdapter publica strategy monorepo cuando hay pnpm-workspace', () => {
  const context = new KernelContext()
  const publisher = new WorkspacePublisher(context)
  const adapter = adapterFor(NEXT_TAURI_FILES, { publisher })
  adapter.detect()
  assert.equal(context.read('workspace')?.strategy, 'monorepo:pnpm-workspace')
  context.dispose()
})

test('WorkspaceAdapter emite WorkspaceScanFailed si el escaneo falla', () => {
  const context = new KernelContext()
  const publisher = new WorkspacePublisher(context)
  const failingLister = () => {
    throw new Error('sin acceso')
  }
  const adapter = adapterFor([], {
    detector: new WorkspaceDetector({ scanner: new WorkspaceScanner({ lister: failingLister }) }),
    root: '/inaccesible',
    publisher,
  })
  let failed = ''
  adapter.events.on('WorkspaceScanFailed', ({ payload }) => {
    failed = payload.error
  })
  adapter.start()
  assert.equal(adapter.health(), 'warning')
  assert.equal(failed, 'sin acceso')
  assert.equal(context.read('workspace')?.structureDetected, false)
  context.dispose()
})

test('WorkspaceAdapter nunca accede a KernelContext directamente', () => {
  const context = new KernelContext()
  const publisher = new WorkspacePublisher(context)
  const adapter = adapterFor(NEXT_TAURI_FILES, { publisher })
  const anyAdapter = adapter as unknown as Record<string, unknown>
  assert.equal(anyAdapter['context'], undefined)
  assert.equal(anyAdapter['store'], undefined)
  adapter.detect()
  assert.equal(context.read('workspace')?.structureDetected, true)
  context.dispose()
})
