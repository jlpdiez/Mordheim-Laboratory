# Mordheim Laboratory · Laboratorio de combate

Web estática en español, sin instalación ni dependencias de JavaScript.

## Abrir

Abre `index.html` en el navegador, o ejecuta:

```sh
python3 -m http.server 8000
```

Visita http://localhost:8000. Schoensperger se carga desde el archivo local `Schoensperger.otf` aportado por el usuario. Las tipografías de Google son opcionales; hay fuentes de respaldo para usarla sin conexión.

## Identidad visual

Logo original: emblema alquímico con dado y cometa de dos colas, acompañado de un logotipo en Schoensperger y el subtítulo Laboratory. El emblema vectorial reutilizable está en `assets/mordheim-laboratory-emblem.svg`; los estilos de marca están en `branding.css`. Se utiliza también en el pie y como favicon.

## Incluye

- Perfiles intercambiables A ↔ B, arma principal y secundaria para ambos.
- Armas básicas: espada, daga, hacha, armas contundentes, lanza, alabarda y arma a dos manos; escudo y rodela en la secundaria.
- Impactos, heridas, cuatro modos de críticos y armadura modificada por Fuerza.
- Fuerza final manual: los bonos de armas y de ronda se indican, pero no se suman automáticamente. F se usa en ambos ataques y en las comprobaciones de parada. La lanza básica no añade +1 F; cualquier bono de campaña se introduce a mano.
- Parada clásica u opcional por umbral y HA, combinable con equipo de campaña.
- Odio activo por perfil: repite una vez los fallos al impactar de ambas armas y del ataque adicional de Fuerte golpe. Se conservan los resultados finales de dados para la parada clásica. La casilla representa la primera ronda contra ese enemigo; desmárcala en rondas posteriores. No se transmite a otra criatura como una montura.
- Distribución exacta de heridas y comparación de mejoras ofensivas y defensivas.
- Pestaña de reglas con los supuestos y limitaciones.

Calcula la probabilidad de quedar fuera de combate: 5+ en lesiones, o 6+ con Duro de matar, incluyendo el +2 de críticos 5–6 en ambos casos. Cuenta una tirada por la herida que agota las restantes y por cada herida excedente. No calcula muerte ni lesiones graves pospartida. Las fases ofensiva y defensiva se evalúan independientemente, sin bajas que impidan responder y sin modificar ataques posteriores por derribo o aturdimiento. Los selectores de armas afectan al ataque y a la defensa de cada perfil. El atributo A se asigna a la principal, y la secundaria ofensiva añade un ataque. Se resuelve principal antes de secundaria y el crítico se comparte entre ambas. Con equipo de campaña, el escudo secundario añade un ataque y parada; la rodela no añade ataques. La armadura del perfil es final: el +1 de escudo se introduce manualmente (5+ pasa a 4+, sin armadura pasa a 6+), nunca lo suma el motor. El comparador ajusta la salvación de la copia cuando añade o retira escudo, sin cambiar el perfil original. Hacha y daga indican sus modificadores automáticos en los selectores. Las armas a dos manos bloquean la secundaria; la lanza admite escudo solo defensivo. La parada opcional elige el golpe de mayor daño esperado, no necesariamente el óptimo para evitar fuera de combate.

## Tablas de críticos

- Básicos y sin críticos.
- **Críticos opcionales:** `Reglamento Mordheim Finiquitao.pdf`, pp. impresas 181–182 (183–184 del PDF).
- **Críticos opcionales avanzados:** `Códice MORDHEIM 2.0.pdf`, pp. impresas 258–259 (259–260 del PDF).

`criticals.js` contiene las tablas y sus ramas de probabilidad. Las familias compartidas coinciden en heridas, armadura y lesiones. El desplazamiento de Empalado difiere (1D6 pulgadas / 3D6 cm), pero no se simula. El Códice añade flexibles y tablas de accidentes. Flexibles tiene un perfil genérico seleccionable; proyectiles, caídas, explosiones y atropellos son solo de consulta, porque el simulador es de cuerpo a cuerpo.

Incluye salvaciones independientes de Herida grave, +1/+2 en lesiones, ataque adicional sin armas y Aplastado (fuera de combate automático tras fallar armadura, aunque queden heridas y con Duro de matar). Barrido/Desarmado repiten para herir según la instrucción del texto, sin un nuevo crítico. Martillado mantiene la herida normal y añade su efecto. Fuerte golpe mantiene la herida y añade un ataque; el crítico ya se ha consumido.

No se simulan iniciativa, atacar primero/último, desarmes sobre equipo, impedir la respuesta, efectos de aturdimiento/derribo en ataques posteriores, desplazamientos o daños a terceros. Ambas fases del comparador siguen siendo independientes: los críticos no impiden responder. No se sustituyen tablas desconocidas: un arma flexible con modo opcional muestra que no existe una tabla aplicable en ese documento.

## Pruebas

```sh
node test.js
```

Casos analíticos y comprobaciones de normalización para distintos perfiles y números de ataques.
