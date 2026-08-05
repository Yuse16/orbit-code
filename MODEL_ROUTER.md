# MODEL_ROUTER.md

## 1. Objetivo

Seleccionar el motor más adecuado según:

- complejidad.
- riesgo.
- costo.
- privacidad.
- archivos.
- etapa.
- capacidades.
- disponibilidad.
- historial de éxito.

La primera pregunta es siempre:

> ¿Esta tarea necesita IA?

## 2. Niveles

### Nivel 0: sistema local

Costo: 0.

Usos:

- búsqueda.
- indexación.
- lectura.
- Git.
- typecheck.
- lint.
- tests.
- build.
- localhost.
- captura.
- diff.
- detección de puertos.
- análisis de imports.

### Nivel 1: modelo local futuro

Costo por petición: 0.

Usos:

- resúmenes.
- clasificación.
- documentación.
- selección preliminar de contexto.
- cambios sencillos.

Estado inicial: conector disponible, motor no instalado.

### Nivel 2: OpenRouter Free

Costo: 0 cuando exista modelo gratuito disponible.

Usos:

- textos.
- documentación.
- explicaciones.
- pruebas sencillas.
- clasificación.
- revisión preliminar.
- cambios pequeños de bajo riesgo.

Restricciones:

- sin secretos.
- sin datos personales.
- sin repositorio completo.
- respetar disponibilidad y límites.

### Nivel 3: Codex con ChatGPT

Motor principal para:

- arquitectura.
- cambios complejos.
- varios archivos.
- depuración difícil.
- integración frontend/backend.
- seguridad.
- refactorización.
- coordinación de tareas.

### Nivel 4: OpenCode con modelo económico

Usos:

- respaldo de Codex.
- cambios medianos.
- proveedor alternativo.
- tareas que requieran herramientas.
- modelos específicos.

Requiere autorización si existe costo.

### Nivel 5: modelo premium

Usos:

- segunda opinión.
- auditoría crítica.
- refactorización de alto riesgo.
- problema no resuelto.
- arquitectura sensible.

Siempre requiere autorización individual.

### Motor visual: v0

Usos:

- crear interfaz desde imagen.
- dashboard.
- páginas.
- componentes.
- responsive.
- datos simulados.

No usar para backend.

### Respaldo visual: Builder Visual Copilot

Usos:

- segunda propuesta visual.
- refinamiento.
- componentes existentes.
- consistencia de diseño.

## 3. Regla principal

```text
Local → Local model → OpenRouter Free → Codex
→ OpenCode económico → Premium autorizado
```

La ruta puede cambiar por etapa o privacidad.

## 4. Clasificación

### Complejidad

- trivial: búsqueda, texto o cambio de una línea.
- baja: un archivo sin lógica crítica.
- media: varios archivos relacionados.
- alta: arquitectura, datos, auth, pagos o migraciones.

### Riesgo

- bajo: documentación o estilos aislados.
- medio: lógica no crítica.
- alto: autenticación, permisos, datos, producción.
- crítico: pagos, secretos, migraciones destructivas.

### Sensibilidad

- pública.
- interna.
- confidencial.
- restringida.

## 5. Matriz inicial

| Tarea | Motor |
|---|---|
| Encontrar un componente | Local |
| Leer imports | Local |
| Ejecutar build | Local |
| Resumir archivo | Local futuro / Free |
| Redactar texto UI | OpenRouter Free |
| Crear prueba simple | OpenRouter Free |
| Corregir componente pequeño | OpenCode + Free |
| Implementar módulo | Codex |
| Diseñar arquitectura | Codex |
| Cambiar autenticación | Codex + auditor |
| Crear interfaz desde imagen | v0 |
| Refinar sistema visual | Builder |
| Comparar capturas | Local + Playwright |
| Auditoría crítica | Codex o premium autorizado |

## 6. Selector de etapa

### Exploración

Prioridad:

1. local.
2. local futuro.
3. OpenRouter Free.
4. Codex solo si el repositorio es complejo.

### Diseño visual

Prioridad:

1. v0.
2. Builder.
3. Codex para integrar.
4. OpenCode para ajustes pequeños.

### Implementación

Prioridad:

1. local para contexto.
2. Codex.
3. OpenCode.
4. premium autorizado.

### Corrección

Prioridad:

1. local.
2. OpenRouter Free para clasificación.
3. OpenCode.
4. Codex.

