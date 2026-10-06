# PLAN — plantilla y generador del `.pptx` «resumen de oferta de proyecto»

aprobado-por: PENDIENTE @ PENDIENTE

> **SIN APROBAR.** La firma la pone el humano en esta ventana (`aprobado-por: <humano> @ <ISO-8601>`), con D1-D4 decididas.
> Entrada: el [`--explore--`](2026-10-06--12-41-40--explore--generar-pptx-oferta.md). El texto exacto del cambio de contrato
> está en el segundo artefacto de PLAN, [`--plan--texto-del-contrato`](2026-10-06--12-41-41--plan--texto-del-contrato.md).

## Punto de partida

`HEAD` `7c85a8e`, árbol limpio. `avatar-body/` vacío. El contrato dice «NO genera el `.pptx`» en `CLAUDE.md` (l. 70,
96-98) y `config.yml` (l. 16-18, 21). Check acotado: 0 errores y 0 warnings imputables. `pptxgenjs` sin instalar;
PowerPoint COM 16.0, Pillow, PyMuPDF y `python-pptx` disponibles.

## Punto de llegada

Un generador **genérico** que, con tres entradas (contenido, marca e imágenes), produce un `.pptx` de 10 a 14 diapositivas
que pasa `validate.py`, se renderiza a PDF y PNG, y cuyas imágenes conservan su proporción real. Dentro del repo, **ningún
dato, marca, imagen ni `.pptx` de un cliente o proveedor real**. El contrato dice lo que el avatar hace ya. Este ciclo **no
añade** errores ni warnings imputables al avatar.

## Decisiones para el humano

| # | decisión | recomendada |
|---|---|---|
| **D1** | marcas reales (logos y paleta de la empresa): **A** fuera de git, en una carpeta local que se indica en `config.local.yaml`; **B** versionadas en `avatar-body/marcas/<empresa>/` | **A**: el repo es **público** |
| **D2** | `apply_theme.js` y `validate.py`: **A** se usan desde el skill `pptx` instalado y se localizan al ejecutar; **B** se copian al avatar | **A**: no se sabe la licencia del skill, y así las mejoras del skill llegan solas |
| **D3** | entrada del contenido: **A** un `contenido.json` que el avatar deriva del esqueleto `.md`; **B** el generador lee el `.md` directamente | **A**: el `.md` sigue siendo libre y el JSON se puede validar campo a campo |
| **D4** | el deck del cliente: **A** este ciclo deja plantilla y ejemplo ficticio, y la v1.2 la encarga después el otro avatar, con su contenido fuera de este repo; **B** se regenera aquí | **A** |

## Estructura (rutas exactas, desde la raíz del avatar)

```
avatar-body/generadores-pptx/
  README.md                       uso, procedencia (adaptado de 01a10c4d…/generadores-entregable/resumen, 2026-10-05) y dependencias
  package.json                    "private": true; versiones exactas: pptxgenjs, image-size; scripts "ejemplo", "minimo", "check"
  lib/marca.js                    lee brand.json; hex de 6 cifras sin '#'; escapa '&' en company; rutas de logos relativas al brand.json
  lib/imagen.js                   dimensiones reales (image-size); contain(caja, img) y cover(caja, img, foco) -> {x,y,w,h,sizing}
  lib/skill-pptx.js               localiza el skill: $PPTX_SKILL_DIR, luego `skill-pptx` de config.local.yaml, luego glob
                                  ~/.claude/skills/synced/*/pptx; fija NODE_PATH en el proceso (Module._initPaths) antes del require
  lib/componentes.js              insignia, tarjeta (sombra nueva por llamada), pie de imagen, cifra grande, línea de tiempo, rejilla, pasos
  lib/notas.js                    compone las notas del orador con el formato fijo (abajo)
  oferta-resumen/generar.js       node generar.js --contenido <json> --marca <brand.json> --imagenes <dir> --salida <pptx>
  oferta-resumen/validar-contenido.js   reglas de la plantilla (abajo); sale con 1 y dice campo y motivo
  oferta-resumen/ejemplo/contenido.json         ficticio completo: 14 diapositivas
  oferta-resumen/ejemplo/contenido-minimo.json  ficticio mínimo: 10 diapositivas (sin agenda ni desdobles)
  oferta-resumen/ejemplo/hacer-imagenes.py      Pillow: PNG sintéticos con las proporciones del material (2184x1162,
                                                1568x1568, 1214x753, 1440x1650, 1440x840) y texto «EJEMPLO»
  herramientas/construir.ps1      generar -> validate.py -> comprobar.py -> render.ps1 -> topng.py; para al primer fallo
  herramientas/render.ps1         PowerPoint COM: abre solo lectura sin ventana, SaveAs(pdf, 32), try/finally, libera COM;
                                  rechaza si hay `~$`; Quit solo si no quedan presentaciones del humano abiertas
  herramientas/topng.py           PyMuPDF, PDF -> PNG por página (dpi por argumento)
  herramientas/comprobar.py       python-pptx: tamaño 16:9, nº de diapositivas, formato de notas, proporción de cada imagen,
                                  formas dentro de la diapositiva, secciones en orden, palabras prohibidas
  salidas/                        ignorado por git
avatar-body/marcas/
  README.md                       formato de brand.json; qué se versiona (solo marcas ficticias)
  demo/brand.json                 marca ficticia «Ejemplo Consultoría» (paleta y Calibri)
  demo/hacer-logos.py             Pillow: logo-claro.png (287x99) y logo-pie.png (116x40), sin versionar
avatar-mind/scaa/plantillas-pptx/index.md            qué plantillas hay, entradas y salidas; bloque avatar-lang
avatar-mind/scaa/plantillas-pptx/oferta-resumen.md   contrato de la plantilla (secciones, tipos, límites, notas)
avatar-mind/narrative/[estado-actual]/procesos/generar-pptx-resumen-oferta.md   el proceso
avatar-mind/meta-narrative/[evolucion]/generar-pptx.md   nodo del grafo; hito al cerrar
```

