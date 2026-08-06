import type { KernelModuleId, KernelModuleRegistration } from './types.mts'

/** Catálogo de módulos que el Kernel puede iniciar y detener. */
export class KernelRegistry {
  private readonly modules = new Map<KernelModuleId, KernelModuleRegistration>()

  register(id: KernelModuleId): void {
    if (!this.modules.has(id)) this.modules.set(id, { id, status: 'registered' })
  }

  setStatus(id: KernelModuleId, status: KernelModuleRegistration['status']): void {
    const registration = this.modules.get(id)
    if (!registration) return
    this.modules.set(id, { ...registration, status })
  }

  list(): ReadonlyArray<KernelModuleRegistration> {
    return [...this.modules.values()]
  }
}
