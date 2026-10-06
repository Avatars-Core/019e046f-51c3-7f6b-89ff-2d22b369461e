"""Imágenes sintéticas del ejemplo ficticio de la plantilla oferta-resumen (no se versionan).

    python hacer-imagenes.py [--salida DIR] [--reglas 1440x900]

Dibuja diagramas y capturas de mentira con las MISMAS proporciones que las imágenes reales
con las que se probó la plantilla (2184x1162, 1568x1568, 1214x753, 1440x1650, 1440x840...),
cada una con la marca «EJEMPLO» y sus píxeles escritos. `--reglas` cambia el tamaño de la
captura alta para comprobar que el generador no tiene proporciones fijadas a mano (test T7).
"""
import argparse
import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

AQUI = Path(__file__).resolve().parent

FONDO = (247, 250, 249)
TINTA = (17, 58, 58)
APOYO = (143, 184, 176)
ACENTO = (200, 97, 31)
SUAVE = (238, 244, 242)

IMAGENES = {
    # nombre: (ancho, alto, tipo)
    "diagrama-estados.png": (1214, 753, "estados"),
    "bpmn.png": (2184, 1162, "proceso"),
    "c4-contenedores.png": (1568, 1568, "cajas"),
    "c4-componentes.png": (1568, 1582, "cajas"),
    "captura-panel.png": (1440, 840, "captura"),
    "captura-detalle.png": (1440, 820, "captura"),
    "captura-ficha.png": (1440, 840, "captura"),
    "captura-reglas.png": (1440, 1650, "captura"),
}


def fuente(tam, negrita=False):
    nombres = ["calibrib.ttf", "arialbd.ttf", "DejaVuSans-Bold.ttf"] if negrita else ["calibri.ttf", "arial.ttf", "DejaVuSans.ttf"]
    for n in nombres:
        for base in (Path("C:/Windows/Fonts"), Path("/usr/share/fonts/truetype/dejavu")):
            if (base / n).exists():
                return ImageFont.truetype(str(base / n), tam)
    return ImageFont.load_default(size=tam)


def caja(d, x0, y0, x1, y1, relleno, texto=None, tam=28):
    d.rounded_rectangle([x0, y0, x1, y1], radius=14, fill=relleno, outline=TINTA, width=3)
    if texto:
        d.text(((x0 + x1) / 2, (y0 + y1) / 2), texto, font=fuente(tam, True), fill=TINTA, anchor="mm")


def flecha(d, x0, y0, x1, y1):
    d.line([x0, y0, x1, y1], fill=TINTA, width=4)
    d.ellipse([x1 - 9, y1 - 9, x1 + 9, y1 + 9], fill=TINTA)


def dibujar(nombre, w, h, tipo):
    img = Image.new("RGB", (w, h), FONDO)
    d = ImageDraw.Draw(img)
    m = max(24, w // 40)
    d.rectangle([0, 0, w - 1, h - 1], outline=APOYO, width=6)
    if tipo == "captura":
        d.rectangle([0, 0, w, m * 2], fill=TINTA)
        for i in range(3):
            d.ellipse([m + i * m, m * 0.6, m * 1.6 + i * m, m * 1.2], fill=APOYO)
        d.rectangle([0, m * 2, w // 5, h], fill=SUAVE)
        for i in range(6):
            y = m * 3 + i * m * 1.6
            d.rounded_rectangle([m, y, w // 5 - m, y + m], radius=8, fill=APOYO if i else ACENTO)
        cols = 3
        cw = (w - w // 5 - m * (cols + 1)) / cols
        y = m * 3
        fila = 0
        while y + m * 4 < h - m * 4:
            for c in range(cols):
                x = w // 5 + m + c * (cw + m)
                caja(d, x, y, x + cw, y + m * 4, (255, 255, 255) if (c + fila) % 2 else SUAVE)
            y += m * 5
            fila += 1
    elif tipo == "estados":
        n = 4
        bw, bh = w / (n * 1.6), h / 6
        for i in range(n):
            x = m + i * (w - 2 * m - bw) / (n - 1)
            caja(d, x, h * 0.25, x + bw, h * 0.25 + bh, SUAVE, f"Estado {i + 1}", 30)
            caja(d, x, h * 0.6, x + bw, h * 0.6 + bh, (255, 255, 255), f"Estado {i + 5}", 30)
            if i:
                flecha(d, x - (w - 2 * m - bw) / (n - 1) + bw, h * 0.25 + bh / 2, x, h * 0.25 + bh / 2)
            flecha(d, x + bw / 2, h * 0.25 + bh, x + bw / 2, h * 0.6)
    elif tipo == "proceso":
        carriles = 4
        ch = (h - 2 * m) / carriles
        for i in range(carriles):
            y = m + i * ch
            d.rectangle([m, y, w - m, y + ch], outline=APOYO, width=3, fill=SUAVE if i % 2 else FONDO)
            d.text((m * 2, y + ch / 2), f"Carril {i + 1}", font=fuente(34, True), fill=TINTA, anchor="lm")
            for j in range(5):
                x = m * 8 + j * (w - m * 10) / 5
                caja(d, x, y + ch * 0.25, x + (w - m * 10) / 7, y + ch * 0.75, (255, 255, 255), f"Tarea {i + 1}.{j + 1}", 26)
    else:  # cajas
        filas, cols = 3, 2
        bw = (w - m * (cols + 1)) / cols
        bh = (h - m * (filas + 1)) / filas
        for f in range(filas):
            for c in range(cols):
                x, y = m + c * (bw + m), m + f * (bh + m)
                caja(d, x, y, x + bw, y + bh, SUAVE if (f + c) % 2 else (255, 255, 255), f"Bloque {f * cols + c + 1}", 44)
    etiqueta = "EJEMPLO"
    d.text((w / 2, h / 2), etiqueta, font=fuente(max(48, min(w, h) // 6), True), fill=ACENTO, anchor="mm", stroke_width=4, stroke_fill=(255, 255, 255))
    d.text((w - m, h - m), f"{nombre} · {w}x{h}", font=fuente(max(20, min(w, h) // 30)), fill=TINTA, anchor="rs")
    return img


def main():
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument("--salida", default=str(AQUI / "imagenes"))
    p.add_argument("--reglas", default=None, help="tamaño de captura-reglas.png, p. ej. 1440x900")
    a = p.parse_args()
    salida = Path(a.salida)
    salida.mkdir(parents=True, exist_ok=True)
    tabla = dict(IMAGENES)
    if a.reglas:
        rw, rh = (int(v) for v in a.reglas.lower().split("x"))
        tabla["captura-reglas.png"] = (rw, rh, "captura")
    for nombre, (w, h, tipo) in tabla.items():
        dibujar(nombre, w, h, tipo).save(salida / nombre)
    print(f"{len(tabla)} imágenes en {salida}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