**`node_modules` y `NODE_PATH`.** `package.json` se versiona y se instala con `npm install` en `avatar-body/generadores-pptx/`
(un solo `node_modules` para todas las plantillas). `node_modules/` y `package-lock.json` ya están en `.gitignore`
(canon de essence). Como el lock no viaja, las versiones van **exactas**, sin `^`. `NODE_PATH` deja de ser cosa del
usuario: `lib/skill-pptx.js` lo fija dentro del proceso.

**`.gitignore`**, en la sección propia del avatar: `avatar-body/generadores-pptx/salidas/`,
`avatar-body/generadores-pptx/oferta-resumen/ejemplo/imagenes/`, `avatar-body/marcas/*/` con `!avatar-body/marcas/demo/`,
`avatar-body/marcas/demo/*.png` y `*.pptx`, `*.pdf` bajo `avatar-body/`.

## La plantilla «oferta-resumen»

16:9 (`LAYOUT_WIDE`, 13,333 × 7,5 pulgadas). Una idea por diapositiva. Tema de la marca, colores con `SchemeColor` y
`applyTheme` tras `writeFile`. Tres layouts: `PORTADA` (oscura partida), `CONTENIDO` (título en placeholder, pie, logo y
número) y `CIERRE`.

| # | sección (`tipo`) | composición | ¿obligatoria? |
|---|---|---|---|
| 1 | `portada` | título, cliente, subtítulo, versión y fecha, quién presenta | sí |
| 2 | `agenda` | 4-8 puntos numerados en dos columnas | no (es la que se quita para llegar a 10) |
| 3 | `que-y-para-quien` | 3 cifras grandes en tarjetas, más una línea de fuera de alcance | sí |
| 4 | `por-que-ahora` | línea de tiempo de 2-4 hitos, más un destacado | sí |
| 5 | `idea-clave` | frase de 1-2 líneas, 3 puntos y una imagen | sí |
| 6 | `modelo-funcional` | diagrama y 2 tarjetas | sí, desdoblable a 2 |
| 7 | `solucion-tecnica` | diagrama y ≤4 filas tecnología-papel | sí, desdoblable a 2 |
| 8 | `prototipo` | captura principal y ≤2 secundarias, con pie | sí, desdoblable a 2 |
| 9 | `plan-de-horas` | barras nativas con los hitos, total y aviso «propuesta» | sí |
| 10 | `riesgos` | rejilla de ≤6 riesgos, cada uno con su pregunta y nivel alto, medio o bajo | sí |
| 11 | `proximos-pasos` | ≤4 pasos numerados, cierre y contacto | sí |

