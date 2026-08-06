# Task Planner

## Propósito

`TaskPlanner.plan(request)` divide la solicitud del usuario en `PlannedTask`s.
Es determinista y no depende de modelos externos.

## Comportamiento

- Si la solicitud especifica `kind`, se genera una tarea enfocada.
- Si el `kind` se infiere del texto, se genera una tarea enfocada.
- Si la solicitud es genérica, se descompone en el pipeline completo.

## Inferencia de tipo

Palabras clave en minúsculas (ejemplos):

| Tipo | Palabras clave |
|---|---|
| frontend | ui, interfaz, frontend, componente, página, vista, formulario, layout |
| backend | backend, api, servicio, endpoint, lógica |
| database | base de datos, database, schema, migración, tabla |
| refactor | refactor, refactorizar, limpiar, simplificar |
| explanation | explicar, cómo funciona, qué hace, entender |
| repetitive | repetitivo, boilerplate, plantilla |
| documentation | documentar, documentación, readme, changelog |
| tests | pruebas, test, testing, cobertura |

Sin coincidencia: `generic`.

## Inferencia de complejidad

| Complejidad | Palabras clave |
|---|---|
| low | pequeño, rápido, simple, sencillo |
| medium | (valor por defecto) |
| high | avanzado, difícil, largo |
| complex | complejo, complicado, gran escala |

## Pipeline genérico

```text
frontend → backend → database → tests → documentation
```

Cada tarea depende de la anterior (`task-1` es raíz). Esto produce
`parallelTasks = [task-1]` y el resto en `sequentialTasks`.

## Etapa por tipo

| Tipo | Etapa |
|---|---|
| frontend | diseno |
| backend / database / repetitive / generic | implementacion |
| refactor | correccion |
| tests | pruebas |
| documentation | publicacion |
| explanation | exploracion |

## Prioridad por tipo

| Tipo | Prioridad |
|---|---|
| backend / database | high |
| frontend / refactor / tests / generic | normal |
| documentation / explanation / repetitive | low |

## Estado

- Implementado en `lib/director/task-planner.mts`.
- Cubierto por `tests/director-planner.test.mts`.
