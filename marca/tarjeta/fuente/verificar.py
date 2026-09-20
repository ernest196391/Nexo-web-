# Comprueba que el QR se lee de verdad: a tamano de impresion, con el hueco
# del logo tapado y despues de emborronarlo como lo veria la camara de un
# telefono barato a medio brazo de distancia.
import numpy as np, cv2
from PIL import Image, ImageFilter
from qr import matriz, URL, QUIET

DESTINO = "https://nexo-plan-veci.vercel.app"

def png(hueco=0.0, mm=22.0, dpi=300, escala=1):
    m, _ = matriz()
    n = len(m)
    px = int(round(mm / 25.4 * dpi)) * escala
    a = np.ones((n, n), np.uint8) * 255
    centro, radio = (n - 1) / 2.0, hueco * n / 2.0
    for y in range(n):
        for x in range(n):
            if m[y][x] and not (radio and abs(x - centro) <= radio and abs(y - centro) <= radio):
                a[y, x] = 0
    im = Image.fromarray(a).resize((px, px), Image.NEAREST)
    return im

def leer(im):
    d = cv2.QRCodeDetector()
    txt, _, _ = d.detectAndDecode(np.array(im.convert("L")))
    return txt

m, _ = matriz()
print("modulos totales:", len(m), "| datos:", len(m) - 2 * QUIET, "| URL:", URL)

for hueco, etiq in [(0.0, "sin hueco"), (0.18, "hueco 18%"), (0.20, "hueco 20%"), (0.24, "hueco 24%")]:
    fila = [etiq.ljust(11)]
    for mm, blur, nota in [(22, 0, "22mm nitido"), (22, 2.2, "22mm borroso"), (16, 3.0, "16mm borroso")]:
        im = png(hueco, mm)
        if blur:
            im = im.resize((260, 260), Image.LANCZOS).filter(ImageFilter.GaussianBlur(blur))
        t = leer(im)
        ok = "OK" if t.upper() == URL else ("FALLA" if not t else "DISTINTO:" + t)
        fila.append(f"{nota}={ok}")
    print("  ".join(fila))
