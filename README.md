# Orbit Code

**Pack de arquitectura:** v0.2.0

Orbit Code es una aplicación de escritorio personal para desarrollar software con agentes de inteligencia artificial, herramientas locales, control de costos y revisión humana.

Su objetivo no es reemplazar todos los editores existentes ni crear un modelo propio. Orbit Code coordina motores como Codex, OpenCode, OpenRouter, v0 y Builder Visual Copilot dentro de una interfaz diseñada para trabajar con repositorios reales de manera segura.

## Estado

- Estado actual: diseño, arquitectura y flujo operativo v0.2 aprobados.
- Plataforma inicial: macOS y Windows.
- Tecnología base: Tauri, React, TypeScript y Rust.
- Primer proyecto piloto: U‑Zala.
- Modo de operación inicial: equilibrado.
- Repositorio del núcleo: privado desde el primer commit.
- Repositorio público separado: documentación, avances, capturas y demostraciones.

## Principios

1. La computadora resuelve localmente todo lo que no requiera IA.
2. El modelo recibe solo el contexto necesario.
3. Codex se reserva para decisiones y cambios complejos.
4. OpenCode funciona como motor flexible y alternativo.
5. v0 crea interfaces de alta calidad de manera quirúrgica.
6. Builder Visual Copilot funciona como respaldo visual.
7. Ninguna API de pago se usa sin autorización previa.
8. Ningún agente modifica `main` directamente.
9. Localhost permanece disponible durante el trabajo.
10. El usuario conserva el control de commit, push y publicación.
11. La interfaz visual aprobada se protege frente a cambios posteriores.
12. Las credenciales nunca se guardan dentro del repositorio.
13. Orbit cambia de motor automáticamente cuando el fallback es gratuito, seguro y equivalente.
14. Si faltan sesión o créditos, explica el bloqueo y ofrece continuar con lo disponible.
15. Mantiene memoria incremental y consolida un resumen diario.
16. La primera apertura del día utiliza una bienvenida espacial contextual.

## Interfaz principal

Orbit Code utiliza una distribución de tres columnas:

```text
┌────────────────┬────────────────────────┬──────────────────────────────┐
│ Explorador     │ Chat y control         │ Área de trabajo              │
│ Archivos       │ Plan                   │ Localhost / Código / Diff     │
│ Git            │ Permisos               │ Terminal / Agentes            │
└────────────────┴────────────────────────┴──────────────────────────────┘
```

El área de trabajo incluye:

- Vista previa de localhost.
- Editor de código.
- Comparación de cambios.
- Terminal.
- Actividad de agentes.
- Vista responsive.
- Capturas y comparación visual.

## Selector de etapa

Cada tarea se clasifica en una etapa:

- Exploración
- Diseño visual
- Implementación
- Corrección
- Pruebas
- Publicación
- Auditoría

La etapa cambia los agentes, herramientas, permisos y modelos disponibles.

## Documentación

| Archivo | Propósito |
|---|---|
| `PROJECT.md` | Visión, alcance y criterios de éxito |
| `ARCHITECTURE.md` | Arquitectura técnica y componentes |
| `AGENTS.md` | Reglas obligatorias para agentes |
| `SECURITY.md` | Seguridad, permisos y secretos |
| `MODEL_ROUTER.md` | Selección de modelos, costos y fallbacks |
| `UI_WORKFLOW.md` | Interfaz y flujo de trabajo |
| `CONNECTIONS.md` | Cuentas, proveedores y autenticación |
| `ROADMAP.md` | Fases y criterios de entrega |
| `DECISIONS.md` | Decisiones aprobadas y su motivo |
| `DEVELOPMENT.md` | Instalación, desarrollo y compilación |

## Inicio recomendado

1. Crear el repositorio privado `orbit-code`.
2. Copiar este pack en la raíz.
3. Crear el esqueleto Tauri.
4. Ejecutar Orbit Code en macOS.
5. Compilar también en Windows mediante integración continua.
6. Conectar U‑Zala como primer repositorio externo.
7. Implementar el explorador, chat, localhost, terminal y Git.
8. Integrar Codex y OpenCode.
9. Añadir el flujo visual con v0.
10. Incorporar proveedores adicionales por etapas.

## Fuera del alcance inicial

- Crear un modelo de IA propio.
- Sustituir por completo VS Code.
- Publicar automáticamente en producción.
- Ejecutar comandos destructivos sin aprobación.
- Administrar cuentas para evadir límites o políticas de proveedores.
- Ofrecer Orbit Code como producto comercial en el MVP.

## Licencia y publicación

La licencia definitiva del núcleo se decidirá más adelante. Mientras Orbit Code sea de uso personal:

- El repositorio del núcleo permanece privado.
- La documentación pública se publica en un repositorio independiente.
- No se publican secretos, tokens, arquitectura sensible ni credenciales.

## Flujo operativo v0.2

Orbit Code incorpora un flujo de continuidad:

```text
Abrir Orbit
→ detectar fecha y hora
→ cerrar memoria pendiente de ayer
→ mostrar saludo contextual
→ restaurar proyecto y conexiones
→ clasificar la tarea
→ seleccionar el menor recurso suficiente
→ comprobar sesión y créditos
→ usar el motor recomendado o un fallback autorizado
→ trabajar en worktree
→ verificar
→ guardar memoria incremental
→ consolidar memoria diaria a las 23:59
```

Reglas principales:

- Si el motor recomendado no tiene sesión, Orbit ofrece iniciar sesión o continuar con lo disponible.
- Si no hay créditos, muestra información verificable y propone el siguiente motor compatible.
- El cambio es automático solo cuando no aumenta costo, riesgo, exposición de datos ni reduce de forma importante la calidad.
- El primer inicio del día presenta un saludo espacial premium y el resumen del último avance.
