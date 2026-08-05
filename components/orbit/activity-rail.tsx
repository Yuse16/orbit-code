'use client'

import { useState } from 'react'
import {
  Files,
  Search,
  GitBranch,
  Play,
  LayoutGrid,
  Settings,
  HelpCircle,
} from 'lucide-react'
import { Tooltip } from './primitives'
import { cn } from '@/lib/utils'

const ITEMS = [
  { id: 'files', label: 'Explorador', icon: Files },
  { id: 'search', label: 'Buscar', icon: Search },
  { id: 'git', label: 'Control de código', icon: GitBranch },
  { id: 'run', label: 'Ejecutar', icon: Play },
  { id: 'ext', label: 'Extensiones', icon: LayoutGrid },
] as const

export function ActivityRail() {
  const [active, setActive] = useState<string>('files')

  return (
    <nav
      aria-label="Barra de actividad"
      className="flex w-12 shrink-0 flex-col items-center justify-between border-r border-border bg-titlebar py-3"
    >
      <ul className="flex flex-col items-center gap-1">
        {ITEMS.map(({ id, label, icon: Icon }) => (
          <li key={id}>
            <Tooltip label={label} side="right">
              <button
                onClick={() => setActive(id)}
                aria-label={label}
                aria-pressed={active === id}
                className={cn(
                  'relative flex size-9 items-center justify-center rounded-lg transition-colors',
                  active === id
                    ? 'text-foreground'
                    : 'text-muted-foreground hover:bg-panel-3 hover:text-foreground',
                )}
              >
                {active === id && (
                  <span className="absolute left-0 h-5 w-0.5 -translate-x-2 rounded-full bg-primary" />
                )}
                <Icon className="size-5" />
              </button>
            </Tooltip>
          </li>
        ))}
      </ul>

      <ul className="flex flex-col items-center gap-1">
        <li>
          <Tooltip label="Configuración" side="right">
            <button
              aria-label="Configuración"
              className="flex size-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-panel-3 hover:text-foreground"
            >
              <Settings className="size-5" />
            </button>
          </Tooltip>
        </li>
        <li>
          <Tooltip label="Ayuda" side="right">
            <button
              aria-label="Ayuda"
              className="flex size-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-panel-3 hover:text-foreground"
            >
              <HelpCircle className="size-5" />
            </button>
          </Tooltip>
        </li>
      </ul>
    </nav>
  )
}
