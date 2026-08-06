import type { WorkspaceSnapshot } from './snapshot.mts'

export const WorkspaceEvents = {
  ScanStarted: 'WorkspaceScanStarted',
  ScanCompleted: 'WorkspaceScanCompleted',
  Detected: 'WorkspaceDetected',
  ScanFailed: 'WorkspaceScanFailed',
} as const

export interface WorkspaceEventMap {
  WorkspaceScanStarted: { root: string }
  WorkspaceScanCompleted: { root: string; detectedFiles: ReadonlyArray<string> }
  WorkspaceDetected: { snapshot: WorkspaceSnapshot }
  WorkspaceScanFailed: { root: string; error: string }
}

export type WorkspaceEventType = keyof WorkspaceEventMap

export type WorkspaceEvent = {
  [Type in WorkspaceEventType]: { type: Type; payload: WorkspaceEventMap[Type] }
}[WorkspaceEventType]

type WorkspaceEventListener<Type extends WorkspaceEventType> = (
  event: Extract<WorkspaceEvent, { type: Type }>,
) => void

type WorkspaceAnyEventListener = (event: WorkspaceEvent) => void

/** Canal tipado de eventos del descubrimiento de workspace. */
export class WorkspaceEventBus {
  private readonly listeners = new Map<WorkspaceEventType, Set<WorkspaceAnyEventListener>>()
  private readonly allListeners = new Set<WorkspaceAnyEventListener>()

  on<Type extends WorkspaceEventType>(
    type: Type,
    listener: WorkspaceEventListener<Type>,
  ): () => void {
    const listeners = this.listeners.get(type) ?? new Set<WorkspaceAnyEventListener>()
    const safeListener = listener as WorkspaceAnyEventListener
    listeners.add(safeListener)
    this.listeners.set(type, listeners)
    return () => {
      listeners.delete(safeListener)
      if (listeners.size === 0) this.listeners.delete(type)
    }
  }

  onAny(listener: WorkspaceAnyEventListener): () => void {
    this.allListeners.add(listener)
    return () => this.allListeners.delete(listener)
  }

  emit<Type extends WorkspaceEventType>(type: Type, payload: WorkspaceEventMap[Type]): void {
    const event = { type, payload } as Extract<WorkspaceEvent, { type: Type }>
    this.listeners.get(type)?.forEach((listener) => listener(event))
    this.allListeners.forEach((listener) => listener(event))
  }
}
