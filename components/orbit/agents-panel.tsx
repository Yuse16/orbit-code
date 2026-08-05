'use client'

/**
 * Panel de agentes en ejecución (simulado).
 * [tauri] Reemplazar AGENTS por el estado en vivo de los procesos/agentes
 * lanzados por el motor. El progreso animado es puramente decorativo aquí.
 */

import { useEffect, useState } from 'react'
import { Loader2, FileCode2 } from 'lucide-react'
import { AGENTS } from '@/lib/orbit/mock-data'
import type { AgentTask } from '@/lib/orbit/types'
import { ProgressBar } from './primitives'
import { AgentGlyph } from './agent-glyph'

/** Anima ligeramente el progreso para dar sensación de trabajo en curso. */
function useLiveProgress(base: number) {
  const [value, setValue] = useState(base)
  useEffect(() => {
    const t = setInterval(() => {
      setValue((v) => {
        const next = v + Math.random() * 1.5 - 0.4
        return Math.max(base - 3, Math.min(97, next))
      })
    }, 1200)
    return () => clearInterval(t)
  }, [base])
  return Math.round(value)
}

function AgentRow({ agent, detailed }: { agent: AgentTask; detailed?: boolean }) {
  const progress = useLiveProgress(agent.progress)
  return (
    <div className="flex items-center gap-3 px-4 py-2.5">
      <AgentGlyph id={agent.id} tone={agent.tone} />
      <div className="w-28 shrink-0">
        <p className="text-sm font-medium text-foreground">{agent.name}</p>
        <p className="truncate text-xs text-muted-foreground">{agent.status}</p>
      </div>
      <div className="flex-1">
        <ProgressBar value={progress} tone={agent.tone} />
        {detailed && (
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
            {agent.files.map((f) => (
              <span
                key={f}
                className="inline-flex items-center gap-1 rounded bg-panel-3 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground"
              >
                <FileCode2 className="size-2.5" />
                {f.split('/').pop()}
              </span>
            ))}
          </div>
        )}
      </div>
      <span className="w-10 shrink-0 text-right font-mono text-xs text-muted-foreground">
        {progress}%
      </span>
      <div className="hidden w-44 shrink-0 items-center gap-1.5 md:flex">
        <Loader2 className="size-3 shrink-0 animate-spin text-muted-foreground" />
        <span className="truncate text-xs text-muted-foreground">{agent.action}</span>
      </div>
      <span className="ml-auto size-2 shrink-0 rounded-full bg-success shadow-[0_0_8px] shadow-success/60" />
    </div>
  )
}

/** Fila compacta usada en el dock inferior (coincide con la imagen). */
export function AgentsDockList() {
  return (
    <div className="divide-y divide-border/50">
      {AGENTS.map((a) => (
        <AgentRow key={a.id} agent={a} />
      ))}
    </div>
  )
}

/** Vista completa usada en la pestaña Agentes del workbench. */
export function AgentsPanel() {
  return (
    <div className="flex h-full flex-col">
      <header className="border-b border-border px-4 py-3">
        <h2 className="text-sm font-semibold text-foreground">Agentes en ejecución</h2>
        <p className="text-xs text-muted-foreground">
          Orquestación simulada de tareas. Cada agente representa un proceso del motor.
        </p>
      </header>
      <div className="flex-1 divide-y divide-border/50 overflow-auto">
        {AGENTS.map((a) => (
          <AgentRow key={a.id} agent={a} detailed />
        ))}
      </div>
    </div>
  )
}
