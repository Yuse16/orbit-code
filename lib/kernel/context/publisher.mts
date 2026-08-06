import type { KernelContext } from './context.mts'
import type { KernelDomainId, KernelState } from './types.mts'

/**
 * Base de los Publishers del contexto. Solo publica, actualiza, elimina o lee
 * su propio dominio; jamás accede a otro Publisher ni a otro módulo.
 */
export class KernelContextPublisher<Domain extends KernelDomainId> {
  readonly domain: Domain
  private readonly context: KernelContext

  constructor(context: KernelContext, domain: Domain, initialState: KernelState[Domain]) {
    this.context = context
    this.domain = domain
    context.register(domain, initialState)
  }

  publish(state: KernelState[Domain]): void {
    this.context.publish(this.domain, state)
  }

  update(changes: Partial<KernelState[Domain]>): void {
    this.context.update(this.domain, changes)
  }

  remove(): void {
    this.context.remove(this.domain)
  }

  snapshot(): KernelState[Domain] | undefined {
    return this.context.read(this.domain)
  }
}
