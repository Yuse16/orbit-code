import type { KernelEvent, KernelEventMap, KernelEventType } from './events.mts'

type EventListener<Type extends KernelEventType> = (
  event: Extract<KernelEvent, { type: Type }>,
) => void

type AnyEventListener = (event: KernelEvent) => void

/** Canal interno del Kernel, separado de los eventos de presentación. */
export class KernelEventBus {
  private readonly listeners = new Map<KernelEventType, Set<AnyEventListener>>()
  private readonly allListeners = new Set<AnyEventListener>()

  on<Type extends KernelEventType>(type: Type, listener: EventListener<Type>): () => void {
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

  emit<Type extends KernelEventType>(type: Type, payload: KernelEventMap[Type]): void {
    const event = { type, payload } as Extract<KernelEvent, { type: Type }>
    this.listeners.get(type)?.forEach((listener) => listener(event))
    this.allListeners.forEach((listener) => listener(event))
  }
}
