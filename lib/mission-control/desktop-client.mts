import type { GitChange, GitWorktreeStatus, HostPlatform } from './types.mts'
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

export interface GitStatusResult {
  branch: string
  worktree: string
  status: GitWorktreeStatus
  pendingChanges: number
  lastSummary: string
  changes: GitChange[]
}

/**
 * Límite de plataforma: React nunca conoce APIs de macOS, Windows o Linux.
 * La implementación Tauri futura cumplirá este mismo contrato.
 */
export interface DesktopClient {
  getSnapshot(): DesktopSnapshot
  openFolder(): Promise<WorkspaceOpenResult | null>
  readGitStatus(root: string): Promise<GitStatusResult>
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

  async readGitStatus(root: string): Promise<GitStatusResult> {
    void root
    return {
      branch: 'main',
      worktree: 'u-zala',
      status: 'changes-pending',
      pendingChanges: 3,
      lastSummary: '3 cambios simulados',
      changes: [
        { status: 'M', path: 'components/TaskCard.tsx' },
        { status: 'A', path: 'app/promociones/page.tsx' },
        { status: 'M', path: 'lib/promotions.ts' },
      ],
    }
  }
}

/** Implementación del puente Tauri; React solo conoce el contrato DesktopClient. */
export class TauriDesktopClient extends MockDesktopClient {
  async openFolder(): Promise<WorkspaceOpenResult | null> {
    return invoke<WorkspaceOpenResult | null>('open_folder')
  }

  async readGitStatus(root: string): Promise<GitStatusResult> {
    return invoke<GitStatusResult>('git_status', { root })
  }
}

export function createDefaultDesktopClient(): DesktopClient {
  if (typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window) {
    return new TauriDesktopClient()
  }
  return new MockDesktopClient()
}
