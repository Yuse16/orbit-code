import { EventBus } from './event-bus.mts'
import type { MissionEvent } from './events.mts'
import { createInitialMissionState, reduceMissionState } from './state.mts'
import type { MissionState } from './types.mts'

export type MissionStateListener = () => void

/**
 * Fuente única de verdad de Orbit. Toda actualización entra por el EventBus;
 * React y futuros clientes nativos solo leen snapshots y se suscriben aquí.
 */
export class MissionStore {
  private state: MissionState
  private readonly listeners = new Set<MissionStateListener>()
  private readonly stopObserving: () => void
  readonly events: EventBus

  constructor(
    events: EventBus,
    initialState: MissionState = createInitialMissionState(),
  ) {
    this.events = events
    this.state = initialState
    this.stopObserving = events.onAny((event) => this.apply(event))
  }

  getSnapshot = (): MissionState => this.state

  subscribe = (listener: MissionStateListener): (() => void) => {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  dispatch(event: MissionEvent): void {
    this.events.emit(event.type, event.payload as never)
  }

  dispose(): void {
    this.stopObserving()
    this.listeners.clear()
  }

  private apply(event: MissionEvent): void {
    const nextState = reduceMissionState(this.state, event)
    if (nextState === this.state) return
    this.state = nextState
    this.listeners.forEach((listener) => listener())
  }
}
