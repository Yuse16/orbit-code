import { WorkspaceAnalyzer } from './analyzer.mts'
import { WorkspaceEventBus } from './events.mts'
import { indexWorkspace } from './indexer.mts'
import { WorkspaceScanner } from './scanner.mts'
import { createEmptyWorkspaceSnapshot, type WorkspaceSnapshot } from './snapshot.mts'

export interface WorkspaceDetectOptions {
  root: string
  projectName?: string
  timestamp?: string
}

export interface WorkspaceDetectorOptions {
  scanner?: WorkspaceScanner
  analyzer?: WorkspaceAnalyzer
  events?: WorkspaceEventBus
  now?: () => string
}

function defaultProjectName(root: string): string {
  return root.split('/').filter(Boolean).pop() ?? 'proyecto'
}

/** Orquesta el escaneo y el análisis para generar un WorkspaceSnapshot. */
export class WorkspaceDetector {
  private readonly scanner: WorkspaceScanner
  private readonly analyzer: WorkspaceAnalyzer
  readonly events: WorkspaceEventBus
  private readonly now: () => string

  constructor(options: WorkspaceDetectorOptions = {}) {
    this.scanner = options.scanner ?? new WorkspaceScanner()
    this.analyzer = options.analyzer ?? new WorkspaceAnalyzer()
    this.events = options.events ?? new WorkspaceEventBus()
    this.now = options.now ?? (() => new Date().toISOString())
  }

  detect(options: WorkspaceDetectOptions): WorkspaceSnapshot {
    const root = options.root
    this.events.emit('WorkspaceScanStarted', { root })
    let scan
    try {
      scan = this.scanner.scan(root)
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      this.events.emit('WorkspaceScanFailed', { root, error: message })
      throw error
    }
    this.events.emit('WorkspaceScanCompleted', { root, detectedFiles: scan.detectedFiles })
    const projectName = options.projectName ?? defaultProjectName(root)
    const analysis = this.analyzer.analyze(scan, { projectName })
    const snapshot: WorkspaceSnapshot = {
      ...createEmptyWorkspaceSnapshot({ root }),
      ...analysis,
      detectedFiles: scan.detectedFiles,
      index: indexWorkspace(scan.entries, { root, now: this.now }),
      timestamp: options.timestamp ?? this.now(),
    }
    this.events.emit('WorkspaceDetected', { snapshot })
    return snapshot
  }
}
