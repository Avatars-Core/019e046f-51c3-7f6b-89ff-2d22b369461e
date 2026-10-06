# CHECK — plantilla y generador del `.pptx` «resumen de oferta de proyecto»

> Entrada: el [`--do--`](2026-10-06--13-01-43--do--generar-pptx-oferta.md). Tests del
> [`--plan--`](2026-10-06--12-41-40--plan--generar-pptx-oferta.md), ejecutados de verdad el 2026-10-06 entre las 13:10 y
> las 13:30, sobre la rama del worktree (último commit del DO: `4427a70`).

## Resultados

| id | resultado | medida |
|---|---|---|
| T1 | **verde** | `npm install` desde cero: 18 paquetes, `npm audit` 0; `require('pptxgenjs')` y `require('image-size')` sin error; `git status`: 0 líneas con `node_modules` o `package-lock.json` |
| T2 | **verde** | `npm run ejemplo` (prepara imágenes y logos y llama a `construir.ps1`): exit 0; en `salidas/ejemplo/` el `.pptx`, el `.pdf` y 14 PNG |
| T3 | **verde** | `npm run minimo`: exit 0; 10 diapositivas (medido con `python-pptx`) y 10 PNG |
| T4 | **verde** | `validate.py` del skill sobre los dos `.pptx`: «All validations PASSED!» y exit 0 en los dos. A la primera: ninguna de las 3 iteraciones de margen del criterio de aborto |
| T5 | **verde** | `comprobar.py`: 12192000 × 6858000 EMU; 14 y 10 diapositivas; notas con su formato en todas (sin `TRANSICION` en la última); 13 y 9 imágenes (logos de los layouts incluidos) con **desvío de proporción 0,000 %**, también la recortada con `cover`; 0 formas fuera; secciones en el orden de la plantilla |
| T6 | **verde** | cuatro entradas rotas, cada una exit 1 y 0 `.pptx` en su carpeta. Mensajes: `contenido.diapositivas: 15 diapositivas; la plantilla admite de 10 a 14`; `marca.tema.colors.accent1: "#FF6C6F" no es un color de seis cifras hexadecimales sin '#' (quita el '#')`; `contenido.diapositivas[5].imagen.fichero: no existe la imagen "…/no-existe.png"`; `contenido.diapositivas[11].total: dice 250 y la suma de los hitos es 240` |
| T7 | **verde** | `hacer-imagenes.py --reglas 1440x900` y reconstruir sin tocar código (`git diff` vacío): la imagen de la idea clave pasa de 4,23 × 4,85 a 5,03 × 3,14 pulgadas (proporción 0,8727 → 1,6000) y `comprobar.py` sigue en verde |
| T8 | **verde** | PowerPoint abierto con ventana y una presentación «del humano» (simulada en otro proceso, sin PowerPoint real abierto antes: 0 procesos). `render.ps1` sobre el ejemplo: exit 0, PDF de 14 páginas; después, la presentación del humano **sigue abierta** y el proceso, vivo (1). Tras cerrar solo esa presentación, 0 procesos. En T2 y T3, sin PowerPoint previo, 0 procesos huérfanos |
| T9 | **verde** | el patrón del plan sobre `avatar-body/` y `avatar-mind/scaa/plantillas-pptx/`: 0 coincidencias. Ampliado a **todas las líneas que añade la rama** (`git diff 255a17c HEAD`): 0 |
| T10 | **verde** | `git ls-files avatar-body` con `.pptx`, `.pdf`, `.png` o `.jpg`: 0. En todo el repo: 0 |
| T11 | **verde** | «NO genera el» en `CLAUDE.md` y `config.yml`: 0; `scaa/[estado-actual]` en `config.local.yaml.example`: 0; `oferta-resumen` en `config.yml`: 1; la viñeta «Genera el `.pptx` final» está literal en `CLAUDE.md` |
| T12 | **verde** | compilador acotado al avatar sobre una copia del árbol con este worktree dentro (cómo, en el `--do--`): 0 errores y 0 warnings imputables, igual que en el explore; los tres bloques `avatar-lang` nuevos parsean (150 → 153 bloques del cierre) |
| T13 | **verde** | el `.md` más grande del ciclo es el `--plan--`, 14.989 B; los nuevos van de 1.371 a 6.769 B. Todos ≤ 16.000 |
| T14 | **manual, pendiente** | lo responde el humano mirando los PNG (ruta abajo) con la lista de QA visual del skill. Su respuesta se cita en el `--release--` |
| sim: NO-APLICA | **no aplica** | el catálogo de simulaciones de essence no tiene escenarios de generación de documentos; lo cubren T2-T8 |

