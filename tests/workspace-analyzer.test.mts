import assert from 'node:assert/strict'
import test from 'node:test'
import { WorkspaceAnalyzer } from '../lib/runtime/adapters/workspace/index.mts'
import { WorkspaceScanner } from '../lib/runtime/adapters/workspace/index.mts'
import {
  MONOREPO_FILES,
  NEXT_TAURI_FILES,
  RUST_TAURI_FILES,
  VITE_REACT_FILES,
  VITEST_FILES,
  virtualLister,
} from './workspace-fixtures.mts'
import { NONE } from '../lib/runtime/adapters/workspace/index.mts'

const analyze = (files: ReadonlyArray<string>, projectName = 'proyecto') => {
  const scanner = new WorkspaceScanner({ lister: virtualLister(files) })
  const result = scanner.scan('/proyecto')
  return new WorkspaceAnalyzer().analyze(result, { projectName })
}

test('WorkspaceAnalyzer detecta Next + TypeScript + pnpm + Tauri', () => {
  const analysis = analyze(NEXT_TAURI_FILES)
  assert.equal(analysis.framework, 'next')
  assert.equal(analysis.language, 'typescript')
  assert.equal(analysis.packageManager, 'pnpm')
  assert.equal(analysis.buildSystem, 'next')
  assert.equal(analysis.frontend, 'react-app-router')
  assert.equal(analysis.desktop, 'tauri')
  assert.equal(analysis.backend, 'tauri-rust')
  assert.equal(analysis.database, 'none')
  assert.equal(analysis.lint, 'eslint')
  assert.equal(analysis.formatter, 'prettier')
  assert.equal(analysis.deployment, 'vercel')
  assert.equal(analysis.monorepo, 'pnpm-workspace')
  assert.equal(analysis.confidence, 0.97)
  assert.equal(analysis.projectName, 'proyecto')
})

test('WorkspaceAnalyzer detecta Vite + React + npm', () => {
  const analysis = analyze(VITE_REACT_FILES)
  assert.equal(analysis.framework, 'vite')
  assert.equal(analysis.language, 'typescript')
  assert.equal(analysis.packageManager, 'npm')
  assert.equal(analysis.buildSystem, 'vite')
  assert.equal(analysis.frontend, 'react')
  assert.equal(analysis.desktop, 'tauri')
  assert.equal(analysis.deployment, 'none')
})

test('WorkspaceAnalyzer detecta Turborepo monorepo pnpm', () => {
  const analysis = analyze(MONOREPO_FILES)
  assert.equal(analysis.monorepo, 'turbo')
  assert.equal(analysis.packageManager, 'pnpm')
  assert.equal(analysis.buildSystem, 'turbo')
  assert.equal(analysis.framework, 'node')
})

test('WorkspaceAnalyzer detecta Rust + Tauri', () => {
  const analysis = analyze(RUST_TAURI_FILES)
  assert.equal(analysis.language, 'rust')
  assert.equal(analysis.packageManager, 'cargo')
  assert.equal(analysis.framework, 'tauri')
  assert.equal(analysis.desktop, 'tauri')
  assert.equal(analysis.backend, 'rust')
})

test('WorkspaceAnalyzer detecta testing playwright y formatter prettier', () => {
  const analysis = analyze(VITEST_FILES)
  assert.equal(analysis.testing, 'playwright')
  assert.equal(analysis.formatter, 'prettier')
})

test('WorkspaceAnalyzer devuelve categorías vacías sin señales', () => {
  const analysis = analyze([])
  assert.equal(analysis.framework, 'unknown')
  assert.equal(analysis.language, 'unknown')
  assert.equal(analysis.packageManager, 'unknown')
  assert.equal(analysis.confidence, 0)
  assert.equal(analysis.monorepo, NONE)
})

test('WorkspaceAnalyzer usa el nombre de proyecto por defecto desde la raíz', () => {
  const analysis = new WorkspaceAnalyzer().analyze(
    new WorkspaceScanner({ lister: virtualLister(['package.json']) }).scan('/var/proyecto/foo'),
  )
  assert.equal(analysis.projectName, 'foo')
})
