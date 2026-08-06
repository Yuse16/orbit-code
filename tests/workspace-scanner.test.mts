import assert from 'node:assert/strict'
import test from 'node:test'
import { WorkspaceScanner } from '../lib/runtime/adapters/workspace/index.mts'
import {
  NESTED_KNOWN_FILES,
  NEXT_TAURI_FILES,
  VITE_REACT_FILES,
  virtualLister,
} from './workspace-fixtures.mts'

test('WorkspaceScanner detecta los archivos conocidos en la raíz', () => {
  const scanner = new WorkspaceScanner({ lister: virtualLister(NEXT_TAURI_FILES) })
  const result = scanner.scan('/proyectos/orbit-code')

  assert.equal(result.root, '/proyectos/orbit-code')
  assert.ok(result.knownFiles.includes('package.json'))
  assert.ok(result.knownFiles.includes('pnpm-workspace.yaml'))
  assert.ok(result.knownFiles.includes('next.config'))
  assert.ok(result.knownFiles.includes('tsconfig.json'))
  assert.ok(result.knownFiles.includes('tailwind.config'))
  assert.ok(result.knownFiles.includes('eslint.config'))
  assert.ok(result.knownFiles.includes('.prettierrc'))
  assert.ok(result.knownFiles.includes('src-tauri'))
  assert.ok(result.knownFiles.includes('vercel.json'))
  assert.ok(result.detectedFiles.includes('next.config.ts'))
  assert.ok(result.detectedFiles.includes('src-tauri'))
})

test('WorkspaceScanner matchea patrones glob en la raíz', () => {
  const scanner = new WorkspaceScanner({ lister: virtualLister(VITE_REACT_FILES) })
  const result = scanner.scan('/app/vite')
  assert.ok(result.detectedFiles.includes('vite.config.ts'))
  assert.ok(result.detectedFiles.includes('package-lock.json'))
})

test('WorkspaceScanner ignora archivos conocidos anidados', () => {
  const scanner = new WorkspaceScanner({ lister: virtualLister(NESTED_KNOWN_FILES) })
  const result = scanner.scan('/monorepo')
  assert.deepEqual(result.detectedFiles, ['package.json'])
})

test('WorkspaceScanner devuelve un resultado vacío para un proyecto sin señales', () => {
  const scanner = new WorkspaceScanner({ lister: virtualLister([]) })
  const result = scanner.scan('/vacio')
  assert.deepEqual(result.detectedFiles, [])
  assert.deepEqual(result.knownFiles, [])
  assert.equal(result.timestamp.length > 0, true)
})

test('WorkspaceScanner usa el lister inyectado', () => {
  const scanner = new WorkspaceScanner({ lister: virtualLister(['Cargo.toml']) })
  const result = scanner.scan('/rust')
  assert.deepEqual(result.knownFiles, ['Cargo.toml'])
})
