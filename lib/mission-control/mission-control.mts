import type { MissionControl, MissionControlOptions } from './contracts.mts'
import { MockDesktopClient } from './desktop-client.mts'
import { EventBus } from './event-bus.mts'
import { createMockServices } from './mock-services.mts'
import { installMissionObservers } from './observers.mts'
import { MissionStore } from './store.mts'

/** Construye el grafo de Mission Control sin acoplarlo a React ni a Tauri. */
export function createMockMissionControl(options: MissionControlOptions = {}): MissionControl {
  const events = new EventBus()
  const store = new MissionStore(events)
  const now = options.now ?? (() => new Date().toISOString())
  const desktopClient = options.desktopClient ?? new MockDesktopClient()
  const services = createMockServices(events, desktopClient, now)
  const stopObservers = installMissionObservers(events, now)

  services.desktop.detect()
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
