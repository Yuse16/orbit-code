# Workspace Discovery

## Propósito

`WorkspaceDiscovery` es el primer adaptador **real** de Orbit. Inspecciona
**únicamente** el proyecto abierto y genera un `WorkspaceSnapshot` con el
perfil tecnológico del workspace:

- Framework
- Lenguaje
- Package manager
- Build system
- Frontend
- Backend
- Desktop
- Base de datos
- Testing
- Lint
- Formatter
- Deployment
- Monorepo

## Garantías de solo lectura

- No modifica archivos.
- No escribe archivos.
- No ejecuta npm, git ni procesos.
- No abre terminal.
- No accede a internet.
- Solo lee el árbol de directorios del proyecto abierto.

## Arquitectura

```text
WorkspaceAdapter (RuntimeAdapter 'workspace')
├── WorkspaceDetector      orquesta escaneo + análisis + eventos
│   ├── WorkspaceScanner    lista archivos del proyecto (solo lectura)
│   │   └── lister          por defecto node:fs (readdirSync/statSync)
│   │                       inyectable para pruebas (lista virtual)
│   └── WorkspaceAnalyzer   convierte archivos detectados en categorías
└── WorkspaceEvents         canal de eventos del descubrimiento
```

El `WorkspaceAdapter` publica el resultado **mediante `WorkspacePublisher`**.
Nunca accede directamente al `KernelContext`.

## Archivos conocidos

| Archivo | Señal |
| --- | --- |
| `package.json` | manifiesto JS/TS |
| `pnpm-workspace.yaml` | pnpm + monorepo |
| `package-lock.json` | npm |
| `yarn.lock` | yarn |
| `bun.lockb` | bun |
| `Cargo.toml` | Rust / cargo |
| `docker-compose.yml` | infraestructura compose |
| `Dockerfile` | contenedores / deploy docker |
| `next.config.*` | Next.js |
| `vite.config.*` | Vite |
| `astro.config.*` | Astro |
| `nuxt.config.*` | Nuxt |
| `angular.json` | Angular |
| `tsconfig.json` | TypeScript |
| `tailwind.config.*` | Tailwind |
| `eslint.config.*` | ESLint |
| `.prettierrc*` | Prettier |
| `turbo.json` | Turborepo |
| `nx.json` | Nx |
| `supabase/` | Supabase (base de datos) |
| `src-tauri/` | Tauri (desktop) |
| `vercel.json` | Vercel (deployment) |

Señales adicionales del análisis: `pnpm-lock.yaml`, `.eslintrc*`,
`playwright.config.*`, `vitest.config.*`, `jest.config.*`, `schema.prisma`,
`prisma/`, `netlify.toml`, `index.html`, `app/`, `pages/`, `src/App.*`.

## Flujo

1. `WorkspaceAdapter.start()` llama a `WorkspaceDetector.detect({ root })`.
2. `WorkspaceDetector` emite `WorkspaceScanStarted`.
3. `WorkspaceScanner.scan(root)` lista archivos (raíz, profundidad limitada,
   ignorando `node_modules`, `.git`, `.next`, `dist`, `out`, `build`, ...).
4. El escáner devuelve `WorkspaceScanResult` (entradas + archivos conocidos).
5. `WorkspaceAnalyzer.analyze(result)` calcula las 13 categorías y la
   confianza.
6. `WorkspaceDetector` compone el `WorkspaceSnapshot` y emite
   `WorkspaceScanCompleted` y `WorkspaceDetected`.
7. `WorkspaceAdapter` publica el resultado en `WorkspacePublisher`.

## Snapshot

```text
{
  projectName, root, framework, language, packageManager, buildSystem,
  frontend, backend, desktop, database, testing, lint, formatter,
  deployment, monorepo, detectedFiles, confidence, timestamp
}
```

Ejemplo (proyecto Next.js + Tauri + pnpm):

```text
projectName:    orbit-code
root:           /proyectos/orbit-code
framework:      next
language:       typescript
packageManager: pnpm
buildSystem:    next
frontend:       react-app-router
backend:        none
desktop:        tauri
database:       none
testing:        none
lint:           eslint
formatter:      prettier
deployment:     vercel
monorepo:       none
detectedFiles:  [package.json, next.config.ts, tsconfig.json, eslint.config.mjs,
                 .prettierrc, src-tauri, vercel.json, pnpm-workspace.yaml]
confidence:     0.89
timestamp:      2026-08-05T14:00:00.000Z
```

La confianza es determinista: `0` sin señales; `min(1, 0.25 + señales * 0.08)`
con señales detectadas.

## Eventos

| Evento | Payload |
| --- | --- |
| `WorkspaceScanStarted` | `{ root }` |
| `WorkspaceScanCompleted` | `{ root, detectedFiles }` |
| `WorkspaceDetected` | `{ snapshot }` |
| `WorkspaceScanFailed` | `{ root, error }` |

## Publicación en el Kernel

El `WorkspaceAdapter` recibe un `WorkspacePublisher` (vía `connect()` o
constructor) y publica un `WorkspaceContextState` derivado del snapshot:

- `strategy`: `monorepo:<tipo>` / `single-project` / `sin-configurar`.
- `structureDetected`: `true` si hay señales detectadas.
- `indexedAt`: `timestamp` del snapshot.

El Kernel puede recibir el adaptador real como opción (`workspaceAdapter`);
si está presente, conecta su `WorkspacePublisher` y el adaptador publica sin
tocar `KernelContext`.

## Límites

- Detección basada en nombres y rutas; no lee el contenido de los archivos.
- Un snapshot sin señales devuelve `confidence: 0` y categorías `unknown`.
