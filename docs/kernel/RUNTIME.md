# Orbit Runtime

## Propósito

Orbit Runtime es la única capa autorizada para hablar con el sistema
operativo (o con servicios externos a través de adaptadores). Todo acceso a
Git, filesystem, terminal, localhost, providers, bases de datos, Docker,
MCP, GitHub, Vercel, Supabase, Browser, Desktop y Workspace pasa por esta
capa. La versión actual es 100 % simulada: ningún adaptador ejecuta acciones
reales en el SO.

El Kernel conoce únicamente `RuntimeRegistry`; nunca adaptadores concretos.
Mission Control no conoce el Runtime. React no conoce adaptadores nativos.

## Flujo de dependencias

```text
React -> Mission Control -> Kernel -> Runtime -> Adapters -> SO (simulado)
```

## Arquitectura

```text
Runtime
├── RuntimeEventBus        canal interno de eventos del Runtime
├── RuntimeRegistry        registro explícito de adaptadores (sin reflexión)
├── RuntimeHealth          agrega la salud de los adaptadores
├── RuntimeAdapter[]       interfaces de ciclo de vida + salud + capacidades
│   ├── Desktop
│   ├── Git
│   ├── Localhost
│   ├── Terminal
│   ├── Filesystem
│   ├── Providers
│   ├── SQLite
│   ├── Docker
│   ├── MCP
│   ├── GitHub
│   ├── Vercel
│   ├── Supabase
│   ├── Browser
│   └── Workspace
└── RuntimeContext        snapshot observable para los consumidores
```

## Ciclo de vida

1. `RuntimeRegistry.register(adapter)` registra cada adaptador explícitamente.
2. `Runtime.start()` inicializa y arranca los adaptadores registrados y emite
   `RuntimeStarted`.
3. `Runtime.stop()` detiene los adaptadores y emite `RuntimeStopped`.
4. Cada adaptador implementa `initialize()`, `start()`, `stop()`, `dispose()`,
   `health()` y `status()`.

## Límites actuales

- Sin llamadas reales al SO, red, Git, procesos, Tauri, SQLite ni Docker.
- Los adaptadores publican capacidades simuladas.
- Un futuro adaptador Tauri real cumplirá el mismo contrato.
