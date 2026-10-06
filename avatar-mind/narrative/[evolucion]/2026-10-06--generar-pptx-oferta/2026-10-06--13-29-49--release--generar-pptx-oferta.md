# RELEASE — plantilla y generador del `.pptx` «resumen de oferta de proyecto»

> Entrada: el [`--check--`](2026-10-06--13-28-16--check--generar-pptx-oferta.md) (T1-T13 en verde, T14 pendiente del
> humano). Cierre hecho por un sub-agente en un worktree: **no hay push** aquí; la rama la integra el hilo principal en
> `master` y publica él.

## Qué queda hecho

`slide-architect` genera el `.pptx` final además del esqueleto. Primera plantilla: `oferta-resumen` (10 a 14
diapositivas 16:9), con un generador que recibe contenido, marca e imágenes por separado, mide cada imagen y cada texto,
valida con el skill `pptx`, comprueba la forma y renderiza con PowerPoint sin tocar las presentaciones del humano. En el
repo, público, solo hay código, la marca ficticia y dos ejemplos ficticios.

## Consolidación multi-destino

| destino | qué | dónde |
|---|---|---|
| estado → `scaa/` | qué plantillas hay, entradas, salidas, garantías y el contrato de `oferta-resumen` | [`scaa/plantillas-pptx/index.md`](../../../scaa/plantillas-pptx/index.md) y [`oferta-resumen.md`](../../../scaa/plantillas-pptx/oferta-resumen.md) |
| método → `narrative/` | el proceso de generar el `.pptx` de un resumen de oferta | [`procesos/generar-pptx-resumen-oferta.md`](../../[estado-actual]/procesos/generar-pptx-resumen-oferta.md) |
| hito → grafo | nodo `generar-pptx` graduado a `CONSOLIDADO`, primer hito del avatar | [`generar-pptx.md`](../../../meta-narrative/[evolucion]/generar-pptx.md) y [`00-grafo-hitos.md`](../../../meta-narrative/[evolucion]/00-grafo-hitos.md) |
| cuerpo → `avatar-body/` | generador, herramientas y marca demo | `avatar-body/generadores-pptx/` y `avatar-body/marcas/` |
| contrato | `CLAUDE.md`, `config.yml`, `config.local.yaml.example`, `.gitignore` | texto del [anexo del plan](2026-10-06--12-41-41--plan--texto-del-contrato.md), aplicado literal |

La carpeta del ciclo se conserva con este `--release--` como rastro y marca de entregado.

## T14 — la revisión del humano

**Pendiente.** El sub-agente que cerró no habla con el humano. El material está fuera de git en
`%TEMP%\claude\slide-architect-revision\` (la carpeta Temp del usuario de Windows) (`ejemplo-14\` y `minimo-10\`, con `.pptx`, PDF y
PNG) y queda registrado como `GP-1` en [`pendientes-de-integracion.jsonl`](../../../../pendientes-de-integracion.jsonl),
que el avatar enseña al arrancar. Cuando el humano responda, su respuesta se cita en el `--check--` y `GP-1` se cierra.
El estado terminal del plan pide esa cita: hasta entonces el contrato está publicado sobre un generador que pasa todo lo
mecánico, y la revisión estética es la única pieza abierta.

## Checklist de coherencia

| # | punto | declaración |
|---|---|---|
| 1-5 | esqueleto, eje, naming, anatomía, enlaces | compilador acotado sobre la rama: 0 errores y 0 warnings imputables; artefactos con nombre canónico |
| 6 | artefactos del ciclo | `idea`, `--explore--`, dos `--plan--`, `--do--`, `--check--` y este `--release--` |
| 7 | consolidación | tabla de arriba |
| 8 | `config.yml` | `sistema-operado: null` sin cambios (sistema-operado atípico, interno); capacidades al día |
| 9 | `.gitignore` | nada sensible versionado: 0 binarios en todo el repo; salidas, imágenes y marcas reales ignoradas |
| 10 | auto-memoria | la carpeta de memoria del harness para este avatar no existe: nada que promover |
| 11 | `/create-avatar` | no aplica: el ciclo no es de essence |
| 12 | propagación | (a) índices propios: grafo de hitos actualizado; el avatar no tiene índice de procesos. (b) plantillas generadoras: no aplica, la capacidad es propia del avatar. (c) descendientes: ninguno. (d) dependencias declaradas: ver #14. **Sin propagación exigida: superficies (a)-(d) recorridas** |
| 13 | destilación | sí: un proceso nuevo en `narrative/` y el porqué en el nodo del grafo (separar contenido, marca y maquetación; medir en vez de fijar números) |
| 14 | cross-avatar | ningún `config.yml` del multiverso declara a este avatar en `requires-from`, `composes` ni `inherits-from`: **sin propagación** |
| 15 | escalada al padre | hereda solo de essence: no hay padre intermedio. El patrón «medir el pre-commit en worktree» es material para essence, abajo |
| 16 | commit + push | commiteado en la rama del worktree; **push pendiente del hilo principal**, que integra la rama en `master` |
| 17 | `CLAUDE.md` mapa | 112 líneas (presupuesto 120), sin changelog ni mecánica inline: el detalle vive en `scaa/` y `narrative/` |
| 18 | pre-merge | **no aplica aquí**: la integración la hace el hilo principal; `master` estaba en `2ef5268` al empezar, que es la base de la rama |
| 19 | DoD documental | no aplica: no se tocó código con documentación en otro avatar |
| 20 | front de conversaciones | sin front materializado: la conversación de las fases vive en el transcript del harness, no en un back `{ts,role,text}` proyectable |
| 21 | conocimiento ajeno | (b) registrado: el avatar de origen (`01a10c4d-41b7-7540-9a80-167285ca3a73`) tiene que saber que el generador existe y cómo se encarga el deck real (D4). Se le avisó después por `SendMessage` (`GP-3`, cerrado) |

## Reparto a `scaa`

Sí: el estado de las plantillas y su contrato van a `scaa/plantillas-pptx/`; el `CLAUDE.md` solo apunta.

## Lo que el humano tiene que decidir

- **T14** (`GP-1`): revisar los PNG del ejemplo. Tres detalles menores ya vistos están en el `--check--`.
- **Menciones previas del proveedor** (`GP-2`, cerrado): tras anonimizar el historial, `idea`, `--explore--` y
  `--plan--` ya no nombran al cliente. Solo quedan las menciones del proveedor en `scaa/presentaciones/`, ya
  publicadas y fuera de alcance; este ciclo no añade ninguna.
- **Aviso al avatar de origen** (`GP-3`, cerrado): hecho por `SendMessage` el 2026-10-06.

## Material para essence (escalada, no mandato)

El `pre-commit` de un avatar corre el compilador contra el árbol del checkout principal. Commiteando desde un worktree,
**no valida nada de la rama**: en este ciclo, siete commits pasaron el hook mientras su salida contaba 150 bloques y la
rama tenía 153. Comprobación: commitear en un worktree un `--do--` con un `--plan--` sin `aprobado-por` y ver que el hook
no se queja. Lo usado aquí para medir (una copia del contenedor con *junctions* y el avatar apuntando al worktree) está
descrito en el `--do--`. Se pasa como material a verificar; no se escribe en essence.
