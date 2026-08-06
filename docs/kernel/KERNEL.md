# Orbit Kernel

## Propósito

Orbit Kernel es el coordinador de tiempo de ejecución de Orbit Code. Inicia y
detiene módulos, compone el contexto global, registra eventos, crea agentes
simulados, inicializa providers simulados, carga DNA y prepara el Scheduler.

Mission Control no inicializa infraestructura. Es un consumidor de snapshots y
comandos expuestos por el Kernel.

## Límites actuales

La primera versión es deliberadamente declarativa: no usa filesystem, shell,
red, Git, Tauri, procesos ni proveedores reales. Cada integración futura se
incorpora como un adaptador detrás de una capability y bajo las políticas de
seguridad existentes.

## Flujo

```text
KernelInitializer -> Kernel -> Registry / DNA / Scheduler
                          -> eventos del Kernel
Mission Control -> consulta KernelContext y solicita comandos al Kernel
React -> consume Mission Control; no conoce adaptadores nativos
```
