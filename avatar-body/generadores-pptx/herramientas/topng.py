"""PDF -> un PNG por página, con PyMuPDF, para revisar el render.

    python topng.py <deck.pdf> <prefijo> [--dpi 110]

Escribe <prefijo>-01.png, <prefijo>-02.png... Antes borra los <prefijo>-NN.png que hubiera,
para que no se mezclen con los de un render anterior. Imprime cuántas páginas ha escrito.
"""
import argparse
import re
import sys
from pathlib import Path

import fitz  # PyMuPDF


def main():
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument("pdf")
    p.add_argument("prefijo")
    p.add_argument("--dpi", type=int, default=110)
    a = p.parse_args()
    prefijo = Path(a.prefijo)
    prefijo.parent.mkdir(parents=True, exist_ok=True)
    patron = re.compile(re.escape(prefijo.name) + r"-\d+\.png$")
    for viejo in prefijo.parent.iterdir():
        if patron.match(viejo.name):
            viejo.unlink()
    doc = fitz.open(a.pdf)
    for i, pagina in enumerate(doc):
        pagina.get_pixmap(dpi=a.dpi).save(f"{prefijo}-{i + 1:02d}.png")
    print(f"png: {len(doc)} en {prefijo.parent}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
