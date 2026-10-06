"""Genera los logos de la marca ficticia «Ejemplo Consultoría» (no se versionan: los PNG
están en .gitignore). Lee los colores del brand.json de esta misma carpeta.

    python hacer-logos.py            -> logo-claro.png (287x99) y logo-pie.png (116x40)

Las medidas son las de los logos reales con los que se probó la plantilla: así el ejemplo
ejercita la misma geometría sin llevar ninguna marca real al repo.
"""
import json
import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

AQUI = Path(__file__).resolve().parent


def fuente(tam, negrita=False):
    nombres = ["calibrib.ttf", "arialbd.ttf", "DejaVuSans-Bold.ttf"] if negrita else ["calibri.ttf", "arial.ttf", "DejaVuSans.ttf"]
    for n in nombres:
        for base in (Path("C:/Windows/Fonts"), Path("/usr/share/fonts/truetype/dejavu")):
            if (base / n).exists():
                return ImageFont.truetype(str(base / n), tam)
    return ImageFont.load_default(size=tam)


def rgb(hexa):
    return tuple(int(hexa[i:i + 2], 16) for i in (0, 2, 4))


def logo(ancho, alto, oscuro, acento, con_lema):
    # Se dibuja a 4x y se reduce: bordes suaves sin depender del antialias de cada sistema.
    k = 4
    w, h = ancho * k, alto * k
    img = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    lado = h - 2 * k * 4
    y0 = (h - lado) // 2
    d.rounded_rectangle([k * 4, y0, k * 4 + lado, y0 + lado], radius=lado // 4, fill=acento + (255,))
    f_mono = fuente(int(lado * 0.5), True)
    d.text((k * 4 + lado / 2, y0 + lado / 2), "EC", font=f_mono, fill=(255, 255, 255, 255), anchor="mm")
    x = k * 4 + lado + k * 6
    f_nombre = fuente(int(h * (0.34 if con_lema else 0.42)), True)
    if con_lema:
        d.text((x, h * 0.40), "Ejemplo", font=f_nombre, fill=oscuro + (255,), anchor="ls")
        d.text((x, h * 0.74), "Consultoría", font=f_nombre, fill=oscuro + (255,), anchor="ls")
        f_lema = fuente(int(h * 0.13))
        d.text((x, h * 0.93), "MARCA FICTICIA DE EJEMPLO", font=f_lema, fill=acento + (255,), anchor="ls")
    else:
        d.text((x, h * 0.5), "Ejemplo", font=f_nombre, fill=oscuro + (255,), anchor="lm")
    return img.resize((ancho, alto), Image.LANCZOS)


def main():
    marca = json.loads((AQUI / "brand.json").read_text(encoding="utf-8"))
    c = marca["tema"]["colors"]
    oscuro, acento = rgb(c["dk1"]), rgb(c["accent1"])
    logo(287, 99, oscuro, acento, True).save(AQUI / marca["logos"]["principal"])
    logo(116, 40, oscuro, acento, False).save(AQUI / marca["logos"]["pie"])
    print("logos:", marca["logos"]["principal"], marca["logos"]["pie"])
    return 0


if __name__ == "__main__":
    sys.exit(main())
