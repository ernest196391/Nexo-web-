# Monta varias tarjetas por hoja para imprimir en una copisteria normal.
# Todo sigue siendo vectorial: se estampan las paginas del PDF original.
#
# Truco que hace esto seguro: las tarjetas van pegadas unas a otras y todas
# son identicas, asi que el sangrado de cada una se solapa con el de su vecina
# y un corte desviado no deja ninguna franja. Ademas la retícula queda centrada
# en la hoja, asi que al imprimir a doble cara el dorso cuadra con el frente
# gire el papel por el lado largo o por el corto.
import pymupdf

MM = 72 / 25.4
CORTE_W, CORTE_H = 85 * MM, 55 * MM
SANGRADO = 3 * MM
MARCA_LARGO, MARCA_HUECO = 13, 6   # longitud y separacion de las marcas de corte

HOJAS = {
    "a4":    dict(w=210 * MM, h=297 * MM,     cols=2, filas=5),
    "carta": dict(w=215.9 * MM, h=279.4 * MM, cols=2, filas=4),
}

def imponer(origen, destino, hoja):
    h = HOJAS[hoja]
    src = pymupdf.open(origen)
    out = pymupdf.open()
    x0 = (h["w"] - h["cols"] * CORTE_W) / 2
    y0 = (h["h"] - h["filas"] * CORTE_H) / 2

    for cara in range(src.page_count):
        pag = out.new_page(width=h["w"], height=h["h"])
        for f in range(h["filas"]):
            for c in range(h["cols"]):
                cx, cy = x0 + c * CORTE_W, y0 + f * CORTE_H
                # Se coloca la pagina con sangrado, desbordando la celda de corte.
                caja = pymupdf.Rect(cx - SANGRADO, cy - SANGRADO,
                                    cx + CORTE_W + SANGRADO, cy + CORTE_H + SANGRADO)
                pag.show_pdf_page(caja, src, cara)

        # Marcas de corte, siempre fuera del area impresa.
        gris = (.45, .45, .45)
        for c in range(h["cols"] + 1):
            x = x0 + c * CORTE_W
            for a, b in [(0, MARCA_LARGO), (h["h"] - MARCA_LARGO, h["h"])]:
                pag.draw_line((x, a), (x, b), color=gris, width=.4)
        for f in range(h["filas"] + 1):
            y = y0 + f * CORTE_H
            for a, b in [(0, MARCA_LARGO), (h["w"] - MARCA_LARGO, h["w"])]:
                pag.draw_line((a, y), (b, y), color=gris, width=.4)

        pag.insert_text((x0, h["h"] - 6), "Imprimir al 100%, sin ajustar a la página.",
                        fontsize=6, color=gris)

    out.save(destino)
    print(f"{destino}: {h['cols'] * h['filas']} tarjetas por hoja, "
          f"{out.page_count} páginas (1 frentes, 2 dorsos)")
    out.close(); src.close()

if __name__ == "__main__":
    for nombre in HOJAS:
        imponer("../imprimir/tarjeta-nexo-imprenta.pdf",
                f"../imprimir/tarjetas-por-hoja-{nombre}.pdf", nombre)
