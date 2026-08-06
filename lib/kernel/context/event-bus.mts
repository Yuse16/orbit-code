import type { KernelContextEvent, KernelContextEventMap, KernelContextEventType } from './events.mts'

type EventListener<Type extends KernelContextEventType> = (
  event: Extract<KernelContextEvent, { type: Type }>,
) => void

type AnyEventListener = (event: KernelContextEvent) => void

/** Canal interno del KernelContext, separado de los buses de los subsistemas. */
export class KernelContextEventBus {
  private readonly listeners = new Map<KernelContextEventType, Set<AnyEventListener>>()
  private readonly allListeners = new Set<AnyEventListener>()

  on<Type extends KernelContextEventType>(type: Type, listener: EventListener<Type>): () => void {
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

  emit<Type extends KernelContextEventType>(type: Type, payload: KernelContextEventMap[Type]): void {
    const event = { type, payload } as Extract<KernelContextEvent, { type: Type }>
    this.listeners.get(type)?.forEach((listener) => listener(event))
    this.allListeners.forEach((listener) => listener(event))
  }
}
