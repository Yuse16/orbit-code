import assert from 'node:assert/strict'
import test from 'node:test'
import {
  WorkspaceScanner,
  indexWorkspace,
} from '../lib/runtime/adapters/workspace/index.mts'
import { entries } from './workspace-fixtures.mts'

const FILES: ReadonlyArray<string> = [
  'package.json',
  'next.config.ts',
  '.env',
  'zebra.txt',
  'Alpha.txt',
  'app/',
  'app/page.tsx',
  'app/layout.tsx',
  'src-tauri/',
  'components/',
  'components/ui/',
  'components/ui/button.tsx',
]

const treeNodeNames = (nodes: ReadonlyArray<{ name: string; type: 'folder' | 'file' }>): string[] =>
  nodes.map((node) => node.name)

test('indexWorkspace construye un árbol anidado con carpetas primero', () => {
  const index = indexWorkspace(entries(FILES), {
    root: '/proyectos/orbit-code',
    now: () => '2026-01-01T00:00:00.000Z',
  })
  assert.equal(index.root, '/proyectos/orbit-code')
  assert.equal(index.indexedAt, '2026-01-01T00:00:00.000Z')
  assert.equal(index.folderCount, 4)
  assert.equal(index.fileCount, 8)
  assert.equal(index.depth, 3)
  assert.deepEqual(treeNodeNames(index.nodes), [
    'app',
    'components',
    'src-tauri',
    '.env',
    'Alpha.txt',
    'next.config.ts',
    'package.json',
    'zebra.txt',
  ])
})

test('indexWorkspace ordena archivos de la raíz alfabéticamente tras las carpetas', () => {
  const index = indexWorkspace(entries(FILES), { root: '/' })
  const rootNames = treeNodeNames(index.nodes)
  assert.deepEqual(rootNames.slice(0, 3), ['app', 'components', 'src-tauri'])
  assert.deepEqual(rootNames.slice(3), ['.env', 'Alpha.txt', 'next.config.ts', 'package.json', 'zebra.txt'])
})

test('indexWorkspace anida carpetas y deriva extensiones', () => {
  const index = indexWorkspace(entries(FILES), { root: '/' })
  const app = index.nodes.find((node) => node.name === 'app')
  assert.ok(app)
  assert.equal(app.type, 'folder')
  assert.deepEqual(treeNodeNames(app.children ?? []), ['layout.tsx', 'page.tsx'])

  const components = index.nodes.find((node) => node.name === 'components')
  const ui = components?.children?.find((node) => node.name === 'ui')
  const button = ui?.children?.find((node) => node.name === 'button.tsx')
  assert.ok(components)
  assert.ok(ui)
  assert.ok(button)
  assert.equal(button.type, 'file')
  assert.equal(button.ext, 'tsx')

  const packageJson = index.nodes.find((node) => node.name === 'package.json')
  assert.equal(packageJson?.ext, 'json')
  const env = index.nodes.find((node) => node.name === '.env')
  assert.equal(env?.ext, null)
})

test('indexWorkspace devuelve un índice vacío sin entradas', () => {
  const index = indexWorkspace([], { root: '/vacio' })
  assert.deepEqual(index.nodes, [])
  assert.equal(index.folderCount, 0)
  assert.equal(index.fileCount, 0)
  assert.equal(index.depth, 0)
})

test('indexWorkspace ignora entradas duplicadas', () => {
  const duplicates = [...entries(['app/', 'app/page.tsx']), ...entries(['app/', 'app/page.tsx'])]
  const index = indexWorkspace(duplicates, { root: '/' })
  assert.equal(index.folderCount, 1)
  assert.equal(index.fileCount, 1)
  assert.deepEqual(treeNodeNames(index.nodes), ['app'])
})

test('WorkspaceScanner + indexWorkspace leen el proyecto real de solo lectura', () => {
  const result = new WorkspaceScanner().scan(process.cwd())
  const index = indexWorkspace(result.entries, { root: process.cwd() })
  assert.ok(index.folderCount > 0)
  assert.ok(index.fileCount > 0)
  assert.ok(index.depth >= 2)
  assert.ok(index.nodes.some((node) => node.name === 'src' || node.name === 'lib'))
})
