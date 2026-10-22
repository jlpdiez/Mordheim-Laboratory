<p align="center">
  <img src="assets/mordheim-laboratory-emblem.svg" alt="Emblema de Mordheim Laboratory: dado alquímico y cometa de dos colas" width="120">
</p>

<h1 align="center">Mordheim Laboratory</h1>

<p align="center">
  <strong>Conoce tus posibilidades. Elige tu ventaja.</strong><br>
  <em>Menos intuición. Más supervivencia en la Ciudad de los Condenados.</em>
</p>

<p align="center">
  🎲 Probabilidades exactas &nbsp; · &nbsp; ⚔️ Combate cuerpo a cuerpo &nbsp; · &nbsp; 🛡️ Comparador de mejoras<br>
  🇪🇸 En español &nbsp; · &nbsp; 📦 Sin instalación &nbsp; · &nbsp; 🌐 En tu navegador
</p>

---

Laboratorio de combate cuerpo a cuerpo para Mordheim, en español. Configura dos combatientes, explora sus probabilidades y compara qué mejora aporta más frente a un rival concreto.

La herramienta calcula distribuciones de probabilidad mediante enumeración de dados y programación dinámica: **no lanza dados aleatorios ni depende de un número de simulaciones**. Los resultados son exactos dentro de las reglas y simplificaciones implementadas, sujetos a la precisión numérica del cálculo.

Es una web estática: no necesita instalación, base de datos, cuentas de usuario ni servidor de aplicación.

## ✨ Qué puedes hacer

- **Analizar un enfrentamiento:** probabilidad de causar heridas, heridas esperadas, distribución del daño y probabilidad de dejar al rival fuera de combate.
- **Configurar ambos perfiles:** atributos, heridas restantes, armadura, arma principal, secundaria, Odio activo y Duro de matar.
- **Intercambiar A y B** para estudiar el ataque en sentido contrario.
- **Comparar mejoras:** +1 HA, +1 Fuerza, +1 Ataque, espada, escudo o rodela.
- **Combinar variantes de campaña:** parada clásica u opcional, equipo básico o de campaña y cuatro modos de críticos.
- **Consultar tablas:** impactar, herir, críticos, armadura, lesiones, parada y disparo. El disparo es solo de consulta; no forma parte del simulador.

## 🚀 Empezar

### Abrir directamente

Descarga o clona el repositorio y abre `index.html` en un navegador moderno. No hay dependencias que instalar ni proceso de compilación.

```sh
git clone git@github.com:jlpdiez/Mordheim-Laboratory.git
cd Mordheim-Laboratory
```

El repositorio es privado: para clonarlo necesitas una cuenta autorizada y acceso SSH a GitHub.

### Servir en local

Si tienes Python 3, puedes usar su servidor estático:

```sh
python3 -m http.server 8000 --bind 127.0.0.1
```

Abre <http://localhost:8000>. Detén el servidor con `Ctrl+C`.

Los cálculos se realizan en el navegador. Las fuentes de Google son opcionales y tienen alternativas de respaldo; sin conexión puede cambiar la tipografía, pero no el funcionamiento del laboratorio.

## 🧭 Guía rápida

1. Abre **Reglas del enfrentamiento** y selecciona las variantes de tu campaña.
2. Configura **A**, el atacante, y **B**, su objetivo.
3. Introduce la **Fuerza final** y la **salvación por armadura final** de cada perfil. Los bonos que debes añadir a mano se detallan más abajo.
4. Elige las armas y activa las habilidades que correspondan a esa fase.
5. Consulta los resultados de **A → B**. Usa **Intercambiar A ↔ B** para invertir el enfrentamiento.
6. En **Comparar mejoras**, elige dos alternativas: cada una se aplica por separado a una copia de A frente al mismo B.

### Cómo interpretar los resultados

| Resultado | Qué significa |
| --- | --- |
| Probabilidad de herir | Probabilidad de causar al menos una herida no salvada durante la fase de ataques de A. |
| Heridas esperadas | Media de heridas no salvadas por fase; no es un resultado garantizado. |
| Agotar heridas del rival | Probabilidad de causar tantas heridas como las que le quedan al objetivo, o más. |
| Fuera de combate | Probabilidad de obtener ese resultado mediante las lesiones y los efectos especiales implementados. |
| Distribución de heridas | Probabilidad de causar exactamente 0, 1, 2… heridas no salvadas, incluso por encima de las restantes. |

