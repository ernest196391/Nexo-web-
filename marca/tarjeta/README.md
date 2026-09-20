# Tarjeta de presentación NEXO

## Qué entregar a la imprenta

`imprimir/tarjeta-nexo-imprenta.pdf` — dos páginas: página 1 el frente, página 2 el dorso.
Es vectorial, así que el logo y el texto no pixelan a ningún tamaño.

Si la imprenta solo acepta imágenes, dale los dos PNG de esa misma carpeta
(`-sangrado-300ppp.png`). Son el mismo diseño rasterizado a 300 ppp.

## Especificaciones

| | |
|---|---|
| Tamaño final (corte) | 85 × 55 mm |
| Tamaño del archivo | 91 × 61 mm (lleva 3 mm de sangrado por lado) |
| Margen de seguridad | 4 mm desde el corte |
| Resolución | 300 ppp |
| Color | RGB |

El sangrado son 3 mm de fondo de más por cada lado que la guillotina se come.
Está para que, si el corte se desvía un milímetro, no aparezca una franja blanca
en el borde. **La imprenta corta en 85 × 55 mm, no en 91 × 61.**

## Dos cosas que conviene decirle a la imprenta

**1. El negro del frente.** El fondo es `#05070D`. Si la imprenta pasa el archivo
a CMYK y usa solo negro (K100), va a salir un gris lavado en vez de negro
profundo. Pídele **negro rico**: aproximadamente C60 M40 A40 N100. Es la
diferencia entre una tarjeta que parece cara y una que parece fotocopia.

**2. El acabado.** Una cara oscura marca las huellas y los rayones con mucha
facilidad. Con **laminado mate o soft-touch** eso desaparece y además se siente
mejor al tacto. Cartulina de 300–350 g.

## El QR

Lleva a `https://nexo-plan-veci.vercel.app`.

Está generado con corrección de errores alta y un hueco en el centro para la
marca, y se comprobó que se lee a 24 mm impreso, de lejos, borroso, inclinado y
con la compresión de la cámara de un teléfono (`fuente/probar_qr.py`).

**Si cambia el dominio**, el QR impreso sigue funcionando porque la dirección de
Vercel no se cae. Pero para la siguiente tirada hay que regenerarlo: cambia la
constante `URL` en `fuente/qr.py` y vuelve a generar todo (ver abajo).

## Qué hay en cada carpeta

- `imprimir/` — lo que se manda a la imprenta.
- `vista/` — para mirar: `vista-previa.png` (las dos caras ya cortadas),
  las caras sueltas y `guias-*.png`, que dibujan en rojo la línea de corte y en
  verde el margen de seguridad. **Las guías no se imprimen**, son solo para
  entender el archivo.
- `fuente/` — el diseño editable. La tarjeta es un HTML, así que cambiar un
  texto, el cargo o el teléfono es editar `tarjeta.html`.

## Regenerar después de un cambio

Hace falta Node con Playwright, y Python con `qrcode`, `pymupdf`, `pillow` y
`opencv-python-headless`.

```bash
cd fuente
python3 -m http.server 8766 &     # el render lee los SVG por HTTP
python3 qr.py 0.16                # QR con hueco del 16% para la marca
node render.js                    # comprueba márgenes y saca el PDF
python3 raster.py                 # PNG a 300 ppp exactos, sacados del PDF
python3 entregables.py            # versiones cortadas, guías y vista previa
python3 probar_qr.py              # comprueba que el QR se sigue leyendo
```

`render.js` avisa si algún texto se sale del margen de seguridad o si alguna
línea de la lista se parte en dos. Si imprime algo ahí, hay que arreglarlo antes
de mandar nada.
