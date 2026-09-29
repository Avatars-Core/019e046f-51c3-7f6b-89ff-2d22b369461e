---
description: Restaura tras un reinicio la foto de escritorios virtuales y sesiones nombradas que guardó /escritorio-virtual-guardar-estado
---

Ejecuta `../019d8dc4-d3e0-76ca-b047-70e2b5b71674/avatar-body/coordinacion-avatares/restaurar-estado-escritorios.ps1` vía PowerShell, sin
argumentos.

No requiere argumentos: `$ARGUMENTS` se ignora. El script lee
`../019d8dc4-d3e0-76ca-b047-70e2b5b71674/avatar-body/coordinacion-avatares/estado-escritorios.json` (escrito antes por
`/escritorio-virtual-guardar-estado`) y, para cada escritorio guardado, reabre sus sesiones con
`abrir-avatar-en-terminal.ps1 -ReanudarSesionId <uuid>` **solo si la sesión guardada trae
`sessionId` y existe su conversación** (el transcript nace en el primer turno, no al arrancar); si
no, la abre en blanco y lo dice — nunca reanuda por nombre. La ventana se abre en el escritorio
actual y se mueve al escritorio guardado que coincide por **nombre** (el GUID no persiste entre
reinicios) por la vía interna de escritorios virtuales; si la sonda de arranque dice que esa
interfaz no está en este Windows, modo reducido: reabre todo en el escritorio actual sin mover y
dice por nombre dónde iba cada sesión.

Reporta al humano la línea de resumen literal que imprime el script (`Restauradas: N | Sin
escritorio emparejado: M | Fallos: K`, con `| Sin mover (modo reducido): R` si lo hubo) y, si
aparece, la línea `Reabiertas en blanco (sin conversacion que reanudar): B`, más los avisos de
escritorios sin equivalente actual y el detalle de cada fallo si los hubo — sin reinterpretarlas.

Ver [`README.md`](../../../019d8dc4-d3e0-76ca-b047-70e2b5b71674/avatar-body/coordinacion-avatares/README.md) § *Guardar y restaurar el
estado de escritorios* y el `CLAUDE.md` raíz de essence § *Traer avatares al escritorio virtual
actual*.

**Regla:** este script vive sólo en essence y se ejecuta ahí — no lo copies a tu propio avatar. Si algo falta o está mal, se arregla en essence.
