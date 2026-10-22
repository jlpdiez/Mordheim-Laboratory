# Seguimiento de reglas

Auditoría de las reglas implementadas en Mordheim Laboratory. Mordheimer se utilizará como referencia de contraste, sin asumir que recoge todas las variantes disponibles.

Solo se consideran verificadas las reglas cuyo alcance, referencia y pruebas se documentan expresamente en una ficha. Las descripciones del comportamiento actual no certifican por sí solas su fidelidad al reglamento.

## Estados

- ⬜ **Pendiente:** todavía no contrastado.
- ✅ **Coincide:** implementación y pruebas verificadas frente a una referencia concreta.
- 🔀 **Variante:** comportamiento deliberadamente distinto, con su procedencia documentada cuando sea posible.
- 🔎 **Simplificación:** el modelo no reproduce toda la regla; se documenta su alcance.
- 🐛 **Error:** discrepancia que debe corregirse.

Una ficha puede recoger varios estados para aspectos distintos. No se marcará un bloque completo como coincidente si conserva interacciones pendientes.

## Resumen

| Bloque | Estado | Seguimiento |
| --- | --- | --- |
| Impactar y tabla de HA | ⬜ Pendiente | — |
| Herir y tabla de F/R | ⬜ Pendiente | — |
| Armadura y modificadores | ⬜ Pendiente | — |
| Armas y equipo básico | ✅ Ataque adicional verificado; resto ⬜ pendiente | [Segunda arma](#segunda-arma-un-ataque-adicional) |
| Equipo de campaña | ⬜ Pendiente | — |
| Parada clásica | ⬜ Pendiente | [Ficha](#parada-clásica) |
| Parada opcional | ⬜ Pendiente | — |
| Críticos básicos | ⬜ Pendiente | — |
| Críticos opcionales y avanzados | ⬜ Pendiente | — |
| Odio | ⬜ Pendiente | — |
| Lesiones y Duro de matar | ⬜ Pendiente | — |
| Orden de resolución e interacciones | ⬜ Pendiente | — |
| Comparador de mejoras | ⬜ Pendiente | — |
| Tablas de consulta, incluido disparo | ⬜ Pendiente | — |

## Método de revisión

1. Elegir un bloque y localizar las páginas concretas de Mordheimer que describen sus reglas e interacciones.
2. Registrar los enlaces, la fecha de consulta y la edición o variante si se identifica. Una búsqueda sin resultados no demuestra que una regla no exista.
3. Contrastar el código, las tablas, las explicaciones de la interfaz y las pruebas. Evitar validar el comportamiento únicamente contra las pruebas actuales, que también pueden contener errores.
4. Describir las discrepancias y clasificarlas como variante, simplificación o error. No cambiar una variante deliberada para hacerla coincidir con otra sin decidirlo expresamente.
5. Añadir casos analíticos con resultados esperados obtenidos de la regla contrastada, incluyendo límites e interacciones.
6. Corregir el código si procede y actualizar las explicaciones de la web. Añadir enlaces públicos solo a referencias efectivamente verificadas.
7. Registrar la conclusión, las pruebas y el commit de resolución. Actualizar el resumen y la issue asociada.

Si una variante no aparece en Mordheimer, se deja pendiente de referencia propia: no se atribuye a ese sitio ni se elimina automáticamente.

## Fichas de revisión

### Segunda arma: un ataque adicional

**Estado:** ✅ Coincide, exclusivamente en el número y reparto de ataques con dos armas de una mano.

**Referencia:** [Mordheimer · Close Combat · fighting with two weapons](https://mordheimer.net/docs/rules/close-combat#fighting-with-two-weapons).

**Edición o variante de la referencia:** sección de reglas generales de combate cuerpo a cuerpo; no se han auditado variantes opcionales.

**Fecha de consulta:** 2026-10-23.

**Issue:** [#1 · Auditoría de reglas frente a Mordheimer](https://github.com/jlpdiez/Mordheim-Laboratory/issues/1).

**Código principal:** `weapons.js`, función `attackGroups`; pruebas en `test.js`.

#### Comportamiento actual y resultado del contraste

Mordheimer indica que dos armas de una mano conceden **un ataque adicional**, añadido después de otros modificadores. Si las armas son distintas, se hace un ataque con una de ellas y el resto con la otra, resolviendo las tiradas por separado.

El motor crea un grupo con `A` ataques de la principal y otro con exactamente un ataque de la secundaria ofensiva. Por tanto, `A=1` produce 2 ataques y `A=4` produce 5, no 8. La elección de qué arma realiza la mayoría de ataques se expresa mediante los selectores de principal y secundaria. La explicación de «01 / Impactar» y el README describen el mismo reparto.

**Conclusión:** coincide para el alcance revisado. No ha sido necesario cambiar el motor ni la explicación de la interfaz.

#### Variantes y límites pendientes

- Esta revisión no valida reglas especiales de armas, restricciones de equipo, escudos de campaña, paradas ni críticos compartidos.
- El atributo `A` se interpreta como el número final de ataques de la principal. No se ha auditado la interacción con Furia asesina ni con otros modificadores, que no se aplican automáticamente en esta prueba.
- La resolución de la principal antes de la secundaria y sus interacciones con críticos quedan fuera de esta ficha.
- No se declara verificado el bloque completo de armas y equipo.

#### Pruebas de revisión

- [x] Comprobar `A=1..6`: total `A+1`, grupo principal de `A` y secundario de 1.
- [x] Comprobar una distribución independiente de heridas con HA3 contra HA3 y F3 contra R3, sin armadura, parada, Odio ni críticos.
- [x] Para ese escenario, cada ataque causa una herida con probabilidad `(3/6) × (3/6) = 1/4`. Con `n=A+1`, la distribución esperada es binomial: `P(k)=C(n,k)(1/4)^k(3/4)^(n-k)`.
- [x] Comprobar media `n/4` y probabilidad de al menos una herida `1-(3/4)^n` sin comparar el motor consigo mismo.
- [x] Ejecutar la suite completa mediante `node test.js` y comprobar el diff con `git diff --check`.

**Pruebas verificadas:** bloque «Dual wielding audit» de `test.js`.

**Commit de resolución:** consultar el commit que introduce esta ficha y las pruebas con `git log --oneline -- docs/reglas.md test.js`.

**Seguimiento en la issue:** pendiente de publicar; no se dispone de autenticación de escritura para la API de GitHub en esta sesión.

Texto preparado para comentar en la issue:

> Primera regla revisada: segunda arma de una mano = un ataque adicional. Coincide con Mordheimer, sección «fighting with two weapons». Verificada en el motor, README e interfaz. Añadidas pruebas para A=1..6 y distribución binomial independiente; suite completa correcta. No se ha cambiado el motor. El resto de armas, restricciones e interacciones sigue pendiente. Detalles y referencia en docs/reglas.md, ficha «Segunda arma: un ataque adicional».

### Parada clásica

**Estado:** ⬜ Pendiente  
**Referencia:** pendiente de localizar.  
**Edición o variante de la referencia:** —  
**Fecha de consulta:** —  
**Issue:** —  
**Código principal:** `app.js` y `weapons.js`.

#### Comportamiento actual

- La tirada debe superar el mayor dado de impacto exitoso.
- No permite parar un impacto de 6.
- No permite parar si la Fuerza rival es al menos el doble de la propia.
- Espada y rodela permiten repetir una parada fallida, no parar dos ataques.
- Con Odio, se usan los resultados finales de los dados tras las repeticiones.

Estas notas describen la implementación actual, no una regla ya validada.

#### Resultado del contraste

Pendiente.

#### Variantes y límites

Revisar por separado la parada opcional y el equipo de campaña. No atribuir estas variantes a Mordheimer sin comprobarlas.

#### Pruebas de revisión

Las casillas indican trabajo de auditoría pendiente, no necesariamente ausencia de pruebas en `test.js`.

- [ ] Superar frente a igualar el dado de impacto.
- [ ] Impactos de 6.
- [ ] Límite por Fuerza, incluido el caso de igualdad al doble.
- [ ] Espada, rodela y combinación de ambas.
- [ ] Varios impactos, armas distintas y repeticiones por Odio.
- [ ] Efecto de la parada sobre heridas, críticos y fuera de combate.

#### Acciones pendientes

- [ ] Añadir enlaces a las páginas concretas consultadas y fecha de consulta.
- [ ] Registrar coincidencias y discrepancias.
- [ ] Corregir el código si corresponde.
- [ ] Revisar o añadir pruebas y actualizar la explicación de la web.

**Conclusión:** pendiente.  
**Pruebas verificadas:** —  
**Commit de resolución:** —

### Plantilla para nuevas fichas

Copiar esta estructura para cada regla o interacción que se revise:

```md
### Nombre de la regla

**Estado:** ⬜ Pendiente
**Referencias:** enlaces concretos, pendientes de localizar.
**Edición o variante de la referencia:** —
**Fecha de consulta:** —
**Issue:** —
**Código principal:** —

#### Comportamiento actual

Descripción de la implementación; no implica validación.

#### Resultado del contraste

Coincidencias y diferencias frente a cada referencia.

#### Variantes y límites

Separar variante de campaña, simplificación del modelo y posible error.

#### Pruebas de revisión

- [ ] Caso básico con resultado esperado independiente.
- [ ] Casos límite.
- [ ] Interacciones relevantes.

#### Acciones pendientes

- [ ] Documentar referencias y conclusión.
- [ ] Corregir código si procede.
- [ ] Revisar o añadir pruebas.
- [ ] Actualizar explicaciones y enlaces de la web.

**Conclusión:** pendiente.
**Pruebas verificadas:** —
**Commit de resolución:** —
```

## Criterio de cierre

Una revisión se considera terminada cuando tiene:

- Referencias concretas y fecha de consulta, o constancia explícita de que la procedencia de una variante sigue pendiente.
- Una conclusión que distinga coincidencias, variantes, simplificaciones y errores.
- Pruebas pertinentes con resultados esperados justificados.
- Código y explicaciones de la interfaz coherentes con la conclusión.
- Enlace al commit de resolución, si hubo cambios.

Las variantes sin referencia pueden quedar documentadas, pero no deben marcarse como verificadas. La auditoría global permanece abierta mientras haya reglas o interacciones pendientes.
