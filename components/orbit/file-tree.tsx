'use client'

import {
  ChevronRight,
  Folder,
  FolderOpen,
  FileCode2,
  FileJson,
  FileText,
  FileCog,
  FileType,
  Database,
  GitBranch,
  type LucideIcon,
} from 'lucide-react'
import { FILE_TREE } from '@/lib/orbit/mock-data'
import type { FileNode, GitStatus } from '@/lib/orbit/types'
import type { WorkspaceIndexNode } from '@/lib/runtime/adapters/workspace/indexer.mts'
import { useOrbit } from './orbit-store'
import { cn } from '@/lib/utils'
import { filterFileNodes } from '@/lib/orbit/file-search.mts'

function fileIcon(node: FileNode): { Icon: LucideIcon; color: string } {
  if (node.id === 'supabase') return { Icon: Database, color: 'text-success' }
  switch (node.ext) {
    case 'tsx':
      return { Icon: FileCode2, color: 'text-primary' }
    case 'ts':
      return { Icon: FileCode2, color: 'text-[#7dd3fc]' }
    case 'json':
      return { Icon: FileJson, color: 'text-warning' }
    case 'md':
      return { Icon: FileText, color: 'text-muted-foreground' }
    case 'env':
      return { Icon: FileCog, color: 'text-success' }
    case 'git':
      return { Icon: GitBranch, color: 'text-danger' }
    case 'yaml':
      return { Icon: FileType, color: 'text-violet' }
    default:
      return { Icon: FileText, color: 'text-muted-foreground' }
  }
}

const GIT_META: Record<Exclude<GitStatus, null>, { color: string; title: string }> = {
  M: { color: 'text-warning', title: 'Modificado' },
  A: { color: 'text-success', title: 'Agregado' },
  D: { color: 'text-danger', title: 'Eliminado' },
}

function GitBadge({ status }: { status: GitStatus }) {
  if (!status) return null
  const meta = GIT_META[status]
  return (
    <span
      title={meta.title}
      className={cn('ml-auto text-[11px] font-semibold', meta.color)}
    >
      {status}
    </span>
  )
}

function toFileNode(node: WorkspaceIndexNode): FileNode {
  return {
    id: node.id,
    name: node.name,
    type: node.type,
    ext: node.ext ?? undefined,
    children: node.children?.map(toFileNode),
  }
}

function TreeNode({ node, depth }: { node: FileNode; depth: number }) {
  const { expanded, toggleFolder, selectedFile, selectFile } = useOrbit()

  if (node.type === 'folder') {
    const isOpen = expanded[node.id]
    return (
      <li>
        <button
          onClick={() => toggleFolder(node.id)}
          aria-expanded={isOpen}
          className="flex w-full items-center gap-1.5 rounded-md py-1 pr-2 text-sm text-foreground/90 transition-colors hover:bg-panel-3"
          style={{ paddingLeft: `${depth * 12 + 6}px` }}
        >
          <ChevronRight
            className={cn(
              'size-3.5 shrink-0 text-muted-foreground transition-transform',
              isOpen && 'rotate-90',
            )}
          />
          {isOpen ? (
            <FolderOpen className="size-4 shrink-0 text-primary/80" />
          ) : (
            <Folder className="size-4 shrink-0 text-muted-foreground" />
          )}
          <span className="truncate">{node.name}</span>
        </button>
        {isOpen && node.children && node.children.length > 0 && (
          <ul>
            {node.children.map((child) => (
              <TreeNode key={child.id} node={child} depth={depth + 1} />
            ))}
          </ul>
        )}
      </li>
    )
  }

  const { Icon, color } = fileIcon(node)
  const selected = selectedFile === node.id
  return (
    <li>
      <button
        onClick={() => selectFile(node.id)}
        aria-current={selected}
        className={cn(
          'flex w-full items-center gap-1.5 rounded-md py-1 pr-2 text-sm transition-colors',
          selected
            ? 'bg-primary/15 text-foreground'
            : 'text-foreground/80 hover:bg-panel-3',
        )}
        style={{ paddingLeft: `${depth * 12 + 24}px` }}
      >
        <Icon className={cn('size-4 shrink-0', color)} />
        <span className="truncate">{node.name}</span>
        <GitBadge status={node.git ?? null} />
      </button>
    </li>
  )
}

export function FileTree() {
  const { workspaceIndex, searchQuery } = useOrbit()
  const allNodes = workspaceIndex ? workspaceIndex.nodes.map(toFileNode) : FILE_TREE
  const nodes = filterFileNodes(allNodes, searchQuery)

  return (
    <div>
      <p className="px-2 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        Explorador
      </p>
      <ul className="space-y-0.5">
        {nodes.length > 0 ? (
          nodes.map((node) => <TreeNode key={node.id} node={node} depth={0} />)
        ) : (
          <li className="px-2 py-2 text-xs text-muted-foreground">Sin coincidencias</li>
        )}
      </ul>
    </div>
  )
}
