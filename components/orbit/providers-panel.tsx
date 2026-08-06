'use client'

/**
 * Panel "Proveedores" (simulado).
 * Muestra el estado de las cuentas del ProviderManager: conexión, auth,
 * créditos, límite, costo estimado, modelos, velocidad y calidad. Permite
 * conectar/desconectar, iniciar/cerrar sesión, cambiar política y estimar
 * presupuesto. Todo es simulado; nada sale a APIs reales.
 */

import { useState } from 'react'
import {
  Boxes,
  CircleDollarSign,
  Cloud,
  CloudOff,
  HardDrive,
  KeyRound,
  LogIn,
  LogOut,
  Plug,
  PlugZap,
  Scale,
  Server,
  Sparkles,
  Unplug,
  Zap,
  type LucideIcon,
} from 'lucide-react'
import type { ModelId, ProviderPolicyId, ProviderSnapshot } from '@/lib/providers/index.mts'
import { cn } from '@/lib/utils'
import { useOrbit } from './orbit-store'

const POLICY_OPTIONS: ReadonlyArray<{ id: ProviderPolicyId; label: string }> = [
  { id: 'balanced', label: 'Equilibrado' },
  { id: 'minimum-cost', label: 'Costo mínimo' },
  { id: 'maximum-quality', label: 'Calidad máxima' },
  { id: 'offline', label: 'Offline' },
  { id: 'safe', label: 'Segura' },
  { id: 'fast', label: 'Rápida' },
]

const CATEGORY_ICON: Record<string, LucideIcon> = {
  cloud: Cloud,
  local: HardDrive,
  visual: Sparkles,
  aggregator: Server,
}

const CATEGORY_LABEL: Record<string, string> = {
  cloud: 'Nube',
  local: 'Local',
  visual: 'Visual',
  aggregator: 'Agregador',
}

function StatusBadge({ provider }: { provider: ProviderSnapshot }) {
  const tone = provider.connected
    ? 'border-success/40 bg-success/10 text-success'
    : 'border-border bg-panel-3 text-muted-foreground'
  const label = provider.connected ? 'conectado' : 'desconectado'
  return <span className={cn('rounded-full border px-2 py-0.5 text-[10px] font-medium', tone)}>{label}</span>
}

function Meter({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-12 text-[11px] text-muted-foreground">{label}</span>
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-panel-3">
        <div
          className={cn('h-full rounded-full', value >= 4 ? 'bg-success' : value >= 3 ? 'bg-primary' : 'bg-warning')}
          style={{ width: `${value * 20}%` }}
        />
      </div>
      <span className="w-4 text-right font-mono text-[11px] text-muted-foreground">{value}</span>
    </div>
  )
}

