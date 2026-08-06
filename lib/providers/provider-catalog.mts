import type { ProviderDescriptor, ProviderId, ProviderStatus } from './types.mts'

/**
 * Catálogo de proveedores simulados. Ninguna conexión real: todo el estado
 * es determinista y local.
 */
export const PROVIDER_CATALOG: ReadonlyArray<ProviderDescriptor> = [
  {
    id: 'openai',
    name: 'OpenAI',
    category: 'cloud',
    speed: 4,
    quality: 4,
    models: ['gpt-4o', 'gpt-4.1', 'o3-mini'],
    monthlyLimit: 2000,
    requiresAuth: true,
    isExternal: true,
    detail: 'Modelos de propósito general y razonamiento.',
  },
  {
    id: 'anthropic',
    name: 'Anthropic',
    category: 'cloud',
    speed: 4,
    quality: 5,
    models: ['claude-sonnet-4', 'claude-haiku-4'],
    monthlyLimit: 2000,
    requiresAuth: true,
    isExternal: true,
    detail: 'Mejor calidad percibida en código y documentación.',
  },
  {
    id: 'google',
    name: 'Google',
    category: 'cloud',
    speed: 4,
    quality: 4,
    models: ['gemini-2.5-pro', 'gemini-2.5-flash'],
    monthlyLimit: 2000,
    requiresAuth: true,
    isExternal: true,
    detail: 'Ventanas de contexto largas y capa gratuita generosa.',
  },
  {
    id: 'openrouter',
    name: 'OpenRouter',
    category: 'aggregator',
    speed: 4,
    quality: 4,
    models: ['openrouter-auto'],
    monthlyLimit: 1000,
    requiresAuth: true,
    isExternal: true,
    detail: 'Agrega múltiples proveedores con un solo punto de acceso.',
  },
  {
    id: 'ollama',
    name: 'Ollama',
    category: 'local',
    speed: 3,
    quality: 3,
    models: ['llama-3.1'],
    monthlyLimit: 0,
    requiresAuth: false,
    isExternal: false,
    detail: 'Modelos locales vía Ollama. Sin coste, sin envío de datos.',
  },
  {
    id: 'lm-studio',
    name: 'LM Studio',
    category: 'local',
    speed: 3,
    quality: 3,
    models: ['llama-4-scout'],
    monthlyLimit: 0,
    requiresAuth: false,
    isExternal: false,
    detail: 'Servidor local compatible con OpenAI. Offline por defecto.',
  },
  {
    id: 'azure-openai',
    name: 'Azure OpenAI',
    category: 'cloud',
    speed: 4,
    quality: 4,
    models: ['azure-gpt-4o'],
    monthlyLimit: 1500,
    requiresAuth: true,
    isExternal: true,
    detail: 'Modelos OpenAI en infraestructura de Azure.',
  },
  {
    id: 'v0',
    name: 'V0',
    category: 'visual',
    speed: 3,
    quality: 4,
    models: ['gpt-image'],
    monthlyLimit: 200,
    requiresAuth: true,
    isExternal: true,
    detail: 'Generación visual y frontend rápido con datos simulados.',
  },
  {
    id: 'github-models',
    name: 'GitHub Models',
    category: 'cloud',
    speed: 4,
    quality: 4,
    models: ['github-gpt-4o-mini'],
    monthlyLimit: 300,
    requiresAuth: true,
    isExternal: true,
    detail: 'Acceso de prueba a modelos con límite mensual.',
  },
  {
    id: 'mistral',
    name: 'Mistral AI',
    category: 'cloud',
    speed: 4,
    quality: 4,
    models: ['mistral-large', 'codestral'],
    monthlyLimit: 1000,
    requiresAuth: true,
    isExternal: true,
    detail: 'Modelos europeos con foco en código (Codestral).',
  },
  {
    id: 'together',
    name: 'Together AI',
    category: 'cloud',
    speed: 4,
    quality: 3,
    models: ['qwen-coder'],
    monthlyLimit: 1000,
    requiresAuth: true,
    isExternal: true,
    detail: 'Inferencia de código abierto a bajo coste.',
  },
  {
    id: 'groq',
    name: 'Groq',
    category: 'cloud',
    speed: 5,
    quality: 3,
    models: ['groq-llama-3.3', 'groq-mixtral'],
    monthlyLimit: 1000,
    requiresAuth: true,
    isExternal: true,
    detail: 'Inferencia de baja latencia sobre LPU.',
  },
  {
    id: 'deepseek',
    name: 'DeepSeek',
    category: 'cloud',
    speed: 3,
    quality: 4,
    models: ['deepseek-r1', 'deepseek-v3'],
    monthlyLimit: 1000,
    requiresAuth: true,
    isExternal: true,
    detail: 'Razonamiento de bajo coste.',
  },
]

/** Busca un proveedor por id o devuelve null. */
export function getProviderDescriptor(id: ProviderId): ProviderDescriptor | null {
  return PROVIDER_CATALOG.find((provider) => provider.id === id) ?? null
}

/** Estado simulado base de un proveedor a partir de su descriptor. */
export function defaultProviderStatus(id: ProviderId): ProviderStatus {
  const provider = getProviderDescriptor(id)
  if (!provider) return 'unavailable'
  if (!provider.isExternal) return 'available'
  if (provider.id === 'v0') return 'limited'
  return 'available'
}
