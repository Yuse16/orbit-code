# ARCHITECTURE.md

## 1. Visión técnica

Orbit Code es una aplicación de escritorio local-first construida sobre Tauri.

```text
Orbit Code Desktop
├── Frontend: React + TypeScript
├── Shell nativo: Tauri
├── Backend local: Rust
├── Estado local: SQLite
├── Editor: Monaco
├── Terminal visual: xterm.js
├── Git: CLI/libgit2 según módulo
├── Agentes: adaptadores nativos + ACP
├── Herramientas: MCP + procesos locales
└── Vista previa: webview con localhost
```

## 2. Plataformas

### macOS

- Arquitectura inicial: Intel `x86_64-apple-darwin`.
- Debe conservar compatibilidad futura con Apple Silicon.
- Desarrollo principal en MacBook Pro 2017.
- Empaquetado inicial local sin distribución pública.
- Firma y notarización se incorporan antes de distribuir.

### Windows

- Objetivo inicial: `x86_64-pc-windows-msvc`.
- Instalador: MSI o NSIS.
- Pruebas en PC Windows.
- Compilación automatizada mediante CI.

## 3. Capas

### 3.1 Presentation Layer

Responsable de la interfaz:

- Explorador.
- Chat.
- Selector de etapa.
- Localhost.
- Monaco.
- Diff.
- Terminal.
- Actividad de agentes.
- Centro de conexiones.
- Presupuestos.
- Autorizaciones.

### 3.2 Application Layer

Coordina:

- Sesiones.
- Proyectos.
- Tareas.
- Etapas.
- Planes.
- Permisos.
- Enrutamiento de modelos.
- Memoria resumida.
- Eventos.
- Estado de UI.

### 3.3 Domain Layer

Entidades principales:

```text
Project
Task
Stage
Agent
Provider
ConnectionProfile
Model
Tool
PermissionRequest
Worktree
VisualBaseline
VerificationRun
CostEstimate
MemorySummary
```

### 3.4 Infrastructure Layer

Implementa:

- Sistema de archivos.
- Git.
- procesos y terminal.
- SQLite.
- keychain/credential manager.
- HTTP/SSE/WebSocket.
- Codex app-server.
- OpenCode SDK.
- OpenRouter.
- v0.
- Builder.
- MCP.
- ACP.
- Playwright.
- Storybook.

## 4. Módulos principales

### 4.1 Project Manager

Responsabilidades:

- Abrir carpeta.
- Verificar si es repositorio Git.
- Detectar stack.
- Leer `package.json`.
- detectar comandos.
- identificar documentación.
- crear configuración local.
- mantener lista de proyectos recientes.

### 4.2 Repository Indexer

No utiliza IA por defecto.

Herramientas sugeridas:

- `ripgrep`
- Tree-sitter
- TypeScript compiler API
- análisis de imports
- símbolos del lenguaje
- caché SQLite

Produce:

- mapa de archivos.
- símbolos.
- relaciones.
- rutas.
- componentes.
- archivos de configuración.
- dependencias.
- resumen por módulo.

### 4.3 Context Builder

Selecciona el contexto mínimo:

```text
Solicitud
+ etapa
+ memoria resumida
+ archivos relacionados
+ diff activo
+ errores relevantes
+ reglas del proyecto
```

Nunca incluye automáticamente:

- `.env`
- claves.
- credenciales.
- archivos binarios.
- datos de clientes.
- repositorio completo.
- carpetas de dependencias.

### 4.4 Task Director

Clasifica:

- complejidad.
- riesgo.
- número de archivos.
- sensibilidad.
- necesidad de visión.
- necesidad de herramientas.
- costo.
- privacidad.
- etapa.

Después selecciona:

- herramientas locales.
- motor.
- modelo.
- agentes.
- verificaciones.
- permisos.

### 4.5 Agent Bridge

Interfaces previstas:

```text
AgentAdapter
├── connect()
├── disconnect()
├── createSession()
├── sendTask()
├── streamEvents()
├── approve()
├── reject()
├── cancel()
└── getUsage()
```

Adaptadores:

