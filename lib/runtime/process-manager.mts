export type ProcessStatus = 'queued' | 'running' | 'succeeded' | 'failed' | 'cancelled'

export interface ProcessSpec {
  command: string
  cwd: string
  timeoutMs: number
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

  async cancel(id: string): Promise<ProcessRecord> {
    const record = this.require(id)
    if (record.status !== 'running' && record.status !== 'queued') return cloneRecord(record)
    await this.handles.get(id)?.cancel()
    record.status = 'cancelled'
    record.finishedAt = this.now()
    return cloneRecord(record)
  }

  private append(id: string, channel: 'stdout' | 'stderr', chunk: string): void {
    const record = this.require(id)
    record[channel] += chunk
  }

  private finish(id: string, exitCode: number | null): void {
    const record = this.require(id)
    if (record.status === 'cancelled') return
    record.status = exitCode === 0 ? 'succeeded' : 'failed'
    record.exitCode = exitCode
    record.finishedAt = this.now()
  }

  private fail(id: string, error: string): void {
    const record = this.require(id)
    record.status = 'failed'
    record.error = error
    record.finishedAt = this.now()
  }

  private validate(spec: ProcessSpec): void {
    if (!spec.command.trim()) throw new Error('El comando del proceso es obligatorio')
    if (!spec.cwd.startsWith('/')) throw new Error('El directorio del proceso debe ser absoluto')
    if (!Number.isFinite(spec.timeoutMs) || spec.timeoutMs <= 0) {
      throw new Error('El timeout del proceso debe ser positivo')
    }
  }

  private require(id: string): ProcessRecord {
    const record = this.records.get(id)
    if (!record) throw new Error(`Proceso desconocido: ${id}`)
    return record
  }
}
