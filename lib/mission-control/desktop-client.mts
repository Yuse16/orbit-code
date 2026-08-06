import type { HostPlatform } from './types.mts'
import { invoke } from '@tauri-apps/api/core'
import type { WorkspaceIndexSnapshot } from '../runtime/adapters/workspace/indexer.mts'

export interface DesktopSnapshot {
  platform: HostPlatform
  platformLabel: string
  appVersion: string
}

export interface WorkspaceOpenResult {
  root: string
  projectName: string
  index: WorkspaceIndexSnapshot
}

/**
 * Límite de plataforma: React nunca conoce APIs de macOS, Windows o Linux.
 * La implementación Tauri futura cumplirá este mismo contrato.
 */
export interface DesktopClient {
  getSnapshot(): DesktopSnapshot
  openFolder(): Promise<WorkspaceOpenResult | null>
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

  async openFolder(): Promise<WorkspaceOpenResult | null> {
    return null
  }
}

/** Implementación del puente Tauri; React solo conoce el contrato DesktopClient. */
export class TauriDesktopClient extends MockDesktopClient {
  async openFolder(): Promise<WorkspaceOpenResult | null> {
    return invoke<WorkspaceOpenResult | null>('open_folder')
  }
}

export function createDefaultDesktopClient(): DesktopClient {
  if (typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window) {
    return new TauriDesktopClient()
  }
  return new MockDesktopClient()
}
