/**
 * Tipos centrales de Orbit Code.
 *
 * NOTA DE INTEGRACIÓN FUTURA:
 * Estas interfaces describen el modelo de datos de la UI. Cuando se conecte
 * el backend real (Tauri commands, sistema de archivos, Git, procesos, etc.)
 * los datos simulados de `mock-data.ts` deben reemplazarse por datos que
 * cumplan exactamente estos contratos, sin cambiar los componentes de UI.
 */

export type GitStatus = 'M' | 'A' | 'D' | null

export interface FileNode {
  id: string
  name: string
  type: 'folder' | 'file'
  /** Extensión usada para elegir icono y resaltado (solo archivos). */
  ext?: string
  /** Estado Git del archivo. */
  git?: GitStatus
  children?: FileNode[]
  /** Contenido simulado que se mostrará en la vista de Código. */
  content?: string
}

export interface Project {
  id: string
  name: string
  path: string
}

export type ProjectStage =
  | 'exploracion'
  | 'diseno'
  | 'implementacion'
  | 'correccion'
  | 'pruebas'
  | 'publicacion'
  | 'auditoria'

export interface StageInfo {
  id: ProjectStage
  label: string
  help: string
}

export type MessageAuthor = 'user' | 'orbit'

export interface ChatMessage {
  id: string
  author: MessageAuthor
  time: string
  text: string
  /** Lista opcional (p. ej. plan de trabajo). */
  plan?: string[]
  /** Nota final discreta bajo el mensaje. */
  footnote?: string
}

export type ConnectionState = 'conectado' | 'limitado' | 'desconectado'

export interface Engine {
  id: string
  name: string
  state: ConnectionState
  description: string
}

export type WorkbenchTab = 'preview' | 'code' | 'changes' | 'terminal' | 'agents' | 'director'

export type Viewport = 'desktop' | 'tablet' | 'movil'

export interface AgentTask {
  id: string
  name: string
  role: string
  status: string
  action: string
  progress: number
  /** color de la barra: primary | success | violet | warning */
  tone: 'primary' | 'success' | 'violet' | 'warning'
  files: string[]
  elapsed: string
}

export interface DiffFile {
  id: string
  path: string
  git: GitStatus
  additions: number
  deletions: number
  tested: 'ok' | 'pendiente' | 'error'
  hunks: DiffLine[]
}

export interface DiffLine {
  type: 'add' | 'del' | 'ctx' | 'meta'
  text: string
}

export interface StatCard {
  id: string
  label: string
  value: string
  delta: string
  trend: 'up' | 'down'
}

export interface Promotion {
  id: string
  badge: string
  title: string
  description: string
  cta: string
  tone: 'violet' | 'success' | 'warning'
}
