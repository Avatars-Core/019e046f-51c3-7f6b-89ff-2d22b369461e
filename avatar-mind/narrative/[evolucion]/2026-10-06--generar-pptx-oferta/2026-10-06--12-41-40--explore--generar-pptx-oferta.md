# EXPLORE — generar el `.pptx` final de un resumen de oferta

> Ciclo abierto el 2026-10-06 a las 12:41 con `abrir-ciclo.sh` de essence. Entrada: [`idea.md`](idea.md).
> Modo simulación: nada fuera de esta carpeta se ha escrito. Fuera del repo, solo lectura.

## Entrada — el disparador

La sesión del avatar solicitante (`01a10c4d-41b7-7540-9a80-167285ca3a73`) pide que este avatar genere el `.pptx`
final. **Reformulado:** ampliar el contrato de `slide-architect` de *arquitecto del esqueleto* a *arquitecto del esqueleto
y productor del `.pptx`*, empezando por una plantilla genérica de resumen de oferta de proyecto, con la marca como
entrada y sin contenido de cliente en el repo.

Es sustantivo por **C3** (ejecutables nuevos en `avatar-body/`). No es C1 (no toca hooks, `settings.json`,
`scaamn-method` ni un `@gate`) ni C2 (no se escribe en otro repo: el material del otro avatar se **lee y se adapta**, no se
mueve).

**Premisa contrastada.** «El humano lo ha aprobado» no se puede verificar desde aquí: llega por un agente, no por el
humano en esta ventana. Se trata como **no aprobado** hasta la línea `aprobado-por:` del plan.

## Suelo verificado (2026-10-06, 12:30-12:41)

**El sistema-operado ya existía** (no nace): `avatar-mind/scaa/presentaciones/` con 5 esqueletos raíz (17.563 B) y 3
subcarpetas (`filosofia/`, `historias/`, `ia-en-consultoria/`).

| comprobación | resultado medido |
|---|---|
| `git status` / `HEAD` | limpio, `master` en `7c85a8e` |
| `avatar-body/` | solo `.gitkeep`: **no hay ningún generador** |
| `narrative/[estado-actual]/procesos/` | solo `.gitkeep` |
| grafo de hitos | 0 hitos, 1 laguna (`cumplir-regla-14`); **ninguna laguna sobre el `.pptx`**: la idea entra como encargo |
| `npm run check -- --alcance=… --errores-avatar=… --warnings-avatar=…` (desde `scaamn-method`) | 0 errores y 0 warnings imputables a este avatar; 5 avatares en el cierre |
| visibilidad del repo (`gh repo view`) | **`PUBLIC`** |
| `.gitignore` | ya ignora `**/node_modules/` y `**/package-lock.json` |
| `commit-msg` hook | rechaza la co-autoría de Claude (regla de essence `CLAUDE.md` § *Commits*) |

**Menciones de «no genera el `.pptx`»** (`grep -i "pptx\|powerpoint"`): `CLAUDE.md` líneas 70, 96-98; `config.yml`
líneas 16-18 (comentario) y 21 (capacidad 3). Fuera del repo, el `index.yml` de essence solo lista nombre y repo: nada
que retocar allí.

**Ruta rota confirmada:** `config.local.yaml.example` dice `avatar-mind/scaa/[estado-actual]/presentaciones`; la carpeta
real es `avatar-mind/scaa/presentaciones/` (sin `[estado-actual]`). `config.yml` lo dice bien.

## Entorno de la máquina (sin instalar nada)

| pieza | estado |
|---|---|
| Node / npm | `v24.14.1` / `11.11.0` |
| `pptxgenjs` | **no está** en el material (`resumen/` no tiene `node_modules`) ni en el global (`npm root -g` solo tiene `@angular`, `@anthropic-ai`, `@mermaid-js`); `require.resolve` falla. Habrá que hacer `npm install` |
| Python | `3.14.3`; Pillow `12.2.0`, PyMuPDF `1.27.2.3`, pywin32, `python-pptx 1.0.2`, `defusedxml` y `lxml`: **sí** |
| `markitdown` | **no** instalado (el QA de contenido del skill lo usa; sustituible por `python-pptx`) |
| PowerPoint por COM | **sí**, `PowerPoint.Application` versión `16.0` |
| LibreOffice / `pdftoppm` | **no** (no hacen falta: PDF por COM, PNG con PyMuPDF) |
| skill `pptx` | `~/.claude/skills/synced/3fe2d7dd-…_ba13349c-…/pptx/`: `scripts/apply_theme.js` (86 líneas; carga `jszip` desde al lado de `pptxgenjs`) y `scripts/office/validate.py` (+ `helpers/`, `validators/`, `schemas/`). La carpeta `synced/<uuid>` es **inestable**: puede cambiar de nombre |

