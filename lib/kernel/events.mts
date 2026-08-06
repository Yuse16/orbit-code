import type {
  CapabilityDescriptor,
  CapabilityId,
  KernelHealthStatus,
  OrbitDNA,
  SchedulerTask,
} from './types.mts'

export interface KernelEventMap {
  KernelStarted: { startedAt: string }
  KernelStopped: { stoppedAt: string }
  CapabilityRegistered: { capability: CapabilityDescriptor }
  CapabilityChanged: { capability: CapabilityDescriptor }
  SchedulerStarted: Record<string, never>
  SchedulerStopped: Record<string, never>
  DNALoaded: { dna: OrbitDNA }
  KernelHealthy: { message: string }
  KernelWarning: { message: string }
  KernelError: { message: string }
  SchedulerTaskQueued: { task: SchedulerTask }
  SchedulerTaskChanged: { task: SchedulerTask }
  CapabilityDiscoveryRequested: { capabilityId: CapabilityId }
}

export type KernelEventType = keyof KernelEventMap

export type KernelEvent = {
  [Type in KernelEventType]: { type: Type; payload: KernelEventMap[Type] }
}[KernelEventType]

export const eventToHealth: Partial<Record<KernelEventType, KernelHealthStatus>> = {
  KernelHealthy: 'healthy',
  KernelWarning: 'warning',
  KernelError: 'error',
}
