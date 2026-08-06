'use client'

/**
 * Ensamblaje de la ventana de escritorio Orbit Code.
 *
 * La barra de título es nativa de macOS (decoraciones del sistema); el
 * contenido WebView comienza directamente en la zona de trabajo.
 *
 * Distribución (fiel a la imagen de referencia):
 *  ┌───────────────────────── Barra de título ─────────────────────────┐
 *  │ Rail │ Explorador │            Chat            │     Workbench      │
 *  │      │            │────────────────────────────────────────────── │
 *  │      │            │        Dock inferior (agentes + terminal)      │
 *  └────────────────────────────────────────────────────────────────────┘
 *
 * El rail y el explorador ocupan toda la altura a la izquierda; el dock
 * inferior abarca solo las columnas de Chat y Workbench, como en la imagen.
 */

import { OrbitProvider } from './orbit-store'
import { ActivityRail } from './activity-rail'
import { ProjectExplorer } from './project-explorer'
import { ChatWorkspace } from './chat-workspace'
import { Workbench } from './workbench'
import { ActivityDock } from './activity-dock'
import { OrbitDialogs } from './orbit-dialogs'

export function DesktopShell() {
  return (
    <OrbitProvider>
      <div className="flex h-screen w-full flex-col overflow-hidden bg-app-gradient p-2.5">
        {/* Ventana de la aplicación */}
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-border bg-background shadow-2xl ring-1 ring-white/[0.03]">
          <div className="flex min-h-0 flex-1">
            {/* Izquierda: rail + explorador (altura completa) */}
            <ActivityRail />
            <ProjectExplorer />

            {/* Derecha: chat + workbench, con dock inferior compartido */}
            <div className="flex min-h-0 min-w-0 flex-1 flex-col">
              <div className="flex min-h-0 flex-1">
                <ChatWorkspace />
                <Workbench />
              </div>
              <ActivityDock />
            </div>
          </div>
        </div>
      </div>

      <OrbitDialogs />
    </OrbitProvider>
  )
}
