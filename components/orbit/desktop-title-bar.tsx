'use client'

import { PanelLeft, PanelRight, Circle } from 'lucide-react'
import { useOrbit } from './orbit-store'
import { Tooltip } from './primitives'
import { cn } from '@/lib/utils'

/**
 * Barra de título estilo aplicación de escritorio (macOS).
 * INTEGRACIÓN FUTURA: los controles de ventana deben enlazarse con la
 * API de ventana de Tauri (minimizar / maximizar / cerrar).
 */
export function DesktopTitleBar() {
  const { connection } = useOrbit()

  const connMeta = {
    conectado: { color: 'text-success', label: 'Conectado' },
    limitado: { color: 'text-warning', label: 'Limitado' },
    desconectado: { color: 'text-danger', label: 'Desconectado' },
  }[connection]

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

      {/* Título centrado */}
      <div className="pointer-events-none absolute left-1/2 -translate-x-1/2 text-xs font-medium text-muted-foreground">
        Orbit Code — {'/Users/usuario/Proyectos'}
      </div>

      {/* Estado + toggles de panel */}
      <div className="flex items-center gap-1">
        <span className="mr-1 flex items-center gap-1.5 text-xs text-muted-foreground">
          <Circle className={cn('size-2 fill-current', connMeta.color)} />
          {connMeta.label}
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
