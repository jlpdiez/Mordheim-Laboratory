# Guía para agentes

## Proyecto y contexto

Mordheim Laboratory es una web estática en español para calcular probabilidades de combate cuerpo a cuerpo y comparar mejoras.

- Lee `README.md` antes de realizar cambios.
- Antes de trabajar en reglas o cálculos, lee `docs/reglas.md` y consulta la issue de auditoría: https://github.com/jlpdiez/Mordheim-Laboratory/issues/1.
- Si no puedes consultar una referencia o una issue, indícalo; no supongas su contenido ni su estado.

## Desarrollo

- Conserva la arquitectura estática, sin dependencias externas de JavaScript ni compilación, salvo petición expresa.
- Mantén la interfaz y la documentación en español.
- Mantén coherentes el código, las tablas, las explicaciones de la interfaz y el README.
- Ejecuta `node test.js` tras modificar cálculos, reglas o su presentación.
- Añade o ajusta pruebas para las correcciones de comportamiento. Justifica los resultados esperados de forma independiente del código que se está comprobando.
- Ejecuta `git diff --check` antes de entregar cambios.

## Auditoría de reglas

- No des por verificada una regla sin contrastarla con una referencia concreta.
- Distingue errores, variantes deliberadas de campaña y simplificaciones del modelo.
- No atribuyas variantes a Mordheimer sin comprobarlas. Que una variante no aparezca allí no demuestra que sea incorrecta ni justifica eliminarla automáticamente.
- No cambies el comportamiento del simulador solo para cerrar una tarea de documentación. Explica las discrepancias y consulta al usuario si la corrección requiere decidir entre variantes.
- Añade enlaces en la web únicamente a referencias efectivamente contrastadas y disponibles.

### Registrar los avances

Al terminar una revisión de reglas o corregir un cálculo relacionado:

1. Actualiza la ficha correspondiente y el resumen de `docs/reglas.md`.
2. Registra los enlaces consultados, la fecha, la conclusión, las variantes o limitaciones y las pruebas revisadas o añadidas.
3. Si la revisión es parcial, deja explícitamente pendientes los aspectos no comprobados. No marques todo el bloque como verificado.
4. Si realizas un commit de resolución, registra su identificador cuando esté disponible. No inventes identificadores ni crees un ciclo de commits solo para documentarlos.
5. Actualiza la issue asociada si tienes acceso de escritura y el trabajo lo requiere. Si no puedes, entrega al usuario un resumen listo para publicar.

Estas instrucciones se refieren a mantener actualizado el seguimiento documental; no autorizan a modificar automáticamente las reglas de juego. Los cambios puramente visuales o de redacción no requieren actualizar la auditoría si no afectan al comportamiento ni a sus conclusiones.

## Publicación y recursos

- GitHub Pages publica desde `main` y la raíz del repositorio. Los cambios subidos pueden quedar visibles en la web.
- No incorpores recursos locales excluidos por `.gitignore` ni enlaces a archivos que no estén disponibles en el despliegue.
- No añadas fuentes u otros recursos de terceros sin comprobar sus permisos de uso y distribución.
- No añadas nombres, páginas ni referencias a documentos retirados de la web y del README sin petición expresa del usuario.
- Mantén el crédito de autor como «Juan Pérez Díez», enlazado a https://github.com/jlpdiez.

## Entrega y continuidad

- Resume los cambios, las pruebas ejecutadas y cualquier limitación pendiente.
- Distingue entre cambios locales, commits realizados y cambios subidos a GitHub. No afirmes que un despliegue ha terminado sin comprobarlo.
- No asumas autorización permanente para hacer push: sigue la petición del usuario y el contexto de la tarea.
- Guarda las conclusiones duraderas en el documento de seguimiento o en la issue, no solo en la conversación.
- Mantén `AGENTS.md` para instrucciones estables; no lo conviertas en un historial de tareas.
