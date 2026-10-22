# Paquete institucional: 10 cuentas y 15 evaluaciones compartidas

Preparado el 22 de octubre de 2026. Implementado y verificado localmente; pendiente de publicación y alta de la institución real. Falta su nombre y el nombre/correo del responsable.

## Condiciones

- 10 cuentas en total, incluyendo la del responsable (decisión de implementación comunicada al cliente).
- 15 evaluaciones compartidas por toda la institución, confirmado por Fernando. No son 15 por cuenta.
- Cupo consumido al crear y guardar una evaluación, aunque esté incompleta. Consultar, editar o imprimir no consume otra. Eliminar no devuelve el cupo.
- Sin vencimiento automático ni recarga mensual configurada: es un paquete de cantidad.
- Las cuentas tienen acceso pagado, con el agente sujeto a los límites de carga del sistema. Una regeneración del informe no crea una nueva evaluación.
- Cada usuario ve únicamente sus alumnos y evaluaciones. El responsable ve cuentas y consumo por persona, no expedientes ajenos.
- El responsable crea cuentas nuevas, desactiva/reactiva y cierra sesiones al desactivar. Las cuentas desactivadas conservan su plaza y sus datos. No se trasladan cuentas existentes por coincidencia de correo.
- Cambiar responsable, reemplazar plazas o ampliar el cupo requiere intervención de administración. No se automatizaron cambios del paquete contratado.

## Recorrido

Administración global → Organizaciones → Preparar institución pagada: nombre de institución, nombre/correo del responsable y contraseña inicial. Se crea la primera cuenta y quedan 9 plazas disponibles.

Responsable → enlace Administrar equipo y cupo → `/institucion`: crea el resto de cuentas y consulta saldo. Cada usuario recibe sus credenciales mediante un canal privado; el formulario no envía correos. La recuperación de contraseña existente continúa disponible.

El cupo aparece en el encabezado de todas las cuentas institucionales. Al llegar a cero, la API impide nuevas evaluaciones y conserva consulta/edición de las existentes.

## Arquitectura y seguridad

`InstitucionPlan` guarda límites y contadores. `InstitucionMiembro` relaciona de forma única usuario y paquete, con indicador de gestor y contador individual. La gestión comercial no asigna el rol global ADMIN ni el rol territorial DIRECTOR.

Los expedientes institucionales no se vinculan automáticamente con una unidad educativa por coincidencia del nombre escrito. Así no adquieren visibilidad territorial accidental. Las cuentas conservan su alcance individual por propietario.

Alta de usuarios y consumo de evaluaciones usan actualización condicional y creación en la misma transacción. Si falla el guardado, se revierte la reserva. Se auditan el alta del paquete, cuentas y cambios de estado. No se registran contraseñas en auditoría.

## Publicación pendiente

1. Con entorno de destino cargado de forma segura, ejecutar `node scripts/migrate-institutions.cjs`.
2. Publicar la aplicación. La migración debe preceder al despliegue: el layout consulta las tablas nuevas.
3. Comprobar `/api/health` y acceso administrativo.
4. Crear la institución con los datos confirmados y entregar acceso al responsable.
5. El responsable crea las otras 9 cuentas. No es necesario inventar correos ni compartir una contraseña entre usuarios.

Migración aditiva e idempotente: `prisma/institutions.sql`. No modifica suscripciones, usuarios ni expedientes existentes.

## QA

Compilación de producción correcta, 50 pruebas unitarias y 244 comprobaciones funcionales correctas con base temporal y proveedores simulados. Incluye carreras por la última evaluación y la décima cuenta, aislamiento de expedientes, bloqueo de administración ajena, cierre de sesiones al desactivar, cupo sin devolución por borrado y edición al agotarlo.

No se crearon cuentas reales, no se enviaron correos ni se ejecutó IA pagada. No se ha verificado visualmente esta nueva pantalla en dispositivo físico.
