import { Compass, Hammer, ShieldCheck } from 'lucide-react'
import { cn } from '@/lib/utils'

const ICON = {
  director: Compass,
  constructor: Hammer,
  verificador: ShieldCheck,
} as const

const TONE: Record<string, string> = {
  violet: 'bg-violet/15 text-violet ring-violet/30',
  success: 'bg-success/15 text-success ring-success/30',
  primary: 'bg-primary/15 text-primary ring-primary/30',
  warning: 'bg-warning/15 text-warning ring-warning/30',
}

export function AgentGlyph({ id, tone }: { id: string; tone: string }) {
  const Icon = ICON[id as keyof typeof ICON] ?? Compass
  return (
    <span
      className={cn(
        'flex size-8 shrink-0 items-center justify-center rounded-lg ring-1',
        TONE[tone] ?? TONE.primary,
      )}
    >
      <Icon className="size-4" />
    </span>
  )
}
