---
description: Trae al escritorio virtual actual las ventanas de las sesiones que este avatar abrió con abrir-avatar-en-terminal.ps1
---

Ejecuta `../019d8dc4-d3e0-76ca-b047-70e2b5b71674/avatar-body/coordinacion-avatares/traer-avatares-al-frente.ps1` vía PowerShell, sin pasar
`-AvatarUuidActual` explícito — el propio script resuelve el uuid del avatar actual leyendo el
`config.yml` más cercano al directorio desde el que se invoca.

No requiere argumentos: `$ARGUMENTS` se ignora. El script filtra `sesiones-abiertas.json` por las
sesiones que este mismo avatar abrió (`abiertoPorUuid`), trae al escritorio virtual de Windows en el
que está ahora el humano las ventanas de las que siguen vivas, limpia del registro las que ya no
tienen proceso, y devuelve un resumen.

Reporta al humano la línea de resumen literal que imprime el script (`Traídas: N | Limpiadas (PID
muerto): M | Fallos: K`), con el detalle de cada fallo si los hubo — sin reinterpretarla.

Ver [`README.md`](../../../019d8dc4-d3e0-76ca-b047-70e2b5b71674/avatar-body/coordinacion-avatares/README.md) § *Traer avatares al escritorio
virtual actual* y el `CLAUDE.md` raíz de essence § *Traer avatares al escritorio virtual actual*.

**Regla:** este script vive sólo en essence y se ejecuta ahí — no lo copies a tu propio avatar. Si algo falta o está mal, se arregla en essence.
