import { cn } from '@/lib/utils'

/**
 * Marca propia de Orbit Code: un núcleo con una órbita inclinada.
 * Identidad original, no derivada de otras aplicaciones.
 */
export function OrbitLogo({
  className,
  gradient = true,
}: {
  className?: string
  gradient?: boolean
}) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={cn('size-6', className)}
      role="img"
      aria-label="Orbit Code"
      fill="none"
    >
      <defs>
        <linearGradient id="orbit-grad" x1="0" y1="0" x2="32" y2="32">
          <stop offset="0%" stopColor="var(--primary)" />
          <stop offset="100%" stopColor="var(--violet)" />
        </linearGradient>
      </defs>
      <ellipse
        cx="16"
        cy="16"
        rx="13"
        ry="6"
        transform="rotate(-35 16 16)"
        stroke={gradient ? 'url(#orbit-grad)' : 'currentColor'}
        strokeWidth="2"
        opacity="0.85"
      />
      <circle
        cx="16"
        cy="16"
        r="5"
        fill={gradient ? 'url(#orbit-grad)' : 'currentColor'}
      />
      <circle cx="27" cy="9" r="2" fill="var(--violet)" />
    </svg>
  )
}
