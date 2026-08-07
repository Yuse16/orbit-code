import { TauriProcessRunner } from './tauri-process-runner.mts'

export type ProcessStatus = 'queued' | 'running' | 'succeeded' | 'failed' | 'cancelled'

export interface ProcessSpec {
  command: string
  cwd: string
  timeoutMs: number
  shell?: string
}

export interface ProcessRecord {
  id: string
  spec: ProcessSpec
  status: ProcessStatus
  pid: number | null
  startedAt: string | null
  finishedAt: string | null
  exitCode: number | null
  stdout: string
  stderr: string
  error: string | null
}

export interface ProcessHandle {
  pid: number | null
  cancel(): Promise<void>
}

export interface ProcessRunner {
  start(
    spec: ProcessSpec,
    handlers: {
      onStdout(chunk: string): void
      onStderr(chunk: string): void
      onExit(exitCode: number | null): void
      onError(error: string): void
    },
  ): Promise<ProcessHandle>
}

export type ProcessListener = (record: ProcessRecord) => void

const cloneRecord = (record: ProcessRecord): ProcessRecord => ({
  ...record,
  spec: { ...record.spec },
})

export class ProcessManager {
  private readonly records = new Map<string, ProcessRecord>()
  private readonly handles = new Map<string, ProcessHandle>()
  private sequence = 0
  private readonly runner: ProcessRunner
  private readonly now: () => string
  private readonly listeners = new Set<ProcessListener>()

  constructor(runner: ProcessRunner, now: () => string = () => new Date().toISOString()) {
    this.runner = runner
    this.now = now
  }

  async start(spec: ProcessSpec): Promise<ProcessRecord> {
    this.validate(spec)
    const id = `process-${++this.sequence}`
    const record: ProcessRecord = {
      id,
      spec: { ...spec },
      status: 'queued',
      pid: null,
      startedAt: null,
      finishedAt: null,
      exitCode: null,
      stdout: '',
      stderr: '',
      error: null,
    }
    this.records.set(id, record)
    this.notify(record)

    try {
      const handle = await this.runner.start(spec, {
        onStdout: (chunk) => this.append(id, 'stdout', chunk),
        onStderr: (chunk) => this.append(id, 'stderr', chunk),
        onExit: (exitCode) => this.finish(id, exitCode),
        onError: (error) => this.fail(id, error),
      })
      const current = this.require(id)
      this.handles.set(id, handle)
      if (current.status === 'queued') {
        current.status = 'running'
        current.pid = handle.pid
        current.startedAt = this.now()
      }
      this.notify(current)
    } catch (error) {
      this.fail(id, error instanceof Error ? error.message : String(error))
    }
    return cloneRecord(this.require(id))
  }

  get(id: string): ProcessRecord | null {
    const record = this.records.get(id)
    return record ? cloneRecord(record) : null
  }

  list(): ProcessRecord[] {
    return [...this.records.values()].map(cloneRecord)
  }

  subscribe(listener: ProcessListener): () => void {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  async cancel(id: string): Promise<ProcessRecord> {
    const record = this.require(id)
    if (record.status !== 'running' && record.status !== 'queued') return cloneRecord(record)
    await this.handles.get(id)?.cancel()
    record.status = 'cancelled'
    record.finishedAt = this.now()
    this.notify(record)
    return cloneRecord(record)
  }

  private append(id: string, channel: 'stdout' | 'stderr', chunk: string): void {
    const record = this.require(id)
    record[channel] += chunk
    this.notify(record)
  }

  private finish(id: string, exitCode: number | null): void {
    const record = this.require(id)
    if (record.status === 'cancelled') return
    record.status = exitCode === 0 ? 'succeeded' : 'failed'
    record.exitCode = exitCode
    record.finishedAt = this.now()
    this.notify(record)
  }

  private fail(id: string, error: string): void {
    const record = this.require(id)
    record.status = 'failed'
    record.error = error
    record.finishedAt = this.now()
    this.notify(record)
  }

  private notify(record: ProcessRecord): void {
    const snapshot = cloneRecord(record)
    this.listeners.forEach((listener) => listener(snapshot))
  }

  private validate(spec: ProcessSpec): void {
    if (!spec.command.trim()) throw new Error('El comando del proceso es obligatorio')
    if (!spec.cwd.startsWith('/')) throw new Error('El directorio del proceso debe ser absoluto')
    if (!Number.isFinite(spec.timeoutMs) || spec.timeoutMs <= 0) {
      throw new Error('El timeout del proceso debe ser positivo')
    }
    if (spec.shell && !['bash', 'zsh', 'fish', 'pwsh', 'powershell', 'cmd'].includes(spec.shell)) {
      throw new Error(`Shell no permitida: ${spec.shell}`)
    }
  }

  private require(id: string): ProcessRecord {
    const record = this.records.get(id)
    if (!record) throw new Error(`Proceso desconocido: ${id}`)
    return record
  }
}

class UnavailableProcessRunner implements ProcessRunner {
  async start(): Promise<ProcessHandle> {
    throw new Error('El ProcessRunner nativo solo está disponible dentro de Tauri')
  }
}

export function createDefaultProcessManager(): ProcessManager {
  if (typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window) {
    return new ProcessManager(new TauriProcessRunner())
  }
  return new ProcessManager(new UnavailableProcessRunner())
}