function ProviderCard({ provider }: { provider: ProviderSnapshot }) {
  const {
    connectProvider,
    disconnectProvider,
    loginProvider,
    logoutProvider,
  } = useOrbit()
  const Icon = CATEGORY_ICON[provider.category] ?? Server

  return (
    <article className="flex flex-col gap-3 rounded-lg border border-border bg-panel p-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-start gap-2.5">
          <Icon className="mt-0.5 size-4 shrink-0 text-primary" />
          <div className="min-w-0">
            <h3 className="truncate text-sm font-semibold text-foreground">{provider.name}</h3>
            <p className="text-[11px] text-muted-foreground">
              {provider.id} · {CATEGORY_LABEL[provider.category] ?? provider.category}
            </p>
          </div>
        </div>
        <StatusBadge provider={provider} />
      </div>

      <p className="line-clamp-2 text-xs text-muted-foreground">{provider.detail}</p>

      <dl className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs">
        <div className="flex items-center justify-between">
          <dt className="text-muted-foreground">Auth</dt>
          <dd className={cn('font-medium', provider.authenticated ? 'text-success' : 'text-warning')}>
            {provider.authenticated ? 'autenticado' : 'sin sesión'}
          </dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="text-muted-foreground">Estado</dt>
          <dd className="font-medium text-foreground">{provider.status}</dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="text-muted-foreground">Créditos</dt>
          <dd className="font-mono text-foreground">
            {provider.creditsAvailable === null ? '—' : provider.creditsAvailable}
          </dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="text-muted-foreground">Límite</dt>
          <dd className="font-mono text-foreground">{provider.limit}</dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="text-muted-foreground">Costo</dt>
          <dd className="font-mono text-foreground">${provider.estimatedCost.toFixed(2)}</dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="text-muted-foreground">Modelos</dt>
          <dd className="font-mono text-foreground">{provider.models.length}</dd>
        </div>
      </dl>

      <div className="space-y-1.5">
        <Meter label="Velocidad" value={provider.estimatedSpeed} />
        <Meter label="Calidad" value={provider.estimatedQuality} />
      </div>

      <div className="flex flex-wrap gap-1.5">
        {provider.models.map((modelId) => (
          <span key={modelId} className="rounded-full border border-border bg-panel-2 px-2 py-0.5 font-mono text-[10px] text-muted-foreground">
            {modelId}
          </span>
        ))}
      </div>

      <div className="mt-auto flex flex-wrap gap-1.5 border-t border-border pt-2.5">
        {provider.isExternal ? (
          <>
            <button
              onClick={() => (provider.connected ? disconnectProvider(provider.id) : connectProvider(provider.id))}
              className="flex items-center gap-1 rounded-md border border-border px-2 py-1 text-[11px] font-medium text-foreground transition-colors hover:border-primary hover:text-primary"
            >
              {provider.connected ? <Unplug className="size-3" /> : <Plug className="size-3" />}
              {provider.connected ? 'Desconectar' : 'Conectar'}
            </button>
            <button
              onClick={() => (provider.authenticated ? logoutProvider(provider.id) : loginProvider(provider.id))}
              className="flex items-center gap-1 rounded-md border border-primary/30 bg-primary/10 px-2 py-1 text-[11px] font-medium text-primary transition-colors hover:bg-primary/20"
            >
              {provider.authenticated ? <LogOut className="size-3" /> : <LogIn className="size-3" />}
              {provider.authenticated ? 'Cerrar sesión' : 'Iniciar sesión'}
            </button>
          </>
        ) : (
          <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
            <PlugZap className="size-3" />
            Disponible sin credenciales
          </span>
        )}
      </div>
    </article>
  )
}

function BudgetEstimator() {
  const { estimateBudget, providers } = useOrbit()
  const [modelId, setModelId] = useState('gpt-4o')
  const [inputTokens, setInputTokens] = useState(1000)
  const [result, setResult] = useState<ReturnType<typeof estimateBudget> | null>(null)

  const models = providers.flatMap((provider) =>
    provider.models.map((id) => ({ id, provider: provider.name })),
  )

  const run = () => {
    const value = estimateBudget({ modelId: modelId as ModelId, inputTokens })
    setResult(value)
  }

  return (
    <section className="rounded-lg border border-border bg-panel p-3">
      <h3 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        <CircleDollarSign className="size-3.5" />
        Estimar presupuesto (simulado)
      </h3>
      <div className="mt-2 flex flex-wrap items-end gap-2">
        <label className="flex min-w-40 flex-1 flex-col">
          <span className="mb-1 text-[11px] text-muted-foreground">Modelo</span>
          <select
            value={modelId}
            onChange={(event) => setModelId(event.target.value)}
            className="w-full rounded-md border border-border bg-panel-2 px-2 py-1.5 text-xs text-foreground outline-none focus:border-primary"
          >
            {models.map((model) => (
              <option key={model.id} value={model.id}>
                {model.id} · {model.provider}
              </option>
            ))}
          </select>
        </label>
        <label className="flex min-w-28 flex-1 flex-col">
          <span className="mb-1 text-[11px] text-muted-foreground">Tokens de entrada</span>
          <input
            type="number"
            min={0}
            value={inputTokens}
            onChange={(event) => setInputTokens(Number(event.target.value))}
            className="w-full rounded-md border border-border bg-panel-2 px-2 py-1.5 font-mono text-xs text-foreground outline-none focus:border-primary"
          />
        </label>
        <button
          onClick={run}
          className="flex items-center gap-1 rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground transition-opacity hover:opacity-90"
        >
          <Zap className="size-3" />
          Estimar
        </button>
      </div>
      {result && (
        <dl className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1.5 rounded-md bg-panel-2 p-2 text-xs sm:grid-cols-5">
          <div className="text-center">
            <dt className="text-muted-foreground">Costo</dt>
            <dd className="font-mono text-foreground">${result.estimatedCost.toFixed(4)}</dd>
          </div>
          <div className="text-center">
            <dt className="text-muted-foreground">Créditos</dt>
            <dd className="font-mono text-foreground">{result.estimatedCredits}</dd>
          </div>
          <div className="text-center">
            <dt className="text-muted-foreground">Tokens</dt>
            <dd className="font-mono text-foreground">{result.estimatedTokens}</dd>
          </div>
          <div className="text-center">
            <dt className="text-muted-foreground">Restantes</dt>
            <dd className="font-mono text-foreground">
              {result.remainingBudget === Infinity ? '∞' : result.remainingBudget}
            </dd>
          </div>
          <div className="text-center">
            <dt className="text-muted-foreground">Aprobación</dt>
            <dd className={cn('font-medium', result.approvalRequired ? 'text-warning' : 'text-success')}>
              {result.approvalRequired ? 'requerida' : 'no'}
            </dd>
          </div>
        </dl>
      )}
    </section>
  )
}

