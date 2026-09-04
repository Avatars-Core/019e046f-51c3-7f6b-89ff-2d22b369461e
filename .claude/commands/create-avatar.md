---
description: Crea un avatar nuevo del multiverso siguiendo el proceso canónico de essence
---

**Este comando no tiene proceso propio: invoca el de essence.** El proceso de creación de avatares
vive en `avatar-mind/narrative/[estado-actual]/life-cycle/procesos/` de essence — life-cycle se lee
directamente, nunca se copia.

Proceso: `../019d8dc4-d3e0-76ca-b047-70e2b5b71674/avatar-mind/narrative/[estado-actual]/life-cycle/procesos/create-avatar.md`

Lee y ejecuta ese proceso con los argumentos `$ARGUMENTS`.

Parsea `$ARGUMENTS` así:

- El primer token que no sea un flag es `<avatar-name>`.
- `--org <github-org>` *(opcional)* → la **org de GitHub destino** donde nace el repo. Si no aparece, la org es la **canónica** (`ORG_CANONICA` del método, hoy `SCAAMN-Multiverse`): **no la elijas tú**. Norma del humano (2026-08-10): *«salvo que no lo diga expresamente, los avatares nuevos nacen en `SCAAMN-Multiverse`, no en `SCAAMN-Multiverse-Private`»*. Propágalo al proceso como el input `<org>` (ver sección *Inputs* › `--org` del proceso), y si `<org>` no es la canónica, el alta lleva además `org_declarada: <org>` en el `index.yml` — sin eso la regla 26 corta el commit.
- `--abstract` *(opcional, flag)* → activa la rama abstracta del proceso.
- Cualquier otro token no-flag tras el nombre puede ser el `<sistema-operado-path>` (o se pregunta si falta y no hay `--abstract`).

Ejemplos:

- `/create-avatar w2m-portfolio` → org destino default `SCAAMN-Multiverse`.
- `/create-avatar plex-manager --org scaamn-multiverse-private` → repo en la org `scaamn-multiverse-private`.

Regla: no copies este proceso a tu propio `avatar-mind/`. Si algo falta, se arregla en essence.
