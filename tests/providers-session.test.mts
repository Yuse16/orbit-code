import assert from 'node:assert/strict'
import test from 'node:test'
import { ProviderSession, ProviderRegistry } from '../lib/providers/index.mts'

test('ProviderSession.login autentica y devuelve un snapshot de sesión', () => {
  const session = new ProviderSession()
  const account = new ProviderRegistry().get('openai')
  assert.ok(account)

  const snapshot = session.login(account)
  assert.equal(snapshot.providerId, 'openai')
  assert.equal(snapshot.authenticated, true)
  assert.equal(snapshot.status, 'authenticated')
  assert.ok(snapshot.expiresAt > snapshot.authenticatedAt)
  assert.ok(snapshot.tokenPreview.startsWith('sk-sim-'))
  assert.equal(account.authenticated, true)
  assert.equal(account.connected, true)
  assert.equal(session.activeCount, 1)
})

test('ProviderSession.logout cierra la sesión y desconecta la cuenta', () => {
  const session = new ProviderSession()
  const account = new ProviderRegistry().get('openai')
  assert.ok(account)
  session.login(account)
  session.logout(account)

  assert.equal(session.snapshotFor('openai'), null)
  assert.equal(account.authenticated, false)
  assert.equal(account.connected, false)
  assert.equal(session.activeCount, 0)
})

test('ProviderSession.refresh renueva la expiración', () => {
  const session = new ProviderSession()
  const account = new ProviderRegistry().get('openai')
  assert.ok(account)
  const before = session.login(account)
  const refreshed = session.refresh(account)
  assert.ok(refreshed)
  assert.equal(refreshed.authenticated, true)
  assert.ok(refreshed.expiresAt >= before.expiresAt)
})

test('ProviderSession.refresh sin sesión activa devuelve null', () => {
  const session = new ProviderSession()
  const account = new ProviderRegistry().get('openai')
  assert.ok(account)
  assert.equal(session.refresh(account), null)
})

test('ProviderSession.expire marca la sesión como expirada', () => {
  const session = new ProviderSession()
  const account = new ProviderRegistry().get('openai')
  assert.ok(account)
  session.login(account)
  session.expire(account)

  const snapshot = session.snapshotFor('openai')
  assert.equal(snapshot?.status, 'expired')
  assert.equal(snapshot?.authenticated, false)
  assert.equal(account.authenticated, false)
})

test('ProviderSession.session de una cuenta sin sesión devuelve null', () => {
  const session = new ProviderSession()
  const account = new ProviderRegistry().get('anthropic')
  assert.ok(account)
  assert.equal(session.session(account), null)
})
