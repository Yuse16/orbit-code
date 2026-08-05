'use client'

/**
 * Dock inferior: mitad izquierda "Agentes en ejecución", mitad derecha
 * "Terminal". Coincide con la franja inferior de la imagen de referencia.
 * Es colapsable y expandible (simulado).
 */

import { ChevronDown, ChevronUp, RefreshCw } from 'lucide-react'
import { AGENTS } from '@/lib/orbit/mock-data'
import { useOrbit } from './orbit-store'
import { AgentsDockList } from './agents-panel'
import { TerminalView } from './terminal-view'

export function ActivityDock() {
  const { dockOpen, setDockOpen } = useOrbit()

  return (
    <div className="border-t border-border bg-panel-1">
      {dockOpen ? (
        <div className="grid h-64 grid-cols-1 lg:grid-cols-2">
          {/* Agentes en ejecución */}
          <div className="flex min-h-0 flex-col border-b border-border lg:border-b-0 lg:border-r">
            <header className="flex items-center justify-between px-4 py-2.5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Agentes en ejecución
                </span>
                <span className="flex size-4 items-center justify-center rounded-full bg-violet/20 text-[10px] font-semibold text-violet">
                  {AGENTS.length}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-panel-3 hover:text-foreground"
                  aria-label="Reiniciar agentes"
                >
                  <RefreshCw className="size-3.5" />
                </button>
                <button
                  onClick={() => setDockOpen(false)}
                  className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-panel-3 hover:text-foreground"
                  aria-label="Contraer panel inferior"
                >
                  <ChevronDown className="size-4" />
                </button>
              </div>
            </header>
            <div className="min-h-0 flex-1 overflow-auto">
              <AgentsDockList />
            </div>
          </div>

          {/* Terminal */}
          <div className="min-h-0">
            <TerminalView compact />
          </div>
        </div>
      ) : (
        <button
          onClick={() => setDockOpen(true)}
          className="flex w-full items-center justify-between px-4 py-2 text-left transition-colors hover:bg-panel-2"
          aria-label="Expandir panel inferior"
        >
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-2">
              <span className="size-2 animate-pulse rounded-full bg-violet" />
              {AGENTS.length} agentes activos
            </span>
            <span className="hidden sm:inline">Terminal: bash</span>
          </div>
          <ChevronUp className="size-4 text-muted-foreground" />
        </button>
      )}
    </div>
  )
}
