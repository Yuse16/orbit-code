'use client'

/**
 * Estado global simulado de Orbit Code.
 *
 * INTEGRACIÓN FUTURA (Tauri):
 * Este store concentra el estado de la UI. Cada acción marcada con `// [tauri]`
 * es un punto de conexión donde, más adelante, se invocará un comando real
 * (sistema de archivos, Git, procesos, motores de IA) en lugar de mutar
 * estado local. Los componentes no deberían cambiar al reemplazar la
 * implementación de estas funciones.
 */

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
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

export type DialogKind = 'install' | 'cost' | 'commit' | 'connection' | null

function findFileContent(id: string): { path: string; content: string } | null {
  let result: { path: string; content: string } | null = null
  const walk = (nodes: typeof FILE_TREE) => {
    for (const n of nodes) {
      if (n.id === id && n.type === 'file') {
        result = { path: n.id, content: n.content ?? `// ${n.name}\n// Sin contenido simulado disponible.` }
        return
      }
      if (n.children) walk(n.children)
    }
  }
  walk(FILE_TREE)
  return result
}

interface OrbitState {
  // Proyecto
  projectId: string
  setProject: (id: string) => void
  projectName: string
  projectPath: string

  // Etapa
  stage: ProjectStage
  setStage: (s: ProjectStage) => void

  // Explorador
  expanded: Record<string, boolean>
  toggleFolder: (id: string) => void
  selectedFile: string | null
  selectFile: (id: string) => void
  openFilePath: string
  openFileContent: string

  // Workbench
  tab: WorkbenchTab
  setTab: (t: WorkbenchTab) => void
  viewport: Viewport
  setViewport: (v: Viewport) => void

  // Git
  branch: string
  setBranch: (b: string) => void

  // Motores
  engine: string
  setEngine: (e: string) => void
  connection: ConnectionState
  cycleConnection: () => void

  // Chat
  messages: ChatMessage[]
  sendMessage: (text: string) => void
  quickAction: (kind: 'revisar' | 'interfaz' | 'error' | 'pruebas') => void
  autoMode: boolean
  setAutoMode: (v: boolean) => void

  // Panel inferior
  dockOpen: boolean
  setDockOpen: (v: boolean) => void
  dockExpanded: boolean
  setDockExpanded: (v: boolean) => void

  // Diálogos
  dialog: DialogKind
  setDialog: (d: DialogKind) => void
}

const OrbitContext = createContext<OrbitState | null>(null)

let idCounter = 100
const nextId = () => `m${idCounter++}`
const now = () =>
  new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })

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

export function OrbitProvider({ children }: { children: ReactNode }) {
  const [projectId, setProjectId] = useState(PROJECTS[0].id)
  const [stage, setStage] = useState<ProjectStage>('implementacion')
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    app: true,
    components: true,
    lib: true,
    supabase: true,
  })
  const [selectedFile, setSelectedFile] = useState<string | null>(
    'components/TaskCard.tsx',
  )
  const [tab, setTab] = useState<WorkbenchTab>('preview')
  const [viewport, setViewport] = useState<Viewport>('desktop')
  const [branch, setBranch] = useState('main')
  const [engine, setEngine] = useState(ENGINE_OPTIONS[1]) // Codex
  const [connection, setConnection] = useState<ConnectionState>('conectado')
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES)
  const [autoMode, setAutoMode] = useState(true)
  const [dockOpen, setDockOpen] = useState(true)
  const [dockExpanded, setDockExpanded] = useState(false)
  const [dialog, setDialog] = useState<DialogKind>(null)

  const project = PROJECTS.find((p) => p.id === projectId)!

  const toggleFolder = useCallback((id: string) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }))
  }, [])

  const selectFile = useCallback((id: string) => {
    // [tauri] leer archivo del disco real
    setSelectedFile(id)
    setTab('code')
  }, [])

  const cycleConnection = useCallback(() => {
    setConnection((c) =>
      c === 'conectado' ? 'limitado' : c === 'limitado' ? 'desconectado' : 'conectado',
    )
  }, [])

  const sendMessage = useCallback((text: string) => {
    if (!text.trim()) return
    // [tauri] enviar prompt al motor de IA seleccionado
    const userMsg: ChatMessage = {
      id: nextId(),
      author: 'user',
      time: now(),
      text: text.trim(),
    }
    const reply: ChatMessage = {
      id: nextId(),
      author: 'orbit',
      time: now(),
      text: 'Recibido. Procesaré la solicitud respetando la etapa actual del proyecto y la interfaz aprobada.',
      footnote: 'Analizando contexto…',
    }
    setMessages((prev) => [...prev, userMsg, reply])
    setDockOpen(true)
  }, [])

  const quickAction = useCallback(
    (kind: 'revisar' | 'interfaz' | 'error' | 'pruebas') => {
      const userMsg: ChatMessage = {
        id: nextId(),
        author: 'user',
        time: now(),
        text: QUICK_USER[kind],
      }
      const reply = { ...QUICK_REPLIES[kind], id: nextId(), time: now() }
      setMessages((prev) => [...prev, userMsg, reply])
      setDockOpen(true)
    },
    [],
  )

  const openFile = selectedFile ? findFileContent(selectedFile) : null

  const value = useMemo<OrbitState>(
    () => ({
      projectId,
      setProject: setProjectId,
      projectName: project.name,
      projectPath: project.path,
      stage,
      setStage,
      expanded,
      toggleFolder,
      selectedFile,
      selectFile,
      openFilePath: openFile?.path ?? 'components/TaskCard.tsx',
      openFileContent:
        openFile?.content ??
        '// Selecciona un archivo del explorador para ver su contenido.',
      tab,
      setTab,
      viewport,
      setViewport,
      branch,
      setBranch,
      engine,
      setEngine,
      connection,
      cycleConnection,
      messages,
      sendMessage,
      quickAction,
      autoMode,
      setAutoMode,
      dockOpen,
      setDockOpen,
      dockExpanded,
      setDockExpanded,
      dialog,
      setDialog,
    }),
    [
      projectId,
      project,
      stage,
      expanded,
      toggleFolder,
      selectedFile,
      selectFile,
      openFile,
      tab,
      viewport,
      branch,
      engine,
      connection,
      cycleConnection,
      messages,
      sendMessage,
      quickAction,
      autoMode,
      dockOpen,
      dockExpanded,
      dialog,
    ],
  )

  return <OrbitContext.Provider value={value}>{children}</OrbitContext.Provider>
}

export function useOrbit() {
  const ctx = useContext(OrbitContext)
  if (!ctx) throw new Error('useOrbit debe usarse dentro de OrbitProvider')
  return ctx
}
