# DEVELOPMENT.md

## 1. Requisitos

### macOS

- macOS compatible con Tauri.
- Xcode Command Line Tools.
- Node.js LTS.
- pnpm.
- Rust estable.
- Git.
- navegador moderno.

### Windows

- Windows 10/11.
- Microsoft C++ Build Tools.
- WebView2.
- Node.js LTS.
- pnpm.
- Rust estable.
- Git.

## 2. Gestor de paquetes

Usar `pnpm`.

Motivos:

- workspaces.
- instalación eficiente.
- lockfile reproducible.
- monorepo futuro.

## 3. Comandos previstos

```bash
pnpm install
pnpm dev
pnpm tauri dev
pnpm typecheck
pnpm lint
pnpm test
pnpm test:e2e
pnpm build
pnpm tauri build
```

Los scripts definitivos se crean con el esqueleto.

## 4. Convenciones

### TypeScript

- modo estricto.
- evitar `any`.
- tipos de dominio compartidos.
- validación en límites externos.
- funciones pequeñas.
- errores tipados.

### React

- componentes funcionales.
- estado global mínimo.
- lógica de negocio fuera de componentes.
- accesibilidad.
- carga diferida de módulos pesados.

### Rust

- comandos Tauri pequeños.
- errores serializables.
- límites de filesystem.
- procesos cancelables.
- no usar `unwrap()` en rutas de producción.

## 5. Monorepo

Estructura propuesta:

```text
apps/
└── desktop/

packages/
├── agent-protocol/
├── model-router/
├── project-indexer/
├── shared/
└── ui/
```

Puede iniciarse sin monorepo si ralentiza el MVP, pero los límites de módulos deben conservarse.

## 6. Variables de entorno

Solo nombres, nunca valores reales:

```text
ORBIT_LOG_LEVEL
ORBIT_DEV_MODE
ORBIT_DATABASE_PATH
```

Credenciales de proveedores no deben depender de `.env` dentro del repositorio. Se guardan en keychain.

Para desarrollo se permiten variables temporales no versionadas, documentadas en `.env.example` sin secretos.

## 7. Git

### Rama principal

```text
main
```

### Ramas de Orbit

```text
feat/<nombre>
fix/<nombre>
docs/<nombre>
refactor/<nombre>
```

### Ramas creadas para proyectos externos

```text
orbit/<stage>/<task-id>
```

### Reglas

- commits pequeños.
- mensajes convencionales.
- no incluir secretos.
- pull request antes de fusionar cambios importantes.
- CI obligatorio antes de release.

## 8. Commits

Formato:

```text
feat: add project explorer
fix: stop orphaned dev server
docs: define model routing
test: cover worktree restoration
```

## 9. Pruebas

### Unitarias

- clasificador de tareas.
- presupuesto.
- redacción.
- rutas.
- eventos.
- adaptadores.

### Integración

- procesos.
- Git.
- SQLite.
- credenciales.
- proveedores simulados.

### E2E

- abrir proyecto.
- iniciar localhost.
- crear worktree.
- modificar archivo.
- mostrar diff.
- restaurar.
- solicitar permiso.

### Visuales

- layout.
- paneles.
- estados.
- responsive.
- baseline.

## 10. Servicios simulados

No usar APIs reales en pruebas automáticas.

Crear:

- MockCodexServer.
- MockOpenCodeServer.
- MockOpenRouter.
- MockV0.
- MockCredentialStore.
- MockGitRepository.

## 11. Logs

Niveles:

```text
error
warn
info
debug
trace
```

`trace` solo en desarrollo.

Redacción obligatoria antes de escribir.

## 12. Manejo de errores

Cada error debe incluir:

- código.
- mensaje.
- operación.
- proveedor.
- tarea.
- recuperable.
- acción sugerida.

Ejemplo:

```json
{
  "code": "PROCESS_PORT_NOT_FOUND",
  "message": "No se detectó un servidor local",
  "recoverable": true,
  "action": "Revisar comando de desarrollo"
}
```

## 13. Desarrollo en Mac y compilación Windows

Desarrollo principal:

- macOS Intel.

Validación:

- CI para Windows.
- pruebas manuales periódicas en PC Windows.

No asumir que los procesos, rutas o shells son iguales.

Abstracciones:

- paths.
- shell.
- keychain.
- instalación.
- enlaces profundos.
- empaquetado.

## 14. CI

Flujos previstos:

```text
ci.yml
├── lint
├── typecheck
├── unit tests
├── Rust fmt
├── Rust clippy
└── build checks

build-desktop.yml
├── macOS Intel
└── Windows x64
```

Los artefactos de desarrollo permanecen privados.

## 15. Releases

Canales:

- development.
- beta.
- stable.

Antes de beta:

- firma.
- notarización Mac.
- firma Windows cuando corresponda.
- actualización segura.
- changelog.
- rollback.

## 16. Primer incremento

El primer incremento debe implementar únicamente:

1. ventana Tauri.
2. layout de tres columnas.
3. selector de etapa.
4. abrir carpeta.
5. árbol de archivos.
6. panel localhost vacío.
7. terminal simulada.
8. panel de agentes simulado.

No integrar proveedores hasta que la interfaz base y los límites estén claros.

## 17. Segundo incremento

1. procesos reales.
2. terminal real.
3. `npm run dev`.
4. detección de puerto.
5. localhost.
6. Git status.
7. diff.
8. U‑Zala.

## 18. Definición de terminado

Una funcionalidad está terminada cuando:

- tiene criterio de aceptación.
- cuenta con pruebas pertinentes.
- no expone secretos.
- funciona en macOS.
- CI de Windows pasa.
- documentación actualizada.
- no rompe U‑Zala.
- cambios revisados.

## 19. Reloj y pruebas temporales

El código de fecha y hora depende de una abstracción inyectable:

```ts
interface Clock {
  now(): Date
  timezone(): string
}
```

Probar primer inicio, reapertura, medianoche, aplicación cerrada, tarea activa, cambio de zona horaria, horario de verano e idempotencia.

## 20. Simuladores de proveedor

Los mocks representan sesión requerida, cuota agotada, saldo conocido o desconocido, pago requerido, error temporal, cambio de motor y recuperación. No probar fallback con cuentas reales.

## 21. Bienvenida

La galaxia se ejecuta localmente, respeta `prefers-reduced-motion`, no retrasa artificialmente el arranque, termina cuando el runtime está listo y funciona sin GPU dedicada. En Mac Intel se prefiere CSS, Canvas ligero o WebGL opcional con fallback.
