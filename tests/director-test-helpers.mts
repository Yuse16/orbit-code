import { KernelContext } from '../lib/kernel/context/index.mts'
import { KernelContextReader } from '../lib/kernel/context/index.mts'
import { createInitialDnaState, createInitialRuntimeState } from '../lib/kernel/context/index.mts'
import { createMockOrbitDNA } from '../lib/kernel/index.mts'
import type { RuntimeHealthStatus } from '../lib/runtime/types.mts'

export interface BuildKernelOptions {
  health?: RuntimeHealthStatus
  withDna?: boolean
}

/** Construye un KernelContextReader determinista para pruebas del Director. */
export const buildKernelReader = (options: BuildKernelOptions = {}): KernelContextReader => {
  const context = new KernelContext()
  context.register('runtime', createInitialRuntimeState())
  context.update('runtime', { lifecycle: 'running', health: options.health ?? 'healthy' })
  if (options.withDna) {
    context.register('dna', createInitialDnaState())
    context.update('dna', { dna: createMockOrbitDNA() })
  }
  return context.createReader()
}