Límites: de 10 a 14 diapositivas en total; el total del plan **se calcula** y, si el JSON trae uno, tiene que coincidir;
texto de cuerpo ≥14 pt y pies ≥10 pt (si no cabe, `validar-contenido.js` falla con el campo y no se encoge).
**Imágenes:** `ajuste: contain` por defecto (diagramas y capturas) y `cover` con `foco: arriba|centro` para fotos; la caja
sale del layout y la proporción, de los píxeles reales. Ningún número de proporción en el código.

**Notas del orador**, texto plano de 1.200 caracteres como mucho, siempre en este orden:

```
MENSAJE: <la idea de la diapositiva, en una frase>
GUION:
- <2 a 5 puntos: lo que se dice>
DATOS: <cifras y su fuente; [derivado] si lo propone el avatar>
TRANSICION: <frase puente a la siguiente>   (no aparece en la última)
TIEMPO: <minutos>
```

## Orden de ejecución del DO

1. **Base:** `package.json`, `lib/` y `npm install`. Commit.
2. **Marcas:** `marcas/README.md`, `demo/brand.json` y `hacer-logos.py`. Commit.
3. **Plantilla:** `generar.js`, `validar-contenido.js` y el ejemplo con sus imágenes sintéticas. Commit.
4. **Herramientas:** `construir.ps1`, `render.ps1`, `topng.py` y `comprobar.py`. Commit.
5. **Memoria:** `scaa/plantillas-pptx/`, el proceso, el README y el nodo del grafo. Commit.
6. **Contrato, el último:** `CLAUDE.md`, `config.yml`, `config.local.yaml.example` y `.gitignore`, con el texto del segundo
   artefacto. Solo cuando T1-T10 están en verde: el contrato no puede prometer lo que aún no funciona.

## Tests

| id | entrada | salida esperada |
|---|---|---|
| T1 | `npm install` en `avatar-body/generadores-pptx/`; `node -e "require('pptxgenjs');require('image-size')"`; `git status --porcelain` | exit 0; 0 líneas con `node_modules` o `package-lock.json` |
| T2 | `construir.ps1` con `ejemplo/contenido.json`, `marcas/demo/brand.json` y las imágenes sintéticas | exit 0; `.pptx`, `.pdf` y 14 PNG en `salidas/` |
| T3 | `construir.ps1` con `ejemplo/contenido-minimo.json` | exit 0; 10 diapositivas y 10 PNG |
| T4 | `python <skill>/scripts/office/validate.py` sobre los `.pptx` de T2 y T3 | exit 0 en los dos |
| T5 | `comprobar.py` sobre T2 y T3 | 12192000 × 6858000 EMU; 10 ≤ n ≤ 14; cada nota empieza por `MENSAJE:` y tiene `GUION:`, `DATOS:` y `TIEMPO:`, más `TRANSICION:` salvo la última; error de proporción de cada imagen ≤ 1 %; 0 formas fuera de la diapositiva; secciones en el orden de la tabla |
| T6 | cuatro entradas rotas: 15 diapositivas; color `"#FF6C6F"`; imagen inexistente; total del plan ≠ suma | exit ≠ 0 en las cuatro, y el mensaje nombra el campo; ningún `.pptx` escrito |
| T7 | regenerar la captura de 1440x1650 a 1440x900 y reconstruir **sin tocar el código** | T5 sigue en verde: la proporción no está fijada a mano |
| T8 | `render.ps1` con un PowerPoint del humano abierto con una presentación cualquiera | PDF con n páginas; la presentación del humano sigue abierta; 0 `POWERPNT.EXE` huérfanos si no había ninguno antes |
| T9 | `grep -riE "<nombres del cliente y del proveedor>\|FranciscoJavierCuena\|C:/Users" avatar-body/ avatar-mind/scaa/plantillas-pptx/` | 0 coincidencias |
| T10 | `git ls-files avatar-body \| grep -E "\.(pptx\|pdf\|png\|jpe?g)$"` | 0 |
| T11 | `grep -n "NO genera el" CLAUDE.md config.yml`; `grep -c "scaa/\[estado-actual\]" config.local.yaml.example` | 0 y 0; las capacidades nuevas, presentes literalmente |
| T12 | `npm run check -- --alcance=019e046f-51c3-7f6b-89ff-2d22b369461e --errores-avatar=019e046f-51c3-7f6b-89ff-2d22b369461e --warnings-avatar=019e046f-51c3-7f6b-89ff-2d22b369461e`, desde `scaamn-method` | 0 errores imputables; los warnings imputables no suben respecto a la medida del explore (0 el 2026-10-06 a las 12:40) |
| T13 | `wc -c` de cada `.md` nuevo o tocado | ≤ 16.000 B cada uno (regla 21) |
| T14 | los PNG de T2, revisados por el humano con la lista de QA visual del skill | el humano responde «OK» o lista defectos; la respuesta se cita en el `--check--` |
| sim: NO-APLICA-generador-pptx-sin-escenario-en-catalogo | revisión del `catalogo.jsonl` de essence (34 escenarios, 2026-10-06) | ninguno cubre generar documentos: el ciclo no toca el compilador, los hooks, la tríada ni el multiverso. Lo verifican T2-T8 |

