# De dónde viene esto

No es nuestro. Es **scroll-craft**, de Nate Herk (AI Automation Society).

- Fuente: https://github.com/nateherkai/scroll-craft
- Versión instalada: **0.3.1**, commit `75d81f74e83692add18cd7a8a8e078b8a887a579`
- Licencia: **MIT** (ver `LICENSE`). Se puede usar, modificar y vender sin pedir
  permiso; la única obligación es conservar ese aviso de copyright, que es por
  lo que el archivo está aquí dentro.

El zip que descargaste empaquetaba el commit `0b816225`, anterior a este. Se
instaló la versión de GitHub, que es la que incluye los arreglos de seguridad y
el desmontaje del motor de la 0.3.1.

## Qué hace falta para usarla

| | Estado en este entorno |
|---|---|
| Node 18+ | v22 ✓ |
| ffmpeg completo | 6.1.1, 564 filtros ✓ (el de Playwright no sirve: 24 filtros, sin `fps` ni webp) |
| playwright-core + Chrome | ✓ con `SCROLLCRAFT_CHROME=/opt/pw-browsers/chromium-1194/chrome-linux/chrome` |
| `KIE_AI_API_KEY` | sin poner, y **no hace falta**: construir con fotos y video propios es una vía de primera clase según la propia skill |

Comprobar antes de construir:

```bash
SCROLLCRAFT_CHROME=/opt/pw-browsers/chromium-1194/chrome-linux/chrome \
  node .claude/skills/scroll-craft/scripts/doctor.mjs
```

## Lo que hay que tener en cuenta antes de usarla aquí

La skill construye páginas donde el scroll mueve video fotograma a fotograma.
Eso es lo más pesado que puede llevar una web. **La web de NEXO se hizo ligera a
propósito**, porque tus clientes son dueños de negocios cubanos con datos de
ETECSA.

La buena noticia es que el peso está casi todo en un solo recurso de la skill:
el dispositivo `scrub` (video). El resto de su oficio —tipografía, espaciado,
color, profundidad, el pinneado, el texto que se arma línea a línea, la
respuesta al puntero— es CSS y pesa prácticamente nada. De las ocho gramáticas
que define, varias no se apoyan en video.