## El material de partida (solo lectura)

`01a10c4d-…/avatar-body/generadores-entregable/` (README, `resumen/deck.js` 30.758 B, `render.ps1`, `topng.py`,
`package.json`) y `avatar-mind/scaa/entregables/index.md`.

**Genérico, reutilizable tal cual o casi:**
- la estructura: `THEME` con `dk1…accent6` → `pres.theme` + `pres.SchemeColor` → `applyTheme()` tras `writeFile()`;
  `LAYOUT_WIDE` (13,333 × 7,5); dos layouts (`PORTADA` oscura partida y `CONTENIDO` con título-placeholder, pie, logo y
  número); secciones con `sectionTitle`;
- los motivos: `badge` (número de idea en círculo de acento), `card` con sombra nueva por llamada, `caption`,
  `framedImage`; las composiciones por tipo de diapositiva (cifras grandes en tres tarjetas, línea de tiempo, frase clave
  + bullets + imagen, imagen + tarjetas, gráfico de barras nativo con `+mn-lt`, rejilla 3×2 de riesgos, cierre con pasos
  numerados);
- `render.ps1` (PowerPoint `SaveAs(pdf, 32)`; Word `ExportAsFixedFormat`) y `topng.py` (PyMuPDF por página, `dpi`);
- el orden de 13 diapositivas: portada, agenda, qué y para quién, por qué ahora, idea clave, modelo (×2), técnica (×2),
  prototipo, plan, riesgos, cierre con próximos pasos.

**Del cliente o del proveedor, no entra en este repo:**
- marca: la de la empresa proveedora (su nombre en tema, autor y empresa, su paleta y su web), los logos `image27.png`
  y `image28.png` (116×40 y 287×99 px, sacados del PID de origen);
- cliente: el nombre de la administración autonómica, el del servicio, el órgano que lo gestiona, el pie, todos los textos y
  notas, la normativa citada, el sistema de identificación, 300 h y los hitos H0-H5, riesgos y próximos pasos;
- imágenes: `estados-oferta.png`, `bpmn-cubrir.png`, `c2.png`, `c3-hex.png`, `cap-*.png`.

**Defectos del material que el plan corrige:**
1. **Proporciones fijadas a mano**: `iw = ih * 1440 / 1650`, `1214/753`, `2184/1162`… Si cambia una imagen, se rompe en
   silencio (el README lo admite: «se ajusta su proporción en `deck.js`»).
2. **Ruta absoluta** a `apply_theme.js` con el uuid de `synced/` y el usuario de la máquina.
3. **`NODE_PATH` obligatorio** porque `apply_theme.js` vive fuera del árbol de `node_modules`.
4. `package.json` llamado `scratchpad`, sin `scripts` útiles, mezclando `docx` (fuera del alcance).
5. `render.ps1` no cierra PowerPoint si falla a medias ni libera COM; abre con ventana.
6. `validate.py` no aparece en el flujo del material (el skill lo exige tras `writeFile()`).
7. Contenido y maquetación mezclados en un solo fichero: no hay plantilla, hay un deck.

## Huecos

| hueco | cerrado | cómo |
|---|---|---|
| ¿Dónde vive el `.pptx` generado? | sí | fuera de git: el repo es público; salida a la ruta que diga el humano o a `config.local.yaml` |
| ¿Se pueden versionar logos de una empresa? | **no** (lo decide el humano) | repo público: propuesta en el plan, D2 |
| ¿Copiar `apply_theme.js` / `validate.py` al avatar? | **no** (lo decide el humano) | licencia del skill sin medir; propuesta en el plan, D3 |
| ¿Hace falta `requires-from`? | sí: no | `requires-from` es dependencia causal md→md; aquí se **adapta código** una vez, no se consume un estado terminal ajeno. Se deja la procedencia escrita en el README |
| ¿Simulación del catálogo de essence aplicable? | sí: ninguna | el catálogo (34 líneas) es del método y la tríada; se declara `NO-APLICA-` con motivo |

## Salida — IDEA_PRODUCIDA

Hay que construir, en un repo **público**, una **plantilla** (no un deck) separada en tres entradas —contenido, marca e
imágenes— más un generador que lea las dimensiones reales de las imágenes, aplique tema y valide, y un render por COM.
Ninguna de las tres entradas de un cliente real entra en git. El contrato público cambia en cuatro sitios conocidos. Pasa
a PLAN.
