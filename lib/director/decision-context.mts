import type { KernelContextReader } from '../kernel/context/reader.mts'
import type {
  CapabilityDescriptor,
  OrbitDNA,
  SchedulerState,
} from '../kernel/types.mts'
import type { MemoryState, ProjectStage, ProviderState } from '../mission-control/types.mts'
import type { WorkspaceSnapshot } from '../runtime/adapters/workspace/snapshot.mts'
import type { RuntimeHealthStatus } from '../runtime/types.mts'
import type { DirectorRequest } from './types.mts'

/**
 * Snapshot de lo único que el Director puede leer: KernelContext,
 * WorkspaceSnapshot, DNA, CurrentStage, ProviderState, RuntimeHealth,
 * Capabilities y MemorySummary.
 */
export interface DecisionContext {
  request: DirectorRequest
  kernel: {
    lifecycle: string
    health: string
    healthMessage: string
    capabilities: ReadonlyArray<CapabilityDescriptor>
    scheduler: SchedulerState | null
    workspace: { strategy: string; structureDetected: boolean; indexedAt: string | null } | null
    providers: ProviderState | null
    memory: MemoryState | null
    dna: OrbitDNA | null
  }
  workspaceSnapshot: WorkspaceSnapshot | null
  currentStage: ProjectStage | null
  providerState: ProviderState | null
  runtimeHealth: RuntimeHealthStatus | null
  capabilities: ReadonlyArray<CapabilityDescriptor> | null
  memorySummary: string | null
  dna: OrbitDNA | null
  timestamp: string
}

export interface DecisionContextOptions {
  workspaceSnapshot?: WorkspaceSnapshot | null
  currentStage?: ProjectStage | null
}

/** Construye el contexto leyendo únicamente a través de KernelContextReader. */
export function createDecisionContext(
  kernel: KernelContextReader,
  request: DirectorRequest,
  options: DecisionContextOptions = {},
  now: () => string = () => new Date().toISOString(),
): DecisionContext {
  const snapshot = kernel.getSnapshot()
  const capabilities = snapshot.capabilities.items
  return {
    request,
    kernel: {
      lifecycle: snapshot.runtime.lifecycle,
      health: snapshot.health.status,
      healthMessage: snapshot.health.message,
      capabilities,
      scheduler: snapshot.scheduler,
      workspace: snapshot.workspace,
      providers: snapshot.providers,
      memory: snapshot.memory,
      dna: snapshot.dna.dna,
    },
    workspaceSnapshot: options.workspaceSnapshot ?? null,
    currentStage: options.currentStage ?? null,
    providerState: snapshot.providers,
    runtimeHealth: snapshot.runtime.health,
    capabilities,
    memorySummary: snapshot.memory.summaryAvailable ? 'Resumen de memoria disponible.' : null,
    dna: snapshot.dna.dna,
    timestamp: now(),
  }
}
