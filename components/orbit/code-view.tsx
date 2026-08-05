'use client'

import { Fragment } from 'react'
import { Save, GitCompare, ExternalLink, FileCode2, Circle } from 'lucide-react'
import { useOrbit } from './orbit-store'

/**
 * Editor de código simulado (sin Monaco todavía).
 * INTEGRACIÓN FUTURA: montar Monaco Editor sobre este contenedor,
 * conservando la barra de pestañas y las acciones.
 */

const KEYWORDS = new Set([
  'import', 'from', 'export', 'default', 'function', 'return', 'const', 'let',
  'var', 'interface', 'type', 'if', 'else', 'for', 'while', 'new', 'class',
  'extends', 'async', 'await',
])
// Grupo de captura (sin flag global) para dividir conservando delimitadores.
const STRING = /("[^"]*"|'[^']*'|`[^`]*`)/
const WORD = /(\b\w+\b)/

function highlight(line: string, key: number) {
  if (line.trim().startsWith('//')) {
    return (
      <span key={key} className="text-muted-foreground/70">
        {line}
      </span>
    )
  }
  // Divide por strings primero para no colorear palabras dentro de ellas.
  const parts = line.split(STRING)
  return (
    <Fragment key={key}>
      {parts.map((part, i) => {
        if (i % 2 === 1) {
          return (
            <span key={i} className="text-success">
              {part}
            </span>
          )
        }
        const segments = part.split(WORD)
        return (
          <Fragment key={i}>
            {segments.map((seg, j) =>
              KEYWORDS.has(seg) ? (
                <span key={j} className="text-violet">
                  {seg}
                </span>
              ) : (
                <span key={j} className="text-foreground/85">
                  {seg}
                </span>
              ),
            )}
          </Fragment>
        )
      })}
    </Fragment>
  )
}

export function CodeView() {
  const { openFilePath, openFileContent } = useOrbit()
  const lines = openFileContent.split('\n')
  const name = openFilePath.split('/').pop()

  return (
    <div className="flex h-full flex-col bg-background">
      {/* Pestañas de archivos */}
      <div className="flex items-center gap-1 border-b border-border bg-panel px-2 pt-1.5">
        <div className="flex items-center gap-2 rounded-t-lg border border-b-0 border-border bg-background px-3 py-1.5 text-[13px]">
          <FileCode2 className="size-4 text-primary" />
          <span>{name}</span>
          <Circle className="size-2 fill-warning text-warning" aria-label="Sin guardar" />
        </div>
      </div>

      {/* Ruta + acciones */}
      <div className="flex items-center justify-between border-b border-border px-3 py-1.5">
        <span className="font-mono text-xs text-muted-foreground">{openFilePath}</span>
        <div className="flex items-center gap-1.5">
          <button className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-panel-3 hover:text-foreground">
            <Save className="size-3.5" /> Guardar
          </button>
          <button className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-panel-3 hover:text-foreground">
            <GitCompare className="size-3.5" /> Comparar
          </button>
          <button className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-panel-3 hover:text-foreground">
            <ExternalLink className="size-3.5" /> Editor externo
          </button>
        </div>
      </div>

      {/* Código + minimapa */}
      <div className="flex flex-1 overflow-hidden">
        <div className="orbit-scroll flex-1 overflow-auto">
          <pre className="min-w-max py-2 font-mono text-[13px] leading-6">
            {lines.map((line, i) => (
              <div key={i} className="flex hover:bg-panel/60">
                <span className="w-12 shrink-0 select-none pr-4 text-right text-muted-foreground/50">
                  {i + 1}
                </span>
                <code className="pr-6">{highlight(line, i) || ' '}</code>
              </div>
            ))}
          </pre>
        </div>
        {/* Minimapa */}
        <div
          aria-hidden
          className="hidden w-16 shrink-0 border-l border-border bg-panel/40 p-1.5 lg:block"
        >
          <div className="space-y-1">
            {lines.slice(0, 40).map((line, i) => (
              <div
                key={i}
                className="h-1 rounded-full bg-muted-foreground/20"
                style={{ width: `${Math.min(100, (line.trim().length / 40) * 100)}%` }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
