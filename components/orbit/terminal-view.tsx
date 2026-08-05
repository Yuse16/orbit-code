'use client'

/**
 * Terminal simulada.
 * [tauri] Reemplazar TERMINAL_LINES y el envío de comandos por un proceso PTY
 * real (por ejemplo `std::process::Command` expuesto vía comando de Tauri).
 */

import { useEffect, useRef, useState } from 'react'
import { Plus, Trash2, Maximize2, ChevronDown } from 'lucide-react'
import { TERMINAL_LINES } from '@/lib/orbit/mock-data'
import { Dropdown, DropdownContent, DropdownItem, DropdownTrigger } from './primitives'

const SHELLS = ['bash', 'zsh', 'fish', 'pwsh']

function lineClass(line: string) {
  if (line.startsWith('$')) return 'text-foreground'
  if (line.startsWith('✓')) return 'text-success'
  if (line.startsWith('>')) return 'text-muted-foreground'
  if (line.includes('http')) return 'text-primary'
  return 'text-muted-foreground'
}

export function TerminalView({ compact = false }: { compact?: boolean }) {
  const [shell, setShell] = useState('bash')
  const [history, setHistory] = useState<string[]>(TERMINAL_LINES)
  const [input, setInput] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight })
  }, [history])

  const run = (e: React.FormEvent) => {
    e.preventDefault()
    const cmd = input.trim()
    if (!cmd) return
    // [tauri] ejecutar comando real y transmitir stdout/stderr
    const out =
      cmd === 'clear'
        ? []
        : [`$ ${cmd}`, `simulación: "${cmd}" no ejecuta procesos reales todavía.`]
    setHistory((h) => (cmd === 'clear' ? [] : [...h, ...out]))
    setInput('')
  }

  return (
    <div className="flex h-full flex-col bg-terminal">
      <header className="flex items-center justify-between border-b border-border/60 px-3 py-2">
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Terminal
        </span>
        <div className="flex items-center gap-1">
          <Dropdown>
            <DropdownTrigger
              ariaLabel="Cambiar shell"
              className="flex items-center gap-1.5 rounded-md border border-border bg-panel-2 px-2 py-1 text-xs text-foreground transition-colors hover:bg-panel-3"
            >
              <span className="size-2 rounded-full bg-success" />
              {shell}
              <ChevronDown className="size-3 text-muted-foreground" />
            </DropdownTrigger>
            <DropdownContent align="end">
              {SHELLS.map((s) => (
                <DropdownItem key={s} active={s === shell} onSelect={() => setShell(s)}>
                  {s}
                </DropdownItem>
              ))}
            </DropdownContent>
          </Dropdown>
          <button
            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-panel-3 hover:text-foreground"
            aria-label="Nueva terminal"
          >
            <Plus className="size-4" />
          </button>
          <button
            onClick={() => setHistory([])}
            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-panel-3 hover:text-foreground"
            aria-label="Limpiar terminal"
          >
            <Trash2 className="size-4" />
          </button>
          <button
            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-panel-3 hover:text-foreground"
            aria-label="Expandir terminal"
          >
            <Maximize2 className="size-4" />
          </button>
        </div>
      </header>

      <div
        ref={scrollRef}
        className="flex-1 overflow-auto px-3 py-2 font-mono text-[13px] leading-relaxed"
      >
        {history.map((line, i) => (
          <div key={i} className={lineClass(line)}>
            {line === '' ? '\u00A0' : line}
          </div>
        ))}
        <form onSubmit={run} className="mt-1 flex items-center gap-2">
          <span className="text-success">$</span>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.nativeEvent.isComposing || e.keyCode === 229) return
            }}
            spellCheck={false}
            autoComplete="off"
            placeholder={compact ? '' : 'Escribe un comando…'}
            aria-label="Entrada de terminal"
            className="flex-1 bg-transparent font-mono text-[13px] text-foreground caret-primary outline-none placeholder:text-muted-foreground/50"
          />
        </form>
      </div>
    </div>
  )
}
