import assert from 'node:assert/strict'
import test from 'node:test'
import { filterFileNodes } from '../lib/orbit/file-search.mts'

const nodes = [
  {
    id: 'src',
    name: 'src',
    type: 'folder' as const,
    children: [
      { id: 'src/app.tsx', name: 'app.tsx', type: 'file' as const },
      { id: 'src/utils.ts', name: 'utils.ts', type: 'file' as const },
    ],
  },
  { id: 'README.md', name: 'README.md', type: 'file' as const },
]

test('filterFileNodes devuelve todos los nodos sin consulta', () => {
  assert.deepEqual(filterFileNodes(nodes, ''), nodes)
})

test('filterFileNodes conserva el padre de una coincidencia anidada', () => {
  assert.deepEqual(filterFileNodes(nodes, 'utils'), [
    {
      id: 'src',
      name: 'src',
      type: 'folder',
      children: [{ id: 'src/utils.ts', name: 'utils.ts', type: 'file' }],
    },
  ])
})

test('filterFileNodes busca también por ruta y no distingue mayúsculas', () => {
  assert.equal(filterFileNodes(nodes, 'SRC/APP').length, 1)
  assert.equal(filterFileNodes(nodes, 'readme')[0]?.id, 'README.md')
})
