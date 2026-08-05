'use client'

/**
 * Contenido SIMULADO de localhost:3000 (la app "U-Zala").
 * Es únicamente una maqueta del sitio abierto dentro del navegador interno
 * de Orbit Code — no es la aplicación Orbit Code en sí. Usa una paleta clara
 * propia e independiente del tema oscuro de Orbit Code.
 */

import {
  Menu,
  Search,
  Bell,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  ListChecks,
  CheckCircle2,
  Clock,
  Loader2,
  ArrowUpRight,
  ArrowDownRight,
  X,
} from 'lucide-react'
import { STATS, PROMOTIONS } from '@/lib/orbit/mock-data'

const NAV = ['Dashboard', 'Tareas', 'Calendario', 'Promociones']

const STAT_ICON = [ListChecks, CheckCircle2, Clock, Loader2]

const PROMO_STYLE: Record<string, { bg: string; badge: string; btn: string }> = {
  violet: {
    bg: 'bg-violet-50 border-violet-100',
    badge: 'bg-violet-100 text-violet-700',
    btn: 'bg-violet-600 hover:bg-violet-700 text-white',
  },
  success: {
    bg: 'bg-emerald-50 border-emerald-100',
    badge: 'bg-emerald-100 text-emerald-700',
    btn: 'bg-emerald-600 hover:bg-emerald-700 text-white',
  },
  warning: {
    bg: 'bg-orange-50 border-orange-100',
    badge: 'bg-orange-100 text-orange-700',
    btn: 'bg-orange-500 hover:bg-orange-600 text-white',
  },
}

export function MockUZalaDashboard() {
  return (
    <div className="min-h-full bg-slate-50 font-sans text-slate-900">
      {/* Encabezado */}
      <header className="flex items-center gap-4 border-b border-slate-200 bg-white px-5 py-3">
        <button className="text-slate-500" aria-label="Menú">
          <Menu className="size-5" />
        </button>
        <span className="flex items-center gap-2 text-lg font-bold">
          <span className="flex size-6 items-center justify-center rounded-md bg-indigo-600 text-xs text-white">
            U
          </span>
          U-Zala
        </span>
        <nav className="ml-4 hidden items-center gap-1 text-sm md:flex">
          {NAV.map((item, i) => (
            <span
              key={item}
              className={
                i === 0
                  ? 'rounded-md bg-indigo-50 px-3 py-1.5 font-medium text-indigo-700'
                  : 'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-slate-600'
              }
            >
              {item}
              {item === 'Promociones' && (
                <span className="rounded-full bg-indigo-600 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                  Nuevo
                </span>
              )}
            </span>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-3 text-slate-500">
          <Search className="size-5" />
          <span className="relative">
            <Bell className="size-5" />
            <span className="absolute -right-0.5 -top-0.5 size-2 rounded-full bg-rose-500" />
          </span>
          <span className="flex size-8 items-center justify-center rounded-full bg-indigo-600 text-sm font-semibold text-white">
            U
          </span>
        </div>
      </header>

      <div className="p-5">
        {/* Bienvenida */}
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold">¡Bienvenido, Usuario! 👋</h2>
            <p className="text-sm text-slate-500">
              Aquí tienes un resumen de tu productividad.
            </p>
          </div>
          <button className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-600">
            18 de mayo, 2025
            <CalendarDays className="size-4" />
          </button>
        </div>

        {/* Estadísticas */}
        <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {STATS.map((s, i) => {
            const Icon = STAT_ICON[i]
            const up = s.trend === 'up'
            return (
              <div
                key={s.id}
                className="rounded-xl border border-slate-200 bg-white p-4"
              >
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-sm font-medium text-slate-500">
                    {s.label}
                  </span>
                  <Icon className="size-4" />
                </div>
                <p className="mt-2 text-2xl font-bold">{s.value}</p>
                <p
                  className={`mt-1 flex items-center gap-1 text-xs font-medium ${
                    up ? 'text-emerald-600' : 'text-rose-500'
                  }`}
                >
                  {up ? (
                    <ArrowUpRight className="size-3" />
                  ) : (
                    <ArrowDownRight className="size-3" />
                  )}
                  {s.delta}
                </p>
              </div>
            )
          })}
        </div>

        {/* Promociones activas */}
        <div className="mt-6 rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Promociones activas</h3>
            <button className="text-sm font-medium text-indigo-600">Ver todas</button>
          </div>
          <div className="mt-3 flex items-stretch gap-3">
            <button
              className="flex shrink-0 items-center text-slate-300"
              aria-label="Anterior"
            >
              <ChevronLeft className="size-5" />
            </button>
            <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-3">
              {PROMOTIONS.map((p) => {
                const st = PROMO_STYLE[p.tone]
                return (
                  <div key={p.id} className={`relative rounded-lg border p-3 ${st.bg}`}>
                    <button
                      className="absolute right-2 top-2 text-slate-400"
                      aria-label="Descartar"
                    >
                      <X className="size-3.5" />
                    </button>
                    <span
                      className={`inline-block rounded-md px-2 py-0.5 text-[11px] font-bold ${st.badge}`}
                    >
                      {p.badge}
                    </span>
                    <p className="mt-2 text-sm font-semibold text-slate-800">
                      {p.title}
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-slate-500">
                      {p.description}
                    </p>
                    <button
                      className={`mt-3 w-full rounded-md py-1.5 text-xs font-semibold ${st.btn}`}
                    >
                      {p.cta}
                    </button>
                  </div>
                )
              })}
            </div>
            <button
              className="flex shrink-0 items-center text-slate-400"
              aria-label="Siguiente"
            >
              <ChevronRight className="size-5" />
            </button>
          </div>
          <div className="mt-3 flex justify-center gap-1.5">
            {[0, 1, 2, 3, 4].map((i) => (
              <span
                key={i}
                className={`size-1.5 rounded-full ${i === 0 ? 'bg-indigo-600' : 'bg-slate-300'}`}
              />
            ))}
          </div>
        </div>

        {/* Paneles inferiores */}
        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <h3 className="font-semibold">Tareas recientes</h3>
            <div className="mt-3 flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
              <span className="flex items-center gap-2 text-sm text-slate-700">
                <span className="size-2 rounded-full bg-indigo-500" />
                Diseñar módulo de promociones
              </span>
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                En progreso
              </span>
            </div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <h3 className="font-semibold">Actividad reciente</h3>
            <div className="mt-3 flex items-center justify-between px-1 py-1 text-sm">
              <span className="flex items-center gap-2 text-slate-700">
                <CheckCircle2 className="size-4 text-emerald-500" />
                Usuario completó “Revisar métricas”
              </span>
              <span className="text-xs text-slate-400">Hace 2 h</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
