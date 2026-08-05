'use client'

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

const subscribeToClient = () => () => undefined

/* ------------------------------------------------------------------ */
/* Tooltip                                                            */
/* ------------------------------------------------------------------ */

export function Tooltip({
  label,
  children,
  side = 'top',
}: {
  label: string
  children: ReactNode
  side?: 'top' | 'bottom' | 'right'
}) {
  const [open, setOpen] = useState(false)
  const sideCls =
    side === 'top'
      ? 'bottom-full left-1/2 -translate-x-1/2 mb-2'
      : side === 'bottom'
        ? 'top-full left-1/2 -translate-x-1/2 mt-2'
        : 'left-full top-1/2 -translate-y-1/2 ml-2'

  return (
    <span
      className="relative inline-flex"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
    >
      {children}
      {open && (
        <span
          role="tooltip"
          className={cn(
            'pointer-events-none absolute z-50 whitespace-nowrap rounded-md border border-border bg-popover px-2 py-1 text-xs text-popover-foreground shadow-lg',
            sideCls,
          )}
        >
          {label}
        </span>
      )}
    </span>
  )
}

/* ------------------------------------------------------------------ */
/* Dialog / Modal                                                     */
/* ------------------------------------------------------------------ */

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  icon,
  className,
}: {
  open: boolean
  onClose: () => void
  title: string
  description?: string
  children?: ReactNode
  footer?: ReactNode
  icon?: ReactNode
  className?: string
}) {
  const mounted = useSyncExternalStore(
    subscribeToClient,
    () => true,
    () => false,
  )

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!mounted || !open) return null

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className={cn(
          'relative w-full max-w-md rounded-xl border border-border bg-popover p-5 shadow-2xl',
          'animate-in fade-in zoom-in-95 duration-150',
          className,
        )}
      >
        <button
          onClick={onClose}
          className="absolute right-3 top-3 rounded-md p-1 text-muted-foreground transition-colors hover:bg-panel-3 hover:text-foreground"
          aria-label="Cerrar"
        >
          <X className="size-4" />
        </button>
        <div className="flex items-start gap-3">
          {icon && <div className="mt-0.5 shrink-0">{icon}</div>}
          <div className="min-w-0">
            <h2 className="text-base font-semibold text-foreground text-pretty">
              {title}
            </h2>
            {description && (
              <p className="mt-1 text-sm text-muted-foreground text-pretty">
                {description}
              </p>
            )}
          </div>
        </div>
        {children && <div className="mt-4">{children}</div>}
        {footer && <div className="mt-5 flex flex-wrap justify-end gap-2">{footer}</div>}
      </div>
    </div>,
    document.body,
  )
}

/* ------------------------------------------------------------------ */
/* Dropdown menu                                                      */
/* ------------------------------------------------------------------ */

interface DropdownCtx {
  open: boolean
  setOpen: (v: boolean) => void
}
const DropdownContext = createContext<DropdownCtx | null>(null)

export function Dropdown({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('mousedown', onClick)
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('mousedown', onClick)
      window.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <DropdownContext.Provider value={{ open, setOpen }}>
      <div ref={ref} className="relative">
        {children}
      </div>
    </DropdownContext.Provider>
  )
}

export function DropdownTrigger({
  children,
  className,
  ariaLabel,
}: {
  children: ReactNode
  className?: string
  ariaLabel?: string
}) {
  const ctx = useContext(DropdownContext)!
  return (
    <button
      type="button"
      aria-haspopup="menu"
      aria-expanded={ctx.open}
      aria-label={ariaLabel}
      onClick={() => ctx.setOpen(!ctx.open)}
      className={className}
    >
      {children}
    </button>
  )
}

export function DropdownContent({
  children,
  align = 'start',
  className,
}: {
  children: ReactNode
  align?: 'start' | 'end'
  className?: string
}) {
  const ctx = useContext(DropdownContext)!
  if (!ctx.open) return null
  return (
    <div
      role="menu"
      className={cn(
        'absolute z-50 mt-2 min-w-52 rounded-lg border border-border bg-popover p-1.5 shadow-xl',
        'animate-in fade-in slide-in-from-top-1 duration-100',
        align === 'end' ? 'right-0' : 'left-0',
        className,
      )}
    >
      {children}
    </div>
  )
}

export function DropdownItem({
  children,
  onSelect,
  active,
  icon,
}: {
  children: ReactNode
  onSelect?: () => void
  active?: boolean
  icon?: ReactNode
}) {
  const ctx = useContext(DropdownContext)!
  return (
    <button
      type="button"
      role="menuitem"
      onClick={() => {
        onSelect?.()
        ctx.setOpen(false)
      }}
      className={cn(
        'flex w-full items-center gap-2.5 rounded-md px-2.5 py-1.5 text-left text-sm transition-colors',
        'hover:bg-panel-3 focus:bg-panel-3 focus:outline-none',
        active ? 'text-primary' : 'text-foreground',
      )}
    >
      {icon && <span className="shrink-0 text-muted-foreground">{icon}</span>}
      <span className="flex-1 truncate">{children}</span>
    </button>
  )
}

export function DropdownLabel({ children }: { children: ReactNode }) {
  return (
    <div className="px-2.5 py-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
      {children}
    </div>
  )
}

export function DropdownSeparator() {
  return <div className="my-1 h-px bg-border" />
}

/* ------------------------------------------------------------------ */
/* Progress bar                                                       */
/* ------------------------------------------------------------------ */

const TONE_BG: Record<string, string> = {
  primary: 'bg-primary',
  success: 'bg-success',
  violet: 'bg-violet',
  warning: 'bg-warning',
}

export function ProgressBar({
  value,
  tone = 'primary',
  className,
}: {
  value: number
  tone?: 'primary' | 'success' | 'violet' | 'warning'
  className?: string
}) {
  return (
    <div
      className={cn('h-1.5 w-full overflow-hidden rounded-full bg-panel-3', className)}
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className={cn('h-full rounded-full transition-all duration-500', TONE_BG[tone])}
        style={{ width: `${value}%` }}
      />
    </div>
  )
}
