#!/usr/bin/env python3
"""Genera css/nexo.css desde el tokens.json del sistema de marca.

Se genera y no se escribe a mano para que no haya dos listas de valores que
puedan separarse. Si el manual cambia: se vuelve a bajar tokens.json a
marca/sistema/project/ y se corre esto.
"""
import json, io, pathlib

RAIZ = pathlib.Path(__file__).resolve().parent.parent
t = json.load(io.open(RAIZ / "marca/sistema/project/tokens.json"))
L, A = [], None
A = L.append

A("/* Tokens de NEXO, generados desde el tokens.json del sistema de marca 1.0.")
A("   No se editan a mano: se regeneran con marca/generar-css.py.")
A("   Fuente: artefacto «NEXO», project/tokens.json */\n")
# El manual: la fuente se empaqueta y nunca se carga de internet. En Cuba eso
# ademas es la diferencia entre que cargue y que no.
for f in t["type"]["fonts"]:
    A(f'@font-face {{\n  font-family: "Archivo";\n  src: url("../assets/fuentes-archivo/{f["file"].split("/")[-1]}") format("woff2");\n  font-weight: {f["weight"]};\n  font-style: normal;\n  font-display: swap;\n}}')
A("")

val = lambda v, k: v[k] if isinstance(v, dict) else v
ref = lambda v: f"var(--{v.strip('{}')})" if v.startswith("{") else v

A(":root {")
for tok in t["color"]["tokens"]: A(f"  --{tok['name']}: {ref(val(tok['value'],'light'))};")
for fam in ("spacing", "radius", "size"):
    for tok in t[fam]["tokens"]: A(f"  --{tok['name']}: {tok['value']};")
for tok in t["shadow"]["tokens"]: A(f"  --{tok['name']}: {val(tok['value'],'light')};")
A(f"  --fuente: {t['type']['families']['sans']};")
A("}\n")
A("/* El manual define los dos temas. El claro manda; el oscuro responde a la")
A("   preferencia del sistema operativo. */")
A('@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) {')
for tok in t["color"]["tokens"]: A(f"  --{tok['name']}: {ref(val(tok['value'],'dark'))};")
for tok in t["shadow"]["tokens"]: A(f"  --{tok['name']}: {val(tok['value'],'dark')};")
A("} }")
A(':root[data-theme="dark"] {')
for tok in t["color"]["tokens"]: A(f"  --{tok['name']}: {ref(val(tok['value'],'dark'))};")
A("}\n")
A("/* Escala tipografica, tal cual la define el manual. */")
for g in t["type"]["groups"]:
    for s in g["styles"]:
        ls = f"\n  letter-spacing: {s['letterSpacing']};" if "letterSpacing" in s else ""
        A(f".{s['name']} {{\n  font-size: {s['fontSize']};\n  line-height: {s['lineHeight']};\n  font-weight: {s['fontWeight']};{ls}\n}}")

io.open(RAIZ / "css/nexo.css", "w").write("\n".join(L) + "\n")
print(f"css/nexo.css · {len(t['color']['tokens'])} colores · {sum(len(g['styles']) for g in t['type']['groups'])} estilos")
