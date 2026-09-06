---
description: Trae al escritorio virtual actual las ventanas de las sesiones que este avatar abrió con abrir-avatar-en-terminal.ps1
---

**Este comando no tiene script propio: invoca el de essence.** `traer-avatares-al-frente.ps1` vive
en `avatar-body/coordinacion-avatares/` de essence — no se copia, se invoca por ruta relativa.

Script: `../019d8dc4-d3e0-76ca-b047-70e2b5b71674/avatar-body/coordinacion-avatares/traer-avatares-al-frente.ps1`

Ejecuta ese script vía PowerShell, sin pasar `-AvatarUuidActual` explícito — el propio script
resuelve el uuid de este avatar leyendo el `config.yml` más cercano al directorio desde el que se
invoca. No requiere argumentos: `$ARGUMENTS` se ignora.

El script filtra `sesiones-abiertas.json` (registro compartido, en essence) por las sesiones que este
mismo avatar abrió (`abiertoPorUuid`), trae al escritorio virtual de Windows en el que está ahora el
humano las ventanas de las que siguen vivas, limpia del registro las que ya no tienen proceso, y
devuelve un resumen.

Reporta al humano la línea de resumen literal que imprime el script (`Traídas: N | Limpiadas (PID
muerto): M | Fallos: K`), con el detalle de cada fallo si los hubo — sin reinterpretarla.

Regla: no copies el script a tu propio `avatar-body/`. Si algo falta, se arregla en essence.
