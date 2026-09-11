---
description: Busca en internet con un criterio usando el Chrome de depuración de essence
---

**Este comando no tiene proceso propio: invoca el de essence.** El proceso de búsqueda en internet
vive en `avatar-mind/narrative/[estado-actual]/life-cycle/procesos/` de essence, y el navegador que
conduce (`avatar-body/navegacion-chrome/`: `leer-pagina.mjs`, `asegurar-chrome.ps1`, puerto 9225,
perfil propio) también — life-cycle y cuerpo se leen e invocan directamente, nunca se copian.

Proceso: `../019d8dc4-d3e0-76ca-b047-70e2b5b71674/avatar-mind/narrative/[estado-actual]/life-cycle/procesos/buscar-internet.md`

Lee y ejecuta ese proceso con el criterio `$ARGUMENTS`.

`$ARGUMENTS` es el criterio de búsqueda en lenguaje natural (p. ej. *"en amazon un switch de 8
puertos con VLAN por menos de 40 €"*). Si viene vacío, pregunta el criterio antes de navegar.

Las rutas del proceso son relativas a la raíz de essence: desde este avatar se antepone
`../019d8dc4-d3e0-76ca-b047-70e2b5b71674/`. Enlaces:

- [`buscar-internet.md`](../../../019d8dc4-d3e0-76ca-b047-70e2b5b71674/avatar-mind/narrative/[estado-actual]/life-cycle/procesos/buscar-internet.md)
- [`navegacion-chrome/README.md`](../../../019d8dc4-d3e0-76ca-b047-70e2b5b71674/avatar-body/navegacion-chrome/README.md)

Regla: no copies este proceso ni los scripts a tu propio avatar. Si algo falta, se arregla en essence.
