# Presupuesto simulado

## Propósito

`ProviderBudget` **estima** el consumo y costo de una tarea a partir del
catálogo y de la política activa. Nunca ejecuta, consume ni descuenta nada
real.

## Entrada y salida

```ts
interface BudgetInput {
  modelId?: ModelId
  providerId?: ProviderId
  inputTokens: number
  outputTokens?: number
}

interface BudgetEstimate {
  estimatedCost: number        // USD, según precios del catálogo
  estimatedCredits: number     // créditos simulados
  estimatedTokens: number      // input + output
  remainingBudget: number      // créditos restantes (Infinity si no aplica)
  approvalRequired: boolean
}
```

## Fórmulas

Con `model` del catálogo y `policy` de la política activa:

```text
estimatedCost =
  per1kInput * inputTokens/1000 + per1kOutput * outputTokens/1000

estimatedCredits = creditsPer1kInput * inputTokens/1000

remainingBudget = credits === null ? Infinity : max(0, credits - estimatedCredits)

approvalRequired = policy.requireApproval && estimatedCost >= policy.approvalThreshold
```

Si no hay modelo (`modelId` ausente o desconocido), se devuelve una
estimación genérica con costo y créditos `0`.

## Ejemplo

Modelo `gpt-4o` (`per1kInput` 0.005, `per1kOutput` 0.015,
`creditsPer1kInput` 0.5), 1000 tokens de entrada y 500 de salida:

| campo | valor |
|---|---|
| estimatedCost | 0.005 × 1 + 0.015 × 0.5 = **0.0125** |
| estimatedCredits | 0.5 × 1 = **0.5** |
| estimatedTokens | **1500** |
| remainingBudget (con 100 créditos) | **99.5** |
| approvalRequired (umbral 2) | **false** |

## Políticas y aprobación

| política | requireApproval | umbral | notas |
|---|---|---|---|
| `balanced` | true | 2 | hasta 3 proveedores activos |
| `minimum-cost` | true | 5 | prioriza costo |
| `maximum-quality` | true | 1 | prioriza calidad |
| `offline` | true | 2 | solo locales, presupuesto 0 |
| `safe` | true | 2 | solo locales, 1 proveedor |
| `fast` | false | 10 | sin aprobación obligatoria |

## Cómo usarlo

```ts
import { ProviderManager } from '../lib/providers/index.mts'

const manager = new ProviderManager()
manager.login('openai')
const estimate = manager.estimateBudget({ modelId: 'gpt-4o', inputTokens: 1000 })
// { estimatedCost: 0.005, estimatedCredits: 0.5, remainingBudget: 0, ... }
```

## Reglas

- Solo estimaciones: `ProviderBudget` no descuenta créditos ni suma costos.
- El acumulado de costo por cuenta (`ProviderAccount.addEstimatedCost`) existe
  solo como campo simulado del snapshot.
- La política activa se define con `ProviderManager.setPolicy(id)`.
