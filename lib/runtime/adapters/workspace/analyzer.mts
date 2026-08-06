import { globName, type WorkspaceFileEntry, type WorkspaceScanResult } from './scanner.mts'
import { NONE, UNKNOWN } from './snapshot.mts'

export interface WorkspaceAnalysis {
  projectName: string
  root: string
  framework: string
  language: string
  packageManager: string
  buildSystem: string
  frontend: string
  backend: string
  desktop: string
  database: string
  testing: string
  lint: string
  formatter: string
  deployment: string
  monorepo: string
  confidence: number
}

const atRoot = (
  entries: ReadonlyArray<WorkspaceFileEntry>,
  pattern: string,
  kind: WorkspaceFileEntry['type'],
): boolean =>
  entries.some(
    (entry) =>
      entry.type === kind && entry.path.indexOf('/') === -1 && globName(entry.name, pattern),
  )

const hasRootFile = (entries: ReadonlyArray<WorkspaceFileEntry>, pattern: string): boolean =>
  atRoot(entries, pattern, 'file')

const hasRootDir = (entries: ReadonlyArray<WorkspaceFileEntry>, pattern: string): boolean =>
  atRoot(entries, pattern, 'directory')

const hasEntry = (entries: ReadonlyArray<WorkspaceFileEntry>, path: string): boolean =>
  entries.some((entry) => entry.path === path)

const hasManifest = (entries: ReadonlyArray<WorkspaceFileEntry>): boolean =>
  hasRootFile(entries, 'package.json')

const hasCargo = (entries: ReadonlyArray<WorkspaceFileEntry>): boolean =>
  hasRootFile(entries, 'Cargo.toml')

const hasTauri = (entries: ReadonlyArray<WorkspaceFileEntry>): boolean =>
  hasRootDir(entries, 'src-tauri')

export function detectLanguage(entries: ReadonlyArray<WorkspaceFileEntry>): string {
  if (hasCargo(entries)) return 'rust'
  if (hasRootFile(entries, 'tsconfig.json')) return 'typescript'
  if (hasManifest(entries)) return 'javascript'
  return UNKNOWN
}

export function detectPackageManager(entries: ReadonlyArray<WorkspaceFileEntry>): string {
  if (hasRootFile(entries, 'pnpm-workspace.yaml') || hasRootFile(entries, 'pnpm-lock.yaml')) {
    return 'pnpm'
  }
  if (hasRootFile(entries, 'bun.lockb')) return 'bun'
  if (hasRootFile(entries, 'yarn.lock')) return 'yarn'
  if (hasRootFile(entries, 'package-lock.json')) return 'npm'
  if (hasCargo(entries)) return 'cargo'
  return UNKNOWN
}

export function detectFramework(entries: ReadonlyArray<WorkspaceFileEntry>): string {
  if (hasRootFile(entries, 'next.config.*')) return 'next'
  if (hasRootFile(entries, 'astro.config.*')) return 'astro'
  if (hasRootFile(entries, 'nuxt.config.*')) return 'nuxt'
  if (hasRootFile(entries, 'angular.json')) return 'angular'
  if (hasRootFile(entries, 'vite.config.*')) return 'vite'
  if (hasTauri(entries)) return 'tauri'
  if (hasCargo(entries)) return 'cargo'
  if (hasManifest(entries)) return 'node'
  return UNKNOWN
}

export function detectBuildSystem(entries: ReadonlyArray<WorkspaceFileEntry>): string {
  if (hasRootFile(entries, 'turbo.json')) return 'turbo'
  if (hasRootFile(entries, 'nx.json')) return 'nx'
  if (hasRootFile(entries, 'next.config.*')) return 'next'
  if (hasRootFile(entries, 'vite.config.*')) return 'vite'
  if (hasRootFile(entries, 'astro.config.*')) return 'astro'
  if (hasRootFile(entries, 'nuxt.config.*')) return 'nuxt'
  if (hasRootFile(entries, 'angular.json')) return 'angular'
  if (hasCargo(entries)) return 'cargo'
  if (hasManifest(entries)) return 'node'
  return UNKNOWN
}

