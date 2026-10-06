# DO — plantilla y generador del `.pptx` «resumen de oferta de proyecto»

> Entrada: el [`--plan--`](2026-10-06--12-41-40--plan--generar-pptx-oferta.md), aprobado por el humano el 2026-10-06 a
> las 12:48 con D1-D4 = A, y su anexo [`--plan--texto-del-contrato`](2026-10-06--12-41-41--plan--texto-del-contrato.md).
> Ejecutado por un sub-agente en un worktree aislado; la rama la integra el hilo principal.

## Magnitudes al empezar (2026-10-06, 13:01)

| fichero que el paso 6 toca | bytes |
|---|---|
| `CLAUDE.md` | 9.734 (99 líneas) |
| `config.yml` | 1.730 |
| `config.local.yaml.example` | 570 |
| `.gitignore` | 5.032 |

Sha de partida: `255a17c` (el plan movió la partida de `7c85a8e` a este commit, que solo añade el propio ciclo).
`avatar-body/` solo tenía `.gitkeep`. Check acotado sobre una copia del árbol con este worktree dentro: 0 errores y 0
warnings imputables (cómo se mide, en § *Cómo se ha medido el check*).

## Pasos

### 1. Base

`avatar-body/generadores-pptx/package.json` (`private`, versiones exactas `pptxgenjs 4.0.1` e `image-size 2.0.4`) y
`lib/`: `skill-pptx.js`, `marca.js`, `imagen.js`, `componentes.js` y `notas.js`. `npm install`: 18 paquetes.

**Desviación menor, a favor:** `npm audit` daba 2 avisos altos por el `image-size 1.2.1` que trae `pptxgenjs` dentro
(DoS en los lectores JXL, HEIF e ICNS). `pptxgenjs` no lo usa en tiempo de ejecución (su llamada está comentada en el
código), así que se fuerza `2.0.4` con `overrides` del `package.json`: `npm audit` = 0.

Commit `78091c9` (con la firma del plan).

### 2. Marcas

`avatar-body/marcas/README.md` (formato de `brand.json`, qué se versiona) y `demo/` con la marca ficticia «Ejemplo
Consultoría»: `brand.json` (paleta verde oscuro y teja, Calibri; la empresa lleva un `&` a propósito, para ejercitar
el escape) y `hacer-logos.py`, que dibuja `logo-claro.png` (287×99) y `logo-pie.png` (116×40). Commit `5a5cef5`.

### 3. Plantilla

`oferta-resumen/plantilla.json` (tipos, orden, secciones y límites, compartida con `comprobar.py`),
`validar-contenido.js`, `generar.js`, y en `ejemplo/` los dos `contenido.json` ficticios (14 y 10 diapositivas) y
`hacer-imagenes.py`. Commit `325e148`.

**Ampliación sobre el plan, sin cambiar su alcance.** Los tres tipos desdoblables llevan dos **composiciones** cada uno
(`diagrama-y-tarjetas` / `cifras-y-diagrama`, `diagrama-y-filas` / `diagrama-y-modulos`, `principal-y-secundarias` /
`dos-capturas`), para que el desdoble no repita la misma diapositiva: es la variedad que tenía el material de partida.
La medida del texto vive en `lib/componentes.js` y la llama `generar.js` al añadir cada caja, así que «no se encoge»
lo cobra el generador con el campo exacto; `validar-contenido.js` cobra solo la estructura.

### 4. Herramientas

`herramientas/construir.ps1`, `render.ps1`, `comprobar.py` y `topng.py`. Commit `780e059`. Los `.ps1` van en ASCII
porque PowerShell 5.1 lee sin BOM como ANSI, y `construir.ps1` no pasa argumentos vacíos (5.1 se los come).
`comprobar.py` busca `TODO` solo en mayúsculas: la primera pasada marcó «Todo esto…» del ejemplo como resto de
plantilla.

### 5. Memoria

`avatar-body/generadores-pptx/README.md`, `avatar-mind/scaa/plantillas-pptx/index.md` y `oferta-resumen.md` (con
bloque `avatar-lang`), el proceso `narrative/[estado-actual]/procesos/generar-pptx-resumen-oferta.md` y el nodo
`meta-narrative/[evolucion]/generar-pptx.md`, enlazado desde `00-grafo-hitos.md` en «En ejecución». El avatar de
origen se nombra solo por su uuid, porque su nombre lleva el del cliente.

## Cómo se ha medido el check

El `pre-commit` corre el compilador desde `scaamn-method` contra el **árbol real**, no contra el worktree, así que no
valida nada de esta rama. Para medirla sin tocar el checkout principal: un contenedor temporal en el scratchpad de la
sesión con una copia de `scaamn-method` (con `node_modules` enlazado), los otros 309 avatares enlazados por *junction* y
este avatar enlazado **al worktree**. La copia del compilador lleva un único cambio, para que el descubrimiento siga las
*junctions* (`isSymbolicLink()` junto a `isDirectory()`); ninguna regla cambia.
