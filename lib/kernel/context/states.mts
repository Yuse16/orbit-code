import { createInitialMissionState } from '../../mission-control/state.mts'
import type { MemoryState, NotificationState, ProviderState } from '../../mission-control/types.mts'
import { createEmptySystemInfo } from '../../runtime/adapters/system/index.mts'
import type { CapabilityState, SchedulerState } from '../types.mts'
import { toMissionContextState } from './mappers.mts'
import type {
  DnaContextState,
  HealthContextState,
  MissionContextState,
  RuntimeContextState,
  SystemContextState,
  WorkspaceContextState,
} from './types.mts'

export const createInitialRuntimeState = (): RuntimeContextState => ({
  lifecycle: 'stopped',
  health: 'stopped',
  startedAt: null,
  adapters: [],
  availableCapabilities: 0,
  totalCapabilities: 0,
})

export const createInitialSystemState = (): SystemContextState => createEmptySystemInfo()

export const createInitialMissionContextState = (): MissionContextState =>
  toMissionContextState(createInitialMissionState())

export const createInitialSchedulerState = (): SchedulerState => ({ status: 'stopped', queue: [] })

export const createInitialWorkspaceState = (): WorkspaceContextState => ({
  strategy: 'sin-configurar',
  structureDetected: false,
  indexedAt: null,
  index: null,
})

export const createInitialProviderState = (): ProviderState => createInitialMissionState().providers

export const createInitialMemoryState = (): MemoryState => createInitialMissionState().memory

export const createInitialNotificationState = (): NotificationState =>
  createInitialMissionState().notifications

export const createInitialCapabilitiesState = (): CapabilityState => ({
  items: [],
  lastDiscoveryAt: null,
})

export const createInitialHealthState = (): HealthContextState => ({
  status: 'unknown',
  message: 'Kernel no iniciado.',
})

export const createInitialDnaState = (): DnaContextState => ({ dna: null })
