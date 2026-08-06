'use client'

import { ChevronsUpDown, Folder, FolderOpen, Plus, Check } from 'lucide-react'
import { PROJECTS } from '@/lib/orbit/mock-data'
import { useOrbit } from './orbit-store'
import {
  Dropdown,
  DropdownContent,
  DropdownItem,
  DropdownLabel,
  DropdownSeparator,
  DropdownTrigger,
} from './primitives'

export function ProjectSelector() {
  const { projectId, setProject, openFolder, projectName, projectPath } = useOrbit()

  return (
    <Dropdown>
      <DropdownTrigger
        ariaLabel="Cambiar proyecto"
        className="flex w-full items-center gap-2.5 rounded-lg border border-border bg-panel-2 px-2.5 py-2 text-left transition-colors hover:bg-panel-3"
      >
        <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary/15 text-primary">
          <FolderOpen className="size-4" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-semibold text-foreground">
            {projectName}
          </span>
          <span className="block truncate font-mono text-[11px] text-muted-foreground">
            {projectPath}
          </span>
        </span>
        <ChevronsUpDown className="size-4 shrink-0 text-muted-foreground" />
      </DropdownTrigger>
      <DropdownContent className="w-[260px]">
        <DropdownLabel>Proyectos</DropdownLabel>
        {PROJECTS.map((p) => (
          <DropdownItem
            key={p.id}
            active={p.id === projectId}
            onSelect={() => setProject(p.id)}
            icon={<Folder className="size-4" />}
          >
            <span className="flex items-center justify-between gap-2">
              {p.name}
              {p.id === projectId && <Check className="size-3.5 text-primary" />}
            </span>
          </DropdownItem>
        ))}
        <DropdownSeparator />
        <DropdownItem icon={<Plus className="size-4" />} onSelect={() => void openFolder()}>
          Abrir otro proyecto
        </DropdownItem>
      </DropdownContent>
    </Dropdown>
  )
}
