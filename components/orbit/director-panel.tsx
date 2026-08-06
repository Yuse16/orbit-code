'use client'

/**
 * Panel "Plan" del Director (simulado).
 * Escribe un objetivo y elige una política para ver el ExecutionPlan que el
 * Director produce: modelos recomendados, costo, tiempo, aprobación y razones.
 */

import { useState } from 'react'
import {
  AlignLeft,
  Boxes,
  CircleDollarSign,
  Clock3,
  Compass,
  Gauge,
  ListChecks,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Wand2,
  type LucideIcon,
} from 'lucide-react'
import type { DecisionPolicyId, ExecutionPlan } from '@/lib/director/index.mts'
import { cn } from '@/lib/utils'
import { useOrbit } from './orbit-store'

const POLICY_OPTIONS: ReadonlyArray<{ id: DecisionPolicyId; label: string; hint: string }> = [
  { id: 'balanced', label: 'Equilibrado', hint: 'Costo, calidad y velocidad.' },
  { id: 'minimum-cost', label: 'Costo mínimo', hint: 'Menor costo posible.' },
  { id: 'maximum-quality', label: 'Calidad máxima', hint: 'Máxima calidad posible.' },
  { id: 'offline', label: 'Modo offline', hint: 'Solo modelos locales.' },
  { id: 'fast', label: 'Modo rápido', hint: 'Minimiza el tiempo.' },
  { id: 'safe', label: 'Modo seguro', hint: 'Exige aprobación.' },
]

const PRESETS: ReadonlyArray<{ label: string; objective: string }> = [
  { label: 'Interfaz', objective: 'Construir la interfaz del dashboard con datos simulados' },
  { label: 'API', objective: 'Implementar la API de pagos' },
  { label: 'Pruebas', objective: 'Agregar pruebas al pipeline' },
  { label: 'Refactor', objective: 'Refactorizar el módulo de autenticación' },
]

const MODEL_COLOR: Record<string, string> = {
  v0: 'border-warning/30 bg-warning/10 text-warning',
  codex: 'border-primary/30 bg-primary/10 text-primary',
  opencode: 'border-success/30 bg-success/10 text-success',
  chatgpt: 'border-violet/30 bg-violet/10 text-violet',
  claude: 'border-violet/30 bg-violet/10 text-violet',
  gemini: 'border-violet/30 bg-violet/10 text-violet',
  'local-model': 'border-border bg-panel-3 text-muted-foreground',
}

const MODEL_ICON: Record<string, LucideIcon> = {
  v0: Sparkles,
  codex: Boxes,
  opencode: Compass,
  'local-model': Gauge,
}

function Stat({ icon: Icon, label, value, tone }: { icon: LucideIcon; label: string; value: string; tone?: string }) {
  return (
    <div className="rounded-lg border border-border bg-panel p-3">
      <div className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
        <Icon className="size-3.5" />
        {label}
      </div>
      <p className={cn('mt-1 font-mono text-lg font-semibold', tone ?? 'text-foreground')}>{value}</p>
    </div>
  )
}

function ModelRow({ model, title, reason }: { model: string; title: string; reason: string }) {
  const Icon = MODEL_ICON[model] ?? Compass
  return (
    <li className="flex items-start gap-3 rounded-lg border border-border bg-panel px-3 py-2.5">
      <Icon className={cn('mt-0.5 size-4 shrink-0', MODEL_COLOR[model]?.split(' ').at(-1))} />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="truncate text-sm font-medium text-foreground">{title}</span>
          <span className={cn('rounded-full border px-2 py-0.5 font-mono text-[10px]', MODEL_COLOR[model] ?? MODEL_COLOR['local-model'])}>
            {model}
          </span>
        </div>
        <p className="mt-0.5 text-xs text-muted-foreground">{reason}</p>
      </div>
    </li>
  )
}

function TaskRow({ title, kind, stage, priority, dependencies }: { title: string; kind: string; stage: string; priority: string; dependencies: ReadonlyArray<string> }) {
  return (
    <li className="flex items-center justify-between gap-2 rounded-lg border border-border bg-panel px-3 py-2 text-sm">
      <div className="min-w-0">
        <p className="truncate text-foreground">{title}</p>
        <p className="text-xs text-muted-foreground">
          {kind} · {stage} · prioridad {priority}
        </p>
      </div>
      <span className="shrink-0 font-mono text-[10px] text-muted-foreground">
        {dependencies.length > 0 ? `depende de ${dependencies.join(', ')}` : 'sin dependencias'}
      </span>
    </li>
  )
}

