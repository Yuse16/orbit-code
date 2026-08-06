import type { RuntimeAdapter, RuntimeAdapterHost, SimulatedAdapterSpec } from './adapter.mts'
import type {
  AdapterLifecycleStatus,
  RuntimeAdapterId,
  RuntimeAdapterSnapshot,
  RuntimeCapabilityDescriptor,
  RuntimeHealthStatus,
} from './types.mts'

const unavailableReason = (running: boolean): string =>
  running ? 'Capacidad simulada disponible.' : 'Adaptador detenido: capacidad no disponible.'

/** Adaptador declarativo: nunca ejecuta acciones reales en el sistema. */
export class SimulatedAdapter implements RuntimeAdapter {
  readonly id: RuntimeAdapterId
  readonly name: string
  private readonly host: RuntimeAdapterHost
  private readonly spec: SimulatedAdapterSpec
  private readonly capabilities = new Map<string, RuntimeCapabilityDescriptor>()
  private lifecycleStatus: AdapterLifecycleStatus = 'stopped'
  private healthStatus: RuntimeHealthStatus = 'stopped'
  private startedAt: string | null = null
  private message: string

  constructor(spec: SimulatedAdapterSpec, host: RuntimeAdapterHost) {
    this.spec = spec
    this.id = spec.id
    this.name = spec.name
    this.host = host
    this.message = `Adaptador ${spec.name} detenido.`
    spec.capabilities.forEach((capability) => {
      this.capabilities.set(capability.id, {
        ...capability,
        available: false,
        reason: unavailableReason(false),
      })
    })
  }

  initialize(): void {
    if (this.lifecycleStatus === 'stopped') {
      this.lifecycleStatus = 'initializing'
      this.healthStatus = 'initializing'
      this.message = `Inicializando adaptador ${this.name} (simulado).`
    }
  }

  start(): void {
    if (this.lifecycleStatus === 'running') return
    this.initialize()
    if (this.spec.failOnStart) {
      this.lifecycleStatus = 'error'
      this.healthStatus = 'error'
      this.message = this.spec.failureMessage ?? `El adaptador ${this.name} falló al iniciar.`
      this.host.emit('AdapterFailed', { adapterId: this.id, message: this.message })
      return
    }
    this.lifecycleStatus = 'running'
    this.healthStatus = this.spec.warnOnStart ? 'warning' : 'healthy'
    this.startedAt = this.host.now()
    this.message = this.spec.warnOnStart
      ? this.spec.warningMessage ?? `El adaptador ${this.name} inició con advertencias.`
      : `Adaptador ${this.name} listo (simulado).`
    this.capabilities.forEach((capability) => {
      this.setCapability(capability.id, true)
    })
    this.host.emit('AdapterStarted', { adapterId: this.id, startedAt: this.startedAt })
  }

  stop(): void {
    if (this.lifecycleStatus === 'stopped') return
    if (this.lifecycleStatus !== 'error') this.lifecycleStatus = 'stopping'
    this.capabilities.forEach((capability) => {
      this.setCapability(capability.id, false)
    })
    this.lifecycleStatus = 'stopped'
    this.healthStatus = 'stopped'
    this.startedAt = null
    this.message = `Adaptador ${this.name} detenido.`
    this.host.emit('AdapterStopped', { adapterId: this.id })
  }

  dispose(): void {
    this.stop()
  }

  health(): RuntimeHealthStatus {
    return this.healthStatus
  }

  status(): RuntimeAdapterSnapshot {
    return {
      id: this.id,
      name: this.name,
      status: this.lifecycleStatus,
      health: this.healthStatus,
      startedAt: this.startedAt,
      message: this.message,
      capabilities: [...this.capabilities.values()],
    }
  }

  private setCapability(id: string, available: boolean): void {
    const current = this.capabilities.get(id)
    if (!current || current.available === available) return
    const updated: RuntimeCapabilityDescriptor = {
      ...current,
      available,
      reason: unavailableReason(available),
    }
    this.capabilities.set(id, updated)
    this.host.emit('CapabilityChanged', { adapterId: this.id, capability: updated })
  }
}

