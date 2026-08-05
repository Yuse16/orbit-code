# PROJECT.md

## 1. Nombre

**Orbit Code**

## 2. Descripción

Orbit Code es una aplicación de escritorio multiplataforma que coordina agentes de programación, herramientas locales, proveedores de modelos y servicios de diseño visual.

Permite abrir un repositorio, conversar con un agente, observar localhost, revisar código, comparar cambios, ejecutar pruebas y aprobar acciones sensibles desde una sola interfaz.

## 3. Problema que resuelve

Las herramientas actuales suelen presentar uno o varios problemas:

- Consumen IA para acciones que la computadora puede resolver localmente.
- Envían demasiado contexto del repositorio.
- Ocultan qué motor está trabajando.
- Mezclan diseño, arquitectura, código, pruebas y publicación.
- Permiten cambios difíciles de revertir.
- Obligan a depender de un solo proveedor.
- Separan el chat, el editor, localhost, la terminal y Git.
- Modifican interfaces aprobadas al agregar lógica.
- No ofrecen suficiente control sobre costos y autorizaciones.

Orbit Code unifica esas actividades y mantiene al usuario como responsable final.

## 4. Usuario inicial

El usuario inicial es el propietario de Orbit Code y desarrollador de proyectos propios.

Contexto inicial:

- Computadora principal: MacBook Pro 2017 Intel, 16 GB de RAM.
- Computadora secundaria: Windows.
- Stack frecuente: Next.js, React, TypeScript, Tailwind, Supabase, Vercel y PWA.
- Repositorio piloto: U‑Zala.
- Preferencia: observar cambios en localhost mientras el agente trabaja.

## 5. Objetivo principal

Construir una herramienta personal que permita:

1. Abrir cualquier repositorio local.
2. Analizarlo sin enviar todo su contenido a un modelo.
3. Seleccionar automáticamente el motor adecuado.
4. Crear interfaces premium desde una imagen.
5. Continuar la implementación sin alterar la interfaz aprobada.
6. Ejecutar pruebas y builds localmente.
7. Mostrar cambios en tiempo real.
8. Solicitar aprobación antes de acciones sensibles.
9. Cambiar de proveedor o cuenta legítima.
10. mantener memoria resumida por proyecto.

## 6. Objetivos específicos

### 6.1 Experiencia de trabajo

- Explorador de archivos permanente.
- Chat central permanente.
- Localhost visible durante la tarea.
- Cambio entre vista previa, código, diff, terminal y agentes.
- Panel dinámico de actividad.
- Indicadores claros de proveedor, costo, contexto y permisos.

### 6.2 Diseño visual

- Recibir una imagen de referencia.
- Usar v0 como diseñador principal mientras esté disponible.
- Usar Builder Visual Copilot como respaldo.
- Crear frontend con datos simulados.
- Aprobar una interfaz.
- Generar una base visual protegida.
- Delegar lógica y backend a Codex/OpenCode.

### 6.3 Seguridad

- Trabajar en ramas y worktrees por tarea.
- Mantener `main` sin cambios directos.
- Crear puntos de restauración.
- Bloquear secretos y archivos sensibles.
- Preguntar antes de instalar, borrar, migrar, hacer commit, push o deploy.
- Confirmación doble para producción.

### 6.4 Costos

- Presupuesto automático inicial: 0 MXN.
- Prioridad a herramientas locales.
- Uso de modelos gratuitos o incluidos.
- Estimación antes de una API de pago.
- Límite por tarea, día y mes.
- Registro de consumo por proyecto.

## 7. No objetivos del MVP

El MVP no busca:

- Ser un IDE completo.
- Reemplazar todos los plugins de VS Code.
- Entrenar un modelo.
- Automatizar publicación sin revisión.
- Gestionar equipos empresariales.
- Ofrecer facturación o planes comerciales.
- Crear una nube propia para ejecutar agentes.
- Sincronizar toda la aplicación con iPhone.
- Dar soporte perfecto a todos los lenguajes.

## 8. Casos de uso iniciales

### Caso A: explorar U‑Zala

1. Abrir la carpeta.
2. Leer estructura, `package.json` y documentación.
3. Crear mapa del repositorio.
4. Mostrar rutas, componentes y dependencias.
5. No modificar archivos.

### Caso B: crear una interfaz

