import { readdirSync, statSync } from 'node:fs'
import { join, relative, sep } from 'node:path'

export type WorkspaceEntryType = 'file' | 'directory'

export interface WorkspaceFileEntry {
  path: string
  name: string
  type: WorkspaceEntryType
}

export interface WorkspaceScanOptions {
  maxDepth?: number
  ignoredDirectories?: ReadonlyArray<string>
}

export interface WorkspaceFileLister {
  (root: string, options: WorkspaceScanOptions): ReadonlyArray<WorkspaceFileEntry>
}

export interface WorkspaceFileSpec {
  id: string
  name: string
  kind: WorkspaceEntryType
}

/** Archivos conocidos definidos en WORKSPACE_DISCOVERY.md. */
export const WORKSPACE_KNOWN_FILES: ReadonlyArray<WorkspaceFileSpec> = [
  { id: 'package.json', name: 'package.json', kind: 'file' },
  { id: 'pnpm-workspace.yaml', name: 'pnpm-workspace.yaml', kind: 'file' },
  { id: 'package-lock.json', name: 'package-lock.json', kind: 'file' },
  { id: 'yarn.lock', name: 'yarn.lock', kind: 'file' },
  { id: 'bun.lockb', name: 'bun.lockb', kind: 'file' },
  { id: 'Cargo.toml', name: 'Cargo.toml', kind: 'file' },
  { id: 'docker-compose.yml', name: 'docker-compose.yml', kind: 'file' },
  { id: 'Dockerfile', name: 'Dockerfile', kind: 'file' },
  { id: 'next.config', name: 'next.config.*', kind: 'file' },
  { id: 'vite.config', name: 'vite.config.*', kind: 'file' },
  { id: 'astro.config', name: 'astro.config.*', kind: 'file' },
  { id: 'nuxt.config', name: 'nuxt.config.*', kind: 'file' },
  { id: 'angular.json', name: 'angular.json', kind: 'file' },
  { id: 'tsconfig.json', name: 'tsconfig.json', kind: 'file' },
  { id: 'tailwind.config', name: 'tailwind.config.*', kind: 'file' },
  { id: 'eslint.config', name: 'eslint.config.*', kind: 'file' },
  { id: '.prettierrc', name: '.prettierrc*', kind: 'file' },
  { id: 'turbo.json', name: 'turbo.json', kind: 'file' },
  { id: 'nx.json', name: 'nx.json', kind: 'file' },
  { id: 'supabase', name: 'supabase', kind: 'directory' },
  { id: 'src-tauri', name: 'src-tauri', kind: 'directory' },
  { id: 'vercel.json', name: 'vercel.json', kind: 'file' },
]

export const WORKSPACE_KNOWN_FILE_IDS: ReadonlyArray<string> = WORKSPACE_KNOWN_FILES.map(
  (spec) => spec.id,
)

export const DEFAULT_IGNORED_DIRECTORIES: ReadonlyArray<string> = [
  '.git',
  '.next',
  '.turbo',
  'node_modules',
  'dist',
  'out',
  'build',
  'target',
  'coverage',
]

/** Matcher simple de nombres con comodín `*` (suficiente para `next.config.*`). */
export function globName(name: string, pattern: string): boolean {
  if (pattern === '*') return true
  const parts = pattern.split('*')
  if (parts.length === 1) return name === pattern
  if (!name.startsWith(parts[0] ?? '')) return false
  if (!name.endsWith(parts[parts.length - 1] ?? '')) return false
  if (parts.length === 2) return true
  return name.includes(parts[1] ?? '')
}

/** Lister por defecto: lectura real del árbol de directorios (solo lectura). */
export function readWorkspaceFilesSync(
  root: string,
  options: WorkspaceScanOptions = {},
): ReadonlyArray<WorkspaceFileEntry> {
  const ignored = new Set(options.ignoredDirectories ?? DEFAULT_IGNORED_DIRECTORIES)
  const maxDepth = options.maxDepth ?? 6
  const entries: WorkspaceFileEntry[] = []

  const walk = (dir: string, depth: number): void => {
    if (depth > maxDepth) return
    let children: string[]
    try {
      children = readdirSync(dir)
    } catch {
      return
    }
    for (const child of children) {
      const absolute = join(dir, child)
      let isDirectory: boolean
      try {
        isDirectory = statSync(absolute).isDirectory()
      } catch {
        continue
      }
      const path = relative(root, absolute).split(sep).join('/')
      if (isDirectory) {
        entries.push({ path, name: child, type: 'directory' })
        if (!ignored.has(child)) walk(absolute, depth + 1)
      } else {
        entries.push({ path, name: child, type: 'file' })
      }
    }
  }

  walk(root, 0)
  return entries
}

export interface WorkspaceScanResult {
  root: string
  entries: ReadonlyArray<WorkspaceFileEntry>
  knownFiles: ReadonlyArray<string>
  detectedFiles: ReadonlyArray<string>
  timestamp: string
}

export interface WorkspaceScannerOptions {
  lister?: WorkspaceFileLister
  scanOptions?: WorkspaceScanOptions
  now?: () => string
}

/** Escanea la raíz del proyecto y reporta los archivos conocidos detectados. */
export class WorkspaceScanner {
  private readonly lister: WorkspaceFileLister
  private readonly scanOptions: WorkspaceScanOptions
  private readonly now: () => string

  constructor(options: WorkspaceScannerOptions = {}) {
    this.lister = options.lister ?? readWorkspaceFilesSync
    this.scanOptions = options.scanOptions ?? {}
    this.now = options.now ?? (() => new Date().toISOString())
  }

  scan(root: string): WorkspaceScanResult {
    const entries = this.lister(root, this.scanOptions)
    const knownFiles: string[] = []
    const detectedFiles: string[] = []
    for (const spec of WORKSPACE_KNOWN_FILES) {
      const matched = entries.find(
        (entry) =>
          entry.type === spec.kind &&
          entry.path.indexOf('/') === -1 &&
          globName(entry.name, spec.name),
      )
      if (matched) {
        knownFiles.push(spec.id)
        detectedFiles.push(matched.name)
      }
    }
    return { root, entries, knownFiles, detectedFiles, timestamp: this.now() }
  }
}
