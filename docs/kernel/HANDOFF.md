# Handoff del Runtime

## Qué construimos

1. Capa `lib/runtime/` con interfaces `Runtime`, `RuntimeContext`,
   `RuntimeRegistry`, `RuntimeAdapter`, `RuntimeModule`, `RuntimeHealth`,
   `RuntimeCapabilities` y `RuntimeEvents`.
2. Registro explícito de 14 adaptadores simulados, sin reflexión.
3. Salud agregada (`Healthy`, `Warning`, `Error`, `Initializing`, `Stopped`).
4. Eventos: `RuntimeStarted`, `RuntimeStopped`, `AdapterRegistered`,
   `AdapterStarted`, `AdapterStopped`, `AdapterFailed`, `HealthChanged`,
   `CapabilityChanged`.
5. Integración con el Kernel: el Kernel inicia/detiene el Runtime y conoce
   únicamente `RuntimeRegistry`.

## Invariantes

- Flujo de dependencias único: React → Mission Control → Kernel → Runtime →
  Adapters → SO.
- Mission Control no conoce adaptadores.
- El Kernel no conoce adaptadores concretos, solo el registry.
- No hay llamadas reales al sistema; todo es simulado.

## Pendientes y riesgos

- El adaptador Tauri real (filesystem/Git/terminal) implementará el mismo
  contrato sin cambiar la interfaz.
- Verificar que ninguna capa superior importe adaptadores concretos.
- Pruebas de cobertura agregadas para registry, health, lifecycle, eventos.
