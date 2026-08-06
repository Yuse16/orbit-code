import type { RuntimeEventBus } from './event-bus.mts'
import type { RuntimeEventMap, RuntimeEventType } from './events.mts'
import type {
  RuntimeAdapterId,
  RuntimeAdapterSnapshot,
  RuntimeHealthStatus,
} from './types.mts'

/** Unidad mínima de ciclo de vida que el Runtime puede iniciar y detener. */
export interface RuntimeModule {
  readonly id: RuntimeAdapterId
  readonly name: string
  initialize(): void
  start(): void
  stop(): void
  dispose(): void
}

/** Adaptador: módulo más salud, snapshot y capacidades simuladas. */
export interface RuntimeAdapter extends RuntimeModule {
  health(): RuntimeHealthStatus
  status(): RuntimeAdapterSnapshot
}

/** Puente entre el adaptador y el Runtime para emitir eventos propios. */
export interface RuntimeAdapterHost {
  readonly now: () => string
  emit<Type extends RuntimeEventType>(type: Type, payload: RuntimeEventMap[Type]): void
}

export interface SimulatedAdapterSpec {
  id: RuntimeAdapterId
  name: string
  capabilities: ReadonlyArray<{ id: string; name: string }>
  failOnStart?: boolean
  failureMessage?: string
  warnOnStart?: boolean
  warningMessage?: string
}

export const createAdapterHost = (events: RuntimeEventBus, now: () => string): RuntimeAdapterHost => ({
  now,
  emit: (type, payload) => events.emit(type, payload),
})
