import type { FileNode } from './types'

export function filterFileNodes(nodes: ReadonlyArray<FileNode>, query: string): FileNode[] {
  const normalized = query.trim().toLocaleLowerCase()
  if (!normalized) return [...nodes]

  return nodes.flatMap((node) => {
    const children = node.children ? filterFileNodes(node.children, query) : []
    const matches = `${node.name} ${node.id}`.toLocaleLowerCase().includes(normalized)
    if (!matches && children.length === 0) return []
    const result = { ...node }
    if (node.children) result.children = matches ? node.children : children
    return [result]
  })
}
