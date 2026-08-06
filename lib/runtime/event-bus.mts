import type { RuntimeEvent, RuntimeEventMap, RuntimeEventType } from './events.mts'

type EventListener<Type extends RuntimeEventType> = (
  event: Extract<RuntimeEvent, { type: Type }>,
) => void

type AnyEventListener = (event: RuntimeEvent) => void

/** Canal interno del Runtime, separado de los eventos de presentación. */
export class RuntimeEventBus {
  private readonly listeners = new Map<RuntimeEventType, Set<AnyEventListener>>()
  private readonly allListeners = new Set<AnyEventListener>()

  on<Type extends RuntimeEventType>(type: Type, listener: EventListener<Type>): () => void {
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

  emit<Type extends RuntimeEventType>(type: Type, payload: RuntimeEventMap[Type]): void {
    const event = { type, payload } as Extract<RuntimeEvent, { type: Type }>
    this.listeners.get(type)?.forEach((listener) => listener(event))
    this.allListeners.forEach((listener) => listener(event))
  }
}
