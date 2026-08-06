# Director

## Propósito

El Director es el único responsable de decidir qué hacer. Recibe una
solicitud del usuario y devuelve un `ExecutionPlan`. No ejecuta acciones, no
llama modelos, no toca Git, terminal, archivos ni redes: solo lee y decide.

Esta versión es simulada y determinista. Ninguna ruta consume APIs reales.

## Regla de oro

> El Director no ejecuta. Ejecuta el plan que el Director produce.

Un `ExecutionPlan` describe qué tareas hacer, con qué modelos, qué adaptadores
se necesitan, cuánto cuesta, cuánto tiempo toma, si requiere aprobación y
cuál es el fallback.

## Dependencias

El Director solo puede leer a través de `KernelContextReader`. Nada más.

```text
Director
├── lee KernelContext (solo lectura)
├── recibe WorkspaceSnapshot opcional
├── decide con DecisionEngine
└── guarda en DecisionHistory
```

## Límites actuales

- No hay llamadas a proveedores reales.
- Los modelos, costos y tiempos son estimaciones simuladas.
- El historial vive en memoria y se limpia con `dispose()`.
- No hay persistencia ni auditoría externa todavía.

## Arquitectura

| Archivo | Responsabilidad |
|---|---|
| `lib/director/types.mts` | Tipos del dominio del Director. |
| `lib/director/director.mts` | Fachada `Director` y `createDirector`. |
| `lib/director/decision-engine.mts` | Motor puro que convierte contexto en plan. |
| `lib/director/decision-context.mts` | Snapshot de lo que el Director puede leer. |
| `lib/director/decision-policy.mts` | Políticas de decisión (`balanced`, `offline`, etc.). |
| `lib/director/decision-history.mts` | Historial de decisiones en memoria. |
| `lib/director/execution-plan.mts` | Forma del plan y validación. |
| `lib/director/model-routing.mts` | Reglas simuladas de selección de modelos. |
| `lib/director/task-planner.mts` | División de solicitudes en tareas. |
| `lib/director/decision-reason.mts` | Justificación trazable de cada decisión. |
| `lib/director/index.mts` | Exports públicos del módulo. |

## Flujo

```text
Solicitud del usuario
  → Director.decide
  → createDecisionContext (solo lectura)
  → DecisionEngine.decide
  → ExecutionPlan
  → DecisionHistory.push
```

## Cómo usarlo

```ts
import { createDirector } from '../lib/director/index.mts'

const director = createDirector({ policy: 'balanced' })
const plan = director.decide({
  request: { objective: 'Implementar la API de pagos', kind: 'backend' },
  kernel: kernel.createReader(),
})
```

## Políticas disponibles

Ver `docs/director/DECISION_ENGINE.md` y `MODEL_SELECTION.md`.

- `balanced`: equilibrio entre costo, calidad y velocidad.
- `minimum-cost`: prioriza el menor costo.
- `maximum-quality`: prioriza la máxima calidad.
- `offline`: solo modelos locales.
- `fast`: minimiza el tiempo.
- `safe`: exige aprobación y evita modelos externos.

## Estado

- Implementado y cubierto por pruebas en `tests/director*.test.mts`.
