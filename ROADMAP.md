# ROADMAP.md

## Principio

Cada fase debe producir una versión utilizable. No se inicia una fase avanzada si la base no es estable.

## Fase 0: Fundación documental

### Entregables

- documentación aprobada.
- repositorio privado.
- repositorio público separado.
- decisiones registradas.
- política de seguridad.
- estructura inicial.

### Criterio de salida

Todos los documentos principales existen y no se contradicen.

---

## Fase 1: Shell multiplataforma

### Objetivo

Crear Orbit Code como aplicación Tauri funcional.

### Entregables

- Tauri.
- React.
- TypeScript.
- Rust.
- layout de tres columnas.
- selector de etapa.
- configuración local.
- macOS Intel.
- build Windows mediante CI.

### Criterio de salida

La aplicación abre en macOS y genera artefacto Windows.

---

## Fase 2: Proyectos y U‑Zala

### Objetivo

Abrir U‑Zala y navegarlo.

### Entregables

- selector de carpeta.
- proyectos recientes.
- explorador.
- lectura de Git.
- detección de stack.
- `package.json`.
- búsqueda local.
- índice inicial.

### Criterio de salida

Orbit abre U‑Zala y muestra su estructura sin modificarlo.

---

## Fase 3: Localhost, código y terminal

### Entregables

- Process Manager.
- terminal.
- detectar comando de desarrollo.
- iniciar servidor.
- detectar puerto.
- webview localhost.
- Monaco.
- logs.
- reinicio.

### Criterio de salida

U‑Zala se ejecuta y se observa dentro de Orbit.

---

## Fase 4: Git seguro

### Entregables

- ramas por tarea.
- worktrees.
- diff.
- restauración.
- estados.
- aprobación.
- fusión controlada.

### Criterio de salida

Una modificación de prueba puede crearse y descartarse sin alterar `main`.

---

## Fase 5: OpenCode

### Entregables

- instalación/detección.
- servidor.
- sesiones.
- streaming.
- acciones.
- permisos.
- cambio de proveedor.

### Criterio de salida

OpenCode modifica un archivo de U‑Zala dentro de un worktree y Orbit muestra el proceso.

---

## Fase 6: Codex

### Entregables

- app-server.
- autenticación.
- sesiones.
- eventos.
- aprobación.
- cambio de cuenta.
- uso.

### Criterio de salida

Codex completa una tarea mediana con diff y verificación.

---

## Fase 7: Director, Model Router y continuidad

### Entregables

- clasificación.
- local-first.
- contexto inteligente.
- OpenRouter Free.
- presupuesto.
- fallback.
- historial.

### Criterio de salida

Orbit selecciona correctamente entre local, free, Codex y OpenCode.

---

## Fase 8: v0 visual

### Entregables

- adjuntar imagen.
- prompt visual.
- v0 API o Web Assist.
- importación.
- localhost.
- comparación.
- aprobación.
- baseline visual.

### Criterio de salida

Una pantalla de U‑Zala se crea desde una referencia y queda protegida.

---

## Fase 9: Verificación

### Entregables

- typecheck.
- lint.
- build.
- Playwright.
- capturas.
- comparación visual.
- reporte final.

### Criterio de salida

Orbit detecta una desviación visual y una regresión funcional.

---

## Fase 10: Builder y Figma

### Entregables

- Builder Visual Copilot.
- componentes existentes.
- Figma MCP.
- diseño/código.
- segunda opinión visual.

### Criterio de salida

Orbit puede usar un flujo visual alternativo sin alterar el núcleo.

---

## Fase 11: ACP y agentes adicionales

### Integraciones candidatas

- ACP.
- Antigravity.
- Claude Agent SDK.
- GitHub Copilot SDK.
- Aider.
- Goose.
- OpenHands.

### Criterio de salida

Un agente compatible puede conectarse mediante contrato universal.

---

## Fase 12: Modelos locales

### Entregables

- Ollama.
- LM Studio.
- endpoint compatible.
- servidor LAN.
- privacidad.
- detección.

### Criterio de salida

Orbit usa un modelo local o remoto autorizado para una tarea simple.

---

## Fase 13: Servicios

### Entregables

- GitHub.
- Vercel.
- Supabase.
- staging.
- logs.
- pull requests.

### Criterio de salida

Orbit prepara y despliega a staging con autorización.

---

## Fase 14: Control remoto

### Entregables

- companion web/PWA.
- estado.
- aprobaciones.
- capturas.
- tareas sencillas.
- canal seguro.

### Criterio de salida

El usuario puede aprobar una acción desde iPhone sin exponer el equipo.

## Prioridades

### P0

- seguridad.
- Git aislado.
- localhost.
- Codex.
- OpenCode.
- U‑Zala.
- macOS y Windows.

### P1

- v0.
- Router.
- OpenRouter.
- baseline.
- Playwright.

### P2

- Builder.
- Figma.
- ACP.
- integraciones adicionales.

### P3

- modelo local.
- control remoto.
- nube.

## Regla de alcance

No agregar una integración solo porque existe. Debe resolver una necesidad real y tener:

- contrato.
- seguridad.
- mantenimiento.
- fallback.
- prueba.
- valor claro.

## Fase 7.5: Bienvenida y memoria diaria

### Entregables

- Runtime Coordinator.
- saludo por hora.
- primer inicio del día.
- bienvenida espacial.
- registro incremental.
- consolidación a las 23:59.
- consolidación retroactiva.
- resumen de proyecto.
- siguiente recomendación.

### Criterio de salida

Orbit puede cerrarse antes de medianoche, abrir al día siguiente, completar la memoria pendiente y mostrar un resumen correcto sin perder el estado de la tarea.
