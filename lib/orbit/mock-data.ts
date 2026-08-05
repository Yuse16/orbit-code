import type {
  AgentTask,
  ChatMessage,
  DiffFile,
  Engine,
  FileNode,
  Project,
  Promotion,
  StageInfo,
  StatCard,
} from './types'

/**
 * DATOS SIMULADOS.
 * Todo lo que aparece aquí es contenido de demostración. Al integrar Tauri /
 * Git / procesos reales, sustituir estos valores por datos en vivo.
 */

export const PROJECTS: Project[] = [
  { id: 'u-zala', name: 'U-Zala', path: '/Users/usuario/Proyectos/U-Zala' },
  {
    id: 'cabanas',
    name: 'Cabañas Sierra',
    path: '/Users/usuario/Proyectos/Cabanas-Sierra',
  },
  { id: 'mphora', name: 'MPHORA', path: '/Users/usuario/Proyectos/MPHORA' },
  {
    id: 'teleprompt',
    name: 'TelePrompt',
    path: '/Users/usuario/Proyectos/TelePrompt',
  },
]

export const RECENT_PROJECTS = [
  'U-Zala',
  'Orbit Shop',
  'TaskFlow',
  'Finanzas Pro',
  'Landing Orbit',
]

const TASKCARD_CONTENT = `import { CheckCircle2, Clock } from "lucide-react"
import { cn } from "@/lib/utils"

interface TaskCardProps {
  title: string
  done?: boolean
}

export function TaskCard({ title, done }: TaskCardProps) {
  return (
    <article
      className={cn(
        "flex items-center gap-3 rounded-lg border p-3",
        done ? "opacity-70" : "bg-card",
      )}
    >
      {done ? (
        <CheckCircle2 className="size-4 text-green-500" />
      ) : (
        <Clock className="size-4 text-blue-500" />
      )}
      <span className="text-sm font-medium">{title}</span>
    </article>
  )
}`

const PROMOTIONS_LIB = `export interface Promotion {
  id: string
  title: string
  discount: string
}

export const promotions: Promotion[] = [
  { id: "welcome", title: "Descuento de bienvenida", discount: "20%" },
  { id: "referral", title: "Invita y gana", discount: "2x1" },
  { id: "annual", title: "Plan Anual", discount: "30%" },
]

export function getActivePromotions() {
  return promotions
}`

export const FILE_TREE: FileNode[] = [
  {
    id: 'app',
    name: 'app',
    type: 'folder',
    children: [
      { id: 'app/dashboard', name: 'dashboard', type: 'folder', children: [] },
      { id: 'app/tareas', name: 'tareas', type: 'folder', children: [] },
      { id: 'app/calendario', name: 'calendario', type: 'folder', children: [] },
      {
        id: 'app/promociones',
        name: 'promociones',
        type: 'folder',
        children: [
          {
            id: 'app/promociones/page.tsx',
            name: 'page.tsx',
            type: 'file',
            ext: 'tsx',
            git: 'A',
            content:
              'export default function PromocionesPage() {\n  return <section>Módulo de promociones</section>\n}',
          },
        ],
      },
    ],
  },
  {
    id: 'components',
    name: 'components',
    type: 'folder',
    children: [
      {
        id: 'components/TaskCard.tsx',
        name: 'TaskCard.tsx',
        type: 'file',
        ext: 'tsx',
        git: 'M',
        content: TASKCARD_CONTENT,
      },
      {
        id: 'components/PromotionCard.tsx',
        name: 'PromotionCard.tsx',
        type: 'file',
        ext: 'tsx',
        content:
          'export function PromotionCard() {\n  return <div>Tarjeta de promoción</div>\n}',
      },
      {
        id: 'components/Sidebar.tsx',
        name: 'Sidebar.tsx',
        type: 'file',
        ext: 'tsx',
        content: 'export function Sidebar() {\n  return <aside>Menú</aside>\n}',
      },
    ],
  },
  {
    id: 'lib',
    name: 'lib',
    type: 'folder',
    children: [
      {
        id: 'lib/tasks.ts',
        name: 'tasks.ts',
        type: 'file',
        ext: 'ts',
        content: 'export const tasks = []',
      },
      {
        id: 'lib/promotions.ts',
        name: 'promotions.ts',
        type: 'file',
        ext: 'ts',
        git: 'M',
        content: PROMOTIONS_LIB,
      },
    ],
  },
  { id: 'public', name: 'public', type: 'folder', children: [] },
  { id: 'docs', name: 'docs', type: 'folder', children: [] },
  { id: 'supabase', name: 'supabase', type: 'folder', children: [] },
  { id: '.env.local', name: '.env.local', type: 'file', ext: 'env' },
  { id: '.gitignore', name: '.gitignore', type: 'file', ext: 'git' },
  {
    id: 'package.json',
    name: 'package.json',
    type: 'file',
    ext: 'json',
    git: 'M',
  },
  { id: 'tsconfig.json', name: 'tsconfig.json', type: 'file', ext: 'json' },
  { id: 'README.md', name: 'README.md', type: 'file', ext: 'md', git: 'M' },
  { id: 'pnpm-lock.yaml', name: 'pnpm-lock.yaml', type: 'file', ext: 'yaml' },
]

