# Plantillas de `.pptx` — qué hay, qué entra y qué sale

Estado de hoy (2026-10-06) de los generadores de `.pptx` de `slide-architect`. Reflejo de
`avatar-body/generadores-pptx/`, que es la fuente de verdad: si esto y el código discrepan, manda el código.

## Qué cambia en el avatar

Hasta el 2026-10-06 el avatar entregaba solo el **esqueleto** en markdown. Desde el ciclo
`2026-10-06--generar-pptx-oferta` también **materializa el `.pptx` final** cuando se le pide, con una plantilla de esta
carpeta y la marca que se le indique. El esqueleto sigue siendo la fuente: el `.pptx` se deriva de él.

## Plantillas

| plantilla | para qué | diapositivas | contrato |
|---|---|---|---|
| `oferta-resumen` | resumen de una oferta de proyecto para presentarla al cliente | 10 a 14, 16:9 | [`oferta-resumen.md`](oferta-resumen.md) |

## Entradas y salidas (comunes a toda plantilla)

| | qué | dónde vive |
|---|---|---|
| entrada | `contenido.json` de la plantilla, derivado del esqueleto `.md` (decisión D3) | ejemplo ficticio en el repo; el real, **fuera** |
| entrada | marca: `brand.json` + logos ([formato](../../../avatar-body/marcas/README.md)) | `demo/` ficticia en el repo; las reales, en `generadores-pptx.marcas` de `config.local.yaml` (D1) |
| entrada | carpeta de imágenes (diagramas, capturas, fotos) | **fuera** del repo; el ejemplo las dibuja con `hacer-imagenes.py` |
| salida | `.pptx` validado con `validate.py` del skill `pptx` | `generadores-pptx.salidas` de `config.local.yaml`, o la ruta que diga el humano |
| salida | PDF (PowerPoint por COM) y un PNG por diapositiva, para revisar | junto al `.pptx`, en `png/` |

**El repo es público**: en git no entra ni el `.pptx`, ni el PDF, ni una imagen, ni el contenido, ni la marca de un
cliente o proveedor real. Lo cubren el `.gitignore` y las comprobaciones T9 y T10 del ciclo.

## Garantías que da el generador

- **Nada se deforma**: cada imagen se coloca por sus píxeles reales (`contain` o `cover` con foco); no hay proporciones
  escritas en el código. `comprobar.py` mide el desvío (≤ 1 %).
- **Nada se encoge**: cada texto se mide antes de añadirse; si no cabe a su tamaño (cuerpo ≥ 14 pt, pies ≥ 10 pt), el
  generador dice el campo y no escribe.
- **Nada a medias**: ante cualquier error (estructura, color, imagen, texto) sale con 1 y no deja `.pptx`.
- **Notas del orador con formato fijo** en todas las diapositivas: `MENSAJE`, `GUION`, `DATOS`, `TRANSICION` (salvo la
  última) y `TIEMPO`, ≤ 1.200 caracteres.
- **El PowerPoint del humano no se toca**: el render abre en solo lectura y sin ventana, y no cierra nada que no abriera.

## Dependencias de máquina

Node ≥ 20, Python 3 (`python-pptx`, `Pillow`, `PyMuPDF`), el skill `pptx` instalado (de él salen `apply_theme.js` y
`validate.py`, que se localizan al ejecutar y no se copian: D2) y PowerPoint para el render.

## Máquina de estados

```avatar-lang
@id: plantillas-pptx

state SIN_PLANTILLA "El avatar no tiene ninguna plantilla de pptx operativa"
state PLANTILLA_PROBADA "Plantilla con ejemplo ficticio que pasa validate.py, comprobar.py y el render" {
  verify: ["el ejemplo ficticio de la plantilla se construye con construir.ps1 y sale con 0"]
}
state PLANTILLA_DISPONIBLE terminal "Plantilla publicada en el contrato del avatar y lista para un deck real"

action probar-plantilla: SIN_PLANTILLA -> PLANTILLA_PROBADA {
  title: "probar la plantilla"
  description: "Construir el ejemplo ficticio de punta a punta y revisar el render"
  requires: SIN_PLANTILLA
  produces: PLANTILLA_PROBADA
}

action publicar-plantilla: PLANTILLA_PROBADA -> PLANTILLA_DISPONIBLE {
  title: "publicar la plantilla"
  description: "Listarla aquí, escribir su contrato y nombrarla en el contrato publico del avatar"
  requires: PLANTILLA_PROBADA
  produces: PLANTILLA_DISPONIBLE
}
```
