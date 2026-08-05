import type { HostPlatform } from './types.mts'

export interface DesktopSnapshot {
  platform: HostPlatform
  platformLabel: string
  appVersion: string
}

/**
 * Límite de plataforma: React nunca conoce APIs de macOS, Windows o Linux.
 * La implementación Tauri futura cumplirá este mismo contrato.
 */
export interface DesktopClient {
  getSnapshot(): DesktopSnapshot
}

export class MockDesktopClient implements DesktopClient {
  private readonly snapshot: DesktopSnapshot

  constructor(snapshot: DesktopSnapshot = {
    platform: 'macos',
    platformLabel: 'macOS',
    appVersion: '0.2.0',
  }) {
    this.snapshot = snapshot
  }

  getSnapshot(): DesktopSnapshot {
    return this.snapshot
  }
}
