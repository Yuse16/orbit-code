'use client'

import {
  Lock,
  RotateCw,
  ExternalLink,
  Maximize2,
  Monitor,
  Tablet,
  Smartphone,
  type LucideIcon,
} from 'lucide-react'
import type { Viewport } from '@/lib/orbit/types'
import { useOrbit } from './orbit-store'
import { Tooltip } from './primitives'
import { cn } from '@/lib/utils'

const VIEWPORTS: { id: Viewport; label: string; icon: LucideIcon }[] = [
  { id: 'desktop', label: 'Desktop', icon: Monitor },
  { id: 'tablet', label: 'Tablet', icon: Tablet },
  { id: 'movil', label: 'Móvil', icon: Smartphone },
]

export function ResponsivePreviewToolbar() {
  const { viewport, setViewport } = useOrbit()

  return (
    <div className="flex items-center gap-2 border-b border-border bg-panel px-3 py-2">
      {/* Barra de navegador interna */}
      <div className="flex flex-1 items-center gap-2 rounded-lg border border-border bg-panel-2 px-3 py-1.5">
        <Lock className="size-3.5 text-success" />
        <span className="font-mono text-[13px] text-foreground/90">localhost:3000</span>
        <div className="ml-auto flex items-center gap-0.5">
          <Tooltip label="Recargar" side="bottom">
            <button className="rounded p-1 text-muted-foreground transition-colors hover:bg-panel-3 hover:text-foreground">
              <RotateCw className="size-3.5" />
            </button>
          </Tooltip>
          <Tooltip label="Abrir en otra ventana" side="bottom">
            <button className="rounded p-1 text-muted-foreground transition-colors hover:bg-panel-3 hover:text-foreground">
              <ExternalLink className="size-3.5" />
            </button>
          </Tooltip>
          <Tooltip label="Expandir" side="bottom">
            <button className="rounded p-1 text-muted-foreground transition-colors hover:bg-panel-3 hover:text-foreground">
              <Maximize2 className="size-3.5" />
            </button>
          </Tooltip>
        </div>
      </div>

      {/* Selectores responsive */}
      <div className="flex items-center gap-0.5 rounded-lg border border-border bg-panel-2 p-0.5">
        {VIEWPORTS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setViewport(id)}
            aria-pressed={viewport === id}
            className={cn(
              'flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[13px] font-medium transition-colors',
              viewport === id
                ? 'bg-primary/20 text-primary'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            <Icon className="size-3.5" />
            {label}
          </button>
        ))}
      </div>
    </div>
  )
}
