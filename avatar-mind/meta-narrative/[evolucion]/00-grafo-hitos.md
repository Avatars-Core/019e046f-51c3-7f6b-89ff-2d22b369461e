# Grafo de hitos — slide-architect

Índice del grafo de evolución del avatar. Cada nodo `.md` de esta carpeta es un hito
(consolidado) o una laguna (dirección abierta). El campo `estado:` de cada nodo toma uno
de los cinco valores del tipo `hito-madurez` (`IDEA_PLASMADA → OPCIONES_EN_VALORACION →
DECISION_CERRADA → EN_EJECUCION → CONSOLIDADO`), que vive en essence y se hereda por
lectura directa — los nodos no lo enlazan, lo citan por nombre.

## Hitos consolidados

- [`generar-pptx`](generar-pptx.md) — `CONSOLIDADO` (2026-10-06) — primer cambio de naturaleza del avatar: deja
  de entregar solo el esqueleto y genera el `.pptx` final con plantillas genéricas (primera: `oferta-resumen`), sin
  contenido ni marca de clientes en el repo. Nació como encargo, no como laguna. Destino: `scaa`, `narrative`,
  `avatar-body`.

El pasado crudo vive en git.

## Lagunas (direcciones abiertas)

- [`cumplir-regla-14`](cumplir-regla-14.md) — `DECISION_CERRADA` — formalizar con bloque
  `avatar-lang` los md de `scaa/presentaciones/` que aún no lo llevan, para
  que sean piezas referenciables cross-avatar. Destino: `scaa`.
