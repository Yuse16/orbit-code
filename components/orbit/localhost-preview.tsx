'use client'

import { ResponsivePreviewToolbar } from './responsive-preview-toolbar'
import { MockUZalaDashboard } from './mock-uzala-dashboard'
import { useOrbit } from './orbit-store'
import { cn } from '@/lib/utils'

const WIDTHS: Record<string, string> = {
  desktop: 'max-w-none',
  tablet: 'max-w-[834px]',
  movil: 'max-w-[420px]',
}

/**
 * Vista previa de localhost.
 * INTEGRACIÓN FUTURA: reemplazar el contenedor por un <iframe> apuntando al
 * servidor de desarrollo real (o una webview de Tauri) hacia localhost:3000.
 */
export function LocalhostPreview() {
  const { viewport } = useOrbit()

  return (
    <div className="flex h-full flex-col">
      <ResponsivePreviewToolbar />
      <div className="orbit-scroll flex-1 overflow-auto bg-panel-3/40 p-4">
        <div
          className={cn(
            'mx-auto h-full overflow-hidden rounded-xl border border-border bg-white shadow-2xl transition-all duration-300',
            WIDTHS[viewport],
          )}
        >
          <div className="orbit-scroll h-full overflow-y-auto">
            <MockUZalaDashboard />
          </div>
        </div>
      </div>
    </div>
  )
}
