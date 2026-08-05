# DECISIONS.md

Registro de decisiones aprobadas.

## D-001: Nombre

**Decisión:** la aplicación se llama Orbit Code.

**Motivo:** representa un centro donde distintas herramientas y agentes orbitan alrededor del proyecto y del usuario.

---

## D-002: Aplicación de escritorio

**Decisión:** Orbit Code será una aplicación de escritorio con instalador.

**Alternativa descartada:** PWA como producto principal.

**Motivo:** necesita acceso a procesos, terminal, Git, localhost, archivos y credenciales seguras.

---

## D-003: Tecnología

**Decisión:** Tauri + React + TypeScript + Rust.

**Alternativa:** Electron.

**Motivo:** menor consumo esperado y mejor integración nativa, conservando una interfaz web.

---

## D-004: Plataformas

**Decisión:** macOS y Windows desde la arquitectura inicial.

**Motivo:** macOS es la computadora principal y Windows debe estar disponible.

---

## D-005: Mac inicial

**Decisión:** soportar Mac Intel.

**Motivo:** la computadora principal es una MacBook Pro 2017 Intel con 16 GB.

---

## D-006: Repositorios

**Decisión:**

- núcleo privado desde el primer commit.
- repositorio público separado para documentación y avances.

**Motivo:** un repositorio público puede conservar copias incluso si luego se hace privado.

---

## D-007: Proyecto piloto

**Decisión:** U‑Zala será el primer repositorio controlado por Orbit.

**Motivo:** permite experimentar sin comprometer proyectos más importantes.

---

## D-008: Separación

**Decisión:** Orbit Code y U‑Zala son repositorios independientes.

**Motivo:** Orbit debe abrir cualquier proyecto, no vivir dentro de uno.

---

## D-009: Modo

**Decisión:** modo equilibrado.

**Permite:** cambios dentro de worktree.

**Pregunta antes de:** dependencias, borrados, migraciones, commit, push y deploy.

---

## D-010: Git

**Decisión:** rama y worktree por tarea.

**Decisión adicional:** ningún agente escribe directamente en `main`.

**Motivo:** aislamiento, restauración y trabajo paralelo.

---

## D-011: Interfaz

**Decisión:** tres columnas permanentes.

- explorador.
- chat.
- área de trabajo.

**Motivo:** conservar archivos, conversación y resultado visibles.

---

## D-012: Localhost

**Decisión:** la vista previa debe permanecer disponible.

**Motivo:** observar cambios en tiempo real es parte central de la experiencia.

---

## D-013: Pestañas

**Decisión:**

- Vista previa.
- Código.
- Cambios.
- Terminal.
- Agentes.

---

## D-014: Etapas

**Decisión:**

- Exploración.
- Diseño visual.
- Implementación.
- Corrección.
- Pruebas.
- Publicación.
- Auditoría.

---

## D-015: Codex

**Decisión:** motor principal para lógica y arquitectura complejas.

---

## D-016: OpenCode

**Decisión:** motor flexible alternativo.

---

## D-017: OpenRouter

**Decisión:** modelos gratuitos para tareas sencillas y modelos económicos solo con autorización.

---

## D-018: v0

**Decisión:** diseñador visual principal mientras exista disponibilidad o crédito.

**Restricción:** uso quirúrgico; no crea toda la aplicación.

---

## D-019: Builder

**Decisión:** Builder Visual Copilot es respaldo y refinamiento visual.

---

## D-020: Protección visual

**Decisión:** una interfaz aprobada genera baseline, sistema visual y archivos protegidos.

**Motivo:** los agentes posteriores deben agregar lógica sin rediseñar.

---

## D-021: Pago

**Decisión:** presupuesto automático inicial de 0 MXN.

**Motivo:** ningún costo debe ocurrir sin autorización.

---

## D-022: Modelo local

**Decisión:** no instalar uno al principio, pero diseñar el conector desde el inicio.

---

## D-023: Cuentas

**Decisión:** perfiles legítimos, conexión, desconexión y cambio manual.

**Restricción:** no evadir límites ni automatizar rotación abusiva.

---

## D-024: Protocolos

**Decisión:** adaptadores nativos para motores principales y soporte futuro para ACP/MCP.

---

## D-025: Verificación

**Decisión:** Playwright y Storybook se incorporan para proteger funcionamiento e interfaz.

---

## D-026: Otros agentes

**Decisión:** integrar por fases y solo cuando aporten valor:

- Antigravity.
- Claude Agent SDK.
- Copilot SDK.
- Aider.
- Goose.
- OpenHands.
- Figma MCP.
- Ollama.
- LM Studio.

---

## D-027: PWA futura

**Decisión:** una PWA podrá existir como control remoto, no como núcleo principal.

## D-028: Fallback automático

**Decisión:** Orbit cambia automáticamente de motor solo cuando costo, privacidad, archivos enviados, riesgo y calidad permanecen equivalentes.

## D-029: Sesión o créditos insuficientes

**Decisión:** Orbit no se bloquea por completo. Explica el flujo recomendado, permite iniciar sesión y ofrece continuar con el mejor motor disponible.

**Restricción:** no inventar saldo, renovación ni costo.

## D-030: Ruta visual de respaldo

**Decisión:**

```text
v0 → Builder → Figma/Make → Codex → OpenCode → asistencia manual
```

## D-031: Memoria diaria

**Decisión:** registrar actividad durante el día y consolidarla a las 23:59 hora local o retroactivamente en el siguiente inicio.

## D-032: Bienvenida contextual

**Decisión:** el primer uso diario muestra una bienvenida espacial premium con saludo según la hora, último avance y siguiente recomendación.
