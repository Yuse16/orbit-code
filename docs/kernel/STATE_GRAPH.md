# State Graph del KernelContext

## Grafo de estado

```text
┌──────────────┐   eventos   ┌────────────────────┐
│  Runtime     │────────────▶│ RuntimePublisher   │
└──────────────┘             └─────────┬──────────┘
┌──────────────┐  snapshots ┌─────────▼──────────┐
│ MissionStore │───────────▶│ MissionPublisher   │
└──────────────┘            │ ProviderPublisher  │
                            │ MemoryPublisher    │
                            │ NotificationPub.   │
                            └─────────┬──────────┘
┌──────────────┐   eventos   ┌─────────▼──────────┐
│ Scheduler    │────────────▶│ SchedulerPublisher │
└──────────────┘             └─────────┬──────────┘
┌──────────────┐   eventos   ┌─────────▼──────────┐
│ Capabilities │────────────▶│ CapabilityPublisher│
└──────────────┘             └─────────┬──────────┘
┌──────────────┐   eventos   ┌─────────▼──────────┐
│ KernelHealth │────────────▶│ HealthPublisher    │
└──────────────┘             └─────────┬──────────┘
┌──────────────┐   eventos   ┌─────────▼──────────┐
│ DNA          │────────────▶│ WorkspacePublisher │
└──────────────┘             └─────────┬──────────┘
                                      ┌▼──────────┐
                                      │ KernelContextStore │
                                      │ version + snapshot │
                                      └─────┬─────┘
                                            │
                        KernelContextReader │  solo lectura
                                            ▼
                                     Consumidores
```

## Flujo de publicación

1. Un subsistema emite un evento o actualiza su store.
2. El Kernel (único compositor) escucha el evento.
3. El Kernel alimenta al Publisher correspondiente.
4. El Publisher escribe su dominio en `KernelContextStore`.
5. El store incrementa `version`, genera `KernelSnapshot` y emite eventos.

## Eventos del contexto

- `SnapshotCreated` — primera versión del snapshot.
- `SnapshotUpdated` — versión posterior con dominios cambiados.
- `PublisherRegistered` — un dominio quedó registrado.
- `PublisherUpdated` — un dominio fue actualizado.
- `PublisherRemoved` — un dominio fue eliminado.
- `ContextChanged` — el contexto cambió (versión + dominios).
