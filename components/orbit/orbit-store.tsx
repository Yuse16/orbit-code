'use client'

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  getMissionHeaderSummary,
  type ProviderId,
} from '@/lib/mission-control/index.mts'
import { createDirector } from '@/lib/director/index.mts'
import type { DecisionPolicyId, ExecutionPlan } from '@/lib/director/index.mts'
import { createMockKernel } from '@/lib/kernel/index.mts'
import {
  ProviderManager,
  type BudgetEstimate,
  type BudgetInput,
  type ProviderHealthSummary,
  type ProviderId as CatalogProviderId,
  type ProviderPolicy,
  type ProviderPolicyId,
  type ProviderSnapshot,
} from '@/lib/providers/index.mts'
import {
  ENGINE_OPTIONS,
  FILE_TREE,
  INITIAL_MESSAGES,
  PROJECTS,
} from '@/lib/orbit/mock-data'
import type {
  ChatMessage,
  ConnectionState,
  ProjectStage,
  Viewport,
  WorkbenchTab,
} from '@/lib/orbit/types'
import type { GitChange, ProjectDescriptor } from '@/lib/mission-control/types.mts'
import type { WorkspaceIndexSnapshot } from '@/lib/runtime/adapters/workspace/indexer.mts'
import {
  MissionControlProvider,
  useMissionControl,
  useMissionState,
  useKernelContext,
} from './mission-control-provider'

export type DialogKind = 'install' | 'cost' | 'commit' | 'connection' | null

const PROVIDER_BY_ENGINE: Record<string, ProviderId | null> = {
  Automático: null,
  ChatGPT: 'chatgpt',
  Codex: 'codex',
  OpenCode: 'opencode',
  'OpenRouter Free': 'openrouter',
  Claude: 'claude',
  Gemini: 'gemini',
  v0: 'v0',
  Builder: 'builder',
  Figma: 'figma',
  'Modelo local': 'local-model',
}

function toConnectionState(status: 'disconnected' | 'connecting' | 'connected' | 'error'): ConnectionState {
  if (status === 'connected') return 'conectado'
  if (status === 'connecting') return 'limitado'
  return 'desconectado'
}

function findFileContent(id: string): { path: string; content: string } | null {
  let result: { path: string; content: string } | null = null
  const walk = (nodes: typeof FILE_TREE) => {
    for (const node of nodes) {
      if (node.id === id && node.type === 'file') {
        result = {
          path: node.id,
          content: node.content ?? `// ${node.name}\n// Sin contenido simulado disponible.`,
        }
        return
      }
      if (node.children) walk(node.children)
    }
  }
  walk(FILE_TREE)
  return result
}

interface OrbitState {
  projectId: string
  setProject: (id: string) => void
  projectName: string
  projectPath: string
  workspaceIndex: WorkspaceIndexSnapshot | null
  recentProjects: ReadonlyArray<ProjectDescriptor>
  openRecentProject: (project: ProjectDescriptor) => void
  openFolder: () => Promise<void>
  framework: string
  worktree: string
  platformLabel: string
  activeProviderLabel: string
  generalStatus: { label: string; tone: 'success' | 'warning' | 'danger' | 'primary' }

  stage: ProjectStage
  setStage: (stage: ProjectStage) => void

  expanded: Record<string, boolean>
  toggleFolder: (id: string) => void
  selectedFile: string | null
  selectFile: (id: string) => void
  openFilePath: string
  openFileContent: string
  searchQuery: string
  setSearchQuery: (query: string) => void

  tab: WorkbenchTab
  setTab: (tab: WorkbenchTab) => void
  viewport: Viewport
  setViewport: (viewport: Viewport) => void

  branch: string
  pendingChanges: number
  gitChanges: ReadonlyArray<GitChange>
  setBranch: (branch: string) => void

  engine: string
  setEngine: (engine: string) => void
  connection: ConnectionState
  cycleConnection: () => void
  providerStates: Record<string, ConnectionState>

