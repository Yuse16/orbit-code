# Orbit Code UI Baseline

## Estado

- Baseline aprobado para la Fase 1.
- Fuente: frontend publicado en `9329c9669f7d2278c9afb9283e9fcc652116dbe6`.
- Viewport canónico: `1440 × 900` CSS px.
- Tema: oscuro.
- Referencia: `references/orbit-shell-1440x900.svg`.

## Composición protegida

1. Marco exterior con fondo degradado y ventana interior redondeada.
2. Barra superior compacta con controles circulares, ruta, rama y estado.
3. Cuerpo principal con tres columnas permanentes:
   - rail de actividad y explorador a la izquierda;
   - chat y control al centro;
   - workbench flexible a la derecha.
4. Dock inferior con agentes y terminal simulada.
5. Workbench con las pestañas Vista previa, Código, Cambios, Terminal y Agentes.

## Invariantes de Fase 1

- No cambiar anchuras, jerarquía, colores, tipografía, radios, tabs ni contenido.
- No sustituir datos simulados por conexiones reales.
- No conectar filesystem, procesos, terminal, Git, localhost, agentes o proveedores.
- Los cambios de infraestructura deben conservar los componentes visuales aprobados.

## Verificación

La validación se realiza a `1440 × 900`, comparando:

- geometría de las tres columnas;
- barra superior y dock inferior;
- orden y etiquetas de las pestañas;
- tokens de color y superficies;
- contenido mock visible;
- ausencia de pantalla blanca, overlays de error o desplazamiento global inesperado.

La referencia SVG es una ficha vectorial del layout derivada directamente de la
estructura y tokens del frontend. La evidencia raster de ejecución se captura al
abrir la ventana Tauri, sin formar parte de los componentes de producción.
