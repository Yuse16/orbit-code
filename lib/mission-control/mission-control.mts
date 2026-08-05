import { createMockKernel } from '../kernel/kernel-initializer.mts'
import type { KernelInitializerOptions } from '../kernel/kernel-initializer.mts'
import type { Kernel } from '../kernel/kernel.mts'
import type { MissionControl } from './contracts.mts'

/** Fachada de Mission Control: consulta y solicita al Kernel, nunca a servicios. */
export function createMissionControl(kernel: Kernel): MissionControl {
  return {
    store: kernel.getMissionStore(),
    actions: {
      openProject: (project) => kernel.openProject(project),
      updateGitStatus: (git) => kernel.updateGitStatus(git),
      setStage: (stage) => kernel.setStage(stage),
      activateProvider: (primaryProviderId, secondaryProviderId) =>
        kernel.activateProvider(primaryProviderId, secondaryProviderId),
      connectProvider: (providerId, detail) => kernel.connectProvider(providerId, detail),
      disconnectProvider: (providerId, detail) => kernel.disconnectProvider(providerId, detail),
    },
    getKernelContext: () => kernel.getContext(),
    dispose: () => kernel.dispose(),
  }
}

/** Composición predeterminada: React recibe únicamente la fachada, sin tocar el Kernel. */
export function createDefaultMissionControl(options: KernelInitializerOptions = {}): MissionControl {
  return createMissionControl(createMockKernel(options))
}
