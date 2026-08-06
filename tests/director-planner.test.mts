import assert from 'node:assert/strict'
import test from 'node:test'
import {
  inferComplexity,
  inferKind,
  priorityForKind,
  stageForKind,
  TaskPlanner,
  titleFor,
} from '../lib/director/index.mts'
import type { DirectorRequest } from '../lib/director/index.mts'

test('inferKind reconoce tipos por palabras clave', () => {
  assert.equal(inferKind('Construir la interfaz del dashboard'), 'frontend')
  assert.equal(inferKind('Implementar la API de usuarios'), 'backend')
  assert.equal(inferKind('Diseñar la base de datos'), 'database')
  assert.equal(inferKind('Refactorizar el módulo de pagos'), 'refactor')
  assert.equal(inferKind('Explicar cómo funciona el scheduler'), 'explanation')
  assert.equal(inferKind('Agregar pruebas al pipeline'), 'tests')
  assert.equal(inferKind('Documentar el README del proyecto'), 'documentation')
})

test('inferKind cae a generic sin coincidencias', () => {
  assert.equal(inferKind('Construir la aplicación completa'), 'generic')
})

test('inferComplexity reconoce complejidad por palabras clave', () => {
  assert.equal(inferComplexity('Tarea muy simple'), 'low')
  assert.equal(inferComplexity('Tarea normal'), 'medium')
  assert.equal(inferComplexity('Tarea difícil y larga'), 'high')
  assert.equal(inferComplexity('Proyecto complejo a gran escala'), 'complex')
})

test('stageForKind mapea cada tipo a una etapa del proyecto', () => {
  assert.equal(stageForKind('frontend'), 'diseno')
  assert.equal(stageForKind('backend'), 'implementacion')
  assert.equal(stageForKind('database'), 'implementacion')
  assert.equal(stageForKind('refactor'), 'correccion')
  assert.equal(stageForKind('tests'), 'pruebas')
  assert.equal(stageForKind('documentation'), 'publicacion')
  assert.equal(stageForKind('explanation'), 'exploracion')
})

test('priorityForKind asigna prioridades razonables', () => {
  assert.equal(priorityForKind('backend'), 'high')
  assert.equal(priorityForKind('database'), 'high')
  assert.equal(priorityForKind('frontend'), 'normal')
  assert.equal(priorityForKind('documentation'), 'low')
})

test('titleFor genera títulos legibles por tipo', () => {
  assert.ok(titleFor('frontend', 'login').includes('interfaz'))
  assert.ok(titleFor('backend', 'login').includes('backend'))
})

test('TaskPlanner descompone solicitudes genéricas en el pipeline completo', () => {
  const planner = new TaskPlanner()
  const tasks = planner.plan({ objective: 'Construir la aplicación completa' })
  assert.equal(tasks.length, 5)
  assert.deepEqual(
    tasks.map((task) => task.kind),
    ['frontend', 'backend', 'database', 'tests', 'documentation'],
  )
  assert.equal(tasks[0].dependencies.length, 0)
  assert.deepEqual(tasks[1].dependencies, ['task-1'])
  assert.deepEqual(tasks[4].dependencies, ['task-4'])
})

test('TaskPlanner genera una sola tarea para solicitudes específicas', () => {
  const planner = new TaskPlanner()
  const tasks = planner.plan({ objective: 'Implementar la API de pagos', kind: 'backend' })
  assert.equal(tasks.length, 1)
  assert.equal(tasks[0].kind, 'backend')
  assert.equal(tasks[0].stage, 'implementacion')
  assert.equal(tasks[0].dependencies.length, 0)
})

test('TaskPlanner respeta kind inferido cuando no se especifica', () => {
  const planner = new TaskPlanner()
  const request: DirectorRequest = { objective: 'Agregar pruebas al router' }
  const tasks = planner.plan(request)
  assert.equal(tasks.length, 1)
  assert.equal(tasks[0].kind, 'tests')
})
