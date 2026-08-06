import type { TaskPriority } from '../kernel/types.mts'
import type { ProjectStage } from '../mission-control/types.mts'
import type { DirectorComplexity, DirectorRequest, DirectorTaskKind, PlannedTask } from './types.mts'

const KIND_KEYWORDS: ReadonlyArray<[DirectorTaskKind, ReadonlyArray<string>]> = [
  ['frontend', ['ui', 'interfaz', 'frontend', 'componente', 'pagina', 'página', 'vista', 'formulario', 'estilo', 'layout']],
  ['backend', ['backend', 'api', 'servicio', 'endpoint', 'servidor', 'logica', 'lógica']],
  ['database', ['base de datos', 'database', 'schema', 'migracion', 'migración', 'tabla', 'modelo de datos']],
  ['refactor', ['refactor', 'refactorizar', 'limpiar', 'extraer', 'simplificar']],
  ['explanation', ['explicar', 'explicacion', 'explicación', 'como funciona', 'cómo funciona', 'que hace', 'qué hace', 'entender']],
  ['repetitive', ['repetitivo', 'boilerplate', 'plantilla', 'codigo repetitivo', 'código repetitivo']],
  ['documentation', ['documentar', 'documentacion', 'documentación', 'readme', 'comentarios', 'changelog']],
  ['tests', ['pruebas', 'test', 'testing', 'cobertura']],
]

const COMPLEXITY_KEYWORDS: ReadonlyArray<[DirectorComplexity, ReadonlyArray<string>]> = [
  ['complex', ['complejo', 'compleja', 'complicado', 'gran escala', 'grande']],
  ['high', ['avanzado', 'dificil', 'difícil', 'largo']],
  ['low', ['pequeno', 'pequeño', 'rapido', 'rápido', 'simple', 'sencillo']],
]

/** Coincide palabras completas para keywords cortos y subcadenas para los largos. */
const matchesKeywords = (text: string, words: ReadonlyArray<string>, keywords: ReadonlyArray<string>): boolean =>
  keywords.some((keyword) => {
    if (keyword.includes(' ')) return text.includes(keyword)
    if (keyword.length <= 3) return words.includes(keyword)
    return words.some((word) => word.includes(keyword))
  })

export function inferKind(objective: string): DirectorTaskKind {
  const text = objective.toLowerCase()
  const words = text.split(/[^a-z0-9áéíóúñü]+/).filter((word) => word.length > 0)
  for (const [kind, keywords] of KIND_KEYWORDS) {
    if (matchesKeywords(text, words, keywords)) return kind
  }
  return 'generic'
}

export function inferComplexity(objective: string): DirectorComplexity {
  const text = objective.toLowerCase()
  for (const [complexity, keywords] of COMPLEXITY_KEYWORDS) {
    if (keywords.some((keyword) => text.includes(keyword))) return complexity
  }
  return 'medium'
}

export function stageForKind(kind: DirectorTaskKind): ProjectStage {
  switch (kind) {
    case 'frontend':
      return 'diseno'
    case 'backend':
    case 'database':
    case 'repetitive':
    case 'generic':
      return 'implementacion'
    case 'refactor':
      return 'correccion'
    case 'tests':
      return 'pruebas'
    case 'documentation':
      return 'publicacion'
    case 'explanation':
      return 'exploracion'
  }
}

export function priorityForKind(kind: DirectorTaskKind): TaskPriority {
  switch (kind) {
    case 'backend':
    case 'database':
      return 'high'
    case 'frontend':
    case 'refactor':
    case 'tests':
      return 'normal'
    case 'documentation':
    case 'explanation':
    case 'repetitive':
      return 'low'
    case 'generic':
      return 'normal'
  }
}

export function titleFor(kind: DirectorTaskKind, objective: string): string {
  switch (kind) {
    case 'frontend':
      return `Construir interfaz para "${objective}"`
    case 'backend':
      return `Implementar backend de "${objective}"`
    case 'database':
      return `Diseñar base de datos para "${objective}"`
    case 'refactor':
      return `Refactorizar: ${objective}`
    case 'explanation':
      return `Explicar: ${objective}`
    case 'repetitive':
      return `Generar código repetitivo: ${objective}`
    case 'documentation':
      return `Documentar: ${objective}`
    case 'tests':
      return `Agregar pruebas: ${objective}`
    case 'generic':
      return `Plan para: ${objective}`
  }
}

const PIPELINE: ReadonlyArray<DirectorTaskKind> = [
  'frontend',
  'backend',
  'database',
  'tests',
  'documentation',
]

const RATIONALE: Readonly<Record<DirectorTaskKind, string>> = {
  frontend: 'Tarea de interfaz derivada de la solicitud.',
  backend: 'Tarea de backend derivada de la solicitud.',
  database: 'Tarea de base de datos derivada de la solicitud.',
  refactor: 'Tarea de refactor derivada de la solicitud.',
  explanation: 'Tarea de explicación derivada de la solicitud.',
  repetitive: 'Tarea de código repetitivo derivada de la solicitud.',
  documentation: 'Tarea de documentación derivada de la solicitud.',
  tests: 'Tarea de pruebas derivada de la solicitud.',
  generic: 'Plan general: ejecutar el pipeline completo.',
}

/**
 * Divide una solicitud en tareas. Las solicitudes generales se descomponen
 * en el pipeline completo; las específicas en una tarea enfocada.
 */
export class TaskPlanner {
  plan(request: DirectorRequest): ReadonlyArray<PlannedTask> {
    const kind = request.kind ?? inferKind(request.objective)
    if (kind === 'generic') return this.planPipeline(request)
    return this.planFocused(kind, request)
  }

  private planPipeline(request: DirectorRequest): ReadonlyArray<PlannedTask> {
    return PIPELINE.map((kind, index) => {
      const id = `task-${index + 1}`
      return {
        id,
        title: titleFor(kind, request.objective),
        kind,
        stage: stageForKind(kind),
        priority: priorityForKind(kind),
        dependencies: index > 0 ? [`task-${index}`] : [],
        rationale: RATIONALE[kind],
      }
    })
  }

  private planFocused(kind: DirectorTaskKind, request: DirectorRequest): ReadonlyArray<PlannedTask> {
    return [
      {
        id: 'task-1',
        title: titleFor(kind, request.objective),
        kind,
        stage: stageForKind(kind),
        priority: priorityForKind(kind),
        dependencies: [],
        rationale: RATIONALE[kind],
      },
    ]
  }
}
