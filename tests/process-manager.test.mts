import assert from 'node:assert/strict'
import test from 'node:test'
import { ProcessManager, type ProcessRunner } from '../lib/runtime/process-manager.mts'

test('ProcessManager registra salida, finalización y código de salida', async () => {
  let exit: ((code: number | null) => void) | undefined
  const runner: ProcessRunner = {
    async start(_spec, handlers) {
      handlers.onStdout('ok\n')
      exit = handlers.onExit
      return { pid: 42, cancel: async () => undefined }
    },
  }
  const manager = new ProcessManager(runner, () => '2026-08-07T00:00:00.000Z')

  const started = await manager.start({ command: 'pnpm test', cwd: '/workspace', timeoutMs: 5000 })
  assert.equal(started.status, 'running')
  assert.equal(started.pid, 42)
  assert.equal(started.stdout, 'ok\n')

  exit?.(0)
  assert.equal(manager.get(started.id)?.status, 'succeeded')
  assert.equal(manager.get(started.id)?.exitCode, 0)
})

test('ProcessManager cancela procesos y conserva el estado', async () => {
  let cancelled = false
  const runner: ProcessRunner = {
    async start() {
      return { pid: 7, cancel: async () => { cancelled = true } }
    },
  }
  const manager = new ProcessManager(runner, () => 'now')
  const started = await manager.start({ command: 'pnpm dev', cwd: '/workspace', timeoutMs: 1000 })

  const cancelledRecord = await manager.cancel(started.id)
  assert.equal(cancelled, true)
  assert.equal(cancelledRecord.status, 'cancelled')
  assert.equal(manager.list().length, 1)
})

test('ProcessManager rechaza comandos inválidos antes de iniciar el runner', async () => {
  let started = false
  const runner: ProcessRunner = {
    async start() {
      started = true
      return { pid: null, cancel: async () => undefined }
    },
  }
  const manager = new ProcessManager(runner)

  await assert.rejects(
    manager.start({ command: '', cwd: '/workspace', timeoutMs: 1000 }),
    /comando.*obligatorio/i,
  )
  assert.equal(started, false)
})
