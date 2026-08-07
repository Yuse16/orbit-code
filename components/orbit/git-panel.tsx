'use client'

import {
  GitBranch,
  ArrowUp,
  ArrowDown,
  Check,
  MoreHorizontal,
  GitCommitHorizontal,
  History,
  Undo2,
  Plus,
} from 'lucide-react'
import { useOrbit } from './orbit-store'
import {
  Dropdown,
  DropdownContent,
  DropdownItem,
  DropdownLabel,
  DropdownSeparator,
  DropdownTrigger,
} from './primitives'
import { cn } from '@/lib/utils'
import type { GitChangeStatus } from '@/lib/mission-control/types.mts'

const STATUS_COLOR: Record<GitChangeStatus, string> = {
  M: 'text-warning',
  A: 'text-success',
  D: 'text-danger',
  '?': 'text-muted-foreground',
}

const BRANCHES = ['main', 'feat/promociones', 'fix/tarjetas']

export function GitPanel() {
  const { branch, pendingChanges, gitChanges, setBranch, selectFile, setTab } = useOrbit()

  return (
    <section className="border-t border-border px-2 py-3">
      <div className="flex items-center justify-between px-1">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Git
        </span>
        <Dropdown>
          <DropdownTrigger
            ariaLabel="Acciones de Git"
            className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-panel-3 hover:text-foreground"
          >
            <MoreHorizontal className="size-4" />
          </DropdownTrigger>
          <DropdownContent align="end">
            <DropdownLabel>Control de código</DropdownLabel>
            <DropdownItem icon={<Plus className="size-4" />}>Crear rama</DropdownItem>
            <DropdownItem
              icon={<History className="size-4" />}
              onSelect={() => setTab('changes')}
            >
              Ver cambios
            </DropdownItem>
            <DropdownItem icon={<Undo2 className="size-4" />}>Restaurar</DropdownItem>
            <DropdownSeparator />
            <DropdownItem icon={<GitCommitHorizontal className="size-4" />}>
              Preparar commit
            </DropdownItem>
          </DropdownContent>
        </Dropdown>
      </div>

      {/* Rama actual */}
      <Dropdown>
        <DropdownTrigger
          ariaLabel="Cambiar rama"
          className="mt-2 flex w-full items-center gap-2 rounded-md border border-border bg-panel-2 px-2 py-1.5 text-sm transition-colors hover:bg-panel-3"
        >
          <GitBranch className="size-4 text-primary" />
          <span className="font-medium">{branch}</span>
          <span className="ml-auto flex items-center gap-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-0.5">
              <ArrowUp className="size-3" />2
            </span>
            <span className="flex items-center gap-0.5">
              <ArrowDown className="size-3" />1
            </span>
            <Check className="size-3.5 text-success" />
          </span>
        </DropdownTrigger>
        <DropdownContent>
          <DropdownLabel>Cambiar rama</DropdownLabel>
          {BRANCHES.map((b) => (
            <DropdownItem
              key={b}
              active={b === branch}
              onSelect={() => setBranch(b)}
              icon={<GitBranch className="size-4" />}
            >
              {b}
            </DropdownItem>
          ))}
        </DropdownContent>
      </Dropdown>

      {/* Lista de cambios */}
      <p className="mt-3 px-1 text-xs text-muted-foreground">Cambios ({pendingChanges})</p>
      <ul className="mt-1 space-y-0.5">
        {gitChanges.map((c) => (
          <li key={c.path}>
            <button
              onClick={() => selectFile(c.path)}
              className="flex w-full items-center gap-2 rounded-md px-1.5 py-1 text-left text-[13px] text-foreground/80 transition-colors hover:bg-panel-3"
            >
              <span
                className={cn(
                  'w-3 shrink-0 text-center text-[11px] font-bold',
                  STATUS_COLOR[c.status],
                )}
              >
                {c.status}
              </span>
              <span className="truncate">{c.path}</span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}
