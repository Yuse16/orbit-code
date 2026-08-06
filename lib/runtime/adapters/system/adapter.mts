import type { RuntimeAdapter, RuntimeAdapterHost } from '../../adapter.mts'
import type { SystemPublisher } from '../../../kernel/context/publishers.mts'
import type {
  AdapterLifecycleStatus,
  RuntimeAdapterId,
  RuntimeAdapterSnapshot,
  RuntimeHealthStatus,
} from '../../types.mts'
import { MockSystemInfoProvider } from './provider.mts'
import type { SystemInfo, SystemInfoProvider } from './types.mts'
import { createEmptySystemInfo } from './types.mts'

const SYSTEM_CAPABILITIES: ReadonlyArray<{ id: string; name: string }> = [
  { id: 'DetectSystem', name: 'Detectar sistema' },
  { id: 'ReadSystemInfo', name: 'Leer info del sistema' },
]

export interface DesktopSystemAdapterOptions {
  provider?: SystemInfoProvider
  host?: RuntimeAdapterHost
  now?: () => string
  publisher?: SystemPublisher
}

/**
 * Adaptador real (solo lectura) de info del sistema. Consultado únicamente
 * desde la capa Runtime; publica el resultado mediante SystemPublisher y
 * jamás accede directamente al KernelContext.
 */
export class DesktopSystemAdapter implements RuntimeAdapter {
  readonly id: RuntimeAdapterId = 'system'
  readonly name = 'System'
  private readonly provider: SystemInfoProvider
  private readonly host: RuntimeAdapterHost | null
  private readonly now: () => string
  private publisher: SystemPublisher | null
  private lifecycleStatus: AdapterLifecycleStatus = 'stopped'
  private healthStatus: RuntimeHealthStatus = 'stopped'
  private startedAt: string | null = null
  private message = 'Adaptador System detenido.'
  private snapshot: SystemInfo | null = null

  constructor(options: DesktopSystemAdapterOptions = {}) {
    this.provider = options.provider ?? new MockSystemInfoProvider()
    this.host = options.host ?? null
    this.now = options.now ?? (() => new Date().toISOString())
    this.publisher = options.publisher ?? null
  }

  /** Conecta el publisher del contexto y publica la primera lectura (solo lectura). */
  connect(publisher: SystemPublisher): this {
    this.publisher = publisher
    this.detect()
    return this
  }

  detect(): SystemInfo | null {
    try {
      const info: SystemInfo = {
        ...createEmptySystemInfo(),
        ...this.provider.read(),
        detectedAt: this.now(),
      }
      this.snapshot = info
      this.publisher?.publish(info)
      return info
    } catch {
      this.snapshot = createEmptySystemInfo()
      this.publisher?.publish(this.snapshot)
      return this.snapshot
    }
  }

  getSnapshot(): SystemInfo | null {
    return this.snapshot
  }

  initialize(): void {
    if (this.lifecycleStatus === 'stopped') {
      this.lifecycleStatus = 'initializing'
      this.healthStatus = 'initializing'
      this.message = 'Inicializando adaptador System.'
    }
  }

  start(): void {
    if (this.lifecycleStatus === 'running') return
    this.lifecycleStatus = 'running'
    this.startedAt = this.now()
    if (this.publisher) {
      this.detect()
      this.healthStatus = 'healthy'
      this.message = `Sistema detectado (${this.provider.source}): ${this.snapshot?.osName ?? 'sin datos'}.`
    } else {
      this.healthStatus = 'warning'
      this.message = 'System: sin publisher conectado.'
    }
    this.host?.emit('AdapterStarted', { adapterId: this.id, startedAt: this.startedAt })
  }

  stop(): void {
    if (this.lifecycleStatus === 'stopped') return
    this.lifecycleStatus = 'stopped'
    this.healthStatus = 'stopped'
    this.startedAt = null
    this.message = 'Adaptador System detenido.'
    this.host?.emit('AdapterStopped', { adapterId: this.id })
  }

  dispose(): void {
    this.stop()
  }

  health(): RuntimeHealthStatus {
    return this.healthStatus
  }

  status(): RuntimeAdapterSnapshot {
    const running = this.lifecycleStatus === 'running'
    return {
      id: this.id,
      name: this.name,
      status: this.lifecycleStatus,
      health: this.healthStatus,
      startedAt: this.startedAt,
      message: this.message,
      capabilities: SYSTEM_CAPABILITIES.map((capability) => ({
        ...capability,
        available: running,
        reason: running
          ? 'Capacidad real disponible (solo lectura).'
          : 'Adaptador detenido: capacidad no disponible.',
      })),
    }
  }
}

export function createDesktopSystemAdapter(
  options: DesktopSystemAdapterOptions = {},
): DesktopSystemAdapter {
  return new DesktopSystemAdapter(options)
}
