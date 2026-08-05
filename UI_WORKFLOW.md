# UI_WORKFLOW.md

## 1. Objetivo

Orbit Code debe permitir entender el estado del proyecto sin cambiar constantemente de ventana.

## 2. Distribución

```text
┌────────────────────┬──────────────────────────┬────────────────────────────┐
│ Explorador         │ Chat y control           │ Área de trabajo            │
│                    │                          │                            │
│ Proyectos          │ Etapa                    │ Vista previa               │
│ Archivos           │ Conversación             │ Código                     │
│ Git                │ Plan                     │ Cambios                    │
│ Búsqueda           │ Permisos                 │ Terminal                   │
│                    │ Progreso                 │ Agentes                    │
└────────────────────┴──────────────────────────┴────────────────────────────┘
```

Las columnas se redimensionan.

## 3. Explorador

Incluye:

- proyectos recientes.
- abrir carpeta.
- archivos.
- búsqueda.
- archivos modificados.
- rama.
- estado Git.
- worktree activo.
- documentación.
- favoritos.

Estados:

```text
M modificado
A agregado
D eliminado
? no rastreado
L bloqueado
```

## 4. Chat

Elementos permanentes:

- selector de etapa.
- selector automático/manual.
- motor actual.
- costo.
- privacidad.
- caja de instrucción.
- adjuntos.
- botones rápidos.
- autorizaciones.

Botones iniciales:

- Revisar proyecto.
- Corregir error.
- Crear interfaz.
- Ejecutar pruebas.
- Preparar commit.
- Auditar.

## 5. Selector de etapa

```text
Exploración
Diseño visual
Implementación
Corrección
Pruebas
Publicación
Auditoría
```

Al cambiar etapa:

- cambia el motor recomendado.
- cambian permisos.
- cambian herramientas.
- cambia el contexto.
- se muestran riesgos.

## 6. Área de trabajo

Pestañas:

```text
[Vista previa] [Código] [Cambios] [Terminal] [Agentes]
```

Modos:

- solo vista previa.
- solo código.
- división código/vista.
- comparación referencia/localhost.
- panel de agentes inferior.

## 7. Vista previa

Barra:

```text
← → ⟳  localhost:3000/ruta
[Desktop] [Tablet] [Móvil] [Captura] [Navegador]
```

Debe:

- conservar la ruta.
- actualizar con HMR.
- detectar errores.
- mostrar estado del servidor.
- permitir reiniciar.
- abrir DevTools cuando sea posible.
- capturar pantalla.
- soportar zoom.

## 8. Código

Monaco debe:

- abrir archivo seleccionado.
- mostrar pestañas.
- resaltar sintaxis.
- permitir edición manual.
- mostrar errores.
- navegar a definición cuando exista soporte.
- guardar en el worktree.

## 9. Cambios

La vista diff debe mostrar:

- archivo.
- líneas agregadas.
- líneas eliminadas.
- cambio completo o por fragmento.
- origen del cambio.
- agente.
- etapa.
- estado de prueba.

Acciones:

- aceptar fragmento.
- rechazar fragmento.
- restaurar archivo.
- restaurar tarea.
- comentar cambio.

## 10. Terminal

Funciones:

- múltiples terminales.
- proceso de desarrollo.
- comandos del agente.
- pruebas.
- filtro de errores.
- cancelación.
- copiar salida.
- ocultar secretos.

Los comandos que requieran permiso aparecen como tarjeta, no se ejecutan silenciosamente.

## 11. Panel de agentes

Estado normal:

```text
Agentes: 0 activos · Proyecto estable
```

Estado activo:

```text
Agentes: 3 activos · 2 archivos · 1 prueba
```

Detalle:

```text
Constructor
Estado: trabajando
Archivo: components/TaskCard.tsx
✓ Leyó componente
✓ Revisó tipos
● Aplicando cambio
○ Pendiente de build
```

Se muestran acciones, no razonamiento privado.

## 12. Centro de conexiones

```text
Codex / ChatGPT      🟢 Disponible
OpenCode             🟢 Instalado
OpenRouter           🟡 Límite gratuito
v0                   🟢 Disponible
Builder              ⚪ No configurado
Modelo local         ⚪ No configurado
```

Acciones:

