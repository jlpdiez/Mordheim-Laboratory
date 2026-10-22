# Seguimiento de reglas

Auditoría de las reglas implementadas en Mordheim Laboratory. Mordheimer se utilizará como referencia de contraste, sin asumir que recoge todas las variantes disponibles.

**Estado inicial:** ninguna regla se considera verificada por la creación de este documento. Las descripciones del comportamiento actual documentan el modelo, no certifican su fidelidad al reglamento.

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
| Armas y equipo básico | ⬜ Pendiente | — |
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
