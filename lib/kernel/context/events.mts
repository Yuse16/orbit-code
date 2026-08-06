import type { KernelDomainId, KernelSnapshot } from './types.mts'

export interface KernelContextEventMap {
  SnapshotCreated: { snapshot: KernelSnapshot; version: number }
  SnapshotUpdated: {
    snapshot: KernelSnapshot
    version: number
    changedDomains: ReadonlyArray<KernelDomainId>
  }
  PublisherRegistered: { domain: KernelDomainId; registeredAt: string }
  PublisherUpdated: { domain: KernelDomainId; updatedAt: string }
  PublisherRemoved: { domain: KernelDomainId; removedAt: string }
  ContextChanged: { version: number; changedDomains: ReadonlyArray<KernelDomainId> }
}

export type KernelContextEventType = keyof KernelContextEventMap

export type KernelContextEvent = {
  [Type in KernelContextEventType]: { type: Type; payload: KernelContextEventMap[Type] }
}[KernelContextEventType]
