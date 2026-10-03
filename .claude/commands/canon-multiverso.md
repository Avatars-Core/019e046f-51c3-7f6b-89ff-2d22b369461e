---
description: Informa, converge o consulta el canon de essence en todos los avatares presentes en esta máquina
---

Ejecuta el comando único de canon para todo el multiverso, desde essence:
`../019d8dc4-d3e0-76ca-b047-70e2b5b71674/avatar-body/multiverse/src/canon-multiverso.ts` (`ts-node`, desde
`../019d8dc4-d3e0-76ca-b047-70e2b5b71674/avatar-body/multiverse/`).

Parsea `$ARGUMENTS` así:

- Sin argumentos — informa, agregado, de todos los avatares presentes en esta máquina, sin tocar
  nada (invoca `canon-al-dia.mjs --solo-avisar` por avatar).
- `--aplicar` — invoca `canon-al-dia.mjs` (con su default nuevo: converge solo) para cada avatar
  presente, en paralelo. `--trabajadores=<N>` ajusta el pool (6 por defecto).
- `--pendientes` (alias `--estado`) — tabla agregada de todo lo que hoy está
  `divergente-sin-decidir`/`personalizado` en cualquier avatar presente.
- `decidir <uuid|nombre> <adoptar|personalizar> <ruta> [--motivo="…"]` — resuelve `<uuid|nombre>`
  contra `index.yml` y decide sobre esa ruta en ese avatar, sin tener que `cd` a su repo, **y añade
  una línea de precedente** a `precedentes.jsonl` (generaliza a los casos que casen con el mismo
  predicado; `--solo-este-avatar` lo limita a ese avatar). Ninguna decisión humana queda fuera del registro.
- `adoptar [--ejecutar] [--trabajadores=<N>] [--lote=<k>/<M>] [--informe=<ruta>]` — **la única vía de
  aplicar el canon en el multiverso** (proceso
  [`adoptar-canon-en-multiverso`](../../../019d8dc4-d3e0-76ca-b047-70e2b5b71674/avatar-mind/narrative/[estado-actual]/life-cycle/procesos/adoptar-canon-en-multiverso.md)).
  Por defecto **simula**: cero bytes en los avatares, acciones por avatar y cola de preguntas agrupada
  por familia, aplicando lo que decide un precedente. Con `--ejecutar` aplica, `git add` sólo de las
  rutas del manifiesto + sello, commit «adopta: canon <rev> (…; precedentes P-xxx)» y push del repo del
  avatar; nunca sistemas-operados, nunca `--force`/`--no-verify`, salta el avatar con trabajo ajeno,
  idempotente. `--lote=<k>/<M>` reparte el universo entre sesiones. Lo que ningún precedente decide se
  pregunta al humano (≤ 4 por turno, por familia) y cada respuesta se registra con `decidir`.
- `--solo=<uuid>[,<uuid>…]` — limita cualquiera de los modos anteriores a esa lista de avatares.
- `--json` — salida estructurada en vez de texto.

Salvo `adoptar --ejecutar`, nunca hace `git add`/`commit`/`push`: eso sigue siendo de cada avatar. Sólo actúa sobre lo que está
clonado en esta máquina — el resumen siempre declara «N presentes de M registrados en `index.yml`».

Detalle y diseño en el ciclo
[`2026-09-19--sello-de-canon-essence-multiverso`](../../../019d8dc4-d3e0-76ca-b047-70e2b5b71674/avatar-mind/narrative/[evolucion]/2026-09-19--sello-de-canon-essence-multiverso/).