## Vuelta atrás y criterio de aborto

- **Receta:** `git revert` de los commits del DO, en orden inverso. Lo que git no versiona se borra con rutas literales,
  nunca con variables compuestas: `rm -rf avatar-body/generadores-pptx/node_modules avatar-body/generadores-pptx/salidas`.
  `config.local.yaml` es del humano: no se toca.
- **Como el contrato va al final, abortar antes del paso 6 deja el contrato intacto.**
- **Aborto:** si `validate.py` falla después de 3 iteraciones de corrección en el generador, o si PowerPoint por COM falla
  dos veces seguidas, se para, se documenta en el `--do--` y se avisa. No se toca el contrato.

## Magnitudes declaradas al abrir

Sha de partida: `7c85a8e`. Bytes que se tocarán: `CLAUDE.md`, `config.yml`, `config.local.yaml.example` y `.gitignore`
(se miden con `wc -c` al empezar el DO, en el `--do--`). Todo lo demás es nuevo.

## Máquina de estados

```avatar-lang
@id: plan-generar-pptx-oferta

state PARTIDA "Avatar sin generador y con contrato de solo esqueleto" {
  verify: ["avatar-body solo contiene .gitkeep", "CLAUDE.md dice NO genera el .pptx"]
}

state GENERADOR_LISTO "Base, marca demo, plantilla y herramientas commiteadas" {
  verify: ["T1, T2 y T3 en verde", "T4 y T5 en verde", "T6 y T7 en verde", "T8 en verde"]
}

state MEMORIA_LISTA "scaa, proceso, README y nodo del grafo escritos" {
  verify: ["T9 y T10 dan 0", "T13 en verde"]
}

state CONTRATO_ACTUALIZADO terminal "Contrato nuevo publicado sobre un generador que ya funciona" {
  verify: ["T11 en verde", "T12 sin errores imputables nuevos", "T14 con respuesta del humano citada"]
}

action construir-generador: PARTIDA -> GENERADOR_LISTO {
  title: "construir el generador"
  description: "Pasos 1 a 4 del DO: base y npm install, marca demo, plantilla oferta-resumen y herramientas de validacion y render"
  requires: PARTIDA
  produces: GENERADOR_LISTO
}

action escribir-memoria: GENERADOR_LISTO -> MEMORIA_LISTA {
  title: "escribir la memoria"
  description: "Paso 5: scaa/plantillas-pptx, proceso generar-pptx-resumen-oferta, README y nodo del grafo"
  requires: GENERADOR_LISTO
  produces: MEMORIA_LISTA
}

action cambiar-contrato: MEMORIA_LISTA -> CONTRATO_ACTUALIZADO {
  title: "cambiar el contrato"
  description: "Paso 6: CLAUDE.md, config.yml, config.local.yaml.example y .gitignore con el texto aprobado"
  requires: MEMORIA_LISTA
  produces: CONTRATO_ACTUALIZADO
}
```

## Riesgos

- **El repo es público.** Un `contenido.json` real o una imagen del cliente en `ejemplo/` se publicarían. Lo cubren T9,
  T10 y el `.gitignore`.
- **`render.ps1` puede cerrar el PowerPoint del humano**, porque COM se engancha a la instancia abierta. Lo cubre T8.
- **La carpeta `synced/<uuid>` del skill cambia** y deja el generador sin `apply_theme.js`. `lib/skill-pptx.js` falla
  diciendo dónde buscó y cómo fijar `PPTX_SKILL_DIR`.
- **Fuentes:** Calibri por defecto. Una fuente de marca fuera de la lista segura del skill es un aviso en `marca.js`, no
  un error.
- **Aprobación cruzada:** si el humano no firma aquí, el ciclo vuelve a laguna (`CICLO_EN_DESARROLLO → LAGUNA_ABIERTA`).