function PlanView({ plan }: { plan: ExecutionPlan }) {
  const approval = plan.approvalRequired
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2 rounded-lg border border-border bg-panel-2 px-3 py-2.5">
        <span className="truncate font-mono text-xs text-muted-foreground">{plan.id}</span>
        <span className="ml-auto rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
          política {plan.policy}
        </span>
        <span className="flex items-center gap-1 rounded-full border border-border bg-panel-3 px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
          <Gauge className="size-3" />
          confianza {Math.round(plan.confidence * 100)}%
        </span>
        <span
          className={cn(
            'flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium',
            approval
              ? 'border-warning/40 bg-warning/10 text-warning'
              : 'border-success/40 bg-success/10 text-success',
          )}
        >
          {approval ? <ShieldAlert className="size-3" /> : <ShieldCheck className="size-3" />}
          {approval ? 'requiere aprobación' : 'sin aprobación'}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat icon={CircleDollarSign} label="Costo estimado" value={`$${plan.estimatedCost.toFixed(2)}`} tone="text-success" />
        <Stat icon={AlignLeft} label="Tokens" value={plan.estimatedTokens.toLocaleString('es-MX')} />
        <Stat icon={Clock3} label="Tiempo" value={`${plan.estimatedTimeMinutes} min`} />
        <Stat icon={ListChecks} label="Tareas" value={String(plan.parallelTasks.length + plan.sequentialTasks.length)} />
      </div>

      <section>
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Modelos recomendados
        </h3>
        <ul className="space-y-1.5">
          {plan.recommendedModels.map((recommendation) => (
            <ModelRow
              key={recommendation.taskId}
              model={recommendation.model}
              title={recommendation.taskTitle}
              reason={recommendation.reason}
            />
          ))}
        </ul>
      </section>

      {plan.parallelTasks.length > 0 && (
        <section>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Tareas en paralelo
          </h3>
          <ul className="space-y-1.5">
            {plan.parallelTasks.map((task) => (
              <TaskRow key={task.id} {...task} />
            ))}
          </ul>
        </section>
      )}

      {plan.sequentialTasks.length > 0 && (
        <section>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Tareas en secuencia
          </h3>
          <ul className="space-y-1.5">
            {plan.sequentialTasks.map((task) => (
              <TaskRow key={task.id} {...task} />
            ))}
          </ul>
        </section>
      )}

      <section className="rounded-lg border border-border bg-panel px-3 py-2.5">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Fallback</h3>
        <p className="mt-1 text-sm text-foreground">{plan.fallbackPlan}</p>
      </section>

      <details className="rounded-lg border border-border bg-panel px-3 py-2.5">
        <summary className="cursor-pointer text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Razones ({plan.reasons.length})
        </summary>
        <ul className="mt-2 space-y-1.5">
          {plan.reasons.map((reason) => (
            <li key={reason.id} className="flex gap-2 text-xs">
              <span className="w-20 shrink-0 font-mono text-muted-foreground">{reason.source}</span>
              <span className="min-w-0">
                <span className="text-foreground">{reason.summary}</span>
                <span className="text-muted-foreground"> — {reason.detail}</span>
              </span>
            </li>
          ))}
        </ul>
      </details>
    </div>
  )
}

export function DirectorPanel() {
  const { directorPlan, runDirector } = useOrbit()
  const [objective, setObjective] = useState('Construir la interfaz del dashboard con datos simulados')
  const [policy, setPolicy] = useState<DecisionPolicyId>('balanced')

  const generate = () => {
    if (!objective.trim()) return
    runDirector(objective.trim(), policy)
  }

  return (
    <div className="flex h-full flex-col">
      <header className="border-b border-border px-4 py-3">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <Wand2 className="size-4 text-primary" />
          Plan del Director
        </h2>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Simulado: clasifica la solicitud, elige modelos y estima costo, tiempo y aprobación sin ejecutar nada.
        </p>
      </header>

      <div className="flex flex-col gap-3 border-b border-border px-4 py-3">
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-muted-foreground">Objetivo</span>
          <input
            value={objective}
            onChange={(event) => setObjective(event.target.value)}
            onKeyDown={(event) => event.key === 'Enter' && generate()}
            placeholder="Describe qué quieres lograr…"
            className="w-full rounded-lg border border-border bg-panel px-3 py-2 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-primary"
          />
        </label>
        <div className="flex flex-wrap items-center gap-2">
          <label className="flex min-w-40 flex-1 flex-col">
            <span className="mb-1 block text-xs font-medium text-muted-foreground">Política</span>
            <select
              value={policy}
              onChange={(event) => setPolicy(event.target.value as DecisionPolicyId)}
              className="w-full rounded-lg border border-border bg-panel px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-primary"
            >
              {POLICY_OPTIONS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <button
            onClick={generate}
            className="ml-auto mt-5 flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            <Wand2 className="size-4" />
            Generar plan
          </button>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] text-muted-foreground">Ejemplos:</span>
          {PRESETS.map((preset) => (
            <button
              key={preset.label}
              onClick={() => {
                setObjective(preset.objective)
                runDirector(preset.objective, policy)
              }}
              className="rounded-full border border-border bg-panel px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:border-primary hover:text-primary"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-auto px-4 py-4">
        {directorPlan ? (
          <PlanView plan={directorPlan} />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
            <Wand2 className="size-8 text-muted-foreground/40" />
            <p className="text-sm font-medium text-foreground">Escribe un objetivo y genera el plan</p>
            <p className="max-w-sm text-xs text-muted-foreground">
              El Director devolverá un ExecutionPlan con modelos recomendados, costo, tiempo y aprobación.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
