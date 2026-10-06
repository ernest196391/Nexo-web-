> **Manual de marca NEXO · versión 1.0.** Aprobado para producción. Este texto es la fuente de verdad. Los valores exactos de cada token están en la sección *Referencia de tokens*. Las fichas de Logo, Fundamentos, Aplicaciones y Componentes lo muestran con ejemplos.

## 1. Qué es NEXO

NEXO conecta los productos, las ventas y las operaciones de un pequeño negocio para que venda más con menos trabajo. Es una plataforma para comercios de Cuba que trabajan desde el teléfono, con internet inestable y sin equipo técnico: catálogo verificado, caja que vende sin internet, inventario, pedidos, gestoras que venden con comisión y un asistente de WhatsApp que solo responde con datos reales.

- **Idea central:** "lo que une". El punto donde las piezas sueltas de un negocio se conectan.
- **Posicionamiento:** Del producto al cliente, todo conectado.
- **Frases de apoyo:** Registras una vez. Vendes en todas partes. · Vende sin comprar mercancía.
- **Personalidad:** clara, ágil, confiable, cercana, tecnológica, premium, humana y precisa. Ni fría ni infantil. Tecnología sofisticada detrás, experiencia simple delante.

## 2. Arquitectura de marca

| Nivel | Nombre | Cómo se muestra |
|---|---|---|
| Marca madre | NEXO | `nexo-horizontal-*`, `nexo-vertical-*`, `nexo-simbolo-*` |
| Producto para dueños | NEXO Business | `nexo-business-*` o `<Logo variant="business" />` |
| Producto para gestoras | NEXO Impulsa | `nexo-impulsa-*` o `<Logo variant="impulsa" />` |
| Servicio | Implementación NEXO | Solo texto, en `title` o `body-strong`, sin logo |
| Funciones | Digitaliza tus productos · Pregunta a NEXO · Conecta tu sistema | Frases en texto normal, sin logo, sin color ni mayúsculas de marca |

Los productos llevan siempre la misma letra, el mismo color y la misma altura de mayúscula que NEXO. Nunca se componen a mano ni se escriben con la fuente.

## 3. Logo

Cuatro piezas (productos, ventas, operaciones y clientes) empujan hacia un mismo centro. El hueco que dejan entre ellas es la X de NEXO.

- **Archivos** (grupo de assets *Logo*, SVG con el texto convertido a trazos):
  - `nexo-horizontal-tinta` es la principal.
  - `nexo-horizontal-negativo` va sobre `nexo-tinta` o fotos oscuras.
  - `nexo-horizontal-blanco` es la versión de una tinta en negativo.
  - Además: `nexo-vertical-*`, `nexo-simbolo-tinta`, `-amarillo` y `-blanco`, `nexo-simbolo-pequeno` (16 a 23 px), `nexo-logotipo-*`, `nexo-business-*`, `nexo-impulsa-*`, `nexo-icono-app` y `nexo-favicon-16`/`-32`.
- **Construcción:** la unidad u es 1/20 de la altura de mayúscula. El símbolo mide 20u y el hueco de la X 2,5u. Hay 7u entre el símbolo y el nombre, y 5u entre NEXO y el producto. Ficha *Logo · Construcción*.
- **Color:** solo hay cinco combinaciones:
  - Tinta sobre blanco.
  - Tinta sobre amarillo.
  - Símbolo amarillo y nombre blanco sobre tinta.
  - Todo blanco sobre tinta.
  - Negro puro de una tinta.

  El amarillo nunca va sobre blanco y el nombre nunca va en amarillo.
- **Área de protección:** medio símbolo (10u) alrededor del logo y un cuarto (5u) alrededor del símbolo solo.
- **Tamaños mínimos:**
  - En pantalla: horizontal 20 px, logotipo 12 px y símbolo 24 px (de 16 a 23 px, la versión pequeña).
  - Impreso 5 mm, ticket térmico 6 mm (logotipo solo 3 mm), bordado 15 mm, serigrafía o vinilo 8 mm.
- **Nunca:** deformar, girar, recolorear, añadir efectos, convertir en contorno, reordenar, escribir NEXO con una fuente, invadir el área de protección, poner el logo sobre un fondo cargado sin placa, ni usar el símbolo como adorno. Ficha *Logo · Usos incorrectos*.

## 4. Color

Usa siempre los tokens (`var(--nombre)`) y nunca un hex suelto en un componente. Hay dos temas, claro y oscuro (`data-theme="dark"`), y los valores de los dos están dentro de cada token.

- **`brand`** es el amarillo `#FFC21A`, con **`on-brand`** encima. Marca la acción más importante de cada pantalla y nada más: una sola por pantalla.
- **`accent`** es el azul mar: `#0B5F8A` en claro y `#6EBEEB` en oscuro. Se usa para enlaces, selección, interruptores, información y "Pregunta a NEXO", con **`on-accent`** encima.
- **Neutros:**
  - Superficies: `surface`, `surface-raised` y `surface-sunken`.
  - Texto: `ink` (principal), `ink-muted` (secundario) e `ink-subtle` (ayudas en campos).
  - Bordes: `line` para separar y `line-strong` para delimitar controles.

  Son grises limpios, sin tinte crema ni azulado.
