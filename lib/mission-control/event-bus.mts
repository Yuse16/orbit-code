import type { MissionEvent, MissionEventMap, MissionEventType } from './events.mts'

type EventListener<Type extends MissionEventType> = (
  event: Extract<MissionEvent, { type: Type }>,
) => void

type AnyEventListener = (event: MissionEvent) => void

/**
 * Canal interno tipado. Los servicios emiten eventos y los observadores se
 * suscriben solo a los tipos que necesitan; no conocen React ni Tauri.
 */
export class EventBus {
  private readonly listeners = new Map<MissionEventType, Set<AnyEventListener>>()
  private readonly allListeners = new Set<AnyEventListener>()

  on<Type extends MissionEventType>(
    type: Type,
    listener: EventListener<Type>,
  ): () => void {
    const listeners = this.listeners.get(type) ?? new Set<AnyEventListener>()
    const safeListener = listener as AnyEventListener
    listeners.add(safeListener)
    this.listeners.set(type, listeners)

    return () => {
      listeners.delete(safeListener)
      if (listeners.size === 0) this.listeners.delete(type)
    }
  }

  onAny(listener: AnyEventListener): () => void {
    this.allListeners.add(listener)
    return () => this.allListeners.delete(listener)
  }

  emit<Type extends MissionEventType>(type: Type, payload: MissionEventMap[Type]): void {
    const event = { type, payload } as Extract<MissionEvent, { type: Type }>
    const listeners = this.listeners.get(type)
    listeners?.forEach((listener) => listener(event))
    this.allListeners.forEach((listener) => listener(event))
  }
}
