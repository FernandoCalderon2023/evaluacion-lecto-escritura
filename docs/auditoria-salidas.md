# Revisión de salidas y trazabilidad — 22 de octubre de 2026

## Hallazgos y correcciones

- Los informes carecían de una referencia verificable a los registros y reglas utilizados. Se añade identificador, fechas en horario de Bolivia, evaluador declarado, versión de reglas y huella SHA-256 de los datos de evaluación.
- Las altas, ediciones y eliminaciones directas de evaluaciones no registraban eventos propios de auditoría. Ahora el evento y la operación se confirman juntos en una transacción. Las ediciones registran huellas anterior/nueva y nombres de campos técnicos, sin copiar observaciones ni contraseñas.
- La generación de IA registra trabajo, proveedor, huella y estado sin revisión. La cuenta que solicitó el trabajo se distingue del nombre libre del evaluador.
- Las áreas incompletas del informe IA podían mostrar un total numérico que parecía un cero evaluado. Ahora muestran pendiente y no se interpretan.
- El resultado explica datos, umbral y decisión por área; lectura y escritura identifican sus reglas como reglas de la plataforma. No se cambiaron puntajes ni umbrales.
- El radar usa escala fija 0–100 y aclara que los valores no son percentiles ni comparaciones entre estudiantes. Los indicadores de estado muestran cantidad de áreas con señales, en lugar de presentar severidad clínica.
- El encabezado imprimible se denomina resumen de evaluación educativa. Se retira la mención normativa que podía aparentar certificación del resultado.
- El resumen familiar ya funciona sin IA: muestra el estado del registro y un siguiente paso para conversar con el docente. Tiene impresión y referencia del caso.
- Las sugerencias de IA se presentan como propuestas pendientes de revisión; no se atribuyen a observaciones verificadas ni a una aprobación profesional.

## Cómo auditar un resultado

1. Abrir la evaluación con una cuenta autorizada y localizar su referencia.
2. Contrastar cada área con los formularios y muestras originales. Los resultados incompletos no permiten inferir dificultades.
3. Revisar los umbrales visibles y la confirmación de aplicación cognitiva/léxica.
4. Consultar los últimos 10 eventos en el historial y, para revisión técnica, los registros de auditoría del administrador.
5. Conservar el PDF con la huella si se necesita comparar versiones. Al cambiar datos cambia su huella; regenerar IA no cambia la huella de las respuestas.
6. Revisar las propuestas con el profesional y acordar una actividad, evidencia de seguimiento y fecha de revisión.

## Límites explícitos

La huella no es una firma digital ni prueba de autoría. El historial empieza con esta mejora y no reconstruye versiones previas de las respuestas. No se añade un expediente inmutable, sellado externo, revisión profesional firmada ni aprobación clínica. La eliminación de un estudiante por cascada no crea un evento individual de eliminación para cada evaluación.

Los filtros de IA reducen salidas riesgosas, pero no prueban que toda propuesta sea pertinente. No se hizo validación psicométrica ni clínica de los umbrales. El paquete institucional conserva 10 cuentas y 15 evaluaciones compartidas; sus datos y contraseñas no fueron usados para estas pruebas.

## Verificación

53 pruebas unitarias y 250 comprobaciones funcionales correctas; build de producción correcto. Incluye huellas estables ante generación de IA, cambio de huella al editar respuestas, datos pendientes sin ceros engañosos, eventos de auditoría, resumen familiar sin IA, aislamiento y cupos institucionales. Pruebas locales con base temporal y proveedores simulados; sin llamadas pagadas de IA. La revisión de estas salidas fue automatizada y de código; no incluye una validación clínica ni una nueva prueba visual en dispositivo físico. Publicación pendiente de verificar.
