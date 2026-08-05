'use client'

import { CircleDot } from 'lucide-react'
import { OrbitLogo } from './orbit-logo'
import { useOrbit } from './orbit-store'
import type { ChatMessage } from '@/lib/orbit/types'
import { cn } from '@/lib/utils'

function MessageItem({ message }: { message: ChatMessage }) {
  const isUser = message.author === 'user'

  return (
    <div className="flex gap-3">
      <span
        className={cn(
          'flex size-7 shrink-0 items-center justify-center rounded-full',
          isUser
            ? 'bg-panel-3 text-xs font-semibold text-foreground'
            : 'bg-violet/15',
        )}
        aria-hidden
      >
        {isUser ? 'U' : <OrbitLogo className="size-4" />}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <span className="text-sm font-semibold text-foreground">
            {isUser ? 'Tú' : 'Orbit Code'}
          </span>
          <span className="text-xs text-muted-foreground">{message.time}</span>
        </div>
        <p className="mt-1 text-sm leading-relaxed text-foreground/90 text-pretty">
          {message.text}
        </p>

        {message.plan && (
          <div className="mt-3">
            <p className="text-sm font-medium text-foreground">Plan de trabajo</p>
            <ul className="mt-1.5 space-y-1.5">
              {message.plan.map((step, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-foreground/80">
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                  <span className="text-pretty">{step}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {message.footnote && (
          <p className="mt-3 flex items-center gap-1.5 text-[13px] text-muted-foreground">
            <CircleDot className="size-3.5 animate-pulse text-primary" />
            {message.footnote}
          </p>
        )}
      </div>
    </div>
  )
}

export function ConversationView() {
  const { messages } = useOrbit()

  return (
    <div className="space-y-6">
      {messages.map((m) => (
        <MessageItem key={m.id} message={m} />
      ))}
    </div>
  )
}
