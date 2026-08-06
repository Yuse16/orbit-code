import { ProviderAccount } from './provider-account.mts'
import type { AuthStatus, ProviderId, ProviderSessionSnapshot } from './types.mts'

/**
 * Gestión de sesión simulada. login()/logout()/refresh()/session() no
 * realizan autenticación real: generan credenciales locales deterministas.
 */
export class ProviderSession {
  private readonly sessions = new Map<ProviderId, SessionRecord>()

  /** Inicia sesión simulada para un proveedor externo. */
  login(account: ProviderAccount): ProviderSessionSnapshot {
    const now = new Date()
    const expiresAt = new Date(now.getTime() + 3600_000)
    const record: SessionRecord = {
      providerId: account.id,
      status: 'authenticated',
      authenticatedAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
      tokenPreview: `sk-sim-${account.id}-${now.getTime().toString(36)}`,
    }
    this.sessions.set(account.id, record)
    account.setAuthenticated()
    return toSnapshot(record)
  }

  /** Cierra sesión simulada y desconecta la cuenta. */
  logout(account: ProviderAccount): void {
    this.sessions.delete(account.id)
    account.disconnect()
  }

  /** Renueva la sesión simulada (mueve la expiración). */
  refresh(account: ProviderAccount): ProviderSessionSnapshot | null {
    const current = this.sessions.get(account.id)
    if (!current) return null
    const expiresAt = new Date(new Date().getTime() + 3600_000)
    this.sessions.set(account.id, { ...current, expiresAt: expiresAt.toISOString() })
    account.setAuthenticated()
    return this.snapshotFor(account.id)
  }

  /** Devuelve el estado de sesión actual; null si no hay sesión. */
  session(account: ProviderAccount): ProviderSessionSnapshot | null {
    return this.snapshotFor(account.id)
  }

  /** Estado de sesión por proveedor; null si no hay sesión. */
  snapshotFor(providerId: ProviderId): ProviderSessionSnapshot | null {
    const record = this.sessions.get(providerId)
    return record ? toSnapshot(record) : null
  }

  /** Procesa la expiración: marca la sesión como expirada. */
  expire(account: ProviderAccount): void {
    const current = this.sessions.get(account.id)
    if (!current) return
    this.sessions.set(account.id, { ...current, status: 'expired' })
    account.setExpired()
  }

  get activeCount(): number {
    return this.sessions.size
  }
}

interface SessionRecord {
  providerId: ProviderId
  status: AuthStatus
  authenticatedAt: string
  expiresAt: string
  tokenPreview: string
}

function toSnapshot(record: SessionRecord): ProviderSessionSnapshot {
  return {
    providerId: record.providerId,
    status: record.status,
    authenticated: record.status === 'authenticated',
    authenticatedAt: record.authenticatedAt,
    expiresAt: record.expiresAt,
    tokenPreview: record.tokenPreview,
  }
}
