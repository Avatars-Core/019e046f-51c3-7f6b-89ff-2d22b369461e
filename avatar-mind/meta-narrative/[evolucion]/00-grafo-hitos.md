# Grafo de hitos — slide-architect

Índice del grafo de evolución del avatar. Cada nodo `.md` de esta carpeta es un hito
(consolidado) o una laguna (dirección abierta). El campo `estado:` de cada nodo toma uno
de los cinco valores del tipo `hito-madurez` (`IDEA_PLASMADA → OPCIONES_EN_VALORACION →
DECISION_CERRADA → EN_EJECUCION → CONSOLIDADO`), que vive en essence y se hereda por
lectura directa — los nodos no lo enlazan, lo citan por nombre.

## Hitos consolidados

Ninguno todavía. `slide-architect` es un avatar joven de dominio estable: su sistema-operado
(el esqueleto vivo de la presentación bajo `scaa/presentaciones/`) ha crecido
en contenido, pero el avatar aún no ha vivido un cambio-de-naturaleza que merezca consolidarse
como hito. El pasado crudo vive en git.

## En ejecución

- [`generar-pptx`](generar-pptx.md) — `EN_EJECUCION` — el avatar pasa a generar el `.pptx` final con plantillas
  genéricas (primera: `oferta-resumen`), sin contenido ni marca de clientes en el repo. Nació como encargo el
  2026-10-06. Destino: `scaa`, `narrative`, `avatar-body`.

## Lagunas (direcciones abiertas)

- [`cumplir-regla-14`](cumplir-regla-14.md) — `DECISION_CERRADA` — formalizar con bloque
  `avatar-lang` los md de `scaa/presentaciones/` que aún no lo llevan, para
  que sean piezas referenciables cross-avatar. Destino: `scaa`.
