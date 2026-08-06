# Scheduler

El Scheduler es propietario de una cola declarativa de tareas. Cada tarea
conoce prioridad, dependencias, estado, cancelación solicitada, reintentos,
motivo de espera y agente asignado.

La arquitectura reconoce Director, Constructor, Investigador, Verificador y
Documentador. En esta fase no planifica, no ejecuta, no inicia procesos y no
llama modelos; solamente define el contrato que usará el Kernel.
