import type { WorkspaceFileEntry } from './scanner.mts'

export interface WorkspaceIndexNode {
  id: string
  name: string
  path: string
  type: 'folder' | 'file'
  ext: string | null
  children?: WorkspaceIndexNode[]
}

/** Índice de archivos del workspace: árbol recursivo, determinista y de solo lectura. */
export interface WorkspaceIndexSnapshot {
  root: string
  nodes: ReadonlyArray<WorkspaceIndexNode>
  folderCount: number
  fileCount: number
  depth: number
  indexedAt: string
}

export interface WorkspaceIndexOptions {
  root: string
  now?: () => string
}

function sortNodes(items: WorkspaceIndexNode[]): WorkspaceIndexNode[] {
  return [...items].sort((a, b) => {
    if (a.type !== b.type) return a.type === 'folder' ? -1 : 1
    return a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })
  })
}

function extensionOf(name: string): string | null {
  const dot = name.lastIndexOf('.')
  if (dot <= 0) return null
  const ext = name.slice(dot + 1)
  return ext.length > 0 ? ext : null
}

/**
 * Convierte las entradas planas del escáner en un árbol anidado.
 * Orden determinista: carpetas primero y luego alfabéticamente.
 */
export function indexWorkspace(
  entries: ReadonlyArray<WorkspaceFileEntry>,
  options: WorkspaceIndexOptions,
): WorkspaceIndexSnapshot {
  const now = options.now ?? (() => new Date().toISOString())
  const childrenByParent = new Map<string, WorkspaceIndexNode[]>()
  const byPath = new Map<string, WorkspaceIndexNode>()
  let folderCount = 0
  let fileCount = 0
  let depth = 0

  for (const entry of entries) {
    if (entry.path === '') continue
    if (byPath.has(entry.path)) continue
    const segments = entry.path.split('/')
    depth = Math.max(depth, segments.length)
    const isFolder = entry.type === 'directory'
    const node: WorkspaceIndexNode = {
      id: entry.path,
      name: entry.name,
      path: entry.path,
      type: isFolder ? 'folder' : 'file',
      ext: isFolder ? null : extensionOf(entry.name),
    }
    if (isFolder) folderCount += 1
    else fileCount += 1
    const parent = segments.length > 1 ? segments.slice(0, -1).join('/') : ''
    const siblings = childrenByParent.get(parent)
    if (siblings) siblings.push(node)
    else childrenByParent.set(parent, [node])
    byPath.set(entry.path, node)
  }

  for (const node of byPath.values()) {
    if (node.type !== 'folder') continue
    const children = childrenByParent.get(node.path)
    if (children && children.length > 0) {
      node.children = sortNodes(children)
    }
  }

  const nodes = sortNodes(childrenByParent.get('') ?? [])
  return { root: options.root, nodes, folderCount, fileCount, depth, indexedAt: now() }
}
