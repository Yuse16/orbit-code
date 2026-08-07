import assert from 'node:assert/strict'
import test from 'node:test'
import { Kernel } from '../lib/kernel/index.mts'
import { MockDesktopClient } from '../lib/mission-control/index.mts'
import { ProcessManager, type ProcessRunner } from '../lib/runtime/process-manager.mts'

test('aprobar un comando resuelve el permiso y conecta ProcessManager', async () => {
  let exit: ((code: number | null) => void) | undefined
  let started = false
  const runner: ProcessRunner = {
    async start(_spec, handlers) {
      started = true
      exit = handlers.onExit
      return { pid: 88, cancel: async () => undefined }
    },
  }
  const processManager = new ProcessManager(runner, () => 'now')
  const kernel = new Kernel(() => 'now', {
    desktopClient: new MockDesktopClient(),
    processManager,
  })

  kernel.requestCommand('pnpm dev', '/workspace')
  const request = kernel.getMissionStore().getSnapshot().permissionRequests[0]
  assert.ok(request)
  assert.equal(request?.status, 'pending')

  const record = await kernel.approveCommand(request.id)
  assert.equal(started, true)
  assert.equal(record?.status, 'running')
  assert.equal(kernel.getMissionStore().getSnapshot().permissionRequests[0]?.status, 'approved')

  exit?.(0)
  assert.equal(processManager.get(record?.id ?? '')?.status, 'succeeded')
  kernel.dispose()
})

test('rechazar un comando no inicia ProcessManager', () => {
  let started = false
  const processManager = new ProcessManager({
    async start() {
      started = true
      return { pid: 1, cancel: async () => undefined }
    },
  })
  const kernel = new Kernel(() => 'now', { processManager })

  kernel.requestCommand('rm -rf project', '/workspace')
  const request = kernel.getMissionStore().getSnapshot().permissionRequests[0]
  assert.ok(request)
  kernel.rejectCommand(request.id)

  assert.equal(started, false)
  assert.equal(kernel.getMissionStore().getSnapshot().permissionRequests[0]?.status, 'rejected')
  kernel.dispose()
})
