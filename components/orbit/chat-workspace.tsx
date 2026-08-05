'use client'

import { OrbitLogo } from './orbit-logo'
import { StageSelector } from './stage-selector'
import { ConversationView } from './conversation-view'
import { QuickActions } from './quick-actions'
import { ModelStatusPanel } from './model-status-panel'
import { MessageBox } from './message-box'

/**
 * Columna central: chat con agentes, selector de etapa y control de motores.
 */
export function ChatWorkspace() {
  return (
    <section className="flex w-[540px] shrink-0 flex-col border-r border-border bg-background">
      {/* Encabezado + etapa (fijos) */}
      <div className="shrink-0 space-y-4 px-5 pb-4 pt-5">
        <div className="flex items-center gap-3">
          <span className="flex size-11 items-center justify-center rounded-xl bg-violet/15">
            <OrbitLogo className="size-7" />
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Orbit Code
          </h1>
        </div>
        <StageSelector />
      </div>

      {/* Conversación + acciones + motores (desplazable) */}
      <div className="orbit-scroll flex-1 space-y-4 overflow-y-auto px-5 py-2">
        <ConversationView />
        <QuickActions />
        <ModelStatusPanel />
      </div>

      {/* Caja de mensaje (fija) */}
      <div className="shrink-0 border-t border-border px-5 py-3">
        <MessageBox />
      </div>
    </section>
  )
}
