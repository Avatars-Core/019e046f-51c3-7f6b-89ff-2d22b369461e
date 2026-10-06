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

## Cómo se ha medido el check

El `pre-commit` corre el compilador desde `scaamn-method` contra el **árbol real**, no contra el worktree, así que no
valida nada de esta rama. Para medirla sin tocar el checkout principal: un contenedor temporal en el scratchpad de la
sesión con una copia de `scaamn-method` (con `node_modules` enlazado), los otros 309 avatares enlazados por *junction* y
este avatar enlazado **al worktree**. La copia del compilador lleva un único cambio, para que el descubrimiento siga las
*junctions* (`isSymbolicLink()` junto a `isDirectory()`); ninguna regla cambia.
