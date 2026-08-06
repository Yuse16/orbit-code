'use client'

import {
  Hexagon,
  Boxes,
  Route,
  Zap,
  ChevronDown,
  ShieldCheck,
  CircleDollarSign,
  Cpu,
  type LucideIcon,
} from 'lucide-react'
import { ENGINES, ENGINE_OPTIONS } from '@/lib/orbit/mock-data'
import type { ConnectionState } from '@/lib/orbit/types'
import { useOrbit } from './orbit-store'
import {
  Dropdown,
  DropdownContent,
  DropdownItem,
  DropdownLabel,
  DropdownTrigger,
  Tooltip,
} from './primitives'
import { cn } from '@/lib/utils'

const ENGINE_ICON: Record<string, { icon: LucideIcon; color: string }> = {
  codex: { icon: Hexagon, color: 'text-primary' },
  opencode: { icon: Boxes, color: 'text-success' },
  openrouter: { icon: Route, color: 'text-violet' },
  v0: { icon: Zap, color: 'text-warning' },
}

const DOT: Record<ConnectionState, string> = {
  conectado: 'bg-success',
  limitado: 'bg-warning',
  desconectado: 'bg-danger',
}

export function ModelStatusPanel() {
  const { engine, setEngine, connection, cycleConnection, providerStates } = useOrbit()

  const globalLabel =
    connection === 'conectado'
      ? 'Conectado'
      : connection === 'limitado'
        ? 'Limitado'
        : 'Desconectado'

  return (
    <section className="rounded-xl border border-border bg-panel-2 p-3.5">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Motores y herramientas
        </span>
        <button
          onClick={cycleConnection}
          className={cn(
            'flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium transition-colors',
            connection === 'conectado'
              ? 'text-success'
              : connection === 'limitado'
                ? 'text-warning'
                : 'text-danger',
          )}
          title="Cambiar estado de conexión (simulado)"
        >
          <span className={cn('size-2 rounded-full', DOT[connection])} />
          {globalLabel}
        </button>
      </div>

      {/* Chips de motores */}
      <div className="mt-3 grid grid-cols-2 gap-2">
        {ENGINES.map((e) => {
          const meta = ENGINE_ICON[e.id]
          const Icon = meta.icon
          const state = providerStates[e.id] ?? 'desconectado'
          return (
            <Tooltip key={e.id} label={e.description} side="top">
              <div className="flex w-full items-center gap-2 rounded-lg border border-border bg-panel px-2.5 py-2">
                <Icon className={cn('size-4 shrink-0', meta.color)} />
                <span className="truncate text-[13px] font-medium">{e.name}</span>
                <span
                  className={cn('ml-auto size-2 rounded-full', DOT[state])}
                  aria-label={state}
                />
              </div>
            </Tooltip>
          )
        })}
      </div>

      {/* Estado del motor actual */}
      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 border-t border-border pt-3 text-[13px]">
        <Dropdown>
          <DropdownTrigger
            ariaLabel="Cambiar motor"
            className="flex items-center gap-1.5 rounded-md px-1.5 py-0.5 text-foreground transition-colors hover:bg-panel-3"
          >
            <Cpu className="size-4 text-primary" />
            <span className="text-muted-foreground">Motor actual:</span>
            <span className="font-semibold">{engine}</span>
            <ChevronDown className="size-3.5 text-muted-foreground" />
          </DropdownTrigger>
          <DropdownContent>
            <DropdownLabel>Cambiar motor</DropdownLabel>
            {ENGINE_OPTIONS.map((opt) => (
              <DropdownItem
                key={opt}
                active={opt === engine}
                onSelect={() => setEngine(opt)}
              >
                {opt}
              </DropdownItem>
            ))}
          </DropdownContent>
        </Dropdown>

        <span className="flex items-center gap-1.5 text-muted-foreground">
          <CircleDollarSign className="size-4" />
          Costo: <span className="font-medium text-success">$0</span>
        </span>
        <span className="flex items-center gap-1.5 text-muted-foreground">
          <ShieldCheck className="size-4" />
          Privacidad: <span className="font-medium text-foreground">Alta</span>
        </span>
      </div>
    </section>
  )
}