1. Elegir “Diseño visual”.
2. Adjuntar una imagen.
3. Enviar contexto mínimo a v0.
4. Generar frontend en una rama aislada.
5. Mostrar localhost.
6. Ajustar hasta aprobar.
7. Guardar referencias visuales.
8. Entregar a Codex/OpenCode.

### Caso C: implementar lógica

1. Elegir “Implementación”.
2. Leer la base visual aprobada.
3. Seleccionar archivos relacionados.
4. Codex propone un plan.
5. El agente modifica la rama.
6. Las herramientas locales ejecutan validaciones.
7. Orbit muestra el diff.
8. El usuario aprueba o restaura.

### Caso D: corregir un error

1. Elegir “Corrección”.
2. Orbit recopila consola, TypeScript, tests y logs.
3. El sistema local busca el archivo.
4. Un modelo económico clasifica el problema.
5. Codex interviene si es complejo.
6. Orbit verifica el resultado.

## 9. Criterios de éxito del MVP

El MVP se considera funcional cuando puede:

- Ejecutarse en macOS y Windows.
- Abrir U‑Zala.
- Mostrar su árbol de archivos.
- Iniciar `npm run dev`.
- detectar y abrir localhost.
- Mostrar terminal integrada.
- Crear una rama o worktree de tarea.
- Leer y mostrar `git diff`.
- Enviar una tarea a Codex u OpenCode.
- Mostrar eventos del agente.
- Solicitar autorizaciones.
- Ejecutar typecheck, lint y build.
- Restaurar una tarea sin afectar `main`.

## 10. Métricas iniciales

- Porcentaje de tareas resueltas sin API de pago.
- Archivos enviados por tarea.
- Tokens estimados ahorrados por indexación local.
- Tareas restauradas correctamente.
- Builds exitosos después de cambios.
- Cambios visuales no autorizados detectados.
- Costo por tarea.
- Tiempo desde instrucción hasta vista previa.
- Número de intervenciones humanas críticas.

## 11. Terminología

| Término | Definición |
|---|---|
| Proyecto | Repositorio abierto por Orbit Code |
| Tarea | Unidad aislada de trabajo |
| Etapa | Exploración, diseño, implementación, corrección, pruebas, publicación o auditoría |
| Motor | Agente o proveedor que ejecuta una tarea |
| Modelo | Modelo de IA utilizado por el motor |
| Worktree | Copia de trabajo aislada de Git |
| Baseline visual | Interfaz aprobada que debe conservarse |
| Director | Componente que clasifica y enruta tareas |
| Verificador | Sistema que prueba y compara resultados |
| Conexión | Cuenta o credencial asociada a un proveedor |

## 12. Continuidad diaria y recuperación

Orbit Code debe reducir al mínimo la necesidad de volver a explicar un proyecto.

Funciones:

- registrar actividad incremental durante el día.
- detectar cambio de fecha con la zona horaria local.
- consolidar la memoria diaria a las 23:59 si la aplicación está abierta.
- generar retroactivamente el resumen al siguiente inicio si estaba cerrada.
- conservar tareas abiertas, rama, worktree, pruebas, costos y pendientes.
- mostrar el siguiente paso recomendado al iniciar.

La memoria diaria registra qué ocurrió; la memoria del proyecto conserva decisiones duraderas.

## 13. Experiencia de bienvenida

El primer uso de cada día muestra una experiencia de arranque premium:

- fondo de galaxia o nebulosa sutil.
- tipografía grande, fina y limpia.
- saludo según la hora local.
- estados reales de carga.
- último proyecto.
- último avance.
- siguiente paso recomendado.

```text
05:00–11:59 → Buenos días
12:00–18:59 → Buenas tardes
19:00–04:59 → Buenas noches
```

La reapertura durante el mismo día utiliza una versión breve.

## 14. Continuidad entre proveedores

Orbit no debe bloquear por completo el desarrollo cuando un proveedor no esté disponible.

Debe:

1. detectar sesión, disponibilidad y crédito cuando la fuente oficial lo permita.
2. explicar el flujo recomendado.
3. ofrecer iniciar sesión.
4. ofrecer el mejor fallback conectado.
5. continuar automáticamente solo si el cambio es gratuito, seguro y equivalente.
6. pedir aprobación cuando cambien costo, privacidad, archivos enviados o calidad esperada.
7. conservar el progreso si un motor falla.
