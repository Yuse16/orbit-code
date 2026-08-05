'use client'

import {
  createContext,
  useContext,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from 'react'
import {
  createMockMissionControl,
  type MissionControl,
  type MissionState,
} from '@/lib/mission-control/index.mts'

const MissionControlContext = createContext<MissionControl | null>(null)

function createOrbitMissionControl(): MissionControl {
  const mission = createMockMissionControl()

  mission.services.project.open({
    id: 'u-zala',
    name: 'U-Zala',
    path: '/Users/usuario/Proyectos/U-Zala',
    framework: 'Next.js',
  })
  mission.services.git.updateStatus({
    branch: 'main',
    worktree: 'u-zala',
    status: 'changes-pending',
    pendingChanges: 3,
    lastSummary: '3 cambios simulados',
  })
  mission.services.tasks.setStage('implementacion')

  return mission
}

/** Único puente React: el núcleo permanece independiente de esta capa. */
export function MissionControlProvider({ children }: { children: ReactNode }) {
  const [mission] = useState(createOrbitMissionControl)
  return <MissionControlContext.Provider value={mission}>{children}</MissionControlContext.Provider>
}

export function useMissionControl(): MissionControl {
  const mission = useContext(MissionControlContext)
  if (!mission) throw new Error('useMissionControl debe usarse dentro de MissionControlProvider')
  return mission
}

export function useMissionState(): MissionState {
  const mission = useMissionControl()
  return useSyncExternalStore(
    mission.store.subscribe,
    mission.store.getSnapshot,
    mission.store.getSnapshot,
  )
}
