import { ProviderAccount } from './provider-account.mts'
import { PROVIDER_CATALOG } from './provider-catalog.mts'
import type { ProviderId, ProviderSnapshot } from './types.mts'

/**
 * Registro de cuentas de proveedor. Crea una cuenta por proveedor del
 * catálogo y permite acceso por id y por estado.
 */
export class ProviderRegistry {
  private readonly accounts = new Map<ProviderId, ProviderAccount>()

  constructor() {
    for (const provider of PROVIDER_CATALOG) {
      this.accounts.set(provider.id, new ProviderAccount(provider.id))
    }
  }

  get size(): number {
    return this.accounts.size
  }

  get(id: ProviderId): ProviderAccount | null {
    return this.accounts.get(id) ?? null
  }

  has(id: ProviderId): boolean {
    return this.accounts.has(id)
  }

  /** Cuenta activa simulada: primera conectada y autenticada. */
  getActive(): ProviderAccount | null {
    for (const account of this.accounts.values()) {
      if (account.connected && account.authenticated) return account
    }
    return null
  }

  listAccounts(): ReadonlyArray<ProviderAccount> {
    return [...this.accounts.values()]
  }

  listSnapshots(): ReadonlyArray<ProviderSnapshot> {
    return this.listAccounts().map((account) => account.toSnapshot())
  }
}
