# AGENTS.md

Este archivo contiene reglas obligatorias para todos los agentes que trabajen dentro de Orbit Code o sobre proyectos abiertos por Orbit Code.

## 1. Prioridad de instrucciones

El orden de prioridad es:

1. Seguridad del usuario y del sistema.
2. Instrucción explícita del usuario.
3. `SECURITY.md`.
4. `DECISIONS.md`.
5. `ARCHITECTURE.md`.
6. `MODEL_ROUTER.md`.
7. `UI_WORKFLOW.md`.
8. Documentación específica del proyecto abierto.
9. Instrucciones de la tarea.
10. Preferencias del agente.

Ante contradicción, se debe detener la acción y solicitar aclaración.

## 2. Principios

- Leer antes de modificar.
- Modificar lo mínimo necesario.
- No asumir que el repositorio está limpio.
- No tocar `main` directamente.
- No ocultar cambios.
- No ejecutar acciones destructivas sin autorización.
- No enviar secretos a modelos.
- No cambiar la interfaz aprobada al agregar lógica.
- No iniciar agentes innecesarios.
- No consumir API de pago sin aprobación.
- No afirmar que una prueba pasó sin ejecutarla.
- No afirmar que un deploy ocurrió sin evidencia.
- No inventar archivos, ramas, commits o resultados.

## 3. Rama y worktree

Toda tarea que modifique código debe:

1. Identificar la rama base.
2. Verificar cambios pendientes.
3. Crear una rama `orbit/<stage>/<task-id>`.
4. Crear un worktree aislado.
5. Ejecutar cambios dentro del worktree.
6. Mostrar diff.
7. Esperar aprobación para fusionar.

Excepciones:

- Solo lectura.
- búsquedas.
- indexación.
- análisis.
- tareas explícitamente autorizadas en modo directo experimental.

El modo directo experimental nunca debe ser el valor predeterminado.

## 4. Etapas

### Exploración

Permitido:

- leer.
- buscar.
- indexar.
- resumir.
- generar mapa del repositorio.

Bloqueado:

- modificar archivos.
- instalar dependencias.
- hacer commit.
- ejecutar migraciones.

### Diseño visual

Permitido:

- crear frontend.
- usar datos simulados.
- trabajar en archivos visuales autorizados.
- generar componentes reutilizables.
- ejecutar localhost.

Bloqueado:

- modificar backend.
- cambiar autenticación.
- cambiar base de datos.
- usar datos reales.
- publicar.

### Implementación

Permitido:

- conectar lógica.
- crear funciones.
- modificar frontend y backend dentro del alcance.
- ejecutar pruebas.

Debe respetar:

- baseline visual.
- arquitectura aprobada.
- límites del proyecto.

### Corrección

Permitido:

- recopilar errores.
- localizar causa.
- aplicar corrección mínima.
- agregar prueba de regresión.

Debe evitar:

- refactorización no solicitada.
- rediseño.
- cambios de dependencias innecesarios.

### Pruebas

Permitido:

- ejecutar typecheck.
- lint.
- tests.
- build.
- Playwright.
- Storybook.
- comparación visual.

Bloqueado:

- cambiar código para “hacer pasar” pruebas sin justificar.
- desactivar validaciones.
- eliminar pruebas.

### Publicación

Permitido tras aprobación:

- preparar commit.
- preparar pull request.
- mostrar resumen.
- hacer push.
- desplegar a staging.

Producción requiere confirmación doble.

### Auditoría

Permitido:

- revisar seguridad.
- dependencias.
- arquitectura.
- permisos.
- secretos.
- calidad.
- rendimiento.

El auditor no corrige automáticamente salvo autorización.

## 5. Uso de modelos

El agente debe permitir que el Director seleccione el motor.

No se debe usar Codex para:

- buscar una cadena.
- abrir un archivo.
- ejecutar build.
- mostrar diff.
- detectar puerto.

No se debe usar v0 para:

- backend.
- autenticación.
- migraciones.
- lógica empresarial.
- publicación.

No se debe usar un modelo gratuito externo con:

- secretos.
- datos personales.
- credenciales.
- información regulada.
- repositorios completos.

## 6. Plan antes de editar

Para tareas medianas o complejas, el agente debe presentar:

- objetivo.
- archivos probables.
- riesgos.
- pruebas.
- permisos.
- motor seleccionado.
- costo adicional esperado.

Para tareas pequeñas, puede trabajar directamente dentro del worktree si el modo equilibrado lo permite.

## 7. Edición

Cada cambio debe:

- conservar estilo del proyecto.
- evitar duplicación.
- mantener tipos.
- documentar solo lo necesario.
- no introducir paquetes sin permiso.
- no borrar código sin explicar.
- no cambiar nombres públicos innecesariamente.
- mantener compatibilidad razonable.

## 8. Diseño aprobado

Cuando existe `.orbit/ui/UI_BASELINE.md`:

- no cambiar colores.
- no alterar layout.
- no reemplazar componentes aprobados.
- no modificar responsive sin autorización.
- adaptar la lógica al componente.
- ejecutar comparación visual.
- reportar cualquier desviación.

## 9. Comandos

Autorización automática:

- lectura.
- búsquedas.
- `git status`.
- `git diff`.
- typecheck.
- lint.
- tests.
- build.
- iniciar servidor de desarrollo.
- capturas locales.

Requieren aprobación:

- instalar dependencias.
- borrar archivos.
- comandos con privilegios.
- migraciones.
- cambios en `.env`.
- modificar configuración de producción.
- crear commit.
- hacer push.
- publicar.
- comandos destructivos.
- acceso fuera del repositorio autorizado.

## 10. Información mostrada al usuario

Mostrar acciones verificables:

```text
✓ Leyó archivo
✓ Encontró referencia
● Modificando componente
● Ejecutando build
○ Esperando autorización
```

No mostrar razonamiento interno privado del modelo.

El resumen final debe incluir:

- qué se cambió.
- archivos.
- pruebas ejecutadas.
- resultados.
- riesgos restantes.
- permisos pendientes.
- costo.
- estado de Git.
- siguiente decisión requerida.

## 11. Errores

Ante un error:

1. Detener acciones dependientes.
2. conservar logs.
3. explicar el fallo.
4. no repetir indefinidamente.
5. intentar máximo el número configurado.
6. cambiar de motor solo si la política lo permite.
7. solicitar autorización si aumenta costo o riesgo.

## 12. Terminación

Una tarea termina únicamente en uno de estos estados:

- completada y verificada.
- completada con advertencias.
- esperando autorización.
- bloqueada.
- cancelada.
- fallida y restaurada.
- fallida sin restauración posible.

Nunca marcar “completada” cuando todavía existen pruebas fallidas no aceptadas.

## 13. Fallback y continuidad

Antes de iniciar un motor, el Director comprueba sesión, disponibilidad y política de costo.

Puede cambiar automáticamente cuando:

- costo adicional igual a cero.
- privacidad igual o mejor.
- mismos archivos enviados.
- tarea de bajo riesgo.
- calidad equivalente.
- fallback automático habilitado.

Debe preguntar cuando aparece un costo, baja la privacidad, necesita otra cuenta, enviará más archivos, disminuye la calidad, cambia de etapa o requiere un proveedor no autorizado.

Si un motor falla, conserva plan, worktree, archivos, eventos, pruebas y contexto resumido.

## 14. Memoria diaria

Los agentes emiten eventos estructurados: objetivo, decisión, modificación, prueba, error, costo, autorización, pendiente y recomendación.

El resumidor diario usa el motor más económico permitido o lógica local. No envía secretos ni conversaciones completas.
