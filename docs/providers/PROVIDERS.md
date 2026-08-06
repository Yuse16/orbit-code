# Provider Manager

## Propósito

El Provider Manager es el módulo que modela, de forma **simulada y
determinista**, el estado de los proveedores de modelos: cuentas, conexión,
autenticación, catálogo de modelos, presupuesto y salud.

Ninguna ruta consume APIs reales (OpenAI, Anthropic, Google, OpenRouter,
Ollama, etc.). Todo valor es una estimación local generada por el módulo.

## Regla de oro

> El Director consulta al Provider Manager. Nadie más consulta al Director.

El flujo de acceso es estrictamente:

```text
React → Mission Control → Director → ProviderManager
```

- React y los componentes de UI usan `useOrbit()` (Mission Control), nunca
  importan `ProviderManager` directamente.
- El Director recibe el **read model** (`ProviderManagerReadModel`) por
  composición y lo consulta de forma read-only antes de construir un
  `ExecutionPlan`.
- El read model no expone escritura: `login`, `logout`, `connect`, etc. quedan
  fuera del alcance del Director.

## Arquitectura

| Archivo | Responsabilidad |
|---|---|
| `lib/providers/types.mts` | Tipos del dominio (`ProviderSnapshot`, `ModelInfo`, `BudgetEstimate`, etc.). |
| `lib/providers/provider-catalog.mts` | Catálogo de los 13 proveedores simulados. |
| `lib/providers/model-catalog.mts` | Catálogo de modelos con capacidades y precios. |
| `lib/providers/provider-account.mts` | Estado mutable por proveedor y snapshot plano. |
| `lib/providers/provider-registry.mts` | Registro de cuentas (una por proveedor). |
| `lib/providers/provider-session.mts` | Sesión simulada (`login/logout/refresh/session`). |
| `lib/providers/provider-budget.mts` | Estimación de presupuesto (solo estimaciones). |
| `lib/providers/provider-policy.mts` | Políticas de uso (`balanced`, `offline`, `safe`, etc.). |
| `lib/providers/provider-health.mts` | Resumen de salud agregado. |
| `lib/providers/provider-manager.mts` | Fachada pública + read model para el Director. |
| `lib/providers/index.mts` | Exports públicos del módulo. |

## Flujo

```text
UI (pestaña Proveedores)
  → useOrbit()  (Mission Control)
  → Director.decide  → read model (solo lectura)
  → ProviderManager
      ├── ProviderRegistry   (cuentas)
      ├── ProviderCatalog    (proveedores)
      ├── ModelCatalog       (modelos)
      ├── ProviderSession    (auth simulada)
      ├── ProviderBudget     (estimaciones)
      ├── ProviderPolicy     (restricciones)
      └── ProviderHealth     (resumen)
```

## Campos de un proveedor

Cada proveedor expone (via `ProviderSnapshot`):

`id`, `nombre`, `estado`, `conectado`, `autenticado`, `créditos disponibles`,
`límite`, `costo estimado`, `modelos disponibles`, `velocidad estimada`,
`calidad estimada`, más su `health` agregado.

Ver `docs/providers/MODEL_CATALOG.md` para el detalle por proveedor y modelo.

## Cómo usarlo (Director)

```ts
import { createDirector } from '../lib/director/index.mts'
import { ProviderManager } from '../lib/providers/index.mts'

const manager = new ProviderManager()
const director = createDirector({ providers: manager.readModel() })

const plan = director.decide({
  request: { objective: 'Construir la aplicación completa' },
  kernel: kernel.createReader(),
})
// plan.reasons incluye fuentes 'providers' y 'budget' cuando hay read model.
```

## Límites actuales

- No hay llamadas a proveedores reales; todo es estimación local.
- La autenticación es simulada (ver `docs/providers/AUTH.md`).
- El presupuesto solo estima (ver `docs/providers/BUDGET.md`).
- El estado vive en memoria dentro del ProviderManager.
- El estado del ProviderManager es independiente del estado de proveedores del
  Kernel/Mission Control; la unificación es trabajo futuro.

## Estado

- Implementado y cubierto por pruebas en `tests/providers-*.test.mts` y
  `tests/director-providers.test.mts`.
