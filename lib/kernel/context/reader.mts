import type { KernelContext } from './context.mts'
import type { KernelContextListener, KernelDomainId, KernelSnapshot, KernelState } from './types.mts'

/** Vista de solo lectura del KernelContext para consumidores. */
export class KernelContextReader {
  private readonly context: KernelContext

  constructor(context: KernelContext) {
    this.context = context
  }

  getSnapshot(): KernelSnapshot {
    return this.context.getSnapshot()
  }

  read<D extends KernelDomainId>(domain: D): KernelState[D] | undefined {
    return this.context.read(domain)
  }

  getVersion(): number {
    return this.context.getVersion()
  }

  subscribe(listener: KernelContextListener): () => void {
    return this.context.subscribe(listener)
  }
}
