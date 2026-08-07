import { invoke } from '@tauri-apps/api/core'
import { listen } from '@tauri-apps/api/event'
import type { ProcessHandle, ProcessRunner, ProcessSpec } from './process-manager.mts'

interface ProcessStartResult { pid: number }
interface ProcessOutputEvent { stream: 'stdout' | 'stderr'; chunk: string }
interface ProcessExitEvent { code: number | null }

let processSequence = 0

export class TauriProcessRunner implements ProcessRunner {
  async start(
    spec: ProcessSpec,
    handlers: {
      onStdout(chunk: string): void
      onStderr(chunk: string): void
      onExit(exitCode: number | null): void
      onError(error: string): void
    },
  ): Promise<ProcessHandle> {
    const id = `process-${Date.now()}-${++processSequence}`
    const unlistenOutput = await listen<ProcessOutputEvent>(`process-output:${id}`, (event) => {
      if (event.payload.stream === 'stdout') handlers.onStdout(event.payload.chunk)
      else handlers.onStderr(event.payload.chunk)
    })
    const unlistenExit = await listen<ProcessExitEvent>(`process-exit:${id}`, (event) => {
      handlers.onExit(event.payload.code)
      void unlistenOutput()
      void unlistenExit()
    })

    try {
      const result = await invoke<ProcessStartResult>('process_start', {
        id,
        command: spec.command,
        cwd: spec.cwd,
        timeoutMs: spec.timeoutMs,
        shell: spec.shell ?? 'bash',
      })
      return {
        pid: result.pid,
        cancel: async () => {
          await invoke('process_cancel', { id })
        },
      }
    } catch (error) {
      await unlistenOutput()
      await unlistenExit()
      handlers.onError(error instanceof Error ? error.message : String(error))
      throw error
    }
  }
}
