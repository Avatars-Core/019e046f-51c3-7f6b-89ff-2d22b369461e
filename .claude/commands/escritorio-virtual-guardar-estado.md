---
description: Guarda la foto de escritorios virtuales de Windows y de las sesiones Claude Code nombradas que hay en cada uno, para recrearla tras un reinicio
---

**Este comando no tiene script propio: invoca el de essence.** `guardar-estado-escritorios.ps1` vive
en `avatar-body/coordinacion-avatares/` de essence — no se copia, se invoca por ruta relativa.

Script: `../019d8dc4-d3e0-76ca-b047-70e2b5b71674/avatar-body/coordinacion-avatares/guardar-estado-escritorios.ps1`

Ejecuta ese script vía PowerShell, sin argumentos. No requiere argumentos: `$ARGUMENTS` se ignora.

El script enumera los escritorios virtuales de Windows existentes (registro
`HKCU\...\VirtualDesktops\Desktops\<GUID>\Name`) y, para cada sesión Claude Code nombrada viva de
`sesiones-abiertas.json` (registro compartido, en essence), toma el `hwnd` capturado al abrirla,
**re-consulta** el escritorio en el que está ahora su ventana
(`IVirtualDesktopManager.GetWindowDesktopId` — manda el escritorio actual, no el de apertura),
resuelve su `sessionId` (es lo que permite a `/escritorio-virtual-restaurar-estado` reanudar la
conversación) y escribe el resultado en `avatar-body/coordinacion-avatares/estado-escritorios.json`
de essence (estado runtime único de la máquina, no versionado; no vive en este avatar). Solo ve las
sesiones abiertas por `abrir-avatar-en-terminal.ps1`: las del acceso directo o de `claude` a mano no
están en el registro.

Reporta al humano la línea de resumen literal que imprime el script (`Escritorios: N | Sesiones
asociadas: M | Sin resolver: K`), con el detalle de cada sesión sin resolver si las hubo — sin
reinterpretarla.

Ver [`README.md`](../../../019d8dc4-d3e0-76ca-b047-70e2b5b71674/avatar-body/coordinacion-avatares/README.md)
§ *Guardar y restaurar el estado de escritorios* y el `CLAUDE.md` raíz de essence § *Traer avatares
al escritorio virtual actual*.

Regla: no copies el script a tu propio `avatar-body/`. Si algo falta, se arregla en essence.
