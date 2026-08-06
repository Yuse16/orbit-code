import { KernelEventBus } from './event-bus.mts'
import type { KernelAgentRole, SchedulerTask, TaskPriority } from './types.mts'

export interface ScheduleTaskInput {
  id: string
  title: string
  priority?: TaskPriority
  dependencies?: ReadonlyArray<string>
  maxRetries?: number
  assignedAgent?: KernelAgentRole | null
}

/**
 * Cola declarativa: conserva el plan y sus transiciones, pero no ejecuta
 * tareas, procesos ni agentes.
 */
export class Scheduler {
  private readonly tasks = new Map<string, SchedulerTask>()
  private running = false
  private readonly events: KernelEventBus

  constructor(events: KernelEventBus) {
    this.events = events
  }

  start(): void {
    if (this.running) return
    this.running = true
    this.events.emit('SchedulerStarted', {})
  }

  stop(): void {
    if (!this.running) return
    this.running = false
    this.events.emit('SchedulerStopped', {})
  }

  list(): ReadonlyArray<SchedulerTask> {
    const rank: Record<TaskPriority, number> = { critical: 0, high: 1, normal: 2, low: 3 }
    return [...this.tasks.values()].sort((left, right) => rank[left.priority] - rank[right.priority])
  }

  enqueue(input: ScheduleTaskInput): SchedulerTask {
    const task: SchedulerTask = {
      id: input.id,
      title: input.title,
      priority: input.priority ?? 'normal',
      dependencies: input.dependencies ?? [],
      status: input.dependencies?.length ? 'waiting' : 'queued',
      retryCount: 0,
      maxRetries: input.maxRetries ?? 0,
      waitReason: input.dependencies?.length ? 'Esperando dependencias.' : null,
      assignedAgent: input.assignedAgent ?? null,
      cancellationRequested: false,
    }
    this.tasks.set(task.id, task)
    this.events.emit('SchedulerTaskQueued', { task })
    return task
  }

  markReady(taskId: string): void {
    this.update(taskId, { status: 'ready', waitReason: null })
  }

  requestCancellation(taskId: string): void {
    this.update(taskId, { cancellationRequested: true, status: 'cancelled' })
  }

  retry(taskId: string): void {
    const task = this.tasks.get(taskId)
    if (!task || task.retryCount >= task.maxRetries) return
    this.update(taskId, {
      retryCount: task.retryCount + 1,
      status: task.dependencies.length ? 'waiting' : 'queued',
      waitReason: task.dependencies.length ? 'Esperando dependencias.' : null,
      cancellationRequested: false,
    })
  }

  private update(taskId: string, changes: Partial<SchedulerTask>): void {
    const task = this.tasks.get(taskId)
    if (!task) return
    const updated = { ...task, ...changes }
    this.tasks.set(taskId, updated)
    this.events.emit('SchedulerTaskChanged', { task: updated })
  }
}
