import qrcode
from qrcode.constants import ERROR_CORRECT_H

# En mayusculas el QR usa modo alfanumerico en vez de byte: la misma URL
# cabe en 33x33 modulos en lugar de 37x37, asi cada modulo se imprime mas
# grande y el codigo aguanta mejor una camara mediocre. El host de una URL
# no distingue mayusculas, asi que abre exactamente la misma pagina.
URL = "HTTPS://NEXO-PLAN-VECI.VERCEL.APP"
QUIET = 4  # zona de silencio obligatoria por la norma

def matriz(datos=URL):
    q = qrcode.QRCode(error_correction=ERROR_CORRECT_H, border=QUIET, box_size=1)
    q.add_data(datos)
    q.make(fit=True)
    return q.get_matrix(), q.version

def svg(color="#0A1F3D", fondo=None, hueco=0.0):
    """QR como un unico <path>. 1 modulo = 1 unidad de viewBox."""
    m, ver = matriz()
    n = len(m)
    centro, radio = (n - 1) / 2.0, hueco * n / 2.0
    partes = []
    for y, fila in enumerate(m):
        for x, negro in enumerate(fila):
            if not negro:
                continue
            if radio and abs(x + .5 - centro - .5) <= radio and abs(y + .5 - centro - .5) <= radio:
                continue  # se vacia el centro para el logo
            partes.append(f"M{x} {y}h1v1h-1z")
    rect = f'<rect width="{n}" height="{n}" fill="{fondo}"/>' if fondo else ""
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {n} {n}" shape-rendering="crispEdges">'
            f'{rect}<path fill="{color}" d="{"".join(partes)}"/></svg>'), n, ver

if __name__ == "__main__":
    import sys
    s, n, ver = svg(hueco=float(sys.argv[1]) if len(sys.argv) > 1 else 0.0)
    open("qr.svg", "w").write(s)
    print(f"version {ver}, {n}x{n} modulos (incluye borde {QUIET})")