export const STAGES: StageInfo[] = [
  {
    id: 'exploracion',
    label: 'Exploración',
    help: 'Analiza el proyecto sin modificar archivos.',
  },
  {
    id: 'diseno',
    label: 'Diseño visual',
    help: 'Crea y aprueba la interfaz antes de conectar la lógica.',
  },
  {
    id: 'implementacion',
    label: 'Implementación',
    help: 'Agrega funciones respetando el diseño aprobado.',
  },
  {
    id: 'correccion',
    label: 'Corrección',
    help: 'Localiza y corrige errores con cambios mínimos.',
  },
  {
    id: 'pruebas',
    label: 'Pruebas',
    help: 'Valida funcionamiento, compilación y diseño.',
  },
  {
    id: 'publicacion',
    label: 'Publicación',
    help: 'Prepara commit, push y despliegue con autorización.',
  },
  {
    id: 'auditoria',
    label: 'Auditoría',
    help: 'Revisa arquitectura, seguridad y calidad.',
  },
]

export const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'm1',
    author: 'user',
    time: '10:32',
    text: 'Agrega el módulo de promociones y conserva la interfaz aprobada.',
  },
  {
    id: 'm2',
    author: 'orbit',
    time: '10:32',
    text: 'Entendido. Implementaré el módulo de promociones conservando la interfaz aprobada.',
    plan: [
      'Revisar archivos del proyecto y dependencias actuales.',
      'Crear un worktree para la nueva funcionalidad.',
      'Modificar componentes y agregar el módulo de promociones.',
      'Ejecutar build para validar los cambios.',
      'Verificar el resultado en localhost:3000.',
    ],
    footnote: 'Comenzando con la revisión del proyecto…',
  },
]

export const ENGINES: Engine[] = [
  {
    id: 'codex',
    name: 'Codex',
    state: 'conectado',
    description: 'Motor principal de razonamiento y edición de código.',
  },
  {
    id: 'opencode',
    name: 'OpenCode',
    state: 'conectado',
    description: 'Agente de código abierto para tareas locales.',
  },
  {
    id: 'openrouter',
    name: 'OpenRouter',
    state: 'conectado',
    description: 'Enrutador de modelos con opciones gratuitas.',
  },
  {
    id: 'v0',
    name: 'v0',
    state: 'conectado',
    description: 'Generación de interfaz y componentes.',
  },
]

export const ENGINE_OPTIONS = [
  'Automático',
  'Codex',
  'OpenCode',
  'OpenRouter Free',
  'v0',
  'Builder',
  'Modelo local',
]

export const AGENTS: AgentTask[] = [
  {
    id: 'director',
    name: 'Director',
    role: 'Orquestador',
    status: 'Planificando tarea',
    action: 'Analizando requerimientos…',
    progress: 80,
    tone: 'violet',
    files: ['app/promociones/page.tsx', 'lib/promotions.ts'],
    elapsed: '00:42',
  },
  {
    id: 'constructor',
    name: 'Constructor',
    role: 'Editor de código',
    status: 'Modificando TaskCard.tsx',
    action: 'Editando componentes…',
    progress: 65,
    tone: 'success',
    files: ['components/TaskCard.tsx', 'components/PromotionCard.tsx'],
    elapsed: '01:15',
  },
  {
    id: 'verificador',
    name: 'Verificador',
    role: 'Control de calidad',
    status: 'Ejecutando build',
    action: 'Compilando proyecto…',
    progress: 45,
    tone: 'primary',
    files: ['package.json'],
    elapsed: '00:23',
  },
]

