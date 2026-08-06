import type {
  WorkspaceFileEntry,
  WorkspaceFileLister,
} from '../lib/runtime/adapters/workspace/index.mts'

export function entries(names: ReadonlyArray<string>): ReadonlyArray<WorkspaceFileEntry> {
  return names.map((name) => {
    const isDirectory = name.endsWith('/')
    const path = isDirectory ? name.slice(0, -1) : name
    const parts = path.split('/')
    return { path, name: parts[parts.length - 1] ?? '', type: isDirectory ? 'directory' : 'file' }
  })
}

export const virtualLister =
  (names: ReadonlyArray<string>): WorkspaceFileLister =>
  (): ReadonlyArray<WorkspaceFileEntry> =>
    entries(names)

export const NEXT_TAURI_FILES: ReadonlyArray<string> = [
  'package.json',
  'pnpm-workspace.yaml',
  'pnpm-lock.yaml',
  'next.config.ts',
  'tsconfig.json',
  'tailwind.config.ts',
  'eslint.config.mjs',
  '.prettierrc',
  'src-tauri/',
  'app/',
  'vercel.json',
]

export const VITE_REACT_FILES: ReadonlyArray<string> = [
  'package.json',
  'package-lock.json',
  'vite.config.ts',
  'tsconfig.json',
  'index.html',
  'src/App.tsx',
  'eslint.config.js',
  '.prettierrc',
  'src-tauri/',
]

export const MONOREPO_FILES: ReadonlyArray<string> = [
  'package.json',
  'pnpm-workspace.yaml',
  'turbo.json',
  'tsconfig.json',
]

export const RUST_TAURI_FILES: ReadonlyArray<string> = [
  'Cargo.toml',
  'package.json',
  'src-tauri/',
]

export const VITEST_FILES: ReadonlyArray<string> = [
  'package.json',
  'vitest.config.ts',
  'playwright.config.ts',
  '.prettierrc',
]

export const NESTED_KNOWN_FILES: ReadonlyArray<string> = [
  'package.json',
  'packages/foo/package.json',
  'packages/foo/vite.config.ts',
]
