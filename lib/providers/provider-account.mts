import { getProviderDescriptor, defaultProviderStatus } from './provider-catalog.mts'
import type {
  AuthStatus,
  ConnectionStatus,
  ModelId,
  ProviderAccountState,
  ProviderDescriptor,
  ProviderId,
  ProviderSnapshot,
  ProviderStatus,
} from './types.mts'

/**
 * Cuenta simulada de un proveedor. Mantiene el estado mutable por proveedor
 * y produce un snapshot plano para la UI y el Director.
 */
export class ProviderAccount {
  readonly descriptor: ProviderDescriptor

  private state: ProviderAccountState

  constructor(id: ProviderId) {
    const descriptor = getProviderDescriptor(id)
    if (!descriptor) throw new Error(`ProviderAccount: proveedor desconocido "${id}"`)
    this.descriptor = descriptor
    this.state = {
      id,
      connection: descriptor.isExternal ? 'disconnected' : 'connected',
      auth: descriptor.isExternal ? 'none' : 'authenticated',
      creditsAvailable: descriptor.isExternal ? 0 : null,
      estimatedCost: 0,
      availableModels: [...descriptor.models],
    }
  }

  get id(): ProviderId {
    return this.state.id
  }

  /** Conecta/desconecta el proveedor (simulado, sin red). */
  connect(): void {
    this.state.connection = 'connected'
  }

  disconnect(): void {
    if (!this.descriptor.isExternal) return
    this.state.connection = 'disconnected'
    this.state.auth = 'none'
  }

  markConnecting(): void {
    this.state.connection = 'connecting'
  }

  markError(): void {
    this.state.connection = 'error'
  }

  /** Registra autenticación simulada. */
  setAuthenticated(): void {
    this.state.auth = 'authenticated'
    this.state.connection = 'connected'
  }

  /** Expira la sesión simulada. */
  setExpired(): void {
    this.state.auth = 'expired'
  }

  clearAuth(): void {
    this.state.auth = 'none'
  }

  /** Suma el costo estimado acumulado en la cuenta. */
  addEstimatedCost(cost: number): void {
    this.state.estimatedCost = round(this.state.estimatedCost + cost)
  }

  /** Resta créditos simulados (no desciende de 0; null = sin créditos). */
  consumeCredits(credits: number): void {
    if (this.state.creditsAvailable === null) return
    this.state.creditsAvailable = Math.max(0, round(this.state.creditsAvailable - credits))
  }

  /** Define qué modelos disponibles permite la cuenta. */
  setAvailableModels(models: ReadonlyArray<ModelId>): void {
    this.state.availableModels = [...models]
  }

  get availableModels(): ReadonlyArray<ModelId> {
    return this.state.availableModels
  }

  /** Estado conectado derivado (autenticado implica conectado). */
  get connected(): boolean {
    return this.state.connection === 'connected'
  }

  get authenticated(): boolean {
    return this.state.auth === 'authenticated'
  }

  /** Estado derivado del proveedor. */
  get status(): ProviderStatus {
    const base = defaultProviderStatus(this.id)
    if (!this.connected || !this.authenticated) return 'unavailable'
    return base
  }

  get estimatedCost(): number {
    return this.state.estimatedCost
  }

  get creditsAvailable(): number | null {
    return this.state.creditsAvailable
  }

  /** Snapshot plano consumible por la UI y el read model. */
  toSnapshot(): ProviderSnapshot {
    return {
      ...this.descriptor,
      status: this.status,
      connected: this.connected,
      authenticated: this.authenticated,
      creditsAvailable: this.creditsAvailable,
      limit: this.descriptor.monthlyLimit,
      estimatedCost: this.state.estimatedCost,
      models: this.state.availableModels,
      estimatedSpeed: this.descriptor.speed,
      estimatedQuality: this.descriptor.quality,
      health: this.connected ? 'healthy' : 'offline',
    }
  }

  /** Estado crudo para sesiones/auditoría interna. */
  toState(): ProviderAccountState {
    return { ...this.state }
  }
}

function round(value: number): number {
  return Math.round(value * 10000) / 10000
}

export type { AuthStatus, ConnectionStatus, ProviderAccountState }