> [!IMPORTANT]
> **Agotar heridas no equivale a dejar fuera de combate.** Un combatiente que pierde su última herida puede quedar derribado o aturdido. La herramienta calcula por separado la probabilidad de quedar fuera de combate; no calcula muerte ni lesiones graves pospartida.

## 🛡️ Configurar bien el equipo

### Lo que debes introducir a mano

- **Fuerza:** usa el valor final, incluidos los bonos del arma o de la ronda. Seleccionar alabarda o arma a dos manos no suma automáticamente su +1 o +2 F.
- **Escudo:** incluye su +1 de protección en la armadura del perfil. Por ejemplo, una salvación de 5+ pasa a 4+; sin armadura, pasa a 6+.
- **Odio activo:** actívalo solo para la primera ronda contra el enemigo correspondiente y desmárcalo después.

La Fuerza del perfil se utiliza para ambas armas y para comprobar si se puede parar. No se configura una Fuerza distinta por arma. La lanza básica no añade +1 F; cualquier bono aplicable de campaña debe introducirse manualmente.

### Lo que resuelve el motor

- El atributo **A** corresponde a los ataques del arma principal. Una secundaria ofensiva añade **un ataque**, no duplica A.
- Se resuelve primero la principal y después la secundaria. Ambas comparten el límite de un crítico por atacante y fase.
- Se aplican el modificador de armadura por Fuerza, el filo cortante del hacha y la protección adicional contra dagas.
- Las armas a dos manos impiden usar secundaria. La lanza admite escudo defensivo, pero no una segunda arma ni rodela.
- La espada y la rodela permiten parada; juntas permiten repetir una parada fallida, no parar dos golpes.
- Con equipo de campaña, el escudo secundario añade parada y un ataque. La rodela no añade ataques.
- Odio repite una sola vez los fallos al impactar de ambas armas y del ataque adicional de Fuerte golpe. La parada clásica usa los dados finales tras las repeticiones.

Hay perfiles de armas de filo, contundentes, lanzas y alabardas, armas a dos manos, ataques naturales y un arma flexible genérica. Esta última no representa las reglas particulares de todas las armas flexibles.

## 📜 Reglas y variantes

Las opciones se aplican a los dos combatientes y también al comparador.

| Ajuste | Opciones |
| --- | --- |
| Parada | Clásica, superando el mayor dado de impacto exitoso; u opcional, por umbral y HA. |
| Críticos | Tabla básica, sin críticos, opcionales o avanzados. |
| Equipo | Básico, con escudo sin parada; o de campaña, con escudo utilizable como arma y con parada. |

### Críticos y lesiones

Un 6 natural al herir puede generar un crítico, salvo cuando se necesita un 6 para herir. Se permite como máximo un crítico por atacante y fase.

La tabla básica contempla dos heridas, posibles resultados que ignoran armadura y un +2 a lesiones en los resultados 5–6. Cuando corresponde armadura, una única salvación protege de las dos heridas del crítico básico.

Para quedar fuera de combate se usa 5+ en lesiones, o 6+ con **Duro de matar**, aplicando los modificadores correspondientes. Se cuenta una tirada de lesiones por la herida que agota las restantes y por cada herida excedente.

Las tablas opcionales incluyen efectos como salvaciones independientes por herida, modificadores a lesiones, repeticiones para herir, ataques adicionales y **Aplastado**, que puede dejar fuera de combate aunque queden heridas e ignora Duro de matar. No todos los efectos narrativos o posicionales de esas tablas se simulan.

### Tablas integradas

Las tablas y sus ramas de probabilidad están implementadas en `criticals.js` y pueden consultarse directamente en la herramienta.

Las familias compartidas por ambas variantes coinciden en sus efectos de heridas, armadura y lesiones. Los desplazamientos de Empalado no se simulan. La variante avanzada añade flexibles y tablas de accidentes; proyectiles, caídas, explosiones y atropellos se muestran solo como referencia.

## ⚖️ Comparar mejoras sin confundir resultados

Cada alternativa se aplica **de forma independiente** al perfil A, manteniendo el mismo rival B. No se acumulan las dos opciones ni se modifica el perfil original.

- **Espada** sustituye el arma principal.
- **Escudo** y **rodela** sustituyen la secundaria, cuando la principal lo permite.
- El comparador ajusta la armadura de la copia al añadir o retirar un escudo; el perfil original debe tener ya su salvación final correctamente introducida.
- No se comparan costes en coronas ni se presupone que todas las opciones sean legales para cualquier banda.

