'use client'

import { Search, ChevronDown, Settings, HelpCircle } from 'lucide-react'
import { OrbitLogo } from './orbit-logo'
import { ProjectSelector } from './project-selector'
import { FileTree } from './file-tree'
import { useOrbit } from './orbit-store'
import { GitPanel } from './git-panel'
import { RecentProjects } from './recent-projects'
import {
  Dropdown,
  DropdownContent,
  DropdownItem,
  DropdownSeparator,
  DropdownTrigger,
  Tooltip,
} from './primitives'

export function ProjectExplorer() {
  const { searchQuery, setSearchQuery } = useOrbit()

  return (
    <aside className="flex w-[276px] shrink-0 flex-col border-r border-border bg-panel">
      {/* Encabezado con marca */}
      <div className="flex items-center gap-2 px-3 py-3">
        <OrbitLogo className="size-6" />
        <span className="text-sm font-semibold tracking-tight">Orbit Code</span>
        <Dropdown>
          <DropdownTrigger
            ariaLabel="Menú de la aplicación"
            className="ml-auto rounded-md p-1 text-muted-foreground transition-colors hover:bg-panel-3 hover:text-foreground"
          >
            <ChevronDown className="size-4" />
          </DropdownTrigger>
          <DropdownContent align="end">
            <DropdownItem>Nuevo proyecto</DropdownItem>
            <DropdownItem>Clonar repositorio</DropdownItem>
            <DropdownSeparator />
            <DropdownItem>Preferencias</DropdownItem>
            <DropdownItem>Acerca de Orbit Code</DropdownItem>
          </DropdownContent>
        </Dropdown>
      </div>

      {/* Selector de proyecto */}
      <div className="px-3">
        <ProjectSelector />
      </div>

      {/* Búsqueda */}
      <div className="px-3 py-3">
        <div className="flex items-center gap-2 rounded-lg border border-border bg-panel-2 px-2.5 py-1.5">
          <Search className="size-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar archivos…"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className="min-w-0 flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
            aria-label="Buscar archivos"
          />
          <kbd className="rounded border border-border bg-panel-3 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Cuerpo desplazable */}
      <div className="orbit-scroll flex-1 overflow-y-auto px-2">
        <FileTree />
        <GitPanel />
        <RecentProjects />
      </div>

      {/* Pie: usuario */}
      <div className="flex items-center gap-2.5 border-t border-border px-3 py-2.5">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-violet text-sm font-semibold text-primary-foreground">
          U
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium text-foreground">
            Usuario
          </span>
          <span className="block truncate text-[11px] text-muted-foreground">
            Perfil local · Plan Pro
          </span>
        </span>
        <Tooltip label="Configuración" side="top">
          <button className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-panel-3 hover:text-foreground">
            <Settings className="size-4" />
          </button>
        </Tooltip>
        <Tooltip label="Ayuda" side="top">
          <button className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-panel-3 hover:text-foreground">
            <HelpCircle className="size-4" />
          </button>
        </Tooltip>
      </div>
    </aside>
  )
}
