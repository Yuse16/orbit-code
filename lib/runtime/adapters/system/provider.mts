import type { SystemInfo, SystemInfoProvider } from './types.mts'
import { createEmptySystemInfo } from './types.mts'

/**
 * Valores del equipo de desarrollo para el proveedor simulado.
 * El proveedor Tauri reemplazará esta lectura estática por la lectura real
 * del SO; el contrato del adaptador no cambia.
 */
export const HOST_SYSTEM_INFO: SystemInfo = {
  detectedAt: null,
  osName: 'macOS',
  osVersion: '15.5',
  arch: 'x64',
  hostname: 'MacBook-Pro-de-JORGE',
  user: 'jorge',
  cpuModel: 'Intel(R) Core(TM) i5-7360U CPU @ 2.30GHz',
  cpuCores: 4,
  totalMemoryGb: 16,
  availableMemoryGb: null,
  nodeVersion: 'v24.11.1',
  pnpmVersion: '11.10.0',
  projectDirectory: '/Users/jorge/Desktop/orbit-code-phase1',
}

/** Proveedor simulado: nunca ejecuta acciones reales sobre el sistema. */
export class MockSystemInfoProvider implements SystemInfoProvider {
  readonly source = 'mock' as const
  private readonly info: SystemInfo

  constructor(info: SystemInfo = HOST_SYSTEM_INFO) {
    this.info = info
  }

  read(): SystemInfo {
    return { ...createEmptySystemInfo(), ...this.info }
  }
}
