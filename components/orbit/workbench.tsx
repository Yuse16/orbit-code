'use client'

/**
 * Workbench derecho: pestañas Vista previa / Código / Cambios / Terminal / Agentes.
 * Todas las vistas son simuladas. La pestaña "Vista previa" contiene el
 * dashboard blanco de U-Zala, que representa el contenido de localhost:3000.
 */

import { DIFFS } from '@/lib/orbit/mock-data'
import type { WorkbenchTab } from '@/lib/orbit/types'
import { cn } from '@/lib/utils'
import { useOrbit } from './orbit-store'
import { LocalhostPreview } from './localhost-preview'
import { CodeView } from './code-view'
import { ChangesView } from './changes-view'
import { TerminalView } from './terminal-view'
import { AgentsPanel } from './agents-panel'

const TABS: { id: WorkbenchTab; label: string; badge?: number }[] = [
  { id: 'preview', label: 'Vista previa' },
  { id: 'code', label: 'Código' },
  { id: 'changes', label: 'Cambios', badge: DIFFS.length },
  { id: 'terminal', label: 'Terminal' },
  { id: 'agents', label: 'Agentes' },
]

export function Workbench() {
  const { tab, setTab } = useOrbit()

  return (
    <section
      className="flex min-w-0 flex-1 flex-col bg-panel-1"
      aria-label="Área de trabajo"
    >
      <div
        role="tablist"
        aria-label="Vistas del área de trabajo"
        className="flex items-center gap-1 border-b border-border px-3"
      >
        {TABS.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              'relative flex items-center gap-1.5 px-3 py-3 text-sm font-medium transition-colors',
              tab === t.id
                ? 'text-foreground'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {t.label}
            {t.badge ? (
              <span className="flex min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground">
                {t.badge}
              </span>
            ) : null}
            {tab === t.id && (
              <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-primary" />
            )}
          </button>
        ))}
      </div>

      <div className="min-h-0 flex-1">
        {tab === 'preview' && <LocalhostPreview />}
        {tab === 'code' && <CodeView />}
        {tab === 'changes' && <ChangesView />}
        {tab === 'terminal' && <TerminalView />}
        {tab === 'agents' && <AgentsPanel />}
      </div>
    </section>
  )
}
