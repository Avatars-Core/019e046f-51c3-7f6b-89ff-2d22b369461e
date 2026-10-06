"""Comprobaciones de forma sobre un .pptx generado (test T5 del ciclo 2026-10-06--generar-pptx-oferta).

    python comprobar.py <deck.pptx> [--plantilla oferta-resumen] [--prohibidas "a,b,c"]

Mira, con python-pptx:
  - tamaño 16:9 de la plantilla (12192000 x 6858000 EMU) y número de diapositivas en su rango;
  - notas del orador con el formato fijo (MENSAJE, GUION, DATOS, TRANSICION salvo la última, TIEMPO)
    y su largo máximo;
  - proporción de cada imagen (diapositivas y layouts) contra sus píxeles, recorte incluido: error <= 1 %;
  - ninguna forma fuera de la diapositiva;
  - secciones en el orden de la plantilla y ninguna diapositiva fuera de sección;
  - ningún texto por debajo del tamaño mínimo de pie (10 pt);
  - palabras prohibidas: restos de plantilla (lorem, ipsum, TODO, xxx...) y las que se pasen.
Sale con 0 si todo cuadra; con 1 y una línea "ERROR ..." por fallo si no.
"""
import argparse
import io
import json
import re
import sys
from pathlib import Path

from PIL import Image
from pptx import Presentation
from pptx.enum.shapes import MSO_SHAPE_TYPE
from pptx.util import Emu

AQUI = Path(__file__).resolve().parent
NS_P14 = "http://schemas.microsoft.com/office/powerpoint/2010/main"
NS_P = "http://schemas.openxmlformats.org/presentationml/2006/main"
NS_R = "http://schemas.openxmlformats.org/officeDocument/2006/relationships"
# TODO en mayúsculas y sin ignorar mayúsculas: «Todo esto...» es castellano, no un resto.
RESTOS = ["lorem", "ipsum", r"(?-i:\bTODO\b)", r"\bx{3,}\b", r"\[insert"]


def formas(contenedor):
    for s in contenedor.shapes:
        yield s
        if s.shape_type == MSO_SHAPE_TYPE.GROUP:
            yield from formas(s)


def textos(contenedor):
    for s in formas(contenedor):
        if s.has_text_frame:
            yield s, s.text_frame


