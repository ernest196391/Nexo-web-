#!/usr/bin/env python3
"""Comprueba la web contra la lista de la sección 11 del manual de marca.

No sustituye a mirar la página: comprueba lo que se puede comprobar solo, que
es justo lo que se escapa al revisar a ojo. Las reglas y las palabras salen del
manual; si el manual cambia, esto se actualiza con él.
"""
import re, sys, pathlib, html

RAIZ = pathlib.Path(__file__).resolve().parent.parent
PAGINAS = ["index.html", "implementacion.html"]

# Manual §8 y §12.
PROHIBIDAS = ["ia", "inteligencia artificial", "algoritmo", "sincronizar", "servidor",
              "plataforma", "ecosistema", "innovador", "disruptivo", "móvil", "vale",
              "ordenador"]
FUENTES_PROHIBIDAS = ["inter", "roboto", "arial"]

BLOQUES = "p|h1|h2|h3|h4|li|div|section|article|header|footer|nav|a|td|th|figcaption"

def texto_visible(bruto):
    """Texto que ve la gente, con las frases SEPARADAS.

    Sin cortar en los bloques, el texto de un enlace y el del párrafo siguiente
    se pegan y el contador de palabras mide frases que nadie escribió."""
    s = re.sub(r"<(script|style|head)\b.*?</\1>", " ", bruto, flags=re.S | re.I)
    s = re.sub(rf"</(?:{BLOQUES})>", " ◼ ", s, flags=re.I)
    s = re.sub(r"<[^>]+>", " ", s)
    return html.unescape(re.sub(r"\s+", " ", s))

fallos = []
for nombre in PAGINAS:
    ruta = RAIZ / nombre
    if not ruta.exists():
        fallos.append(f"{nombre}: no existe"); continue
    bruto = ruta.read_text(encoding="utf-8")
    visible = texto_visible(bruto)

    # Una sola acción brand por pantalla (§4).
    n = len(re.findall(r"btn--brand", bruto))
    print(f"{nombre}: {n} botón(es) brand", "ok" if n <= 1 else "← MÁS DE UNO")
    if n > 1:
        fallos.append(f"{nombre}: {n} botones brand; el manual permite uno por pantalla")

    # Palabras prohibidas en el texto que ve la gente (§8).
    for mala in PROHIBIDAS:
        if re.search(rf"(?<![a-záéíóúñ]){re.escape(mala)}(?![a-záéíóúñ])", visible, re.I):
            fallos.append(f'{nombre}: usa la palabra prohibida "{mala}"')

    # Frases de 12 palabras como máximo (§8). Se avisa, no se bloquea: un
    # titular de portada puede justificar pasarse.
    frases = [f.strip(" ◼") for trozo in visible.split("◼")
              for f in re.split(r"(?<=[.!?:])\s+", trozo)]
    largas = [f for f in frases if len(f.split()) > 12]
    for f in largas[:6]:
        print(f'  aviso · frase de {len(f.split())} palabras: "{f[:68]}…"')

    # Nada de hex sueltos fuera de los tokens (§11).
    for h in set(re.findall(r"#[0-9A-Fa-f]{6}\b", bruto)):
        if h.upper() not in ("#FFFFFF",):
            fallos.append(f"{nombre}: hex suelto {h}; el manual pide var(--token)")

# Fuentes prohibidas (§12) y tamaño mínimo de lectura (§5).
for css in (RAIZ / "css").glob("*.css"):
    cuerpo = css.read_text(encoding="utf-8")
    for f in FUENTES_PROHIBIDAS:
        if re.search(rf"font-family:[^;]*\b{f}\b", cuerpo, re.I):
            fallos.append(f"{css.name}: usa la fuente prohibida {f}")
    for t in re.findall(r"font-size:\s*(\d+)px", cuerpo):
        if int(t) < 13:
            fallos.append(f"{css.name}: font-size de {t}px; el mínimo del manual es 13 (label)")

print()
if fallos:
    print(f"{len(fallos)} FALLO(S):")
    for f in fallos: print("  ·", f)
    sys.exit(1)
print("CUMPLE LA LISTA DEL MANUAL")
