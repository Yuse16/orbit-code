# Orbit Runtime Adapters

## Propósito

Los adaptadores del Runtime son la frontera declarada entre Orbit y el
sistema. Cada adaptador simula una capacidad real y publica:

- ciclo de vida (`initialize`, `start`, `stop`, `dispose`),
- salud (`health`),
- snapshot observable (`status`),
- capacidades simuladas (`capabilities`).

## Catálogo

| Adaptador | Id | Capacidades simuladas |
| --- | --- | --- |
| Desktop | `desktop` | DetectPlatform, ShowWindow, Notify |
| Git | `git` | Status, Commit, Diff, Branch, Fetch, Push |
| Localhost | `localhost` | StartPreview, StopPreview |
| Terminal | `terminal` | RunCommand |
| Filesystem | `filesystem` | ReadFile, WriteFile, ListDirectory |
| Providers | `providers` | ActivateProvider, ConnectProvider, DisconnectProvider |
| SQLite | `sqlite` | OpenDatabase, RunQuery |
| Docker | `docker` | ListContainers, StartContainer |
| MCP | `mcp` | RegisterTool, CallTool |
| GitHub | `github` | Authenticate, CreatePR, SyncRepository |
| Vercel | `vercel` | Authenticate, DeployPreview, DeployProduction |
| Supabase | `supabase` | Authenticate, RunMigration |
| Browser | `browser` | OpenTab, CaptureViewport |
| Workspace | `workspace` | DetectStructure, IndexFiles |

## Comportamiento simulado

- Al iniciar un adaptador, sus capacidades pasan de `unavailable` a
  `available` y se emite `CapabilityChanged`.
- Al detenerlo, regresan a `unavailable`.
- Un adaptador puede declararse como `failOnStart` o `warnOnStart` para
  probar `AdapterFailed`, salud `warning` y agregación de `RuntimeHealth`.

## Contrato

```text
RuntimeAdapter
├── readonly id: RuntimeAdapterId
├── readonly name: string
├── initialize(): void
├── start(): void
├── stop(): void
├── dispose(): void
├── health(): RuntimeHealthStatus
└── status(): RuntimeAdapterSnapshot
```
