---
description: Guarda la foto de los escritorios virtuales de Windows y de las sesiones Claude Code nombradas de cada uno, para recrearla tras un reinicio
---

Ejecuta `../019d8dc4-d3e0-76ca-b047-70e2b5b71674/avatar-body/coordinacion-avatares/guardar-estado-escritorios.ps1` vía PowerShell, sin
argumentos.

No requiere argumentos: `$ARGUMENTS` se ignora. El script enumera los escritorios virtuales de
Windows existentes (registro `HKCU\...\VirtualDesktops\Desktops\<GUID>\Name`) y guarda **todas las
sesiones Claude Code vivas** con su escritorio actual (`IVirtualDesktopManager.GetWindowDesktopId` —
manda el escritorio de ahora, no el de apertura) y su `sessionId` (es lo que permite a
`/escritorio-virtual-restaurar-estado` reanudar la conversación). Junta dos fuentes sin duplicados:
las sesiones de `sesiones-abiertas.json` (abiertas por `abrir-avatar-en-terminal.ps1`, con su nombre y
su tarea) y las que **descubre** por sus ventanas de consola —Windows Terminal o conhost—, vengan del
lanzador del portal, del acceso directo o de `claude` a mano. Escribe el resultado en
`../019d8dc4-d3e0-76ca-b047-70e2b5b71674/avatar-body/coordinacion-avatares/estado-escritorios.json` (estado runtime, no versionado).

Reporta al humano la línea de resumen literal que imprime el script (`Escritorios: N | Sesiones
asociadas: M | Descubiertas: D | Cerradas en registro: C | Sin resolver: K`), con el detalle de cada
sesión sin resolver si las hubo — sin reinterpretarla. *Sin resolver* son sesiones **vivas** que no se
pudieron guardar (restaurar no las reabrirá); *Cerradas en registro* son entradas viejas del registro
cuya sesión ya no existe, y no son un fallo.

Ver [`README.md`](../../../019d8dc4-d3e0-76ca-b047-70e2b5b71674/avatar-body/coordinacion-avatares/README.md) § *Guardar y restaurar el
estado de escritorios* y el `CLAUDE.md` raíz de essence § *Traer avatares al escritorio virtual
actual*.

**Regla:** este script vive sólo en essence y se ejecuta ahí — no lo copies a tu propio avatar. Si algo falta o está mal, se arregla en essence.
