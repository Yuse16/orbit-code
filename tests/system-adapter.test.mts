import assert from 'node:assert/strict'
import test from 'node:test'
import { Kernel } from '../lib/kernel/index.mts'
import { KernelContext, SystemPublisher } from '../lib/kernel/context/index.mts'
import {
  DesktopSystemAdapter,
  MockSystemInfoProvider,
  createDesktopSystemAdapter,
  createEmptySystemInfo,
  type SystemInfo,
} from '../lib/runtime/adapters/system/index.mts'
import type { RuntimeAdapterHost } from '../lib/runtime/adapter.mts'
import type { RuntimeEventMap, RuntimeEventType } from '../lib/runtime/index.mts'

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

const mockInfo = (): SystemInfo => ({
  ...createEmptySystemInfo(),
  osName: 'macOS',
  osVersion: '15.5',
  arch: 'x64',
  hostname: 'dev-host',
  user: 'dev',
  cpuModel: 'Test CPU',
  cpuCores: 4,
  totalMemoryGb: 16,
  availableMemoryGb: 8,
  nodeVersion: 'v24.11.1',
  pnpmVersion: '11.10.0',
  projectDirectory: '/proyectos/orbit-code',
})

test('DesktopSystemAdapter sigue el contrato de RuntimeAdapter', () => {
  const { host, started, stopped } = hostFor()
  const context = new KernelContext()
  const publisher = new SystemPublisher(context)
  const adapter = new DesktopSystemAdapter({
    host,
    publisher,
    now: () => '2026-01-01T00:00:00.000Z',
  })
  assert.equal(adapter.id, 'system')
  assert.equal(adapter.name, 'System')
  assert.equal(adapter.health(), 'stopped')
  assert.equal(adapter.status().status, 'stopped')

  adapter.initialize()
  assert.equal(adapter.status().status, 'initializing')

  adapter.start()
  assert.equal(adapter.health(), 'healthy')
  assert.equal(adapter.status().status, 'running')
  assert.equal(adapter.status().startedAt, '2026-01-01T00:00:00.000Z')
  assert.equal(adapter.status().capabilities.filter((c) => c.available).length, 2)
  assert.deepEqual(started, ['system'])
  assert.ok(adapter.getSnapshot())

  adapter.stop()
  assert.equal(adapter.health(), 'stopped')
  assert.equal(adapter.status().status, 'stopped')
  assert.equal(adapter.status().capabilities.filter((c) => c.available).length, 0)
  assert.deepEqual(stopped, ['system'])
  context.dispose()
  adapter.dispose()
})

test('DesktopSystemAdapter sin publisher arranca en warning y no publica', () => {
  const context = new KernelContext()
  new SystemPublisher(context)
  const adapter = new DesktopSystemAdapter({ provider: new MockSystemInfoProvider(mockInfo()) })
  adapter.start()
  assert.equal(adapter.health(), 'warning')
  assert.equal(adapter.status().status, 'running')
  assert.equal(adapter.getSnapshot(), null)
  assert.equal(context.read('system')?.osName, null)
  context.dispose()
})

test('DesktopSystemAdapter detecta y publica mediante SystemPublisher', () => {
  const context = new KernelContext()
  const publisher = new SystemPublisher(context)
  const adapter = new DesktopSystemAdapter({ publisher, now: () => '2026-01-01T00:00:00.000Z' })

  const snapshot = adapter.detect()
  assert.ok(snapshot)
  assert.equal(snapshot.osName, 'macOS')
  assert.equal(snapshot.nodeVersion, 'v24.11.1')
  assert.equal(snapshot.detectedAt, '2026-01-01T00:00:00.000Z')

  const system = context.read('system')
  assert.equal(system?.osName, 'macOS')
  assert.equal(system?.cpuCores, 4)
  assert.equal(context.getSnapshot().system.totalMemoryGb, 16)
  context.dispose()
})

test('DesktopSystemAdapter publica al conectarse al publisher', () => {
  const context = new KernelContext()
  const publisher = new SystemPublisher(context)
  const adapter = createDesktopSystemAdapter()
  adapter.connect(publisher)
  assert.equal(context.read('system')?.osName, 'macOS')
  assert.ok(adapter.getSnapshot()?.detectedAt)
  context.dispose()
})

test('El Kernel conecta el DesktopSystemAdapter al SystemPublisher', () => {
  const adapter = new DesktopSystemAdapter({
    provider: new MockSystemInfoProvider(mockInfo()),
    now: () => '2026-01-01T00:00:00.000Z',
  })
  const kernel = new Kernel(() => 'now', { systemAdapter: adapter })
  kernel.start()

  const system = kernel.getContextSnapshot().system
  assert.equal(system.osName, 'macOS')
  assert.equal(system.osVersion, '15.5')
  assert.equal(system.arch, 'x64')
  assert.equal(system.cpuCores, 4)
  assert.equal(system.totalMemoryGb, 16)
  assert.equal(system.nodeVersion, 'v24.11.1')
  assert.equal(system.pnpmVersion, '11.10.0')
  assert.equal(system.projectDirectory, '/proyectos/orbit-code')
  assert.equal(adapter.getSnapshot()?.osName, 'macOS')
  kernel.dispose()
})

test('El Kernel sin adaptador mantiene el estado inicial del sistema', () => {
  const kernel = new Kernel(() => 'now', {})
  kernel.start()
  assert.deepEqual(kernel.getContextSnapshot().system, createEmptySystemInfo())
  kernel.dispose()
})

test('MockSystemInfoProvider devuelve la info inyectada sin campos omitidos', () => {
  const provider = new MockSystemInfoProvider(mockInfo())
  assert.equal(provider.source, 'mock')
  const info = provider.read()
  assert.equal(info.osName, 'macOS')
  assert.equal(info.cpuCores, 4)
  assert.equal(info.detectedAt, null)
  assert.equal(Object.keys(info).length, Object.keys(createEmptySystemInfo()).length)
})

test('DesktopSystemAdapter nunca accede a KernelContext directamente', () => {
  const context = new KernelContext()
  const publisher = new SystemPublisher(context)
  const adapter = createDesktopSystemAdapter()
  const anyAdapter = adapter as unknown as Record<string, unknown>
  assert.equal(anyAdapter['context'], undefined)
  assert.equal(anyAdapter['store'], undefined)
  adapter.connect(publisher)
  assert.equal(context.read('system')?.osName, 'macOS')
  context.dispose()
})
