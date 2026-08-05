import type { DesktopClient } from '../mission-control/desktop-client.mts'
import { MockDesktopClient } from '../mission-control/desktop-client.mts'
import { EventBus } from '../mission-control/event-bus.mts'
import { createMockServices } from '../mission-control/mock-services.mts'
import { installMissionObservers } from '../mission-control/observers.mts'
import { MissionStore } from '../mission-control/store.mts'
import type { MissionGuidance } from '../mission-control/types.mts'

export interface KernelMissionRuntime {
  readonly events: EventBus
  readonly store: MissionStore
  readonly services: ReturnType<typeof createMockServices>
  dispose(): void
}

export interface KernelMissionRuntimeOptions {
  desktopClient?: DesktopClient
  now: () => string
  guidance?: MissionGuidance
}

/** El Kernel construye este grafo; Mission Control solo lo consume indirectamente. */
export function createKernelMissionRuntime(options: KernelMissionRuntimeOptions): KernelMissionRuntime {
  const events = new EventBus()
  const store = new MissionStore(events)
  const desktopClient = options.desktopClient ?? new MockDesktopClient()
  const services = createMockServices(events, desktopClient, options.now)
  const stopObservers = installMissionObservers(events, options.now)

  if (options.guidance) events.emit('GuidanceChanged', { guidance: options.guidance })

  return {
    events,
    store,
    services,
    dispose: () => {
      stopObservers()
      store.dispose()
    },
  }
}
