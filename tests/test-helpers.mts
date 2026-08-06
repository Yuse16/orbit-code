import { createAdapterHost, createSimulatedAdapter, Runtime, RuntimeEventBus } from '../lib/runtime/index.mts'
import type { SimulatedAdapterSpec } from '../lib/runtime/index.mts'

export const buildRuntime = (specs: ReadonlyArray<SimulatedAdapterSpec>, now = () => 'now'): Runtime => {
  const events = new RuntimeEventBus()
  const host = createAdapterHost(events, now)
  const adapters = specs.map((spec) => createSimulatedAdapter(spec, host))
  return new Runtime({ adapters, events, now })
}
