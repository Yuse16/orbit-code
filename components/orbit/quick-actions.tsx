'use client'

import { ScanSearch, Sparkles, Bug, FlaskConical } from 'lucide-react'
import { useOrbit } from './orbit-store'

const ACTIONS = [
  { id: 'revisar', label: 'Revisar proyecto', icon: ScanSearch },
  { id: 'interfaz', label: 'Crear interfaz', icon: Sparkles },
  { id: 'error', label: 'Corregir error', icon: Bug },
  { id: 'pruebas', label: 'Ejecutar pruebas', icon: FlaskConical },
] as const

export function QuickActions() {
  const { quickAction } = useOrbit()

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      {ACTIONS.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          onClick={() => quickAction(id)}
          className="flex items-center justify-center gap-2 rounded-lg border border-border bg-panel-2 px-2.5 py-2 text-[13px] font-medium text-foreground/90 transition-colors hover:border-primary/40 hover:bg-panel-3"
        >
          <Icon className="size-4 text-muted-foreground" />
          <span className="truncate">{label}</span>
        </button>
      ))}
    </div>
  )
}
