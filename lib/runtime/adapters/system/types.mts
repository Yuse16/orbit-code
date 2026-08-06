/**
 * Info del sistema leída por el adaptador en modo solo lectura.
 * Cada campo puede ser null: el proveedor real (Tauri) aún no entrega todos
 * los datos; la UI muestra "No disponible" en ese caso.
 */
export interface SystemInfo {
  detectedAt: string | null
  osName: string | null
  osVersion: string | null
  arch: string | null
  hostname: string | null
  user: string | null
  cpuModel: string | null
  cpuCores: number | null
  totalMemoryGb: number | null
  availableMemoryGb: number | null
  nodeVersion: string | null
  pnpmVersion: string | null
  projectDirectory: string | null
}

export const createEmptySystemInfo = (): SystemInfo => ({
  detectedAt: null,
  osName: null,
  osVersion: null,
  arch: null,
  hostname: null,
  user: null,
  cpuModel: null,
  cpuCores: null,
  totalMemoryGb: null,
  availableMemoryGb: null,
  nodeVersion: null,
  pnpmVersion: null,
  projectDirectory: null,
})

/** Fuente de datos del sistema: simulada hoy, Tauri real en el futuro. */
export interface SystemInfoProvider {
  readonly source: 'mock' | 'tauri'
  read(): SystemInfo
}
