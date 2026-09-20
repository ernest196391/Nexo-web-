# El PDF es el original vectorial; los PNG salen de el a 300 ppp exactos,
# asi no hay dos maquetas distintas que puedan desincronizarse.
import fitz
doc = fitz.open("tarjeta-nexo-imprenta.pdf")
nombres = ["frente", "dorso"]
for i, pagina in enumerate(doc):
    pm = pagina.get_pixmap(dpi=300)
    f = f"tarjeta-nexo-{nombres[i]}-300ppp.png"
    pm.save(f)
    print(f, f"{pm.width}x{pm.height} px =",
          round(pm.width / 300 * 25.4, 2), "x", round(pm.height / 300 * 25.4, 2), "mm")
print("paginas:", doc.page_count, "| tamaño pagina pt:", [round(v,2) for v in doc[0].rect])