export const DIFFS: DiffFile[] = [
  {
    id: 'd1',
    path: 'components/TaskCard.tsx',
    git: 'M',
    additions: 12,
    deletions: 3,
    tested: 'ok',
    hunks: [
      { type: 'meta', text: '@@ -1,6 +1,9 @@ export function TaskCard' },
      { type: 'ctx', text: 'import { cn } from "@/lib/utils"' },
      { type: 'del', text: 'export function TaskCard({ title }) {' },
      { type: 'add', text: 'export function TaskCard({ title, done }) {' },
      { type: 'add', text: '  const icon = done ? "check" : "clock"' },
      { type: 'ctx', text: '  return (' },
      { type: 'add', text: '    <article className="rounded-lg border p-3">' },
      { type: 'del', text: '    <div className="p-3">' },
      { type: 'ctx', text: '      <span>{title}</span>' },
      { type: 'ctx', text: '    </article>' },
    ],
  },
  {
    id: 'd2',
    path: 'app/promociones/page.tsx',
    git: 'A',
    additions: 34,
    deletions: 0,
    tested: 'pendiente',
    hunks: [
      { type: 'meta', text: '@@ -0,0 +1,12 @@ nuevo archivo' },
      { type: 'add', text: 'import { getActivePromotions } from "@/lib/promotions"' },
      { type: 'add', text: '' },
      { type: 'add', text: 'export default function PromocionesPage() {' },
      { type: 'add', text: '  const promos = getActivePromotions()' },
      { type: 'add', text: '  return (' },
      { type: 'add', text: '    <section className="grid gap-4">' },
      { type: 'add', text: '      {promos.map((p) => (' },
      { type: 'add', text: '        <PromotionCard key={p.id} {...p} />' },
      { type: 'add', text: '      ))}' },
      { type: 'add', text: '    </section>' },
      { type: 'add', text: '  )' },
      { type: 'add', text: '}' },
    ],
  },
  {
    id: 'd3',
    path: 'lib/promotions.ts',
    git: 'M',
    additions: 8,
    deletions: 1,
    tested: 'ok',
    hunks: [
      { type: 'meta', text: '@@ -3,4 +3,11 @@ export const promotions' },
      { type: 'del', text: 'export const promotions = []' },
      { type: 'add', text: 'export const promotions = [' },
      { type: 'add', text: '  { id: "welcome", discount: "20%" },' },
      { type: 'add', text: '  { id: "referral", discount: "2x1" },' },
      { type: 'add', text: ']' },
    ],
  },
]

export const TERMINAL_LINES: string[] = [
  '$ pnpm dev',
  '> u-zala@0.1.0 dev',
  '> next dev -p 3000',
  '',
  '✓ Ready in 3.2s',
  '✓ Compiled successfully',
  '✓ Local:    http://localhost:3000',
  '✓ Network:  http://192.168.1.10:3000',
]

export const STATS: StatCard[] = [
  { id: 'total', label: 'Tareas totales', value: '24', delta: '12% vs ayer', trend: 'up' },
  { id: 'done', label: 'Completadas', value: '16', delta: '20% vs ayer', trend: 'up' },
  { id: 'pending', label: 'Pendientes', value: '8', delta: '5% vs ayer', trend: 'down' },
  { id: 'progress', label: 'En progreso', value: '3', delta: '10% vs ayer', trend: 'up' },
]

export const PROMOTIONS: Promotion[] = [
  {
    id: 'welcome',
    badge: '20% OFF',
    title: 'Descuento de bienvenida',
    description: 'Obtén 20% en planes Premium. Válido hasta 25/05/2025.',
    cta: 'Usar cupón',
    tone: 'violet',
  },
  {
    id: 'referral',
    badge: '2x1',
    title: 'Invita y gana',
    description: 'Invita a un amigo y ambos obtienen 2 meses gratis.',
    cta: 'Invitar ahora',
    tone: 'success',
  },
  {
    id: 'annual',
    badge: 'NUEVO',
    title: 'Plan Anual',
    description: 'Ahorra 30% con el plan anual por tiempo limitado.',
    cta: 'Ver planes',
    tone: 'warning',
  },
]