### Pruebas

Prioridad:

1. local.
2. IA únicamente para interpretar fallos.

### Publicación

Prioridad:

1. local.
2. IA solo para resumen y revisión.

### Auditoría

Prioridad:

1. herramientas locales.
2. Codex.
3. segunda opinión autorizada.

## 7. Fallback

El fallback ocurre si:

- proveedor no disponible.
- límite alcanzado.
- error.
- falta de capacidad.
- contexto insuficiente.
- privacidad incompatible.

Antes de cambiar:

- mostrar motivo.
- mostrar nuevo costo.
- mantener contexto mínimo.
- pedir autorización si aumenta costo.
- no repetir más del máximo configurado.

## 8. Presupuestos

Configuración inicial:

```text
Presupuesto automático: 0 MXN
Pago por operación: siempre preguntar
Límite mensual: configurado por usuario
```

La estimación incluye:

- entrada.
- salida máxima.
- imágenes.
- herramientas.
- reintentos.
- moneda.
- margen de seguridad.

## 9. Privacidad

Los modelos externos reciben solo:

- instrucción.
- resumen del proyecto.
- archivos relacionados.
- diff.
- errores.
- reglas.

Nunca:

- `.env`.
- claves.
- cookies.
- tokens.
- datos personales.
- archivos no relacionados.
- repositorio completo por defecto.

## 10. Historial de rendimiento

Orbit registra:

```json
{
  "taskType": "typescript-fix",
  "provider": "codex",
  "model": "detected-model",
  "success": true,
  "verification": "build-passed",
  "cost": 0,
  "durationMs": 82000
}
```

El historial ayuda a elegir, pero no reemplaza las políticas.

## 11. Configuración conceptual

```json
{
  "mode": "balanced",
  "automaticPaidBudget": 0,
  "preferLocalTools": true,
  "preferIncludedPlans": true,
  "allowFreeOpenRouter": true,
  "allowPaidProviders": false,
  "visualPrimary": "v0",
  "visualFallback": "builder",
  "complexPrimary": "codex",
  "implementationFallback": "opencode"
}
```

## 12. Transparencia

La UI siempre muestra:

- motor.
- modelo cuando sea conocido.
- razón.
- costo.
- contexto enviado.
- archivos.
- proveedor final.
- nivel de privacidad.
- fallback.

## 13. Comprobación previa del motor

Antes de una tarea:

```text
1. ¿Está configurado?
2. ¿Tiene sesión o credencial válida?
3. ¿Está disponible?
4. ¿Tiene capacidad para la tarea?
5. ¿Tiene créditos o cuota?
6. ¿Cumple privacidad?
7. ¿Cabe en presupuesto?
8. ¿Es el menor recurso suficiente?
```

## 14. Sesión no iniciada

Cuando el motor recomendado no está autenticado:

```text
El flujo recomendado utiliza: <motor>
Motivo: <capacidad requerida>

[Iniciar sesión]
[Continuar con lo disponible]
[Elegir otro motor]
[Cancelar]
```

Al autenticar, Orbit verifica y retoma la tarea. Si se continúa con lo disponible, recalcula la ruta.

## 15. Créditos o cuota agotados

Orbit consulta saldo, cuota, renovación y costo estimado cuando exista soporte oficial.

Si conoce el dato, lo muestra. Si no lo conoce, indica que el proveedor rechazó la operación y que el saldo exacto no pudo verificarse. Nunca inventa cuántos créditos faltan.

## 16. Ruta visual exacta

Para `Diseño visual`:

```text
v0
→ Builder Visual Copilot
→ Figma/Make si está conectado
→ Codex con referencia visual
→ OpenCode con modelo visual compatible
→ asistencia manual
```

Orbit informa si la alternativa puede reducir fidelidad. v0 deja de usarse después de aprobar la interfaz, salvo rediseño importante.

## 17. Cambio automático

El fallback automático siempre produce una notificación visible.

Puede ejecutarse sin modal cuando el costo es cero, la privacidad no cambia, la capacidad es equivalente, la tarea es de bajo riesgo, los archivos no cambian y `automaticFallback` está activo.

En cualquier otro caso se muestra una comparación y se pide autorización.

## 18. Conservación del progreso

El cambio de motor reutiliza resumen, plan, archivos relevantes, diff, errores, acciones completadas, restricciones y baseline visual. No reenvía toda la conversación ni el repositorio.