**Las comprobaciones pueden fallar, y se ha visto.** Además de T6: `comprobar.py` sobre una copia con una imagen
estirada un 20 % en alto da exit 1 y `deformada un 16.7%`; un texto de cifra largo y un título de 75 caracteres hacen
que `generar.js` salga con 1, nombre los dos campos y no escriba nada; y el localizador del skill, sin skill a mano,
dice dónde buscó y cómo fijar `PPTX_SKILL_DIR`.

## Revisión visual del agente (previa a T14)

Hoja de contactos de las 14 diapositivas: sin desbordes, sin solapes, títulos a la misma altura y márgenes ≥ 0,5". Tres
detalles menores que no bloquean y quedan para el humano: en la idea clave queda aire entre la frase y las viñetas; las
tarjetas de módulos y de riesgos tienen hueco abajo con textos cortos; y en la tarjeta oscura del plan «fase II» puede
partir «II» a la línea siguiente. Los tres dependen del texto del ejemplo, no de la plantilla.

**Material para T14**, fuera de git: `C:\Users\FRANCI~1\AppData\Local\Temp\claude\slide-architect-revision\`, con
`ejemplo-14\` (`.pptx`, PDF y 14 PNG) y `minimo-10\` (`.pptx`, PDF y 10 PNG).

## Refactorización

vueltas: 1 · medido con `--contra=255a17c` (primer commit del ciclo).

- **Antes**: el máximo de las notas (1.200) escrito en dos sitios (`lib/notas.js` y `plantilla.json`); cinco símbolos
  exportados que nadie importaba (`sombra` del kit, `RANURAS`, `FUENTES_SEGURAS`, `MAX_CARACTERES`, `RAIZ_AVATAR`);
  1.263 líneas de código en `lib/`, `oferta-resumen/*.js` y `herramientas/`.
- **Después**: el máximo vive solo en `plantilla.json` y `validarNotas` lo recibe; 0 exportaciones muertas; 1.261 líneas.
  Bajó poco porque el código es nuevo: lo que se quitó es duplicación, que es lo que hace mentir a un contrato.
- Tras el refactor se repitieron `construir.ps1 -SinRender` sobre el ejemplo (verde) y T6 (las cuatro siguen en exit 1
  sin `.pptx`).

## Desviaciones y su medida

- **El `pre-commit` no valida esta rama.** Corre el compilador contra el árbol real, que en un worktree es el `master`
  sin estos cambios: los seis commits del DO pasaron el hook sin que mirara ni uno de sus ficheros (lo dice su propia
  salida, «150 bloques», cuando la rama tiene 153). Medida aplicada: T12 sobre la copia con *junctions*. Medida que se
  propone, no de este ciclo: que el hook compile el árbol del worktree que commitea.
- **Nombres del cliente ya publicados.** T9 da 0 en lo que este ciclo añade, pero el `idea.md`, el `--explore--` y el
  `--plan--` (commit `255a17c`, anterior al DO) nombran al cliente y al proveedor del material de partida, y hay
  menciones previas del proveedor en `scaa/presentaciones/`. No se han tocado: reescribirlos cambia artefactos ya
  aprobados y no borra el historial de un repo público. Lo decide el humano (en el `--release--`).

## Salida

T1-T13 en verde, T14 pendiente del humano. Pasa a RELEASE.