- **Estados:** `success`, `warning` (naranja, nunca amarillo) y `danger`, cada uno con su `-surface`. Siempre van con icono y palabra.
- **Piezas de marca:** `nexo-amarillo`, `nexo-tinta` y `nexo-blanco` no cambian con el tema. Se usan en el logo, el ticket, la camiseta, el cartel, las redes y el aviso de sin conexión.
- **Comercio:** `merchant` y `on-merchant` (sección 9).
- **Contraste:** todo texto supera 4,5:1 en los dos temas, y los bordes de control y el foco superan 3:1. Ficha *Color*. `brand` sobre `surface` claro da 1,6:1, así que nunca se usa como texto, línea fina ni icono sobre fondo claro.

## 5. Tipografía

Archivo (Omnibus-Type, licencia OFL), en los pesos 400, 500, 600, 700 y 800 (`fonts/`). Se empaqueta dentro de la app y nunca se carga de internet. La pila de respaldo es Helvetica Neue y Helvetica.

| Estilo | Tamaño / interlínea | Peso | Uso |
|---|---|---|---|
| `display-lg` | 48 / 52 | 800 | Portada web y carteles (≥ 600 px) |
| `display` | 32 / 36 | 800 | Titular en el teléfono |
| `title-lg` | 24 / 30 | 700 | Título de pantalla |
| `title` | 20 / 26 | 700 | Sección o tarjeta |
| `amount` | 28 / 32 | 800 | Totales |
| `body-lg` | 18 / 26 | 400 | Lectura en web |
| `body` | 16 / 24 | 400 | Texto de la app (mínimo de lectura) |
| `body-strong` | 16 / 24 | 600 | Nombres y precios en listas |
| `button` | 16 / 20 | 600 | Botones y pestañas |
| `small` | 14 / 20 | 400 | Metadatos de una línea |
| `label` | 13 / 16 | 600 | Insignias en mayúsculas, máximo dos palabras |

- Ningún texto que haya que leer baja de 16 px.
- Las cifras van en formato cubano (1.250 CUP) y con números tabulares en columnas.
- Mayúscula solo al principio de la frase.

## 6. Espacio, forma y movimiento

- **Retícula de 4 px:**
  - El margen lateral en el teléfono es `space-4` (16 px). Entre bloques, `space-6`; entre secciones, `space-8`.
  - En la web de escritorio, el margen es `space-12` y las secciones se separan con `space-16`.
- **Áreas táctiles:** todo lo que se toca mide al menos `size-target` (48 px). El botón Cobrar mide `size-button-lg` (56 px).
- **Radios:**
  - `radius-xs` para insignias, `radius-sm` para botones, campos y placas de logo, `radius-md` para tarjetas y avisos, `radius-lg` para hojas inferiores.
  - Los botones son rectángulos, nunca píldoras. `radius-full` solo en interruptores y avatares.
- **Sombras:** solo `shadow-sheet`, en hojas y menús flotantes. Lo demás se separa con `line`.
- **Foco:** contorno de `size-focus` (3 px) en `focus`, separado 2 px.
- **Movimiento:** transiciones cortas, de 150 a 200 ms, solo para mostrar qué cambió (una hoja que sube, un aviso que aparece). Nada que rebote ni que haga esperar al cajero.

## 7. Iconos y fotografía

- **Iconos:**
  - Son 27 iconos de trazo (grupo *Iconos*, componente `Icon`). Están en una retícula de 24 px, con trazo de 2 px y remates redondos, y toman el color del texto.
  - Muestran cosas del negocio, nunca tecnología.
  - Sin emojis. Solo sin texto en la barra de pestañas y en buscar o cerrar.
  - Si hace falta uno nuevo, se dibuja con las mismas reglas.
- **Fotografía:**
  - Comercios cubanos reales y sus productos reales, con luz natural de puerta o ventana.
  - Encuadre a la altura de los ojos o del mostrador.
  - Gente trabajando, con permiso firmado, que no mira a la cámara.
  - Nunca fotos de banco, imágenes generadas que imiten comercios reales ni pantallas con datos inventados.
  - Sin foto todavía: el hueco `surface-sunken` con el icono `foto`.

## 8. Tono de voz

Es el español de Cuba, de tú, con una idea por frase y 12 palabras como máximo, y siempre habla del resultado para el negocio, no de la tecnología. Ficha *Tono de voz*.

- **Prohibido:** "IA", "inteligencia artificial", "algoritmo", "sincronizar", "servidor", "plataforma", "ecosistema", "innovador" y "disruptivo".
- **Cifras:** solo reales y con moneda. Nunca cifras, clientes ni testimonios inventados.
- **Botones:** un verbo y, si se puede, la cifra: "Cobrar 4.500 CUP".
- **Avisos:** primero qué pasó, después qué hacer. Sin exclamaciones y sin emojis en la interfaz.
- **Vocabulario de Cuba:** teléfono, efectivo, transferencia, mandar. Evita "móvil", "vale" y "ordenador".
- **Formato:** fecha "mar 6 oct", hora "3:40 p. m." y cantidades con punto de miles.

