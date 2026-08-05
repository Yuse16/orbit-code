import { createMockOrbitDNA } from './dna.mts'
import { Kernel } from './kernel.mts'
import type { OrbitDNA } from './types.mts'
import type { DesktopClient } from '../mission-control/desktop-client.mts'
import type { MissionGuidance } from '../mission-control/types.mts'

export interface KernelInitializerOptions {
  now?: () => string
  dna?: OrbitDNA
  desktopClient?: DesktopClient
  guidance?: MissionGuidance
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
    })
    kernel.loadDNA(this.options.dna ?? createMockOrbitDNA())
    kernel.start()
    return kernel
  }
}

export function createMockKernel(options: KernelInitializerOptions = {}): Kernel {
  return new KernelInitializer(options).initialize()
}
