import type { RuntimeAdapter, RuntimeAdapterHost } from '../../adapter.mts'
import type { WorkspacePublisher } from '../../../kernel/context/publishers.mts'
import type { WorkspaceContextState } from '../../../kernel/context/types.mts'
import type {
  AdapterLifecycleStatus,
  RuntimeAdapterId,
  RuntimeAdapterSnapshot,
  RuntimeHealthStatus,
} from '../../types.mts'
import { WorkspaceDetector } from './detector.mts'
import { WorkspaceEventBus } from './events.mts'
import type { WorkspaceSnapshot } from './snapshot.mts'
import { NONE } from './snapshot.mts'

const WORKSPACE_CAPABILITIES: ReadonlyArray<{ id: string; name: string }> = [
  { id: 'DetectStructure', name: 'Detectar estructura' },
  { id: 'IndexFiles', name: 'Indexar archivos' },
]

/** Proyección del snapshot al dominio `workspace` del KernelContext. */
export function toWorkspaceContextState(snapshot: WorkspaceSnapshot): WorkspaceContextState {
  const structured = snapshot.detectedFiles.length > 0
  return {
    strategy:
      snapshot.monorepo !== NONE
        ? `monorepo:${snapshot.monorepo}`
        : structured
          ? 'single-project'
          : 'sin-configurar',
    structureDetected: structured,
    indexedAt: snapshot.timestamp || null,
  }
}

export interface WorkspaceAdapterOptions {
  detector?: WorkspaceDetector
  events?: WorkspaceEventBus
  host?: RuntimeAdapterHost
  now?: () => string
  projectName?: string
  publisher?: WorkspacePublisher
  root?: string
}

/**
 * Adaptador real (solo lectura) de discovery de workspace. Publica el
 * resultado mediante WorkspacePublisher; jamás accede directamente al
 * KernelContext.
 */
export class WorkspaceAdapter implements RuntimeAdapter {
  readonly id: RuntimeAdapterId = 'workspace'
  readonly name = 'Workspace'
  readonly events: WorkspaceEventBus
  private readonly detector: WorkspaceDetector
  private readonly host: RuntimeAdapterHost | null
  private readonly now: () => string
  private publisher: WorkspacePublisher | null
  private root: string | null
  private projectName: string | null
  private lifecycleStatus: AdapterLifecycleStatus = 'stopped'
  private healthStatus: RuntimeHealthStatus = 'stopped'
  private startedAt: string | null = null
  private message = 'Adaptador Workspace detenido.'
  private snapshot: WorkspaceSnapshot | null = null

  constructor(options: WorkspaceAdapterOptions = {}) {
    this.detector = options.detector ?? new WorkspaceDetector()
    this.events = options.events ?? this.detector.events
    this.host = options.host ?? null
    this.now = options.now ?? (() => new Date().toISOString())
    this.publisher = options.publisher ?? null
    this.root = options.root ?? null
    this.projectName = options.projectName ?? null
  }

  /** Conecta el publisher del contexto; el adaptador solo publica a través de él. */
  connect(publisher: WorkspacePublisher): this {
    this.publisher = publisher
    return this
  }

  setRoot(root: string, projectName?: string): this {
    this.root = root
    if (projectName !== undefined) this.projectName = projectName
    return this
  }

  detect(): WorkspaceSnapshot | null {
    if (!this.root) return null
    const snapshot = this.detector.detect({
      root: this.root,
      projectName: this.projectName ?? undefined,
    })
    this.snapshot = snapshot
    this.publisher?.publish(toWorkspaceContextState(snapshot))
    return snapshot
  }

  getSnapshot(): WorkspaceSnapshot | null {
    return this.snapshot
  }

  initialize(): void {
    if (this.lifecycleStatus === 'stopped') {
      this.lifecycleStatus = 'initializing'
      this.healthStatus = 'initializing'
      this.message = 'Inicializando adaptador Workspace.'
    }
  }

  start(): void {
    if (this.lifecycleStatus === 'running') return
    this.lifecycleStatus = 'running'
    this.startedAt = this.now()
    if (this.root) {
      try {
        const snapshot = this.detect()
        this.healthStatus = snapshot && snapshot.confidence > 0 ? 'healthy' : 'warning'
        this.message =
          snapshot && snapshot.confidence > 0
            ? `Workspace detectado: ${snapshot.framework} / ${snapshot.language} (${snapshot.detectedFiles.length} archivos).`
            : 'Workspace sin señales detectadas.'
      } catch (error) {
        this.healthStatus = 'warning'
        const message = error instanceof Error ? error.message : String(error)
        this.message = `Workspace: fallo de detección (${message}).`
        if (this.root) this.events.emit('WorkspaceScanFailed', { root: this.root, error: message })
      }
    } else {
      this.healthStatus = 'warning'
      this.message = 'Workspace: sin proyecto abierto.'
    }
    this.host?.emit('AdapterStarted', { adapterId: this.id, startedAt: this.startedAt })
  }

  stop(): void {
    if (this.lifecycleStatus === 'stopped') return
    this.lifecycleStatus = 'stopped'
    this.healthStatus = 'stopped'
    this.startedAt = null
    this.message = 'Adaptador Workspace detenido.'
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
      capabilities: WORKSPACE_CAPABILITIES.map((capability) => ({
        ...capability,
        available: running,
        reason: running
          ? 'Capacidad real disponible (solo lectura).'
          : 'Adaptador detenido: capacidad no disponible.',
      })),
    }
  }
}
