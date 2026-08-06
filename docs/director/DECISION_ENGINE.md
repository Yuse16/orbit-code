# Decision Engine

## Propósito

`DecisionEngine.decide(context)` convierte un `DecisionContext` en un
`ExecutionPlan`. Es una función pura: recibe lo que el Director puede leer y
devuelve una decisión, sin efectos secundarios.

## Entradas

```text
DecisionContext
├── request (objetivo, tipo, complejidad, política)
├── kernel (lifecycle, health, capabilities, scheduler, providers, memory, dna)
├── workspaceSnapshot (opcional)
├── currentStage (opcional)
└── runtimeHealth
```

## Salidas

```text
ExecutionPlan
├── recommendedModels
├── recommendedAdapters
├── requiredCapabilities
├── estimatedTokens / estimatedCost / estimatedTimeMinutes
├── approvalRequired
├── parallelTasks / sequentialTasks
├── fallbackPlan
├── confidence
├── reasoningSummary
└── reasons (trazables)
```

## Estimación simulada

Los valores son deterministas y locales. No consultan APIs.

| Tipo | Tokens base | Minutos base |
|---|---|---|
| frontend | 12 000 | 45 |
| backend | 16 000 | 60 |
| database | 6 000 | 30 |
| tests | 8 000 | 40 |
| documentation | 4 000 | 20 |
| refactor | 5 000 | 25 |
| explanation | 3 000 | 10 |
| repetitive | 2 000 | 10 |
| generic | 10 000 | 50 |

Multiplicador por complejidad:

| Complejidad | Multiplicador |
|---|---|
| low | 1.0 |
| medium | 1.4 |
| high | 1.8 |
| complex | 2.4 |

Costo por 1000 tokens simulado por modelo:

| Modelo | Costo/1k |
|---|---|
| v0 | 1.5 |
| codex | 0.9 |
| claude | 1.2 |
| gemini | 0.5 |
| chatgpt | 0.3 |
| opencode | 0.15 |
| local-model | 0 |

## Políticas

Cada política ajusta los límites de la decisión.

| Política | Modelos | Externos | Pago | Aprobación | Velocidad |
|---|---|---|---|---|---|
| balanced | 3 | sí | sí | no | no |
| minimum-cost | 2 | sí | no | no | no |
| maximum-quality | 4 | sí | sí | no | no |
| offline | 1 | no | no | no | no |
| fast | 1 | sí | sí | no | sí |
| safe | 1 | no | no | sí | no |

## Confianza

```text
base 0.5
+ 0.2 si hay DNA
+ 0.1 si el runtime está healthy
+ 0.1 si el workspaceSnapshot tiene confianza > 0
− 0.2 si el runtime está en error
```

## Restricciones

- La complejidad y el tipo se infieren si la solicitud no los declara.
- El plan nunca recomienda un modelo desconocido.
- Con política `offline` o `safe`, todos los modelos son `local-model`.
- La política `safe` siempre exige aprobación.

## Estado

- Implementado en `lib/director/decision-engine.mts`.
- Cubierto por `tests/director-engine.test.mts`.
