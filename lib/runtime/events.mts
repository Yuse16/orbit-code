import type { RuntimeAdapterId, RuntimeCapabilityDescriptor, RuntimeHealthStatus } from './types.mts'

export interface RuntimeEventMap {
  RuntimeStarted: { startedAt: string }
  RuntimeStopped: { stoppedAt: string }
  AdapterRegistered: { adapterId: RuntimeAdapterId }
  AdapterStarted: { adapterId: RuntimeAdapterId; startedAt: string }
  AdapterStopped: { adapterId: RuntimeAdapterId }
  AdapterFailed: { adapterId: RuntimeAdapterId; message: string }
  HealthChanged: { status: RuntimeHealthStatus; message: string }
  CapabilityChanged: { adapterId: RuntimeAdapterId; capability: RuntimeCapabilityDescriptor }
}

export type RuntimeEventType = keyof RuntimeEventMap

export type RuntimeEvent = {
  [Type in RuntimeEventType]: { type: Type; payload: RuntimeEventMap[Type] }
}[RuntimeEventType]
