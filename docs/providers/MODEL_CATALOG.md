# Catálogo de proveedores y modelos

Todo el catálogo es **simulado y determinista**. Los precios, velocidades y
calidades son estimaciones locales con fines de demostración.

## Proveedores (13)

| id | nombre | categoría | velocidad | calidad | modelos | límite |
|---|---|---|---|---|---|---|
| `openai` | OpenAI | cloud | 4 | 4 | gpt-4o, gpt-4.1, o3-mini | 2000 |
| `anthropic` | Anthropic | cloud | 4 | 5 | claude-sonnet-4, claude-haiku-4 | 2000 |
| `google` | Google | cloud | 4 | 4 | gemini-2.5-pro, gemini-2.5-flash | 2000 |
| `openrouter` | OpenRouter | aggregator | 4 | 4 | openrouter-auto | 1000 |
| `ollama` | Ollama | local | 3 | 3 | llama-3.1 | 0 |
| `lm-studio` | LM Studio | local | 3 | 3 | llama-4-scout | 0 |
| `azure-openai` | Azure OpenAI | cloud | 4 | 4 | azure-gpt-4o | 1500 |
| `v0` | V0 | visual | 3 | 4 | gpt-image | 200 |
| `github-models` | GitHub Models | cloud | 4 | 4 | github-gpt-4o-mini | 300 |
| `mistral` | Mistral AI | cloud | 4 | 4 | mistral-large, codestral | 1000 |
| `together` | Together AI | cloud | 4 | 3 | qwen-coder | 1000 |
| `groq` | Groq | cloud | 5 | 3 | groq-llama-3.3, groq-mixtral | 1000 |
| `deepseek` | DeepSeek | cloud | 3 | 4 | deepseek-r1, deepseek-v3 | 1000 |

Los proveedores locales (`ollama`, `lm-studio`) nacen conectados y autenticados,
sin créditos (`null`). Los externos nacen desconectados y sin sesión.

## Modelos (20)

Campos por modelo: `nombre`, `proveedor`, `tipo`, `razonamiento`, `coding`,
`frontend`, `backend`, `documentación`, `visión`, `herramientas`, `ventana de
contexto`, `velocidad`, `costo`.

| id | proveedor | tipo | raz | cod | f/e | b/e | doc | vis | tools | ctx | vel |
|---|---|---|---|---|---|---|---|---|---|---|---|
| gpt-4o | openai | chat | 4 | 4 | 4 | 4 | 4 | sí | sí | 128k | 4 |
| gpt-4.1 | openai | chat | 4 | 4 | 4 | 4 | 4 | sí | sí | 1M | 4 |
| o3-mini | openai | reasoning | 5 | 5 | 3 | 5 | 3 | no | sí | 200k | 4 |
| claude-sonnet-4 | anthropic | chat | 5 | 5 | 5 | 5 | 5 | sí | sí | 200k | 4 |
| claude-haiku-4 | anthropic | chat | 3 | 4 | 3 | 4 | 4 | sí | sí | 200k | 5 |
| gemini-2.5-pro | google | chat | 5 | 4 | 4 | 4 | 4 | sí | sí | 1M | 4 |
| gemini-2.5-flash | google | chat | 4 | 4 | 3 | 4 | 3 | sí | sí | 1M | 5 |
| openrouter-auto | openrouter | chat | 4 | 4 | 4 | 4 | 4 | sí | sí | 128k | 4 |
| deepseek-r1 | deepseek | reasoning | 5 | 5 | 3 | 5 | 3 | no | no | 128k | 3 |
| deepseek-v3 | deepseek | chat | 4 | 4 | 4 | 4 | 3 | no | sí | 128k | 3 |
| mistral-large | mistral | chat | 4 | 4 | 3 | 4 | 3 | no | sí | 128k | 4 |
| codestral | mistral | code | 3 | 5 | 3 | 5 | 3 | no | sí | 256k | 4 |
| groq-llama-3.3 | groq | chat | 3 | 3 | 3 | 3 | 3 | no | sí | 131k | 5 |
| groq-mixtral | groq | chat | 3 | 3 | 2 | 3 | 2 | no | no | 32k | 5 |
| llama-3.1 | ollama | chat | 2 | 2 | 2 | 2 | 2 | no | no | 131k | 3 |
| llama-4-scout | lm-studio | chat | 3 | 3 | 3 | 3 | 3 | sí | no | 10M | 3 |
| qwen-coder | together | code | 3 | 4 | 3 | 4 | 2 | no | sí | 131k | 4 |
| gpt-image | v0 | image | 1 | 1 | 5 | 1 | 1 | sí | no | 16k | 3 |
| azure-gpt-4o | azure-openai | chat | 4 | 4 | 4 | 4 | 4 | sí | sí | 128k | 4 |
| github-gpt-4o-mini | github-models | chat | 3 | 3 | 3 | 3 | 3 | sí | sí | 128k | 5 |

Los modelos locales (`llama-3.1`, `llama-4-scout`) tienen costo cero. Escala de
capacidades: 1 (débil) a 5 (excelente).

## Cómo leer el catálogo

```ts
import { getModelInfo, getModelsByProvider } from '../lib/providers/index.mts'

const model = getModelInfo('gpt-4o')        // ModelInfo | null
const openai = getModelsByProvider('openai') // ReadonlyArray<ModelInfo>
```
