# Lee el QR de CADA archivo que se manda a la imprenta y comprueba que lleva la
# dirección buena. Los intermedios no cuentan: lo que importa es lo que acaba
# en manos del impresor.
#
# Existe porque al cambiar de dominio se regeneró todo en la carpeta de trabajo
# y no se copió a imprimir/. Las hojas salieron con el QR nuevo y el PDF suelto
# se quedó con el viejo, y nada avisó.
import sys, glob, os
import numpy as np, cv2, pymupdf
from PIL import Image
from qr import URL

def leer(img):
    """Devuelve la lista de URLs encontradas. Se usa la variante MULTI porque
    las hojas montadas llevan ocho o diez códigos en la misma página y el
    detector de uno solo no encuentra ninguno: daba un aprobado falso justo en
    los archivos que se llevan a la copistería."""
    a = np.array(img.convert("L"))
    det = cv2.QRCodeDetector()
    ok, textos, _, _ = det.detectAndDecodeMulti(a)
    if ok:
        return [t for t in textos if t]
    t = det.detectAndDecode(a)[0]
    return [t] if t else []

def paginas(ruta):
    if ruta.endswith(".pdf"):
        doc = pymupdf.open(ruta)
        for i, pag in enumerate(doc):
            pm = pag.get_pixmap(dpi=400)   # las hojas llevan el QR pequeño
            yield f"pág. {i+1}", Image.frombytes("RGB", (pm.width, pm.height), pm.samples)
    else:
        yield "", Image.open(ruta)

fallos = 0
archivos = sorted(glob.glob("../imprimir/*.pdf") + glob.glob("../imprimir/*.png"))
if not archivos:
    sys.exit("No hay nada en imprimir/. Corre entregables.py e imponer.py primero.")

for ruta in archivos:
    for etiqueta, im in paginas(ruta):
        textos = leer(im)
        nombre = f"{os.path.basename(ruta)} {etiqueta}".strip()
        malos = sorted({t for t in textos if t != URL})
        if not textos:
            # El frente no lleva QR: eso es correcto, no un fallo.
            print(f"  ·    {nombre:44} sin QR")
        elif malos:
            fallos += 1
            print(f"  FALLA {nombre:43} lleva {malos}, debería llevar {URL}")
        else:
            print(f"  ok   {nombre:44} {len(textos)} código(s), todos a {URL}")

print(f"\n{'TODO APUNTA AL SITIO CORRECTO' if not fallos else str(fallos) + ' ARCHIVO(S) CON LA DIRECCIÓN VIEJA'}")
sys.exit(1 if fallos else 0)
