# Orbit Code Design System Baseline

## Tipografía

- Sans: Geist Sans, con fallback `ui-sans-serif`, `system-ui`, `sans-serif`.
- Mono: Geist Mono, con fallback `ui-monospace`, `monospace`.
- Escala dominante: 11–14 px; título principal de 24 px.

## Geometría

- Radio base: `0.625rem`.
- Ventana interior: `rounded-[14px]`.
- Rail de actividad: `48px`.
- Explorador: `276px`.
- Chat: `540px`.
- Workbench: flexible, `min-width: 0`.
- Dock abierto: `256px` de alto.

## Tokens cromáticos

Los valores canónicos permanecen en `app/globals.css`:

- base: azul-negro profundo;
- paneles: grafito azulado en tres niveles;
- primary: azul eléctrico;
- violet: violeta orbital;
- success: verde;
- warning: ámbar;
- danger/destructive: rojo;
- bordes: grafito semitransparente.

## Componentes visuales protegidos

- `DesktopShell` y `DesktopTitleBar`.
- `ActivityRail` y `ProjectExplorer`.
- `ChatWorkspace` y controles asociados.
- `Workbench` y sus cinco vistas.
- `ActivityDock`.
- primitivas de modal, dropdown, tooltip y progreso.

## Estados

- Activo: primary o violet según el contexto.
- Correcto/disponible: success.
- Advertencia/pendiente: warning.
- Error/bloqueado: danger.
- No configurado o secundario: muted foreground.

## Regla de conservación

Los incrementos de infraestructura pueden agregar configuración y shell nativo,
pero no deben modificar este sistema sin una aprobación visual independiente.
