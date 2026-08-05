'use client'

import { useState, type KeyboardEvent } from 'react'
import { ImagePlus, Paperclip, SendHorizontal } from 'lucide-react'
import { useOrbit } from './orbit-store'
import { Tooltip } from './primitives'
import { cn } from '@/lib/utils'

export function MessageBox() {
  const { sendMessage, autoMode, setAutoMode } = useOrbit()
  const [value, setValue] = useState('')

  const submit = () => {
    if (!value.trim()) return
    sendMessage(value)
    setValue('')
  }

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Respeta la composición de IME (chino/japonés/coreano) y Safari (229).
    if (e.nativeEvent.isComposing || e.keyCode === 229) return
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      submit()
    }
  }

  return (
    <div className="rounded-xl border border-border bg-panel-2 p-2.5">
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={onKeyDown}
        rows={2}
        placeholder="Describe qué quieres cambiar…"
        aria-label="Mensaje para Orbit Code"
        className="orbit-scroll max-h-32 min-h-[44px] w-full resize-none bg-transparent px-1.5 py-1 text-sm leading-relaxed text-foreground placeholder:text-muted-foreground focus:outline-none"
      />
      <div className="mt-1.5 flex items-center gap-1.5">
        <Tooltip label="Adjuntar imagen" side="top">
          <button className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-panel-3 hover:text-foreground">
            <ImagePlus className="size-4" />
          </button>
        </Tooltip>
        <Tooltip label="Adjuntar archivo" side="top">
          <button className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-panel-3 hover:text-foreground">
            <Paperclip className="size-4" />
          </button>
        </Tooltip>

        {/* Selector Automático / Manual */}
        <div className="ml-1 flex rounded-md border border-border p-0.5 text-xs">
          <button
            onClick={() => setAutoMode(true)}
            className={cn(
              'rounded px-2 py-0.5 font-medium transition-colors',
              autoMode ? 'bg-primary/20 text-primary' : 'text-muted-foreground',
            )}
          >
            Automático
          </button>
          <button
            onClick={() => setAutoMode(false)}
            className={cn(
              'rounded px-2 py-0.5 font-medium transition-colors',
              !autoMode ? 'bg-primary/20 text-primary' : 'text-muted-foreground',
            )}
          >
            Manual
          </button>
        </div>

        <button
          onClick={submit}
          disabled={!value.trim()}
          aria-label="Enviar mensaje"
          className="ml-auto flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-40"
        >
          <SendHorizontal className="size-4" />
          Enviar
        </button>
      </div>
    </div>
  )
}
