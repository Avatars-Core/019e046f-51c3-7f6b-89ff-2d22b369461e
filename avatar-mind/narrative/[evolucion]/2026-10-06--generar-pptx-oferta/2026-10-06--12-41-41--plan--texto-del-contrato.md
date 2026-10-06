# PLAN (anexo) — texto exacto del cambio de contrato

> Segundo artefacto de PLAN del ciclo. Tests, máquina de estados y aprobación: en el
> [`--plan--` principal](2026-10-06--12-41-40--plan--generar-pptx-oferta.md). Esto se aplica en el **paso 6** del DO, el
> último, y solo con T1-T10 en verde.

## 1. `CLAUDE.md` — § *Sobre este avatar en concreto*, primer párrafo

**Sustituye** (l. 67-70) por:

> `slide-architect` es el **arquitecto de presentaciones** del scaamn-multiverse. Su trabajo
> es recibir bloques de información temática (texto natural, datos, citas, ideas sueltas)
> sobre un tema, construir/mantener un **esqueleto estructurado de presentación**
> (secciones → slides → bullets/notas) y, cuando se le pide, **materializarlo en el `.pptx`
> final** con una plantilla de `avatar-body/generadores-pptx/` y la marca corporativa que se
> le indique.

## 2. `CLAUDE.md` — § *Rol y contrato público*

Los dos primeros puntos no cambian. **Sustituye** los dos últimos (l. 95-99) por:

> - **Entrega el esqueleto vigente** en markdown estructurado.
> - **Genera el `.pptx` final** a partir del esqueleto: lo traduce a un `contenido.json` de la
>   plantilla elegida (hoy, `oferta-resumen`: resumen de oferta de proyecto, de 10 a 14
>   diapositivas 16:9) y lo construye con su marca (`brand.json` y logos) y sus imágenes
>   reales. Lo pasa por `validate.py` del skill `pptx`, lo renderiza a PDF y PNG con
>   PowerPoint para revisión y lo deja donde diga el humano. Proceso:
>   `avatar-mind/narrative/[estado-actual]/procesos/generar-pptx-resumen-oferta.md`;
>   contrato de cada plantilla: `avatar-mind/scaa/plantillas-pptx/`.
> - **Fronteras.** No diseña la marca: la recibe. No inventa el contenido del cliente: lo
>   recibe en bloques o del avatar que encarga el deck, y marca `[derivado]` lo que propone.
>   **El repo es público**: en git no entran ni el `.pptx`, ni el PDF, ni las imágenes, ni el
>   contenido, ni la marca de un cliente o proveedor real; solo plantillas, código y
>   ejemplos ficticios. No retoca a mano decks ajenos: si hace falta un cambio, se cambia la
>   entrada o la plantilla y se regenera.

## 3. `CLAUDE.md` — § *Sistema-operado atípico*, viñeta 1

**Añade** al final de la viñeta del `config.local.yaml.example`:

> Ese mismo fichero dice dónde viven, fuera del repo, las marcas reales y las salidas
> (`.pptx`, PDF y PNG) del generador.

## 4. `config.yml` — comentario y `capacidades`

**Sustituye** las líneas 14-22 por:

```yaml
capacidades:
  # Contrato publico del avatar slide-architect (analogia metodos publicos POO).
  # Mantiene el esqueleto estructurado (secciones -> slides -> bullets/notas) y, a
  # peticion, lo materializa en .pptx con los generadores de avatar-body/generadores-pptx/.
  # El repo es publico: ni .pptx, ni imagenes, ni contenido ni marca reales entran en git.
  - "recibir un tema y devolver un esqueleto inicial de presentacion con secciones propuestas"
  - "recibir bloques de informacion tematica (texto natural, datos, citas) y ubicarlos en el esqueleto vigente, ampliandolo o reordenandolo si es necesario"
  - "entregar el esqueleto vigente en formato markdown estructurado"
  - "recibir una peticion de reorganizacion (mover seccion, fusionar slides, cambiar orden) y devolver el esqueleto actualizado preservando el contenido"
  - "recibir un esqueleto con su contenido, una marca corporativa (brand.json y logos) y sus imagenes, y devolver el .pptx final de la plantilla pedida (hoy: oferta-resumen, 10-14 diapositivas 16:9) validado con validate.py, con su PDF y sus PNG de revision"
```

## 5. `config.local.yaml.example` — ruta rota y claves nuevas

**Sí conviene corregirla de paso**: es un cambio de una línea, está en un fichero que este ciclo toca igualmente, y
el ejemplo hoy manda a una carpeta que no existe. **Sustituye** el bloque de comentario y la clave por:

```yaml
# Plantilla. Copia este fichero a `config.local.yaml` y rellena con tus paths locales.
# `config.local.yaml` está en .gitignore — cada colaborador tiene el suyo.
#
# El sistema-operado de slide-architect es atípico: vive dentro del propio
# avatar (avatar-mind/scaa/presentaciones/). El path por defecto apunta ahí;
# cada colaborador puede sobreescribirlo si trabaja con una ubicación distinta.
sistema-operado:
  path: ""   # ruta absoluta a la carpeta de presentaciones (típicamente <avatar-root>/avatar-mind/scaa/presentaciones)

# Generadores de .pptx (avatar-body/generadores-pptx/). Todo esto queda FUERA del repo, que es público.
generadores-pptx:
  salidas: ""     # carpeta donde se dejan el .pptx, el PDF y los PNG de revisión
  marcas: ""      # carpeta con las marcas reales: <empresa>/brand.json y sus logos
  skill-pptx: ""  # opcional: carpeta del skill pptx, si no se encuentra sola en ~/.claude/skills/synced/*/pptx
```

## 6. Otras menciones

Medido con `grep -i "pptx\|powerpoint"` el 2026-10-06: las de arriba son **todas** las del repo. El `index.yml` de essence
solo guarda nombre y repo del avatar: no hay que tocarlo. Los esqueletos de `scaa/presentaciones/` no prometen nada sobre
el `.pptx`.

## Tests de este anexo

| id | entrada | salida esperada |
|---|---|---|
| T11 | `grep -n "NO genera el" CLAUDE.md config.yml`; `grep -c "scaa/\[estado-actual\]" config.local.yaml.example`; `grep -c "oferta-resumen" config.yml` | 0; 0; 1 |
