import type { KernelContext } from './context.mts'
import { KernelContextPublisher } from './publisher.mts'
import {
  createInitialCapabilitiesState,
  createInitialHealthState,
  createInitialMemoryState,
  createInitialMissionContextState,
  createInitialNotificationState,
  createInitialProviderState,
  createInitialRuntimeState,
  createInitialSchedulerState,
  createInitialWorkspaceState,
} from './states.mts'

export class RuntimePublisher extends KernelContextPublisher<'runtime'> {
  constructor(context: KernelContext) {
    super(context, 'runtime', createInitialRuntimeState())
  }
}

export class MissionPublisher extends KernelContextPublisher<'mission'> {
  constructor(context: KernelContext) {
    super(context, 'mission', createInitialMissionContextState())
  }
}

export class SchedulerPublisher extends KernelContextPublisher<'scheduler'> {
  constructor(context: KernelContext) {
    super(context, 'scheduler', createInitialSchedulerState())
  }
}

export class WorkspacePublisher extends KernelContextPublisher<'workspace'> {
  constructor(context: KernelContext) {
    super(context, 'workspace', createInitialWorkspaceState())
  }
}

export class ProviderPublisher extends KernelContextPublisher<'providers'> {
  constructor(context: KernelContext) {
    super(context, 'providers', createInitialProviderState())
  }
}

export class MemoryPublisher extends KernelContextPublisher<'memory'> {
  constructor(context: KernelContext) {
    super(context, 'memory', createInitialMemoryState())
  }
}

export class NotificationPublisher extends KernelContextPublisher<'notifications'> {
  constructor(context: KernelContext) {
    super(context, 'notifications', createInitialNotificationState())
  }
}

export class CapabilityPublisher extends KernelContextPublisher<'capabilities'> {
  constructor(context: KernelContext) {
    super(context, 'capabilities', createInitialCapabilitiesState())
  }
}

export class HealthPublisher extends KernelContextPublisher<'health'> {
  constructor(context: KernelContext) {
    super(context, 'health', createInitialHealthState())
  }
}
