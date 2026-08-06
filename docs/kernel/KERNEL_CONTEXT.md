# KernelContext

## Propósito

`KernelContext` es la única fuente de verdad unificada de Orbit. Todos los
subsistemas publican su estado mediante Publishers y ningún consumidor puede
leer un subsistema directamente: todo se lee desde `KernelContext`.

## Dominios

El snapshot unificado expone un solo objeto con:

| Dominio | Contenido | Publisher |
| --- | --- | --- |
| `runtime` | lifecycle, health, adapters, capacidades | `RuntimePublisher` |
| `mission` | project, git, localhost, agents, tasks, desktop, build, guidance | `MissionPublisher` |
| `scheduler` | status, queue | `SchedulerPublisher` |
| `workspace` | strategy, structureDetected, indexedAt | `WorkspacePublisher` |
| `providers` | conexiones, proveedor primario/secundario | `ProviderPublisher` |
| `memory` | status, lastSavedAt, summaryAvailable | `MemoryPublisher` |
| `notifications` | items, unreadCount | `NotificationPublisher` |
| `capabilities` | catálogo de capabilities | `CapabilityPublisher` |
| `health` | status, message | `HealthPublisher` |
| `dna` | descripción del proyecto | Kernel (vía publisher) |
| `timestamp` / `version` | metadatos del snapshot | KernelContextStore |

## Clases

- `KernelContext` — fachada pública; propietaria del store y de los publishers.
- `KernelContextStore` — guarda el estado por dominio y versiona snapshots.
- `KernelContextPublisher` — base que publica/actualiza/elimina su dominio.
- `KernelContextReader` — vista de solo lectura para consumidores.
- `KernelSnapshot` — snapshot inmutable, versionado y con marca de tiempo.
- `KernelState` — registro dominio → estado.

## Regla de acceso

```text
Runtime ---------------+      +----------------> KernelContextReader
Mission Runtime -------+      |  read only
Scheduler -------------+      |
Providers -------------+      |
Capabilities ----------+      |
Memory ----------------+ -> Publishers -> KernelContextStore -> KernelSnapshot
Notifications ---------+      |
Workspace -------------+      |
Health ----------------/      |

Ningún subsistema lee a otro subsistema.
Mission Runtime NO consulta Runtime. Runtime NO consulta Mission Runtime.
```

## Compatibilidad

`Kernel.getSnapshot()` y `Kernel.getContext()` (estado operativo del Kernel:
lifecycle, modules, salud interna) se conservan como proyección de
compatibilidad. Los consumidores migran a `KernelContext` en incrementos
posteriores.
