# Prueba el QR tal y como sale impreso: se recorta del PNG final de 300 ppp
# y se simula la foto de un telefono (reduccion, desenfoque, inclinacion y
# compresion JPEG). Si falla aqui, falla en la calle.
import io, numpy as np, cv2
from PIL import Image, ImageFilter

URL_OK = "HTTPS://NEXO-PLAN-VECI.VERCEL.APP"
im = Image.open("tarjeta-nexo-dorso-300ppp.png").convert("RGB")

# El QR ocupa 24 mm; se recorta con holgura por la mitad derecha de la tarjeta.
w, h = im.size
qr = im.crop((int(w * .63), int(h * .18), int(w * .95), int(h * .66)))
qr.save("qr-recorte.png")

def leer(x):
    return cv2.QRCodeDetector().detectAndDecode(np.array(x.convert("L")))[0]

def foto(base, lado, blur, giro, calidad):
    x = base.resize((lado, lado * base.size[1] // base.size[0]), Image.LANCZOS)
    if giro:
        x = x.rotate(giro, resample=Image.BICUBIC, expand=True, fillcolor=(255, 255, 255))
    if blur:
        x = x.filter(ImageFilter.GaussianBlur(blur))
    buf = io.BytesIO(); x.save(buf, "JPEG", quality=calidad); buf.seek(0)
    return Image.open(buf)

print("original 300 ppp:", "OK" if leer(qr) == URL_OK else "FALLA")
casos = [
    ("foto cerca, buena luz", 900, 0.8, 0, 92),
    ("foto normal",           520, 1.4, 6, 80),
    ("foto lejos y movida",   340, 2.0, 11, 70),
    ("foto mala, muy lejos",  240, 2.2, 15, 55),
]
for nombre, lado, blur, giro, cal in casos:
    t = leer(foto(qr, lado, blur, giro, cal))
    print(f"{nombre:24} {'OK' if t == URL_OK else ('FALLA' if not t else 'DISTINTO: ' + t)}")
