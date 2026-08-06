# Orbit DNA

`OrbitDNA` es la descripción portable de un proyecto que el Kernel carga antes
de planear trabajo. Conserva: nombre, framework, lenguaje, base de datos,
proveedor IA preferido, deployment, testing, estrategia de ramas, estrategia
de workspace y preferencias.

Esta fase genera DNA simulado y emite `DNALoaded`; no lee archivos, no persiste
datos y no infiere configuración real.
