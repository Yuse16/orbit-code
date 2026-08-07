'use client'

import { FolderGit2 } from 'lucide-react'
import { RECENT_PROJECTS } from '@/lib/orbit/mock-data'
import type { ProjectDescriptor } from '@/lib/mission-control/types.mts'
import { useOrbit } from './orbit-store'
import { cn } from '@/lib/utils'

export function RecentProjects() {
  const { projectName, recentProjects, openRecentProject } = useOrbit()
  const projects = recentProjects.length
    ? recentProjects.map((project) => ({ key: project.id, name: project.name, project }))
    : RECENT_PROJECTS.map((name) => ({ key: name, name, project: null as ProjectDescriptor | null }))

  return (
    <section className="border-t border-border px-2 py-3">
      <p className="px-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        Proyectos recientes
      </p>
      <ul className="mt-1 space-y-0.5">
        {projects.map(({ key, name, project }) => {
          const active = name === projectName
          return (
            <li key={key}>
              <button
                onClick={() => project && openRecentProject(project)}
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
