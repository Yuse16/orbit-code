# Publishers del KernelContext

## Contrato

Cada Publisher solo puede:

```text
publish(state)      reemplaza el estado completo de su dominio
update(changes)     fusiona cambios parciales en su dominio
remove()            elimina su dominio del contexto
snapshot()          lee el estado actual de su propio dominio
```

## Reglas

- Un Publisher jamás accede a otro Publisher.
- Un Publisher jamás accede directamente a otro módulo.
- Un Publisher solo escribe en su propio dominio dentro de `KernelContextStore`.

## Catálogo

| Publisher | Dominio | Alimentado por |
| --- | --- | --- |
| `RuntimePublisher` | `runtime` | eventos del Runtime |
| `MissionPublisher` | `mission` | snapshots de MissionStore |
| `SchedulerPublisher` | `scheduler` | eventos del Scheduler |
| `CapabilityPublisher` | `capabilities` | eventos de CapabilityRegistry |
| `ProviderPublisher` | `providers` | snapshots de MissionStore |
| `MemoryPublisher` | `memory` | snapshots de MissionStore |
| `NotificationPublisher` | `notifications` | snapshots de MissionStore |
| `WorkspacePublisher` | `workspace` | composición del Kernel (DNA) |
| `HealthPublisher` | `health` | eventos de salud del Kernel |

El Kernel es el único que compone subsistemas y alimenta los Publishers.

## Flujo

```text
Subsistema -> evento -> Kernel (compositor) -> Publisher -> KernelContextStore
```

El Publisher no conoce al subsistema; el subsistema no conoce al Publisher.
