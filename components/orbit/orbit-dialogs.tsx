'use client'

/**
 * Diálogos simulados de Orbit Code.
 * Ninguno realiza acciones reales. Son puntos de conexión futuros:
 *  - commit      -> [tauri] git add/commit/push
 *  - connection  -> [tauri] estado real de red/motores
 *  - cost        -> [tauri] telemetría de uso/costo del motor
 *  - install     -> [tauri] instalación de motores/CLI locales
 */

import { GitCommitHorizontal, Wifi, DollarSign, Download } from 'lucide-react'
import { DIFFS } from '@/lib/orbit/mock-data'
import { Modal } from './primitives'
import { useOrbit } from './orbit-store'

function Btn({
  children,
  onClick,
  variant = 'ghost',
}: {
  children: React.ReactNode
  onClick?: () => void
  variant?: 'primary' | 'ghost'
}) {
  return (
    <button
      onClick={onClick}
      className={
        variant === 'primary'
          ? 'rounded-md bg-primary px-3.5 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90'
          : 'rounded-md border border-border px-3.5 py-2 text-sm font-medium text-foreground transition-colors hover:bg-panel-3'
      }
    >
      {children}
    </button>
  )
}

export function OrbitDialogs() {
  const { dialog, setDialog, connection } = useOrbit()
  const close = () => setDialog(null)
  const totalAdd = DIFFS.reduce((s, d) => s + d.additions, 0)
  const totalDel = DIFFS.reduce((s, d) => s + d.deletions, 0)

  return (
    <>
      {/* Commit */}
      <Modal
        open={dialog === 'commit'}
        onClose={close}
        icon={<GitCommitHorizontal className="size-5 text-primary" />}
        title="Preparar commit"
        description={`${DIFFS.length} archivos · +${totalAdd} −${totalDel}. Nada se enviará sin tu autorización.`}
        footer={
          <>
            <Btn onClick={close}>Cancelar</Btn>
            <Btn variant="primary" onClick={close}>
              Confirmar (simulado)
            </Btn>
          </>
        }
      >
        <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
          Mensaje del commit
        </label>
        <textarea
          defaultValue="feat: agrega módulo de promociones y actualiza TaskCard"
          rows={3}
          className="w-full resize-none rounded-md border border-border bg-panel-2 p-2.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
        />
        <ul className="mt-3 space-y-1">
          {DIFFS.map((d) => (
            <li key={d.id} className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="font-mono font-bold text-warning">{d.git}</span>
              <span className="truncate font-mono">{d.path}</span>
            </li>
          ))}
        </ul>
      </Modal>

      {/* Conexión */}
      <Modal
        open={dialog === 'connection'}
        onClose={close}
        icon={<Wifi className="size-5 text-success" />}
        title="Estado de conexión"
        description="Resumen simulado de la conexión con los motores de IA."
        footer={<Btn variant="primary" onClick={close}>Entendido</Btn>}
      >
        <div className="space-y-2 text-sm">
          <Row label="Estado" value={connection} />
          <Row label="Privacidad" value="Alta · procesamiento local prioritario" />
          <Row label="Región" value="Automática" />
          <Row label="Latencia" value="42 ms (simulada)" />
        </div>
      </Modal>

      {/* Costo */}
      <Modal
        open={dialog === 'cost'}
        onClose={close}
        icon={<DollarSign className="size-5 text-success" />}
        title="Uso y costo"
        description="Telemetría de uso simulada de la sesión actual."
        footer={<Btn variant="primary" onClick={close}>Cerrar</Btn>}
      >
        <div className="space-y-2 text-sm">
          <Row label="Costo de sesión" value="$0.00" />
          <Row label="Tokens usados" value="128k (simulado)" />
          <Row label="Motor actual" value="Codex" />
          <Row label="Plan" value="Pro" />
        </div>
      </Modal>

      {/* Instalar motor */}
      <Modal
        open={dialog === 'install'}
        onClose={close}
        icon={<Download className="size-5 text-primary" />}
        title="Agregar motor o herramienta"
        description="Conecta motores adicionales. La instalación real se hará vía Tauri."
        footer={
          <>
            <Btn onClick={close}>Cancelar</Btn>
            <Btn variant="primary" onClick={close}>
              Continuar (simulado)
            </Btn>
          </>
        }
      >
        <ul className="space-y-2">
          {['Modelo local (Ollama)', 'Anthropic Claude', 'Google Gemini', 'Grok'].map((m) => (
            <li
              key={m}
              className="flex items-center justify-between rounded-md border border-border bg-panel-2 px-3 py-2 text-sm text-foreground"
            >
              {m}
              <span className="text-xs text-muted-foreground">No conectado</span>
            </li>
          ))}
        </ul>
      </Modal>
    </>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-md bg-panel-2 px-3 py-2">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium capitalize text-foreground">{value}</span>
    </div>
  )
}