export const DEFAULT_ADAPTER_SPECS: ReadonlyArray<SimulatedAdapterSpec> = [
  { id: 'desktop', name: 'Desktop', capabilities: [{ id: 'DetectPlatform', name: 'Detectar plataforma' }, { id: 'ShowWindow', name: 'Mostrar ventana' }, { id: 'Notify', name: 'Notificar' }] },
  { id: 'git', name: 'Git', capabilities: [{ id: 'Status', name: 'Ver estado' }, { id: 'Commit', name: 'Crear commit' }, { id: 'Diff', name: 'Ver diff' }, { id: 'Branch', name: 'Gestionar ramas' }, { id: 'Fetch', name: 'Actualizar remoto' }, { id: 'Push', name: 'Publicar cambios' }] },
  { id: 'localhost', name: 'Localhost', capabilities: [{ id: 'StartPreview', name: 'Iniciar preview' }, { id: 'StopPreview', name: 'Detener preview' }] },
  { id: 'terminal', name: 'Terminal', capabilities: [{ id: 'RunCommand', name: 'Ejecutar comando' }] },
  { id: 'filesystem', name: 'Filesystem', capabilities: [{ id: 'ReadFile', name: 'Leer archivo' }, { id: 'WriteFile', name: 'Escribir archivo' }, { id: 'ListDirectory', name: 'Listar directorio' }] },
  { id: 'providers', name: 'Providers', capabilities: [{ id: 'ActivateProvider', name: 'Activar proveedor' }, { id: 'ConnectProvider', name: 'Conectar proveedor' }, { id: 'DisconnectProvider', name: 'Desconectar proveedor' }] },
  { id: 'sqlite', name: 'SQLite', capabilities: [{ id: 'OpenDatabase', name: 'Abrir base de datos' }, { id: 'RunQuery', name: 'Ejecutar consulta' }] },
  { id: 'docker', name: 'Docker', capabilities: [{ id: 'ListContainers', name: 'Listar contenedores' }, { id: 'StartContainer', name: 'Iniciar contenedor' }] },
  { id: 'mcp', name: 'MCP', capabilities: [{ id: 'RegisterTool', name: 'Registrar herramienta' }, { id: 'CallTool', name: 'Llamar herramienta' }] },
  { id: 'github', name: 'GitHub', capabilities: [{ id: 'Authenticate', name: 'Autenticar' }, { id: 'CreatePR', name: 'Crear pull request' }, { id: 'SyncRepository', name: 'Sincronizar repositorio' }] },
  { id: 'vercel', name: 'Vercel', capabilities: [{ id: 'Authenticate', name: 'Autenticar' }, { id: 'DeployPreview', name: 'Desplegar preview' }, { id: 'DeployProduction', name: 'Desplegar producción' }] },
  { id: 'supabase', name: 'Supabase', capabilities: [{ id: 'Authenticate', name: 'Autenticar' }, { id: 'RunMigration', name: 'Ejecutar migración' }] },
  { id: 'browser', name: 'Browser', capabilities: [{ id: 'OpenTab', name: 'Abrir pestaña' }, { id: 'CaptureViewport', name: 'Capturar viewport' }] },
  { id: 'workspace', name: 'Workspace', capabilities: [{ id: 'DetectStructure', name: 'Detectar estructura' }, { id: 'IndexFiles', name: 'Indexar archivos' }] },
]

export function createSimulatedAdapter(
  spec: SimulatedAdapterSpec,
  host: RuntimeAdapterHost,
): RuntimeAdapter {
  return new SimulatedAdapter(spec, host)
}

export function createDefaultAdapters(host: RuntimeAdapterHost): ReadonlyArray<RuntimeAdapter> {
  return DEFAULT_ADAPTER_SPECS.map((spec) => createSimulatedAdapter(spec, host))
}
