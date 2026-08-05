'use client'

import { ChevronDown } from 'lucide-react'
import { STAGES } from '@/lib/orbit/mock-data'
import { useOrbit } from './orbit-store'
import { cn } from '@/lib/utils'

export function StageSelector() {
  const { stage, setStage } = useOrbit()
  const current = STAGES.find((s) => s.id === stage)!

  return (
    <div>
      <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        Etapa actual del proyecto
        <ChevronDown className="size-3.5" />
      </div>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {STAGES.map((s) => (
          <button
            key={s.id}
            onClick={() => setStage(s.id)}
            aria-pressed={s.id === stage}
            className={cn(
              'rounded-full border px-3 py-1 text-[13px] font-medium transition-colors',
              s.id === stage
                ? 'border-primary/60 bg-primary/15 text-primary'
                : 'border-border bg-panel-2 text-muted-foreground hover:bg-panel-3 hover:text-foreground',
            )}
          >
            {s.label}
          </button>
        ))}
      </div>
      <p className="mt-2 text-[13px] text-muted-foreground text-pretty">
        {current.help}
      </p>
    </div>
  )
}
