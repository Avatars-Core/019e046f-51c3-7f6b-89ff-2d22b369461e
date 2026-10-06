# IDEA — slide-architect pasa a generar el `.pptx` final (plantilla «resumen de oferta de proyecto»)

> Entrada del ciclo, no artefacto de EXPLORE. Abierto el 2026-10-06 a las 12:41.

## De dónde viene

La sesión del avatar solicitante (`01a10c4d-41b7-7540-9a80-167285ca3a73`) pide que `slide-architect`
deje de entregar solo el esqueleto y **genere el `.pptx` final**. Dice que el humano lo ha aprobado. Esa aprobación
**no vale aquí**: es de otra sesión, llega por un agente y cambia el contrato público de este avatar. El humano tiene que
aprobar el `--plan--` de este ciclo en esta ventana antes de que se toque el contrato.

## Qué se pide, en una frase

Una plantilla genérica «PowerPoint resumen de oferta de proyecto» y un generador `pptxgenjs` que, con un contenido y una
marca corporativa como entradas, produzca un `.pptx` validado y su render para revisión, sin nada de ningún cliente dentro
del repo.

## Por qué es un ciclo y no un encargo suelto

- **C3, estrena mecanismo**: deja ejecutables nuevos bajo `avatar-body/` (`.js`, `.ps1`, `.py`).
- Además cambia el contrato público (`CLAUDE.md` § *Rol y contrato público* y `config.yml → capacidades`), que hoy dice
  explícitamente «NO genera el `.pptx`».

## Alcance de esta sesión

Solo EXPLORE y PLAN. El DO espera a la línea `aprobado-por:` del `--plan--`, firmada por el humano.