def main():
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("pptx")
    p.add_argument("--plantilla", default="oferta-resumen")
    p.add_argument("--prohibidas", default="", help="lista separada por comas, sin distinguir mayúsculas")
    a = p.parse_args()

    plantilla = json.loads((AQUI.parent / a.plantilla / "plantilla.json").read_text(encoding="utf-8"))
    prs = Presentation(a.pptx)
    errores, avisos = [], []
    err = errores.append
    W, H = prs.slide_width, prs.slide_height
    n = len(prs.slides)

    # Tamaño y número.
    t = plantilla["tamano"]
    if (W, H) != (t["ancho_emu"], t["alto_emu"]):
        err(f"tamaño {W}x{H} EMU; la plantilla es {t['ancho_emu']}x{t['alto_emu']}")
    lo, hi = plantilla["diapositivas"]["min"], plantilla["diapositivas"]["max"]
    if not lo <= n <= hi:
        err(f"{n} diapositivas; la plantilla admite de {lo} a {hi}")

    # Notas.
    maximo = plantilla["notas"]["max_caracteres"]
    for i, s in enumerate(prs.slides, 1):
        notas = s.notes_slide.notes_text_frame.text if s.has_notes_slide else ""
        lineas = notas.replace("\r", "\n").split("\n")
        ultima = i == n
        if not notas.startswith("MENSAJE:"):
            err(f"diapositiva {i}: las notas no empiezan por MENSAJE:")
        for etiqueta in ("GUION:", "DATOS:", "TIEMPO:"):
            if not any(l.startswith(etiqueta) for l in lineas):
                err(f"diapositiva {i}: a las notas les falta {etiqueta}")
        tiene_transicion = any(l.startswith("TRANSICION:") for l in lineas)
        if not ultima and not tiene_transicion:
            err(f"diapositiva {i}: a las notas les falta TRANSICION:")
        if ultima and tiene_transicion:
            err(f"diapositiva {i}: la última diapositiva no lleva TRANSICION:")
        if len(notas) > maximo:
            err(f"diapositiva {i}: notas de {len(notas)} caracteres; máximo {maximo}")

    # Imágenes y límites, en diapositivas y en los layouts que usan.
    layouts = {id(s.slide_layout): s.slide_layout for s in prs.slides}
    contenedores = [(f"diapositiva {i}", s) for i, s in enumerate(prs.slides, 1)]
    contenedores += [(f"layout {l.name}", l) for l in layouts.values()]
    imagenes = 0
    peor = 0.0
    for nombre, c in contenedores:
        for f in formas(c):
            if f.left is not None and f.width is not None:
                if f.left < 0 or f.top < 0 or f.left + f.width > W + 1 or f.top + f.height > H + 1:
                    err(f"{nombre}: «{f.name}» se sale de la diapositiva "
                        f"({Emu(f.left).inches:.2f}, {Emu(f.top).inches:.2f}, {Emu(f.width).inches:.2f} x {Emu(f.height).inches:.2f} in)")
            if f.shape_type == MSO_SHAPE_TYPE.PICTURE:
                imagenes += 1
                pw, ph = Image.open(io.BytesIO(f.image.blob)).size
                visible_w = pw * (1 - f.crop_left - f.crop_right)
                visible_h = ph * (1 - f.crop_top - f.crop_bottom)
                real = visible_w / visible_h
                dibujada = f.width / f.height
                desvio = abs(dibujada / real - 1)
                peor = max(peor, desvio)
                if desvio > 0.01:
                    err(f"{nombre}: «{f.name}» deformada un {desvio:.1%} (píxeles {pw}x{ph}, recorte incluido)")

    # Secciones.
    orden = plantilla["secciones"]
    lst = prs.part._element.find(f".//{{{NS_P14}}}sectionLst")
    ids = [e.get("id") for e in prs.part._element.find(f"{{{NS_P}}}sldIdLst")]
    secciones = []
    if lst is None:
        err("el .pptx no tiene secciones")
    else:
        cubiertos = set()
        for sec in lst.findall(f"{{{NS_P14}}}section"):
            nombre = sec.get("name")
            secciones.append(nombre)
            for sid in sec.iter(f"{{{NS_P14}}}sldId"):
                cubiertos.add(sid.get("id"))
        fuera = [x for x in secciones if x not in orden]
        if fuera:
            err(f"secciones que no son de la plantilla: {fuera}")
        posiciones = [orden.index(x) for x in secciones if x in orden]
        if posiciones != sorted(posiciones) or len(set(posiciones)) != len(posiciones):
            err(f"secciones fuera del orden de la plantilla: {secciones}")
        sueltas = [i + 1 for i, x in enumerate(ids) if x not in cubiertos]
        if sueltas:
            err(f"diapositivas fuera de toda sección: {sueltas}")

    # Tamaño mínimo de letra y palabras prohibidas.
    minimo = plantilla["texto"]["pie_min_pt"] * 100
    patrones = RESTOS + [re.escape(x.strip()) for x in a.prohibidas.split(",") if x.strip()]
    prohibidas = re.compile("|".join(patrones), re.IGNORECASE)
    for i, s in enumerate(prs.slides, 1):
        todo = []
        for f, tf in textos(s):
            todo.append(tf.text)
            for par in tf.paragraphs:
                for r in par.runs:
                    sz = r.font.size
                    if sz is not None and sz < minimo and r.text.strip():
                        err(f"diapositiva {i}: «{r.text[:30]}» a {sz.pt:g} pt; mínimo {minimo / 100:g} pt")
        if s.has_notes_slide:
            todo.append(s.notes_slide.notes_text_frame.text)
        for m in prohibidas.finditer("\n".join(todo)):
            err(f"diapositiva {i}: palabra prohibida «{m.group(0)}»")

    print(f"comprobar: {Path(a.pptx).name}: {n} diapositivas, {W}x{H} EMU, {imagenes} imágenes "
          f"(peor desvío de proporción {peor:.3%}), secciones {secciones}")
    for e in errores:
        print(f"ERROR {e}")
    if errores:
        print(f"comprobar: {len(errores)} error(es)")
        return 1
    print("comprobar: ok")
    return 0


if __name__ == "__main__":
    sys.exit(main())
