# generadores-pptx — de un esqueleto a un `.pptx` validado

Generadores `pptxgenjs` de `slide-architect`. Cada plantilla recibe **tres entradas separadas** —contenido, marca e
imágenes— y produce un `.pptx` que pasa `validate.py` del skill `pptx`, más su PDF y sus PNG para revisarlo.
**Ninguna de las tres entradas de un cliente real entra en git**: el repo es público.

| qué | dónde |
|---|---|
| proceso de uso, paso a paso | [`generar-pptx-resumen-oferta.md`](../../avatar-mind/narrative/[estado-actual]/procesos/generar-pptx-resumen-oferta.md) |
| contrato de cada plantilla (secciones, campos, límites, notas) | [`scaa/plantillas-pptx/`](../../avatar-mind/scaa/plantillas-pptx/index.md) |
| formato de una marca | [`../marcas/README.md`](../marcas/README.md) |

## Qué hay

| ruta | qué hace |
|---|---|
| `package.json` | `pptxgenjs` e `image-size` con versión exacta (el `package-lock.json` no viaja); `overrides` sube el `image-size` que `pptxgenjs` trae dentro y no usa, para dejar `npm audit` a 0 |
| `lib/skill-pptx.js` | localiza el skill `pptx` (`PPTX_SKILL_DIR`, luego `skill-pptx` de `config.local.yaml`, luego `~/.claude/skills/synced/*/pptx`) y carga su `apply_theme.js` fijando `NODE_PATH` dentro del proceso. `node lib/skill-pptx.js` imprime la carpeta |
| `lib/marca.js` | lee y valida un `brand.json`: colores de seis cifras sin `#`, `&` escapado en la empresa, logos con sus píxeles |
| `lib/imagen.js` | dimensiones reales; `contain` (la imagen entera) y `cover` con foco `arriba` o `centro` (la caja llena, recortando) |
| `lib/componentes.js` | motivos (tarjeta, círculo numerado, insignia, imagen con sombra, pie) y la **medida del texto**: lo que no cabe se rechaza con su campo, no se encoge |
| `lib/notas.js` | notas del orador con formato fijo (`MENSAJE`, `GUION`, `DATOS`, `TRANSICION`, `TIEMPO`) |
| `oferta-resumen/plantilla.json` | tipos, orden, secciones y límites de la plantilla; lo leen `generar.js` y `comprobar.py` |
| `oferta-resumen/generar.js` | el generador: `--contenido --marca --imagenes --salida` |
| `oferta-resumen/validar-contenido.js` | reglas de estructura del `contenido.json`; también por línea de órdenes |
| `oferta-resumen/ejemplo/` | `contenido.json` ficticio (14 diapositivas), `contenido-minimo.json` (10) y `hacer-imagenes.py`, que dibuja las imágenes sintéticas en `ejemplo/imagenes/` (sin versionar) |
| `herramientas/construir.ps1` | generar → `validate.py` → `comprobar.py` → `render.ps1` → `topng.py`; para al primer fallo |
| `herramientas/render.ps1` | PowerPoint por COM: solo lectura, sin ventana, se niega si el `.pptx` está abierto (`~$`), no cierra nada que no abriera y solo sale de PowerPoint si no estaba abierto antes |
| `herramientas/comprobar.py` | `python-pptx`: tamaño, número de diapositivas, notas, proporción real de cada imagen (≤ 1 %), formas dentro, secciones en orden, letra ≥ 10 pt y palabras prohibidas (`--prohibidas`) |
| `herramientas/topng.py` | PyMuPDF: PDF → un PNG por página |
| `salidas/` | salidas de prueba; **ignorada por git** |

## Uso rápido

```
cd avatar-body/generadores-pptx
npm install
npm run ejemplo        # ejemplo ficticio de 14 diapositivas -> salidas/ejemplo/
npm run minimo         # ejemplo ficticio de 10 diapositivas -> salidas/minimo/
npm run check          # reglas de estructura de los dos contenido.json de ejemplo
```

Con un deck real, las tres entradas están fuera del repo:

```
powershell -NoProfile -ExecutionPolicy Bypass -File herramientas/construir.ps1 `
  -Contenido <fuera>/contenido.json -Marca <marcas>/<empresa>/brand.json -Imagenes <fuera>/imagenes `
  -Salida <salidas>/<deck>.pptx -Prohibidas "<nombres que no deben aparecer>"
```

Sin `-Salida`, el `.pptx` va a `generadores-pptx.salidas` de `config.local.yaml`.

## Dependencias

- **Node** ≥ 20 y lo que dice `package.json`.
- **Python** 3 con `python-pptx`, `Pillow`, `PyMuPDF`, y lo que pide `validate.py` (`defusedxml`, `lxml`).
- **El skill `pptx`** instalado (de él salen `apply_theme.js` y `validate.py`; no se copian, decisión D2: su licencia no
  permite redistribuirlos y así las mejoras del skill llegan solas).
- **PowerPoint** para el render (COM). Sin PowerPoint, `construir.ps1 -SinRender` llega hasta `comprobar.py`.

## Procedencia

Adaptado del `deck.js` del avatar `01a10c4d-41b7-7540-9a80-167285ca3a73`
(`avatar-body/generadores-entregable/resumen/`, 2026-10-05), leído sin modificarlo. Se le nombra solo por su uuid: su
nombre lleva el del cliente. Se conservan su estructura de tema,
layouts y motivos; se quitan su contenido, su marca y sus imágenes, y se corrigen sus defectos: proporciones de imagen
fijadas a mano, ruta absoluta al skill, `NODE_PATH` obligatorio, render sin `finally` ni liberación de COM, y contenido
mezclado con maquetación. Ciclo: `avatar-mind/narrative/[evolucion]/2026-10-06--generar-pptx-oferta/`.
