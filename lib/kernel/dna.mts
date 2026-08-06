import type { OrbitDNA } from './types.mts'

export const createMockOrbitDNA = (overrides: Partial<OrbitDNA> = {}): OrbitDNA => ({
  projectName: 'Sin proyecto abierto',
  framework: 'No detectado',
  language: 'No detectado',
  database: 'No configurada',
  preferredAiProvider: 'Sin proveedor',
  deployment: 'No configurado',
  testing: 'No configurado',
  branchStrategy: 'No configurada',
  workspaceStrategy: 'No configurada',
  preferences: {},
  ...overrides,
})