export function detectFrontend(entries: ReadonlyArray<WorkspaceFileEntry>): string {
  if (hasRootDir(entries, 'app')) return 'react-app-router'
  if (hasRootDir(entries, 'pages')) return 'react-pages-router'
  if (hasEntry(entries, 'src/App.vue')) return 'vue'
  if (hasEntry(entries, 'src/App.svelte')) return 'svelte'
  if (
    hasEntry(entries, 'src/App.tsx') ||
    hasEntry(entries, 'src/App.jsx') ||
    hasEntry(entries, 'src/main.tsx') ||
    hasEntry(entries, 'src/main.jsx')
  ) {
    return 'react'
  }
  if (hasRootFile(entries, 'index.html')) return 'vanilla-html'
  return NONE
}

export function detectBackend(entries: ReadonlyArray<WorkspaceFileEntry>): string {
  if (hasCargo(entries)) return 'rust'
  if (hasTauri(entries)) return 'tauri-rust'
  return NONE
}

export function detectDesktop(entries: ReadonlyArray<WorkspaceFileEntry>): string {
  if (hasTauri(entries)) return 'tauri'
  return NONE
}

export function detectDatabase(entries: ReadonlyArray<WorkspaceFileEntry>): string {
  if (hasRootDir(entries, 'supabase')) return 'supabase'
  if (hasRootDir(entries, 'prisma') || hasEntry(entries, 'schema.prisma')) return 'prisma'
  if (hasRootFile(entries, 'docker-compose.yml')) return 'docker-compose'
  return NONE
}

export function detectTesting(entries: ReadonlyArray<WorkspaceFileEntry>): string {
  if (hasRootFile(entries, 'playwright.config.*')) return 'playwright'
  if (hasRootFile(entries, 'vitest.config.*')) return 'vitest'
  if (hasRootFile(entries, 'jest.config.*')) return 'jest'
  return NONE
}

export function detectLint(entries: ReadonlyArray<WorkspaceFileEntry>): string {
  if (hasRootFile(entries, 'eslint.config.*') || hasRootFile(entries, '.eslintrc*')) return 'eslint'
  return NONE
}

export function detectFormatter(entries: ReadonlyArray<WorkspaceFileEntry>): string {
  if (hasRootFile(entries, '.prettierrc*')) return 'prettier'
  return NONE
}

export function detectDeployment(entries: ReadonlyArray<WorkspaceFileEntry>): string {
  if (hasRootFile(entries, 'vercel.json')) return 'vercel'
  if (hasRootFile(entries, 'Dockerfile')) return 'docker'
  if (hasRootFile(entries, 'docker-compose.yml')) return 'docker-compose'
  if (hasRootFile(entries, 'netlify.toml')) return 'netlify'
  return NONE
}

export function detectMonorepo(entries: ReadonlyArray<WorkspaceFileEntry>): string {
  if (hasRootFile(entries, 'turbo.json')) return 'turbo'
  if (hasRootFile(entries, 'nx.json')) return 'nx'
  if (hasRootFile(entries, 'pnpm-workspace.yaml')) return 'pnpm-workspace'
  return NONE
}

function computeConfidence(signalCount: number): number {
  if (signalCount <= 0) return 0
  return Math.min(1, 0.25 + signalCount * 0.08)
}

export function analyzeWorkspace(
  result: WorkspaceScanResult,
  projectName: string,
): WorkspaceAnalysis {
  const entries = result.entries
  const confidence = Math.round(computeConfidence(result.detectedFiles.length) * 100) / 100
  return {
    projectName,
    root: result.root,
    framework: detectFramework(entries),
    language: detectLanguage(entries),
    packageManager: detectPackageManager(entries),
    buildSystem: detectBuildSystem(entries),
    frontend: detectFrontend(entries),
    backend: detectBackend(entries),
    desktop: detectDesktop(entries),
    database: detectDatabase(entries),
    testing: detectTesting(entries),
    lint: detectLint(entries),
    formatter: detectFormatter(entries),
    deployment: detectDeployment(entries),
    monorepo: detectMonorepo(entries),
    confidence,
  }
}

export class WorkspaceAnalyzer {
  analyze(result: WorkspaceScanResult, options: { projectName?: string } = {}): WorkspaceAnalysis {
    const projectName = options.projectName ?? result.root.split('/').filter(Boolean).pop() ?? 'proyecto'
    return analyzeWorkspace(result, projectName)
  }
}
