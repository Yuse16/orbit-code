# CONNECTIONS.md

## 1. Objetivo

Centralizar proveedores, cuentas, sesiones y credenciales sin exponer secretos.

## 2. Tipos de conexión

- OAuth.
- código de dispositivo.
- API key.
- CLI autenticado.
- servidor local.
- servidor remoto autorizado.
- MCP.
- ACP.

Cada proveedor define su método oficial.

## 3. Principios

- abrir autenticación en navegador del sistema cuando corresponda.
- no pedir contraseñas dentro de Orbit.
- guardar secretos en keychain.
- permitir verificar conexión.
- permitir cerrar sesión.
- permitir perfiles legítimos.
- no automatizar evasión de límites.
- mostrar saldo o uso cuando la API lo permita.

## 4. Codex / ChatGPT

Métodos previstos:

- autenticación administrada por Codex CLI/app-server.
- código de dispositivo o navegador según soporte.
- sesión separada por perfil.

Orbit muestra:

- cuenta identificable parcialmente.
- estado.
- plan cuando esté disponible.
- disponibilidad.
- límite o error.
- cerrar sesión.
- cambiar cuenta.

No almacena contraseña.

## 5. OpenCode

Orbit detecta o instala OpenCode.

Puede conectarse a:

- OpenAI.
- OpenRouter.
- proveedores compatibles.
- modelos locales.
- futuras integraciones.

Orbit administra:

- proceso.
- puerto.
- estado.
- perfiles.
- eventos.
- configuración.

## 6. OpenRouter

Métodos:

- OAuth con PKCE cuando esté disponible.
- API key manual.

Funciones:

- modelos gratuitos.
- modelos económicos.
- presupuestos.
- fallback.
- saldo.
- uso.
- revocación.

Regla:

```text
API de pago desactivada por defecto.
```

## 7. v0

Dos modos:

### v0 API

- API key.
- acceso según plan.
- estimación.
- proyectos.
- chats.
- imágenes.
- generación.

### v0 Web Assist

- Orbit prepara prompt y archivos.
- abre v0 en navegador.
- usuario trabaja con su cuenta.
- Orbit importa el resultado.

Orbit no debe copiar cookies ni automatizar de forma no autorizada la sesión del navegador.

## 8. Builder Visual Copilot

Integración progresiva:

- enlace al editor.
- importación/exportación.
- Devtools.
- componentes.
- referencias.
- futura API si existe soporte adecuado.

No se asume acceso total desde el MVP.

## 9. Figma

Futuro:

- Figma MCP.
- leer variables.
- componentes.
- diseños.
- capturar localhost.
- enviar contexto a agentes.

## 10. GitHub

Funciones futuras:

- autenticación oficial.
- abrir repositorios.
- branches.
- pull requests.
- issues.
- checks.
- releases.

El Git local funciona antes de conectar GitHub.

## 11. Vercel

Funciones futuras:

- proyectos.
- preview deployments.
- logs.
- dominios.
- estado.

Producción requiere confirmación doble.

## 12. Supabase

Funciones futuras:

- proyectos.
- esquema.
- migraciones.
- logs.
- políticas.
- tipos.

Toda migración requiere aprobación.

## 13. Modelos locales

Conector genérico compatible con API estilo OpenAI.

Perfiles:

```text
Ollama local
LM Studio local
Servidor LAN
Servidor remoto autorizado
```

Campos:

- nombre.
- URL.
- modelo.
- autenticación opcional.
- timeout.
- privacidad.
- prueba de conexión.

Estado inicial: no configurado.

## 14. Perfiles

Ejemplo:

```text
v0
├── Personal
└── Trabajo

OpenRouter
├── Personal
└── Proyecto
```

Cada perfil contiene:

- identificador.
- nombre.
- proveedor.
- referencia segura.
- estado.
- última verificación.
- límites.
- preferencias.

## 15. Estados

```text
🟢 Disponible
🟡 Disponible con límites
🔴 Error o bloqueado
⚪ No configurado
🔵 Verificando
```

## 16. Cambio de cuenta

Flujo:

1. pausar tareas del proveedor.
2. cerrar sesión.
3. eliminar credencial si se solicita.
4. iniciar flujo oficial.
5. verificar.
6. seleccionar perfil.
7. reanudar.

No cambiar automáticamente de cuenta para evitar límites.

## 17. Almacenamiento

Metadatos en SQLite:

- proveedor.
- perfil.
- estado.
- preferencia.
- timestamps.

Secretos en almacenamiento seguro.

## 18. Diagnóstico

“Probar conexión” debe:

- validar credencial.
- verificar endpoint.
- mostrar modelo o servicio.
- medir latencia.
- no consumir una tarea costosa.
- ocultar respuesta sensible.

## 19. Resolución de disponibilidad

Estados normalizados: disponible, sesión requerida, disponible con límites, créditos agotados, pago requerido, error temporal y no compatible. La verificación no ejecuta una generación costosa.

## 20. Inicio de sesión dentro del flujo

Cuando una tarea necesita un proveedor no conectado, Orbit pausa solo esa tarea, explica por qué se recomienda, ofrece autenticación oficial o fallback, verifica la sesión y retoma automáticamente.

## 21. Créditos y renovación

Orbit muestra saldo, cuota o renovación solo cuando el proveedor lo expone oficialmente, la credencial tiene permiso y la respuesta es reciente. Muestra fecha de consulta y origen.

## 22. Cambio de perfil legítimo

Se permite seleccionar manualmente otro perfil autorizado. Orbit no propone automáticamente otra cuenta para evadir límites gratuitos.
