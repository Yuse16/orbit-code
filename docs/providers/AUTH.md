# Autenticación simulada

## Propósito

`ProviderSession` modela el ciclo de vida de una sesión de proveedor **sin
autenticación real**: no se envían credenciales, no se pide consentimiento y
no se almacenan secretos.

## Ciclo de vida

```text
sin sesión  → login()  → autenticado
autenticado → refresh() → autenticado (expiración renovada)
autenticado → expire() → expirado
autenticado → logout() → sin sesión
```

## API

```ts
import { ProviderManager } from '../lib/providers/index.mts'

const manager = new ProviderManager()

manager.login('openai')            // ProviderSessionSnapshot | null
manager.refresh('openai')          // ProviderSessionSnapshot | null
manager.session('openai')          // ProviderSessionSnapshot | null
manager.logout('openai')           // void
```

## Snapshot de sesión

```ts
interface ProviderSessionSnapshot {
  providerId: string
  status: 'none' | 'pending' | 'authenticated' | 'expired'
  authenticated: boolean
  authenticatedAt: string
  expiresAt: string
  tokenPreview: string // p. ej. "sk-sim-openai-xxxx"
}
```

- `tokenPreview` es un identificador simulado con prefijo `sk-sim-`. Nunca es
  una credencial real.
- `expiresAt` se renueva con `refresh()` a +1 hora.
- `login()` además conecta la cuenta (`setAuthenticated`).
- `logout()` además desconecta la cuenta.

## Reglas

- Solo los proveedores externos tienen sesión. Los locales
  (`ollama`, `lm-studio`) nacen autenticados sin token.
- `login`/`refresh` sobre un id desconocido devuelven `null`.
- No se persiste nada: la sesión vive en memoria del `ProviderSession`.

## Por qué simulado

La política de la fase actual no permite enviar secretos ni datos a modelos
externos (ver `AGENTS.md`). Cuando se habilite autenticación real, debe
mantenerse esta interfaz y reemplazar únicamente la implementación interna,
sin tocar la UI ni el Director.
