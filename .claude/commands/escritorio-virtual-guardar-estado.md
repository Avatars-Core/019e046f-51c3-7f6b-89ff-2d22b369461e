Ejecuta `avatar-body/coordinacion-avatares/guardar-estado-escritorios.ps1` vía PowerShell, sin
argumentos.

No requiere argumentos: `$ARGUMENTS` se ignora. El script enumera los escritorios virtuales de
Windows existentes (registro `HKCU\...\VirtualDesktops\Desktops\<GUID>\Name`), cruza cada
sesión Claude Code nombrada viva de `sesiones-abiertas.json` con el escritorio en el que está su
ventana (`IVirtualDesktopManager.GetWindowDesktopId`), y escribe el resultado en
`avatar-body/coordinacion-avatares/estado-escritorios.json` (estado runtime, no versionado).

Reporta al humano la línea de resumen literal que imprime el script (`Escritorios: N | Sesiones
asociadas: M | Sin resolver: K`), con el detalle de cada sesión sin resolver si las hubo — sin
reinterpretarla.

Ver [`README.md`](../../avatar-body/coordinacion-avatares/README.md) § *Guardar y restaurar el
estado de escritorios* y el `CLAUDE.md` raíz de essence.
