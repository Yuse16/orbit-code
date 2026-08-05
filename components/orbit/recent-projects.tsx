'use client'

import { FolderGit2 } from 'lucide-react'
import { RECENT_PROJECTS } from '@/lib/orbit/mock-data'
import { useOrbit } from './orbit-store'
import { cn } from '@/lib/utils'

export function RecentProjects() {
  const { projectName } = useOrbit()

  return (
    <section className="border-t border-border px-2 py-3">
      <p className="px-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        Proyectos recientes
      </p>
      <ul className="mt-1 space-y-0.5">
        {RECENT_PROJECTS.map((name) => {
          const active = name === projectName
          return (
            <li key={name}>
              <button
                className={cn(
                  'flex w-full items-center gap-2 rounded-md px-1.5 py-1 text-left text-[13px] transition-colors',
                  active
                    ? 'bg-panel-3 text-foreground'
                    : 'text-foreground/75 hover:bg-panel-3',
                )}
              >
                <FolderGit2
                  className={cn('size-4 shrink-0', active ? 'text-primary' : 'text-muted-foreground')}
                />
                <span className="truncate">{name}</span>
              </button>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
