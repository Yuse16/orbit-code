import assert from 'node:assert/strict'
import test from 'node:test'
import { HealthPublisher, KernelContext } from '../lib/kernel/context/index.mts'

test('KernelContext emite SnapshotCreated, SnapshotUpdated y ContextChanged', () => {
  const context = new KernelContext(() => 't')
  const seen: string[] = []
  context.events.on('SnapshotCreated', ({ payload }) => seen.push(`created:${payload.version}`))
  context.events.on('SnapshotUpdated', ({ payload }) =>
    seen.push(`updated:${payload.version}:${payload.changedDomains.join(',')}`),
  )
  context.events.on('ContextChanged', ({ payload }) => seen.push(`changed:${payload.version}`))

  const health = new HealthPublisher(context)
  health.update({ status: 'healthy', message: 'ok' })
  health.publish({ status: 'warning', message: 'w' })

  assert.deepEqual(seen, [
    'created:1',
    'changed:1',
    'updated:2:health',
    'changed:2',
  ])
  context.dispose()
})

test('KernelContext emite PublisherRegistered, PublisherUpdated y PublisherRemoved', () => {
  const context = new KernelContext(() => 't')
  const seen: string[] = []
  context.events.on('PublisherRegistered', ({ payload }) => seen.push(`registered:${payload.domain}`))
  context.events.on('PublisherUpdated', ({ payload }) => seen.push(`updated:${payload.domain}`))
  context.events.on('PublisherRemoved', ({ payload }) => seen.push(`removed:${payload.domain}`))

  const health = new HealthPublisher(context)
  health.update({ status: 'healthy', message: 'ok' })
  health.remove()

  assert.deepEqual(seen, ['registered:health', 'updated:health', 'removed:health'])
  context.dispose()
})

test('KernelContextEventBus permite desuscribirse', () => {
  const context = new KernelContext()
  let count = 0
  const off = context.events.on('ContextChanged', () => {
    count += 1
  })
  const health = new HealthPublisher(context)
  health.update({ message: 'a' })
  off()
  health.update({ message: 'b' })
  assert.equal(count, 1)
  context.dispose()
})
