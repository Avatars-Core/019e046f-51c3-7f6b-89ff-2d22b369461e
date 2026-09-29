---
description: Propaga un cambio de fichero (texto exacto) a todos los avatares del multiverso
---

Lee y ejecuta `../019d8dc4-d3e0-76ca-b047-70e2b5b71674/avatar-mind/narrative/[estado-actual]/life-cycle/procesos/propagar-a-multiverso.md` con los argumentos `$ARGUMENTS`.

Parsea `$ARGUMENTS` así:

- `<fichero-destino-relativo>` — primer token no-flag: ruta relativa a la raíz de cada avatar (p.ej.
  `.claude/settings.json`, `CLAUDE.md`).
- `--texto-exacto <path-o-literal>` *(requerido)* — el contenido exacto a aplicar. Si apunta a un
  fichero, se lee su contenido como texto exacto; si no, se toma como literal.
- `--ancla <string>` *(opcional)* — el string/versión anterior a localizar para decidir sustituir vs
  insertar vs marcar excepción. Si no se pasa, se infiere comparando contra la versión vigente en
  essence del mismo fichero.
- `--dry-run` *(opcional, flag)* — solo clasifica (aplicados/ya-aplicados/excepciones) sin escribir
  ni commitear nada. Útil para estimar alcance antes de ejecutar.
- `--push` *(opcional, flag)* — además de commitear en cada repo tocado, pushea. Por defecto **no**
  pushea (ver proceso § *Mecanismo* paso 5).

Ejemplos:

- `/propagar-a-multiverso .claude/settings.json --texto-exacto "<nuevo texto del hook>" --dry-run` →
  estima cuántos avatares tienen la versión anterior, cuántos ya están al día, cuántos son excepción.
- `/propagar-a-multiverso CLAUDE.md --texto-exacto ruta/al/parrafo.md --push` → aplica y pushea.

**Regla:** este proceso vive sólo en essence y se lee ahí — no lo copies a tu propio avatar. Si algo falta o está mal, se arregla en essence.
