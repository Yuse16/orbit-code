# SECURITY.md

## 1. Objetivo

Proteger:

- repositorios.
- credenciales.
- cuentas.
- datos personales.
- sistema operativo.
- ramas estables.
- servicios externos.
- presupuesto.
- historial de trabajo.

## 2. Modelo de amenazas

Orbit Code debe asumir que pueden ocurrir:

- prompts maliciosos dentro de archivos.
- comandos peligrosos sugeridos por modelos.
- paquetes comprometidos.
- exposición accidental de secretos.
- cambios fuera del alcance.
- fuga de datos a proveedores.
- ejecución en directorios incorrectos.
- agentes descontrolados.
- errores en autenticación.
- uso inesperado de APIs de pago.
- modificación de producción.
- logs que contengan datos sensibles.

## 3. Límites de confianza

```text
Usuario
  ↓ confía
Orbit Core
  ↓ acceso limitado
Adaptadores y herramientas
  ↓ no confiables por defecto
Proveedores externos y modelos
```

El contenido generado por un modelo se trata como una propuesta, no como una orden confiable.

## 4. Credenciales

Las credenciales deben guardarse en:

- macOS Keychain.
- Windows Credential Manager.

Nunca en:

- Git.
- `.env` versionado.
- SQLite sin cifrar.
- `localStorage`.
- logs.
- prompts.
- capturas.
- archivos Markdown.
- portapapeles de manera persistente.

Orbit guarda solo referencias como:

```json
{
  "provider": "openrouter",
  "profileId": "personal",
  "credentialRef": "keychain://orbit/openrouter/personal"
}
```

## 5. Perfiles

Se permiten perfiles legítimos por proveedor:

- personal.
- trabajo.
- proyecto.

El usuario puede:

- conectar.
- verificar.
- cambiar.
- cerrar sesión.
- eliminar.

Orbit no debe:

- crear cuentas automáticamente.
- rotar cuentas para evadir límites.
- eludir políticas.
- reutilizar sesiones sin consentimiento.

## 6. Archivos sensibles

Bloqueados por defecto:

```text
.env
.env.*
*.pem
*.key
*.p12
*.pfx
id_rsa
id_ed25519
credentials.json
service-account*.json
```

Antes de enviar contexto se ejecuta:

- detección de secretos.
- redacción.
- exclusión por patrón.
- revisión de tamaño.
- clasificación de sensibilidad.

## 7. Sistema de archivos

Cada proyecto autoriza una raíz.

El agente:

- puede leer dentro de la raíz.
- puede escribir solo en el worktree.
- no puede acceder al directorio padre sin permiso.
- no puede seguir enlaces simbólicos fuera del alcance.
- no puede modificar archivos del sistema.
- no puede usar rutas absolutas externas sin aprobación.

## 8. Procesos

Todo comando debe tener:

- directorio de trabajo.
- identidad de tarea.
- timeout.
- captura de salida.
- cancelación.
- política de permisos.

Bloqueados por defecto:

```text
sudo
rm -rf
format
diskutil erase
shutdown
reboot
chmod -R
chown -R
curl | sh
powershell remoto no verificado
```

Las coincidencias no son la única protección; se debe evaluar intención y argumentos.

## 9. Red

Las conexiones salientes se limitan a:

- proveedor autorizado.
- Git remoto autorizado.
- servicios del proyecto.
- registros de paquetes durante instalación aprobada.

Orbit debe mostrar:

- destino.
- proveedor.
- archivos enviados.
- tamaño.
- política de datos.
- costo estimado.

## 10. Proveedores externos

Antes de usar un proveedor:

- verificar conexión.
- conocer política configurada.
- aplicar redacción.
- limitar contexto.
- solicitar Zero Data Retention cuando esté disponible.
- no asumir que “gratis” significa privado.
- mostrar el proveedor final cuando exista enrutamiento.

## 11. Presupuesto

Valor predeterminado:

```text
Pago automático: 0 MXN
```

Cualquier costo requiere:

- estimación.
- modelo.
- archivos.
- tokens aproximados.
- máximo autorizado.
- acción explícita del usuario.

La tarea se detiene al alcanzar el máximo.

## 12. Git

Protecciones:

- `main` es solo lectura para agentes.
- worktree por tarea.
- punto de restauración.
- diff obligatorio.
- commit requiere aprobación.
- push requiere aprobación.
- producción requiere confirmación doble.
- nunca forzar push por defecto.
- nunca reescribir historial sin autorización extraordinaria.

## 13. Diseño visual

v0 y Builder:

- no reciben backend completo.
- no reciben secretos.
- trabajan en ramas aisladas.
- no publican.
- no acceden a producción.
- reciben solo imágenes y archivos visuales necesarios.

## 14. Logs

Los logs deben:

- redactar tokens.
- evitar prompts completos sensibles.
- registrar acciones.
- separar diagnóstico de contenido.
- permitir borrado.
- tener retención configurable.

No registrar:

- contraseñas.
- cookies.
- tokens OAuth.
- claves.
- contenido de `.env`.
- datos personales innecesarios.

## 15. Dependencias

Toda instalación requiere:

- nombre.
- versión.
- motivo.
- licencia.
- scripts de instalación.
- impacto.
- aprobación.

Después:

- actualizar lockfile.
- ejecutar auditoría.
- revisar diff.
- verificar build.

## 16. Actualizaciones de Orbit

Antes de distribución:

- artefactos firmados.
- checksums.
- canal estable y beta.
- notas de versión.
- rollback.
- actualización desactivable.

## 17. Incidentes

Ante posible exposición:

1. detener tarea.
2. desconectar proveedor.
3. eliminar credencial local.
4. revocar token.
5. identificar alcance.
6. limpiar logs.
7. revisar Git.
8. documentar incidente.
9. restaurar desde punto seguro.
10. no continuar hasta resolver.

## 18. Lista mínima antes de fusionar

- [ ] No hay secretos.
- [ ] Diff revisado.
- [ ] Pruebas ejecutadas.
- [ ] Dependencias autorizadas.
- [ ] Baseline visual conservado.
- [ ] No hay comandos pendientes.
- [ ] No se tocó producción.
- [ ] Costo registrado.
- [ ] Usuario aprobó la fusión.

## 19. Seguridad del fallback

Un fallback no hereda automáticamente permisos del motor anterior. Antes de cambiar se revisan proveedor final, política de datos, archivos, credencial, costo, capacidad y riesgo.

Orbit no inicia sesión, cambia de cuenta, compra créditos ni acepta condiciones por el usuario.

## 20. Memoria y privacidad

La memoria diaria excluye secretos, tokens, `.env`, datos personales innecesarios, prompts sensibles y respuestas extensas. Se almacena localmente y puede borrarse por proyecto o fecha.

## 21. Hora y zona horaria

Orbit utiliza hora local y tolera cambio manual, zona horaria, horario de verano, suspensión y apertura después de medianoche. La consolidación diaria debe ser idempotente.