- conectar.
- verificar.
- cambiar perfil.
- cerrar sesión.
- eliminar credencial.
- ver límites.
- configurar presupuesto.

## 13. Flujo visual

### Paso 1

Seleccionar “Diseño visual”.

### Paso 2

Adjuntar imagen.

### Paso 3

Configurar:

- solo frontend.
- responsive.
- componentes reutilizables.
- datos simulados.
- backend bloqueado.
- archivos permitidos.
- costo máximo.

### Paso 4

v0 genera dentro del worktree.

### Paso 5

Orbit inicia localhost y muestra:

```text
[Referencia] [Resultado] [Comparar] [Código] [Cambios]
```

### Paso 6

Ajustar.

### Paso 7

“Aprobar interfaz y continuar”.

### Paso 8

Generar:

```text
.orbit/ui/
├── UI_BASELINE.md
├── DESIGN_SYSTEM.md
├── COMPONENT_MAP.json
├── approved-files.json
└── references/
```

### Paso 9

Cambiar automáticamente a “Implementación”.

### Paso 10

Codex/OpenCode reciben reglas de protección visual.

## 14. Autorizaciones

Tarjeta:

```text
Acción solicitada: instalar dependencia
Paquete: example
Motivo: componente de accesibilidad
Riesgo: medio
Archivos afectados: package.json, lockfile

[Autorizar una vez] [Rechazar]
```

Para pago:

```text
Proveedor: v0
Costo estimado: 12–18 MXN
Máximo: 20 MXN
Imagen: 1
Archivos: 5

[Autorizar] [Alternativa gratuita] [Cancelar]
```

## 15. Estados

Colores conceptuales:

- verde: disponible o correcto.
- amarillo: límite, advertencia o pendiente.
- rojo: bloqueado, error o acción crítica.
- gris: no configurado.
- azul: trabajando.

Nunca depender solo del color; usar texto e iconos.

## 16. Final de tarea

Tarjeta final:

```text
Tarea completada

Cambios:
- 4 archivos modificados
- 1 archivo agregado

Verificación:
✓ TypeScript
✓ Lint
✓ Build
✓ Visual

Git:
Rama orbit/implementation/task-014
Sin commit

Costo:
0 MXN

[Revisar diff] [Preparar commit] [Descartar]
```

## 17. Accesibilidad

- navegación por teclado.
- foco visible.
- contraste suficiente.
- texto escalable.
- estados con icono y texto.
- paneles redimensionables.
- soporte de lector de pantalla donde sea viable.

## 18. Pantalla espacial de bienvenida

### Primer inicio del día

```text
BUENOS DÍAS

Orbit Code

Continuemos donde lo dejamos.
```

Fondo con galaxia o nebulosa violeta y azul, animación lenta, tipografía grande y fina, logo orbital y estados reales de carga.

Después muestra proyecto reciente, último avance y siguiente paso.

### Reapertura

```text
BUENAS TARDES
Orbit Code
Restaurando tu espacio…
```

```text
05:00–11:59 → Buenos días
12:00–18:59 → Buenas tardes
19:00–04:59 → Buenas noches
```

Debe soportar omitir y reducir animaciones.

## 19. Modal de sesión requerida

```text
El flujo recomendado utiliza v0

Necesitas iniciar sesión para continuar con la ruta visual recomendada.

[Iniciar sesión]
[Continuar con lo disponible]
[Elegir motor]
[Cancelar]
```

El resto de Orbit continúa operativo.

## 20. Modal de límite o créditos

Si el saldo es verificable, muestra saldo, necesidad estimada y renovación conocida. Si no es verificable, explica que el proveedor rechazó la operación y ofrece revisar cuenta, usar alternativa, reintentar o cancelar.

## 21. Tarjeta de cambio de motor

Compara motor anterior, problema, motor propuesto, capacidades, calidad esperada, costo, privacidad y archivos adicionales.

## 22. Resumen de primer uso

```text
Buenas noches, Enrique

Proyecto reciente: U-Zala
Último avance: interfaz de promociones aprobada

✓ Build correcto
✓ Diseño protegido
○ Commit pendiente

Siguiente paso: ejecutar pruebas móviles

[Continuar]
[Ver resumen de ayer]
[Abrir otro proyecto]
```
