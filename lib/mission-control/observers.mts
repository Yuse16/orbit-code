import type { EventBus } from './event-bus.mts'

/**
 * Reglas reactivas sin dependencias entre módulos. Cada observador escucha
 * solo su evento y publica una consecuencia declarativa en el mismo bus.
 */
export function installMissionObservers(events: EventBus, now: () => string = () => new Date().toISOString()): () => void {
  const stopBuildObserver = events.on('BuildFinished', (event) => {
    const succeeded = event.payload.status === 'succeeded'
    events.emit('NotificationRaised', {
      level: succeeded ? 'success' : 'error',
      message: succeeded ? 'Build simulado completado.' : 'Build simulado con error.',
      createdAt: now(),
    })
    events.emit('GuidanceChanged', {
      guidance: succeeded
        ? {
            recommendedAction: 'Revisar el resultado antes de continuar.',
            risks: [],
            warnings: [],
            pending: ['Confirmar el siguiente paso de la tarea.'],
          }
        : {
            recommendedAction: 'Revisar el error de build antes de continuar.',
            risks: ['El estado de compilación requiere atención.'],
            warnings: [event.payload.error ?? 'No se proporcionó detalle de error.'],
            pending: ['Corregir el fallo y volver a validar.'],
          },
    })
  })

  const stopProviderObserver = events.on('ProviderDisconnected', (event) => {
    events.emit('NotificationRaised', {
      level: 'warning',
      message: `${event.payload.providerId} está desconectado.`,
      createdAt: now(),
    })
  })

  const stopTaskObserver = events.on('TaskCompleted', (event) => {
    events.emit('NotificationRaised', {
      level: 'success',
      message: `Tarea ${event.payload.taskId} completada.`,
      createdAt: now(),
    })
  })

  return () => {
    stopBuildObserver()
    stopProviderObserver()
    stopTaskObserver()
  }
}
