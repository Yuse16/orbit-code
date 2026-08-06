# Model Selection

## Propósito

`model-routing.mts` define las reglas simuladas de selección de modelos para
el Director. Es una tabla determinista: ninguna llamada a proveedores reales.

Los resultados alimentan `ExecutionPlan.recommendedModels`.

## Tabla simulada

| Tipo | low | medium | high | complex |
|---|---|---|---|---|
| frontend | opencode | v0 | v0 | v0 |
| backend | opencode | codex | codex | codex |
| database | opencode | codex | codex | codex |
| refactor | opencode | opencode | codex | codex |
| explanation | chatgpt | chatgpt | chatgpt | chatgpt |
| repetitive | local-model | local-model | opencode | opencode |
| documentation | opencode | opencode | opencode | opencode |
| tests | opencode | opencode | codex | codex |
| generic | opencode (default) | | | |

## Ajuste por política

`applyPolicyToRoute(route, policy)`:

- Sin modelos externos → `local-model`.
- Preferir velocidad → `opencode`.
- Sin modelos de pago y ruta de pago → `local-model` o `opencode`.

## Restricciones

- Límite de modelos distintos por política (`maxDistinctModels`): si se
  excede, la tarea pasa a `opencode`.
- Catálogos: `PAID_MODELS` y `LOCAL_MODELS`.

## Relación con MODEL_ROUTER.md

`MODEL_ROUTER.md` define la política conceptual (niveles, fallback,
presupuesto y privacidad). Este módulo es la implementación simulada mínima:
debe evolucionar sin cambiar la interfaz `ModelRouter`.

## Estados del motor

El Director aún no consulta disponibilidad, sesión ni créditos reales.
Eso llega en una fase posterior sin cambiar la forma del `ExecutionPlan`.

## Estado

- Implementado en `lib/director/model-routing.mts`.
- Cubierto por `tests/director-routing.test.mts`.