  messages: ChatMessage[]
  sendMessage: (text: string) => void
  quickAction: (kind: 'revisar' | 'interfaz' | 'error' | 'pruebas') => void
  autoMode: boolean
  setAutoMode: (value: boolean) => void

  directorPlan: ExecutionPlan | null
  runDirector: (objective: string, policy: DecisionPolicyId) => void

  providers: ReadonlyArray<ProviderSnapshot>
  providerHealth: ProviderHealthSummary
  providerPolicy: ProviderPolicy
  connectProvider: (id: CatalogProviderId) => void
  disconnectProvider: (id: CatalogProviderId) => void
  loginProvider: (id: CatalogProviderId) => void
  logoutProvider: (id: CatalogProviderId) => void
  setProviderPolicy: (id: ProviderPolicyId) => void
  estimateBudget: (input: BudgetInput) => BudgetEstimate

  dockOpen: boolean
  setDockOpen: (value: boolean) => void
  dockExpanded: boolean
  setDockExpanded: (value: boolean) => void

  dialog: DialogKind
  setDialog: (dialog: DialogKind) => void
}

const OrbitContext = createContext<OrbitState | null>(null)

let idCounter = 100
const nextId = () => `m${idCounter++}`
const now = () => new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })

const QUICK_REPLIES: Record<string, ChatMessage> = {
  revisar: {
    id: '',
    author: 'orbit',
    time: '',
    text: 'Revisando el proyecto: leyendo estructura de carpetas y dependencias declaradas en package.json.',
  },
  interfaz: {
    id: '',
    author: 'orbit',
    time: '',
    text: 'Generando una propuesta de interfaz para aprobación antes de conectar la lógica.',
  },
  error: {
    id: '',
    author: 'orbit',
    time: '',
    text: 'Analizando la traza de errores y proponiendo la corrección con el mínimo de cambios posible.',
  },
  pruebas: {
    id: '',
    author: 'orbit',
    time: '',
    text: 'Ejecutando pruebas y build para validar funcionamiento, compilación y diseño.',
  },
}

const QUICK_USER: Record<string, string> = {
  revisar: 'Revisa el proyecto.',
  interfaz: 'Crea una interfaz.',
  error: 'Corrige el error actual.',
  pruebas: 'Ejecuta las pruebas.',
}