export function ProvidersPanel() {
  const { providers, providerHealth, providerPolicy, setProviderPolicy } = useOrbit()
  const [filter, setFilter] = useState<'todos' | 'conectados'>('todos')

  const visible = filter === 'conectados' ? providers.filter((provider) => provider.connected) : providers

  return (
    <div className="flex h-full flex-col">
      <header className="border-b border-border px-4 py-3">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <Cloud className="size-4 text-primary" />
          Proveedores
        </h2>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Simulado: cuentas, catálogo de modelos y presupuesto. Ninguna llamada real a APIs externas.
        </p>
      </header>

      <div className="flex flex-wrap items-center gap-3 border-b border-border px-4 py-3">
        <div
          className={cn(
            'flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs',
            providerHealth.status === 'healthy'
              ? 'border-success/40 bg-success/10 text-success'
              : providerHealth.status === 'warning'
                ? 'border-warning/40 bg-warning/10 text-warning'
                : 'border-border bg-panel-3 text-muted-foreground',
          )}
        >
          {providerHealth.status === 'healthy' ? <Cloud className="size-3.5" /> : <CloudOff className="size-3.5" />}
          {providerHealth.connectedCount}/{providerHealth.total} conectados · {providerHealth.authenticatedCount} con sesión
        </div>
        <label className="flex items-center gap-2 text-xs text-muted-foreground">
          <Scale className="size-3.5" />
          Política:
          <select
            value={providerPolicy.id}
            onChange={(event) => setProviderPolicy(event.target.value as ProviderPolicyId)}
            className="rounded-md border border-border bg-panel-2 px-2 py-1 text-xs text-foreground outline-none focus:border-primary"
          >
            {POLICY_OPTIONS.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <div className="ml-auto flex gap-1.5">
          {(['todos', 'conectados'] as const).map((option) => (
            <button
              key={option}
              onClick={() => setFilter(option)}
              className={cn(
                'rounded-md px-2.5 py-1 text-xs font-medium transition-colors',
                filter === option
                  ? 'bg-primary text-primary-foreground'
                  : 'border border-border text-muted-foreground hover:text-foreground',
              )}
            >
              {option === 'todos' ? 'Todos' : 'Conectados'}
            </button>
          ))}
        </div>
      </div>

      <div className="min-h-0 flex-1 space-y-3 overflow-auto px-4 py-4">
        <BudgetEstimator />

        <section>
          <h3 className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <Boxes className="size-3.5" />
            Proveedores registrados ({visible.length})
          </h3>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {visible.map((provider) => (
              <ProviderCard key={provider.id} provider={provider} />
            ))}
          </div>
        </section>

        <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <KeyRound className="size-3" />
          Autenticación simulada: login/logout/refresh sin credenciales reales.
        </p>
      </div>
    </div>
  )
}
