# Capability Registry

`CapabilityRegistry` mantiene el catálogo de capacidades potenciales de Orbit:
Git, Desktop, Node, pnpm, Framework, Database, Docker, AI, Preview, Build,
Deploy, Testing, Memory, Workspace, GitHub, Vercel, Supabase, Tauri, MCP,
Plugins, Filesystem y Shell.

Cada entrada declara nombre, estado, versión, proveedor, disponibilidad,
motivo y última comprobación. La disponibilidad actual es simulada; el registro
no examina la máquina ni ejecuta detecciones.

Los cambios se comunican mediante `CapabilityRegistered` y
`CapabilityChanged`. Una futura detección podrá escuchar
`CapabilityDiscoveryRequested` sin acoplar la UI al adaptador.