- `CodexAdapter`
- `OpenCodeAdapter`
- `AcpAdapter`
- `CliAdapter`
- futuros adaptadores.

### 4.6 Visual Bridge

Gestiona:

- imagen de referencia.
- v0.
- Builder.
- Figma MCP futuro.
- importación de código.
- baseline.
- capturas.
- aprobación.

### 4.7 Worktree Manager

Cada tarea modificadora utiliza:

```text
main
└── orbit/<stage>/<task-id>
```

Responsabilidades:

- verificar estado limpio.
- crear rama.
- crear worktree.
- ejecutar agente dentro del worktree.
- iniciar localhost del worktree.
- comparar contra la rama base.
- descartar o fusionar.

### 4.8 Process Manager

Controla:

- `npm run dev`
- `pnpm dev`
- `npm test`
- `npm run build`
- servidores de agentes.
- terminales.
- procesos secundarios.
- puertos.

Todo proceso debe:

- tener ID.
- registrar inicio y fin.
- soportar cancelación.
- limitar directorio de trabajo.
- emitir stdout/stderr.
- respetar permisos.

### 4.9 Preview Manager

Funciones:

- detectar puerto.
- abrir localhost.
- recargar.
- conservar ruta.
- modo escritorio, tableta y móvil.
- abrir navegador externo.
- capturar pantalla.
- inspeccionar errores.
- conectar Playwright.

### 4.10 Verification Engine

Ejecuta:

- typecheck.
- lint.
- tests.
- build.
- pruebas de interacción.
- pruebas visuales.
- análisis de diff.
- comprobación de archivos sensibles.
- validación de diseño aprobado.

### 4.11 Connection Manager

Administra perfiles por proveedor:

```text
Provider
└── ConnectionProfile[]
```

Credenciales:

- llavero de macOS.
- Credential Manager de Windows.
- nunca SQLite sin cifrar.
- nunca repositorio.
- nunca logs.

### 4.12 Cost Manager

Funciones:

- estimar costo.
- aplicar presupuesto.
- pedir autorización.
- registrar consumo.
- detener tareas.
- mostrar saldo cuando el proveedor lo permita.

## 5. Flujo de una tarea

```text
Usuario escribe instrucción
        ↓
Director clasifica etapa y riesgo
        ↓
Indexer busca archivos
        ↓
Context Builder prepara contexto
        ↓
Model Router selecciona motor
        ↓
Worktree Manager crea entorno
        ↓
Agente trabaja
        ↓
Eventos aparecen en Orbit
        ↓
Preview y terminal se actualizan
        ↓
Verification Engine valida
        ↓
Usuario revisa diff
        ↓
Aprobar / seguir / descartar
```

## 6. Eventos

Todos los motores se normalizan a eventos internos:

```text
task.created
task.started
task.completed
task.failed
agent.connected
agent.message
agent.action.started
agent.action.completed
file.read
file.modified
command.requested
command.started
command.completed
permission.requested
permission.resolved
verification.started
verification.completed
cost.estimated
cost.updated
preview.ready
preview.error
```

La UI no depende del formato interno de cada proveedor.

## 7. Persistencia local

SQLite almacena:

- proyectos recientes.
- tareas.
- eventos resumidos.
- decisiones.
- configuraciones.
- baseline visual.
- métricas.
- costos.
- perfiles sin secretos.
- memoria resumida.

Los secretos permanecen fuera de SQLite.

## 8. Estructura propuesta del repositorio

```text
orbit-code/
├── src/
│   ├── app/
│   ├── components/
│   ├── features/
│   │   ├── projects/
│   │   ├── chat/
│   │   ├── preview/
│   │   ├── editor/
│   │   ├── terminal/
│   │   ├── agents/
│   │   ├── connections/
│   │   └── settings/
│   ├── lib/
│   └── types/
├── src-tauri/
│   ├── src/
│   │   ├── commands/
│   │   ├── filesystem/
│   │   ├── git/
│   │   ├── processes/
│   │   ├── credentials/
│   │   ├── agents/
│   │   └── security/
│   └── capabilities/
├── packages/
│   ├── agent-protocol/
│   ├── model-router/
│   ├── project-indexer/
│   └── shared/
├── tests/
├── docs/
└── .github/workflows/
```

