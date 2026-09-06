Ejecuta `avatar-body/coordinacion-avatares/restaurar-estado-escritorios.ps1` vía PowerShell, sin
argumentos.

No requiere argumentos: `$ARGUMENTS` se ignora. El script lee
`avatar-body/coordinacion-avatares/estado-escritorios.json` (escrito antes por
`/escritorio-virtual-guardar-estado`) y, para cada escritorio guardado, reabre sus sesiones con
`abrir-avatar-en-terminal.ps1 -Reanudar` (continuidad de conversación, no sesión en blanco) y
mueve la ventana nueva al escritorio virtual actual que coincide por **nombre** (el GUID no
persiste entre reinicios).

Reporta al humano la línea de resumen literal que imprime el script (`Restauradas: N | Sin
escritorio emparejado: M | Fallos: K`), con los avisos de escritorios sin equivalente actual y el
detalle de cada fallo si los hubo — sin reinterpretarla.

Ver [`README.md`](../../avatar-body/coordinacion-avatares/README.md) § *Guardar y restaurar el
estado de escritorios* y el `CLAUDE.md` raíz de essence.