| Así sí | Así no |
|---|---|
| Sin conexión. Sigues vendiendo. | Error de red: no se pudo sincronizar. |
| Te quedan 2 ventiladores. ¿Pedimos más? | Alerta: stock bajo el umbral mínimo. |
| Vende sin comprar mercancía. Ganas comisión en cada venta. | Únete a nuestro innovador ecosistema de revendedores. |
| Pregunta a NEXO: ¿qué se vendió más esta semana? | Nuestra IA analiza tus datos en tiempo real. |

## 9. Marca del comercio

Los comercios clientes (por ejemplo, Casa Viva) venden con su propia cara.

- **Qué pone el comercio:** su logo (en una placa con `radius-sm`), su nombre y un color, que sustituye a `merchant`.
- **El texto encima del color:** `on-merchant` se elige solo entre `nexo-tinta` y `nexo-blanco`, el que dé más contraste (`NEXO.onMerchant`). Si ninguno da 4,5:1, el color solo se usa como franja de 4 px.
- **En su catálogo público:**
  - `merchant` pinta la cabecera (`MerchantHeader`) y el botón principal.
  - NEXO solo aparece en el sello "Hecho con NEXO" del pie: símbolo de 14 px y texto en `small`.
- **En NEXO Business manda NEXO:** cabecera con `nexo-business-*`, acción principal en `brand`, y el comercio con su logo y una franja `merchant` de 4 px.
- **Nunca cambian:** la tipografía, los iconos, los estados, el foco, la caja ni el icono de la app.

## 10. Aplicaciones

Cada aplicación tiene su ficha en *Aplicaciones*, con sus reglas en el README de esa ficha:

- **Caja:** un solo botón `brand` de 56 px ("Cobrar 9.300 CUP"), cuadrícula de productos con foto real, hoja inferior con el total en `amount`, y franja de sin conexión que no bloquea la venta.
- **Panel del dueño:**
  - Cabecera NEXO Business, franja del comercio y cifras clave en `surface-sunken`.
  - Un aviso como máximo, listas de 56 px, Pregunta a NEXO en `accent` y barra de 5 pestañas con la activa marcada en `brand`.
- **Portada web:** el titular, la promesa, una foto real con el bloque amarillo y el símbolo gigante, tres beneficios y los dos productos. Sin dashboards ni cifras inventadas.
- **Icono de app:**
  - `nexo-icono-app`: fondo amarillo y símbolo al 50%.
  - Adaptativo de 108 dp, con zona segura de 66 dp y capa monocroma.
- **Ticket:**
  - 384 puntos en negro puro, con el nombre del comercio arriba.
  - Firma "Hecho con" + `nexo-logotipo-tinta` a 3 mm.
  - Nada por debajo de 18 puntos.
- **Instagram:**
  - 1080 × 1080, con margen de 64 px, sobre fondo amarillo, tinta o foto real con placa.
  - Titular de 7 palabras como máximo y el logo abajo a la izquierda.
- **Camiseta:** negra, con el símbolo bordado en amarillo de 60 mm en el pecho y el logo en negativo de 280 mm en la espalda.
- **Cartel:**
  - A3 en vidriera, amarillo, con "Pide por WhatsApp. Te lo tenemos listo."
  - Calcomanía de 150 mm "Vendemos con NEXO".
  - Para imprenta, el amarillo ≈ C0 M24 Y90 K0, con prueba física siempre.

## 11. Cómo construir con NEXO

Instrucciones para personas y agentes:

1. Carga `tokens.css` y la fuente desde `fonts/`. Usa solo variables (`var(--brand)`, `var(--space-4)`…) y las clases de estilo de texto (`.body`, `.amount`…).
2. Para interfaces en React, carga React 18 y `components/bundle.js` + `components/bundle.css`. Usa `window.NEXO`:
   - `Logo`, `Icon` y `Button`.
   - `Alert`, `Badge` y `OfflineBar`.
   - `Amount` y `MerchantHeader`.
   - Las funciones `formatAmount` y `onMerchant`.

   Los tipos están en `components/index.d.ts`.
3. Para el logo, usa el componente `Logo` o los SVG del grupo *Logo*. Nunca lo redibujes ni lo escribas con la fuente.
4. Antes de entregar, comprueba:
   - Solo hay un botón `brand` por pantalla.
   - Ningún texto de lectura baja de 16 px.
   - El contraste es ≥ 4,5:1 en los dos temas.
   - Los estados llevan icono y palabra.
   - Las áreas táctiles miden 48 px o más.
   - Los textos son de tú y sin palabras prohibidas.
   - Las cifras son reales o están marcadas como datos de ejemplo.
   - Nada de la lista de la sección 12.

## 12. Prohibido en toda la marca

- Robots, cerebros, circuitos, nodos de red.
- Gradientes morados o azul-violeta, neón, degradados 3D, brillos.
- Dashboards falsos, cifras o testimonios inventados, fotos de banco.
- Emojis como iconos.
- Las fuentes Inter, Roboto y Arial.
- Paletas cliché de IA, como crema con terracota o negro con verde ácido.
