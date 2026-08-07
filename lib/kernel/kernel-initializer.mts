import { createMockOrbitDNA } from './dna.mts'
import { Kernel } from './kernel.mts'
import type { OrbitDNA } from './types.mts'
import { createDefaultRuntime, type Runtime } from '../runtime/runtime.mts'
import type { WorkspaceAdapter } from '../runtime/adapters/workspace/index.mts'
import type { DesktopSystemAdapter } from '../runtime/adapters/system/index.mts'
import type { DesktopClient } from '../mission-control/desktop-client.mts'
import type { MissionGuidance } from '../mission-control/types.mts'
import { createDefaultProcessManager, type ProcessManager } from '../runtime/process-manager.mts'

export interface KernelInitializerOptions {
  now?: () => string
  dna?: OrbitDNA
  desktopClient?: DesktopClient
  guidance?: MissionGuidance
  runtime?: Runtime
  systemAdapter?: DesktopSystemAdapter
  workspaceAdapter?: WorkspaceAdapter
  processManager?: ProcessManager
}

/** Construye y arranca el grafo simulado antes de que cualquier consumidor exista. */
export class KernelInitializer {
  private readonly options: KernelInitializerOptions

  constructor(options: KernelInitializerOptions = {}) {
    this.options = options
  }

  initialize(): Kernel {
    const kernel = new Kernel(this.options.now, {
      desktopClient: this.options.desktopClient,
      guidance: this.options.guidance,
      runtime: this.options.runtime ?? createDefaultRuntime({ now: this.options.now }),
      systemAdapter: this.options.systemAdapter,
      workspaceAdapter: this.options.workspaceAdapter,
      processManager: this.options.processManager ?? createDefaultProcessManager(),
    })
    kernel.loadDNA(this.options.dna ?? createMockOrbitDNA())
    kernel.start()
    return kernel
  }
}

export function createMockKernel(options: KernelInitializerOptions = {}): Kernel {
  return new KernelInitializer(options).initialize()
}