> [!TIP]
> Una mejora de HA no siempre cambia la tirada para impactar. Su utilidad depende del enfrentamiento concreto, igual que la de la Fuerza, los ataques o la parada.

## 🔎 Alcance y limitaciones

El laboratorio estudia **fases de ataques**, no una batalla completa ni un duelo hasta que solo quede un superviviente.

- Las fases ofensiva y defensiva del comparador son independientes: ambos combatientes realizan todos sus ataques.
- No se simulan iniciativa, cargas, atacar primero o último, ni bajas que impidan responder.
- Derribos, aturdimientos y desarmes no alteran los ataques posteriores de la fase.
- No se calculan movimientos, desplazamientos, daños a terceros ni efectos sobre otras criaturas, como monturas.
- La parada opcional elige el impacto parable de mayor daño esperado; no necesariamente el que minimiza la probabilidad de quedar fuera de combate.
- Una familia sin tabla aplicable en el modo elegido se indica como tal: no se sustituye por una tabla inventada.
- No hay simulación de disparos, magia, campaña, experiencia ni lesiones graves pospartida.

Comprueba siempre las reglas, erratas y acuerdos de tu grupo. La herramienta ayuda a comparar probabilidades dentro de su modelo; no sustituye al reglamento ni resuelve todas las interacciones posibles.

## 📋 Seguimiento de reglas

La auditoría de reglas, variantes y simplificaciones se registra en **[docs/reglas.md](docs/reglas.md)**. El documento recoge los bloques pendientes, el método de contraste con Mordheimer y las fichas de revisión. Ninguna regla se considera verificada hasta completar su revisión y las pruebas correspondientes.

## 🗂️ Estructura del proyecto

| Archivo | Responsabilidad |
| --- | --- |
| `index.html` | Estructura, secciones, controles y explicaciones de la web. |
| `app.js` | Perfiles, reglas generales, resultados, comparador e interacción con la interfaz. |
| `weapons.js` | Catálogo de armas, restricciones de equipo y cálculo del combate con armas. |
| `criticals.js` | Tablas de críticos y ramas de probabilidad de sus efectos. |
| `style.css` | Estilos base. |
| `theme.css` | Tema visual del laboratorio. |
| `branding.css` | Estilos de la identidad de marca. |
| `assets/mordheim-laboratory-emblem.svg` | Emblema vectorial, utilizado también como favicon. |
| `Schoensperger.otf` | Tipografía local del logotipo. |
| `test.js` | Pruebas automatizadas, sin dependencias externas. |

## 🧪 Desarrollo y pruebas

Edita los archivos y recarga el navegador. No se necesita `npm install` ni un empaquetador.

Para ejecutar las pruebas necesitas una versión moderna de Node.js:

```sh
node test.js
```

Las pruebas incluyen casos analíticos, normalización de distribuciones, armas, paradas, críticos, Odio, intercambio de perfiles y comprobaciones de las referencias de la interfaz.

Si cambias una regla, añade o ajusta un caso de prueba y revisa también las explicaciones visibles en la web. Antes de compartir cambios, comprueba tanto los resultados del motor como los selectores y el comparador en el navegador.

## 🌐 Publicación y acceso

Puedes alojar los archivos en un servicio de hosting estático. La carpeta raíz contiene `index.html`; no hay comando de compilación ni backend que desplegar.

> [!WARNING]
> **Un repositorio privado no convierte una web desplegada en privada.** El control de acceso depende del servicio de alojamiento y debe configurarse por separado. Si solo debe entrar un grupo de amigos, utiliza una solución que autentique a los visitantes, por ejemplo Cloudflare Pages con Cloudflare Access.

Antes de publicar:

- Decide si la web será pública o tendrá acceso restringido.
- Revisa los permisos de distribución de las fuentes y de cualquier material que incorpores.
- Comprueba que los enlaces no dependan de archivos locales no incluidos en el repositorio.
- Comprueba las rutas, la carga de estilos y el funcionamiento en móvil.
- Ejecuta `node test.js`.

---

## 🏷️ Herramienta no oficial

Mordheim Laboratory es un proyecto no oficial, sin afiliación con Games Workshop. Las marcas y materiales de terceros pertenecen a sus respectivos titulares. La disponibilidad del código no implica permiso para redistribuir reglamentos, fuentes u otros recursos de terceros.
