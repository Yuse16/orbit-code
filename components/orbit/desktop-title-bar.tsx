'use client'

import { PanelLeft, PanelRight, Circle } from 'lucide-react'
import { useOrbit } from './orbit-store'
import { Tooltip } from './primitives'
import { cn } from '@/lib/utils'

const STATUS_COLOR = {
  success: 'text-success',
  warning: 'text-warning',
  danger: 'text-danger',
  primary: 'text-primary',
}

/**
 * Barra de título estilo aplicación de escritorio (macOS).
 * INTEGRACIÓN FUTURA: los controles de ventana deben enlazarse con la
 * API de ventana de Tauri (minimizar / maximizar / cerrar).
 */
export function DesktopTitleBar() {
  const {
    projectName,
    projectPath,
    branch,
    framework,
    platformLabel,
    activeProviderLabel,
    generalStatus,
  } = useOrbit()

  return (
    <header className="flex h-9 shrink-0 items-center justify-between border-b border-border bg-titlebar px-3 select-none">
      {/* Controles de ventana macOS */}
      <div className="flex items-center gap-2">
        <span className="group flex items-center gap-2">
          <span className="size-3 rounded-full bg-[#ff5f57]" aria-hidden />
          <span className="size-3 rounded-full bg-[#febc2e]" aria-hidden />
          <span className="size-3 rounded-full bg-[#28c840]" aria-hidden />
          <span className="sr-only">Controles de ventana</span>
        </span>
      </div>

      {/* Mission Control: ubicación, runtime y estado general. */}
      <div className="pointer-events-none absolute left-1/2 flex -translate-x-1/2 items-center gap-1.5 truncate text-xs font-medium text-muted-foreground">
        <span className="truncate" title={projectPath}>{projectName}</span>
        <span aria-hidden>·</span>
        <span>{branch}</span>
        <span aria-hidden>·</span>
        <span>{framework}</span>
        <span aria-hidden>·</span>
        <span>{platformLabel}</span>
        <span aria-hidden>·</span>
        <span>{activeProviderLabel}</span>
      </div>

      {/* Estado + toggles de panel */}
      <div className="flex items-center gap-1">
        <span className="mr-1 flex items-center gap-1.5 text-xs text-muted-foreground">
          <Circle className={cn('size-2 fill-current', STATUS_COLOR[generalStatus.tone])} />
          {generalStatus.label}
        </span>
        <Tooltip label="Panel izquierdo" side="bottom">
          <button className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-panel-3 hover:text-foreground">
            <PanelLeft className="size-4" />
          </button>
        </Tooltip>
        <Tooltip label="Panel derecho" side="bottom">
          <button className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-panel-3 hover:text-foreground">
            <PanelRight className="size-4" />
          </button>
        </Tooltip>
      </div>
    </header>
  )
}
