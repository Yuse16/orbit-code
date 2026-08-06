import type { ProviderHealthStatus, ProviderHealthSummary, ProviderSnapshot } from './types.mts'

/**
 * Evaluación simulada de salud agregada. Determinista a partir de los
 * snapshots de las cuentas; no realiza ninguna petición real.
 */
export class ProviderHealth {
  /** Resumen de salud de un conjunto de proveedores. */
  summarize(providers: ReadonlyArray<ProviderSnapshot>): ProviderHealthSummary {
    const total = providers.length
    const connected = providers.filter((provider) => provider.connected).length
    const authenticated = providers.filter((provider) => provider.authenticated).length

    if (total === 0) {
      return {
        status: 'error',
        connectedCount: 0,
        authenticatedCount: 0,
        total: 0,
        message: 'Sin proveedores registrados.',
      }
    }

    const connectedRatio = connected / total
    let status: ProviderHealthStatus = 'healthy'
    if (connectedRatio < 0.5) status = 'warning'
    if (connected === 0) status = 'offline'

    return {
      status,
      connectedCount: connected,
      authenticatedCount: authenticated,
      total,
      message: buildMessage(connected, authenticated, total, status),
    }
  }
}

function buildMessage(
  connected: number,
  authenticated: number,
  total: number,
  status: ProviderHealthStatus,
): string {
  if (status === 'offline') return 'Sin proveedores conectados.'
  if (status === 'warning') return `Solo ${connected} de ${total} proveedores conectados.`
  return `${connected}/${total} proveedores conectados, ${authenticated} autenticados.`
}
