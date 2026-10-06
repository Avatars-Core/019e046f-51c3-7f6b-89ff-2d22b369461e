---
hito: generar-pptx
estado: CONSOLIDADO
sigue-a: []
precede-a: []
fecha: 2026-10-06
destino: [scaa, narrative, avatar-body]
---

# Hito: el avatar pasa de arquitecto del esqueleto a productor del `.pptx`

Nodo nacido como **encargo**, no como laguna: el grafo no tenía ninguna dirección abierta sobre el `.pptx`. Lo pidió el
2026-10-06 la sesión de otro avatar (`01a10c4d-41b7-7540-9a80-167285ca3a73`), que necesitaba el deck de resumen de una
oferta; la aprobación que traía no valía aquí, y el humano aprobó el plan en la ventana de este avatar a las 12:48.

## Qué cambia de naturaleza

Hasta ese día el contrato decía, literalmente, que el avatar **no** generaba el `.pptx`: entregaba el esqueleto para
que alguien lo pasara a PowerPoint a mano. Desde el ciclo
[`2026-10-06--generar-pptx-oferta`](../../narrative/[evolucion]/2026-10-06--generar-pptx-oferta/idea.md) el esqueleto
sigue siendo la fuente, pero el avatar también **lo materializa**: una plantilla genérica (`oferta-resumen`), un
generador que recibe contenido, marca e imágenes como entradas separadas, y una cadena que valida, comprueba y
renderiza antes de entregar.

## Decisiones que lo fundan (humano, 2026-10-06)

- **D1** — las marcas reales viven fuera de git: el repo es público.
- **D2** — `apply_theme.js` y `validate.py` se usan desde el skill `pptx` instalado, no se copian.
- **D3** — el generador lee un `contenido.json` derivado del esqueleto `.md`.
- **D4** — el ciclo deja plantilla y ejemplo ficticio; el deck real lo encarga después su avatar, con su contenido fuera
  de este repo.

## Lo que el hito deja aprendido

Un deck que mezcla contenido, marca y maquetación en un solo fichero no es una plantilla: es un deck. Separar las tres
entradas es lo que permite que el mismo código sirva a cualquier cliente sin publicar a ninguno, y medir (píxeles de
cada imagen, anchura de cada texto) en vez de fijar números a mano es lo que impide que un cambio de entrada rompa la
salida en silencio.

## Consolidación (2026-10-06)

Cerrado con el [`--release--`](../../narrative/[evolucion]/2026-10-06--generar-pptx-oferta/2026-10-06--13-29-49--release--generar-pptx-oferta.md)
del ciclo: estado en `scaa/plantillas-pptx/`, método en `narrative/[estado-actual]/procesos/generar-pptx-resumen-oferta.md`
y contrato nuevo en `CLAUDE.md` y `config.yml`. Queda abierta, fuera del hito, la revisión visual del humano sobre el
ejemplo (T14, `GP-1` de `pendientes-de-integracion.jsonl`).