## 9. Configuración por proyecto

Orbit crea fuera del control del usuario o en una carpeta ignorada:

```text
.orbit/
├── project.json
├── memory/
│   ├── summary.md
│   ├── decisions.md
│   └── modules.json
├── index/
│   └── repository.sqlite
├── ui/
│   ├── UI_BASELINE.md
│   ├── DESIGN_SYSTEM.md
│   ├── COMPONENT_MAP.json
│   ├── approved-files.json
│   └── references/
└── tasks/
```

Debe ofrecer la opción de guardar `.orbit/`:

- dentro del proyecto e ignorarlo con Git.
- en el directorio de datos de Orbit.
- parcialmente versionado cuando el usuario lo autorice.

## 10. Dependencias externas

El núcleo no debe quedar acoplado a un proveedor.

Cada integración implementa un contrato y puede deshabilitarse sin romper:

- explorador.
- código.
- terminal.
- Git.
- localhost.
- pruebas.
- memoria local.

## 11. Rendimiento

Para una Mac Intel de 16 GB:

- evitar procesos pesados simultáneos.
- limitar agentes paralelos.
- cargar Monaco bajo demanda.
- no iniciar Playwright hasta necesitarlo.
- indexar incrementalmente.
- suspender worktrees inactivos.
- preferir procesos locales pequeños.
- modelo local desactivado inicialmente.

## 12. Runtime Coordinator

El `Runtime Coordinator` gobierna el arranque, la continuidad y el cambio de fecha.

Responsabilidades:

- leer hora y zona horaria del sistema.
- decidir saludo completo o breve.
- finalizar memoria pendiente del día anterior.
- restaurar último proyecto.
- detectar tareas incompletas.
- revisar procesos huérfanos.
- comprobar conexiones sin ejecutar tareas costosas.
- emitir estados reales a la pantalla de bienvenida.
- abrir el espacio de trabajo cuando los requisitos mínimos estén listos.

```ts
interface RuntimeSessionState {
  localDate: string
  localTime: string
  timezone: string
  firstLaunchOfDay: boolean
  lastProjectId?: string
  incompleteTaskIds: string[]
  pendingDailySummaryDate?: string
}
```

## 13. Daily Memory Engine

La memoria diaria se construye en dos capas.

### Registro incremental

Cada evento relevante se guarda durante el día: proyecto, tarea, etapa, motor, archivos, decisiones, pruebas, errores, costos, Git y autorizaciones.

### Consolidación diaria

A las 23:59 hora local, o en el siguiente inicio si Orbit estaba cerrado:

1. agrupa eventos.
2. elimina duplicados.
3. resume trabajo.
4. identifica decisiones.
5. registra estado Git y costos.
6. identifica pendientes.
7. calcula la siguiente recomendación.
8. guarda un resumen por fecha.

```text
.orbit/memory/
├── project-summary.md
├── decisions.md
├── events/
└── daily/
    └── YYYY-MM-DD.md
```

La consolidación no detiene tareas activas. Una tarea que cruza medianoche puede aparecer en ambos días con el mismo ID.

## 14. Provider Availability Resolver

Antes de iniciar un motor, Orbit evalúa configuración, autenticación, conectividad, cuota, capacidades, privacidad y costo.

```ts
type ProviderAvailability =
  | { status: "ready" }
  | { status: "login-required"; loginMethod: string }
  | { status: "quota-exhausted"; knownBalance?: number; renewalAt?: string }
  | { status: "payment-required"; estimatedCost?: number }
  | { status: "unreachable"; retryable: boolean }
  | { status: "unsupported"; reason: string }
```

La UI nunca inventa saldo, renovación ni créditos.

## 15. Welcome Experience

La bienvenida es una vista local y no depende de IA.

Incluye galaxia animada sutil, logo orbital, saludo contextual, estados reales de carga, resumen del proyecto y modo de animación reducida.

Mensajes permitidos solo cuando la acción ocurre:

- Recuperando memoria.
- Comprobando conexiones.
- Restaurando Git.
- Preparando localhost.
- Finalizando la memoria de ayer.
