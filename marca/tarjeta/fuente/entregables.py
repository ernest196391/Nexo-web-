# Genera lo que se manda a imprimir y lo que el usuario mira.
from PIL import Image, ImageDraw
import os

PPP = 300
mm = lambda v: round(v / 25.4 * PPP)
SANGRADO, ANCHO, ALTO, SEGURO = 3, 85, 55, 4

os.makedirs("entrega", exist_ok=True)
for cara in ("frente", "dorso"):
    src = Image.open(f"tarjeta-nexo-{cara}-300ppp.png").convert("RGB")
    src.save(f"entrega/tarjeta-nexo-{cara}-sangrado-300ppp.png")

    # Version ya cortada: es la que se ve al tener la tarjeta en la mano.
    b = mm(SANGRADO)
    cortada = src.crop((b, b, src.width - b, src.height - b))
    cortada.save(f"entrega/tarjeta-nexo-{cara}-cortada-300ppp.png")

    # Version con guias, solo para entender el archivo (NO se imprime).
    g = src.copy(); d = ImageDraw.Draw(g)
    d.rectangle([b, b, src.width - b - 1, src.height - b - 1], outline=(255, 60, 60), width=3)
    s = mm(SANGRADO + SEGURO)
    d.rectangle([s, s, src.width - s - 1, src.height - s - 1], outline=(60, 220, 120), width=3)
    g.save(f"entrega/guias-{cara}.png")
    print(cara, "sangrado", src.size, "| cortada", cortada.size,
          "=", round(cortada.width / PPP * 25.4, 1), "x", round(cortada.height / PPP * 25.4, 1), "mm")

# Hoja de contacto para mirar las dos caras juntas.
f = Image.open("entrega/tarjeta-nexo-frente-cortada-300ppp.png")
d_ = Image.open("entrega/tarjeta-nexo-dorso-cortada-300ppp.png")
sep = mm(6)
hoja = Image.new("RGB", (f.width, f.height * 2 + sep), (122, 130, 150))
hoja.paste(f, (0, 0)); hoja.paste(d_, (0, f.height + sep))
hoja.save("entrega/vista-previa.png")
print("vista-previa.png", hoja.size)