function OrbitStateProvider({ children }: { children: ReactNode }) {
  const mission = useMissionControl()
  const missionState = useMissionState()
  const kernelContext = useKernelContext()
  const [kernel] = useState(() => createMockKernel())
  const [providerManager] = useState(() => new ProviderManager())
  const [director] = useState(() => createDirector({ providers: providerManager.readModel() }))
  const [providerState, setProviderState] = useState(() => ({
    providers: providerManager.listProviders(),
    health: providerManager.healthSummary(),
  }))
  const [directorPlan, setDirectorPlan] = useState<ExecutionPlan | null>(null)
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    app: true,
    components: true,
    lib: true,
    supabase: true,
  })
  const [selectedFile, setSelectedFile] = useState<string | null>('components/TaskCard.tsx')
  const [searchQuery, setSearchQuery] = useState('')
  const [tab, setTab] = useState<WorkbenchTab>('preview')
  const [viewport, setViewport] = useState<Viewport>('desktop')
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES)
  const [autoMode, setAutoMode] = useState(true)
  const [dockOpen, setDockOpen] = useState(true)
  const [dockExpanded, setDockExpanded] = useState(false)
  const [dialog, setDialog] = useState<DialogKind>(null)

  const summary = getMissionHeaderSummary(missionState)
  const activeProvider = missionState.providers.providers.find(
    (provider) => provider.id === missionState.providers.primaryProviderId,
  )
  const providerStates = Object.fromEntries(
    missionState.providers.providers.map((provider) => [
      provider.id,
      toConnectionState(provider.status),
    ]),
  ) as Record<string, ConnectionState>

  const setProject = useCallback((id: string) => {
    const project = PROJECTS.find((candidate) => candidate.id === id)
    if (!project) return
    mission.actions.openProject({ ...project, framework: 'Next.js' })
  }, [mission])

  const openFolder = useCallback(() => mission.actions.openFolder(), [mission])

  const openRecentProject = useCallback(
    (project: ProjectDescriptor) => mission.actions.openProject(project),
    [mission],
  )

  const setStage = useCallback((stage: ProjectStage) => {
    mission.actions.setStage(stage)
  }, [mission])

  const toggleFolder = useCallback((id: string) => {
    setExpanded((previous) => ({ ...previous, [id]: !previous[id] }))
  }, [])

  const selectFile = useCallback((id: string) => {
    setSelectedFile(id)
    setTab('code')
  }, [])

  const setBranch = useCallback((branch: string) => {
    mission.actions.updateGitStatus({ branch })
  }, [mission])

  const setEngine = useCallback((engine: string) => {
    const providerId = PROVIDER_BY_ENGINE[engine] ?? null
    mission.actions.activateProvider(providerId)
  }, [mission])

  const cycleConnection = useCallback(() => {
    const providerId = missionState.providers.primaryProviderId ?? 'codex'
    const provider = missionState.providers.providers.find((item) => item.id === providerId)
    mission.actions.activateProvider(providerId)
    if (provider?.status === 'connected') {
      mission.actions.disconnectProvider(providerId, 'Desconectado (simulado)')
      return
    }
    mission.actions.connectProvider(providerId, 'Conectado (simulado)')
  }, [mission, missionState.providers])

  const sendMessage = useCallback((text: string) => {
    if (!text.trim()) return
    const userMessage: ChatMessage = { id: nextId(), author: 'user', time: now(), text: text.trim() }
    const reply: ChatMessage = {
      id: nextId(),
      author: 'orbit',
      time: now(),
      text: 'Recibido. Procesaré la solicitud respetando la etapa actual del proyecto y la interfaz aprobada.',
      footnote: 'Analizando contexto…',
    }
    setMessages((previous) => [...previous, userMessage, reply])
    setDockOpen(true)
  }, [])

  const quickAction = useCallback((kind: 'revisar' | 'interfaz' | 'error' | 'pruebas') => {
    const userMessage: ChatMessage = { id: nextId(), author: 'user', time: now(), text: QUICK_USER[kind] }
    const reply = { ...QUICK_REPLIES[kind], id: nextId(), time: now() }
    setMessages((previous) => [...previous, userMessage, reply])
    setDockOpen(true)
  }, [])

  const refreshProviders = useCallback(() => {
    setProviderState({
      providers: providerManager.listProviders(),
      health: providerManager.healthSummary(),
    })
  }, [providerManager])
  const providerSnapshots = providerState.providers
  const providerHealth = providerState.health
  const providerPolicy = providerManager.policy()

  const connectProvider = useCallback((id: CatalogProviderId) => {
    providerManager.connect(id)
    refreshProviders()
  }, [providerManager, refreshProviders])

  const disconnectProvider = useCallback((id: CatalogProviderId) => {
    providerManager.disconnect(id)
    refreshProviders()
  }, [providerManager, refreshProviders])

  const loginProvider = useCallback((id: CatalogProviderId) => {
    providerManager.login(id)
    refreshProviders()
  }, [providerManager, refreshProviders])

  const logoutProvider = useCallback((id: CatalogProviderId) => {
    providerManager.logout(id)
    refreshProviders()
  }, [providerManager, refreshProviders])

  const setProviderPolicy = useCallback((id: ProviderPolicyId) => {
    providerManager.setPolicy(id)
    refreshProviders()
  }, [providerManager, refreshProviders])

  const estimateBudget = useCallback(
    (input: BudgetInput) => providerManager.estimateBudget(input),
    [providerManager],
  )

  const runDirector = useCallback((objective: string, policy: DecisionPolicyId) => {
    const plan = director.decide({
      request: { objective, policy },
      kernel: kernel.getContextReader(),
      currentStage: missionState.tasks.currentStage,
    })
    setDirectorPlan(plan)
    setTab('director')
    const userMessage: ChatMessage = { id: nextId(), author: 'user', time: now(), text: objective }
    const reply: ChatMessage = {
      id: nextId(),
      author: 'orbit',
      time: now(),
      text: `Plan generado con política "${plan.policy}".`,
      footnote: `Costo estimado $${plan.estimatedCost.toFixed(2)} · ${plan.parallelTasks.length + plan.sequentialTasks.length} tareas.`,
    }
    setMessages((previous) => [...previous, userMessage, reply])
    setDockOpen(true)
  }, [director, kernel, missionState.tasks.currentStage])

  const openFile = selectedFile ? findFileContent(selectedFile) : null
  const value = useMemo<OrbitState>(() => ({
    projectId: missionState.project.id,
    setProject,
    projectName: summary.project,
    projectPath: summary.projectPath,
    workspaceIndex: kernelContext.workspace.index,
    recentProjects: missionState.recentProjects,
    openRecentProject,
    openFolder,
    framework: summary.framework,
    worktree: missionState.git.worktree,
    platformLabel: summary.operatingSystem,
    activeProviderLabel: summary.provider,
    generalStatus: summary.status,
    stage: missionState.tasks.currentStage,
    setStage,
    expanded,
    toggleFolder,
    selectedFile,
    selectFile,
    openFilePath: openFile?.path ?? 'components/TaskCard.tsx',
    openFileContent: openFile?.content ?? '// Selecciona un archivo del explorador para ver su contenido.',
    searchQuery,
    setSearchQuery,
    tab,
    setTab,
    viewport,
    setViewport,
    branch: missionState.git.branch,
    pendingChanges: missionState.git.pendingChanges,
    gitChanges: missionState.git.changes,
    setBranch,
    engine: activeProvider?.label ?? ENGINE_OPTIONS[0],
    setEngine,
    connection: toConnectionState(activeProvider?.status ?? 'disconnected'),
    cycleConnection,
    providerStates,
    messages,
    sendMessage,
    quickAction,
    autoMode,
    setAutoMode,
    directorPlan,
    runDirector,
    providers: providerSnapshots,
    providerHealth,
    providerPolicy,
    connectProvider,
    disconnectProvider,
    loginProvider,
    logoutProvider,
    setProviderPolicy,
    estimateBudget,
    dockOpen,
    setDockOpen,
    dockExpanded,
    setDockExpanded,
    dialog,
    setDialog,
  }), [
    activeProvider,
    autoMode,
    connectProvider,
    cycleConnection,
    dialog,
    directorPlan,
    disconnectProvider,
    dockExpanded,
    dockOpen,
    estimateBudget,
    expanded,
    loginProvider,
    logoutProvider,
    messages,
    missionState,
    openRecentProject,
    kernelContext,
    openFile,
    openFolder,
    providerHealth,
    providerPolicy,
    providerSnapshots,
    providerStates,
    quickAction,
    runDirector,
    selectFile,
    selectedFile,
    searchQuery,
    sendMessage,
    setBranch,
    setEngine,
    setProject,
    setProviderPolicy,
    setStage,
    summary,
    tab,
    toggleFolder,
    viewport,
  ])

  return <OrbitContext.Provider value={value}>{children}</OrbitContext.Provider>
}

export function OrbitProvider({ children }: { children: ReactNode }) {
  return (
    <MissionControlProvider>
      <OrbitStateProvider>{children}</OrbitStateProvider>
    </MissionControlProvider>
  )
}

export function useOrbit() {
  const context = useContext(OrbitContext)
  if (!context) throw new Error('useOrbit debe usarse dentro de OrbitProvider')
  return context
}
