'use client'

/**
 * Vista de Cambios (diff simulado).
 * [tauri] Reemplazar DIFFS por `git diff` real del repositorio abierto.
 */

import { useState } from 'react'
import { FilePlus2, FileText, Check, Clock, CircleX, GitCommitHorizontal } from 'lucide-react'
import { DIFFS } from '@/lib/orbit/mock-data'
import type { DiffFile, GitStatus } from '@/lib/orbit/types'
import { cn } from '@/lib/utils'
import { useOrbit } from './orbit-store'

const STATUS_STYLE: Record<Exclude<GitStatus, null>, string> = {
  M: 'text-warning',
  A: 'text-success',
  D: 'text-destructive',
}

function TestedBadge({ tested }: { tested: DiffFile['tested'] }) {
  if (tested === 'ok')
    return (
      <span className="inline-flex items-center gap-1 text-xs text-success">
        <Check className="size-3" /> Probado
      </span>
    )
  if (tested === 'pendiente')
    return (
      <span className="inline-flex items-center gap-1 text-xs text-warning">
        <Clock className="size-3" /> Pendiente
      </span>
    )
  return (
    <span className="inline-flex items-center gap-1 text-xs text-destructive">
      <CircleX className="size-3" /> Error
    </span>
  )
}

function lineStyle(type: string) {
  switch (type) {
    case 'add':
      return 'bg-success/10 text-success before:content-["+"]'
    case 'del':
      return 'bg-destructive/10 text-destructive before:content-["-"]'
    case 'meta':
      return 'text-primary before:content-["\\00a0"]'
    default:
      return 'text-muted-foreground before:content-["\\00a0"]'
  }
}

export function ChangesView() {
  const { setDialog } = useOrbit()
  const [active, setActive] = useState(DIFFS[0].id)
  const file = DIFFS.find((d) => d.id === active)!

  return (
    <div className="flex h-full min-h-0">
      {/* Lista de archivos modificados */}
      <div className="flex w-64 shrink-0 flex-col border-r border-border">
        <div className="flex items-center justify-between px-3 py-2.5">
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Archivos ({DIFFS.length})
          </span>
        </div>
        <ul className="flex-1 overflow-auto px-2 pb-2">
          {DIFFS.map((d) => (
            <li key={d.id}>
              <button
                onClick={() => setActive(d.id)}
                className={cn(
                  'flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm transition-colors',
                  active === d.id ? 'bg-panel-3 text-foreground' : 'text-muted-foreground hover:bg-panel-2 hover:text-foreground',
                )}
              >
                {d.git === 'A' ? (
                  <FilePlus2 className="size-4 shrink-0 text-success" />
                ) : (
                  <FileText className="size-4 shrink-0 text-muted-foreground" />
                )}
                <span className="flex-1 truncate">{d.path.split('/').pop()}</span>
                <span className="font-mono text-[11px] text-success">+{d.additions}</span>
                <span className="font-mono text-[11px] text-destructive">-{d.deletions}</span>
              </button>
            </li>
          ))}
        </ul>
        <div className="border-t border-border p-3">
          <button
            onClick={() => setDialog('commit')}
            className="flex w-full items-center justify-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <GitCommitHorizontal className="size-4" />
            Preparar commit
          </button>
        </div>
      </div>

      {/* Diff del archivo activo */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-border px-4 py-2.5">
          <div className="flex items-center gap-2 min-w-0">
            <span className={cn('font-mono text-xs font-bold', STATUS_STYLE[file.git ?? 'M'])}>
              {file.git}
            </span>
            <span className="truncate font-mono text-sm text-foreground">{file.path}</span>
          </div>
          <TestedBadge tested={file.tested} />
        </header>
        <div className="flex-1 overflow-auto bg-editor font-mono text-[13px] leading-relaxed">
          {file.hunks.map((h, i) => (
            <div
              key={i}
              className={cn(
                'whitespace-pre px-4 before:mr-2 before:inline-block before:w-2 before:text-center',
                lineStyle(h.type),
              )}
            >
              {h.text}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
