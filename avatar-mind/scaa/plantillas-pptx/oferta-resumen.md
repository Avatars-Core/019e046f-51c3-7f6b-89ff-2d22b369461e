# Plantilla `oferta-resumen` — contrato

Resumen de una oferta de proyecto para presentarla al cliente: **una idea por diapositiva**, de 10 a 14 diapositivas,
16:9 (`LAYOUT_WIDE`, 13,333 × 7,5 pulgadas). Código: `avatar-body/generadores-pptx/oferta-resumen/` (`plantilla.json`
es la tabla de tipos que leen el generador y `comprobar.py`). Ejemplo completo y ficticio:
`oferta-resumen/ejemplo/contenido.json`; mínimo: `contenido-minimo.json`.

## Marco

- **Tema** de la marca (`brand.json`): todos los colores salen de sus doce ranuras por `SchemeColor`, y `apply_theme.js`
  los escribe en el tema tras `writeFile`. Cambiar de marca no toca el código.
- **Tres layouts**: `PORTADA` (panel oscuro a la derecha, logo principal arriba a la izquierda), `CONTENIDO` (título en
  placeholder, pie de texto, logo pequeño y número de diapositiva) y `CIERRE` (mismo marco que la portada, aparte para
  poder reestilizarlo).
- **Motivo**: una insignia numerada en círculo de acento junto al título, con el número del bloque (La oferta = 1,
  Modelo funcional = 2, Solución técnica = 3, Prototipo = 4, Plan y riesgos = 5). Tarjetas con sombra, sin barras de
  acento.
- **Secciones** de PowerPoint en este orden: Apertura, La oferta, Modelo funcional, Solución técnica, Prototipo, Plan y
  riesgos, Cierre.

## `contenido.json`

```text
{ "plantilla": "oferta-resumen",
  "meta": { "titulo", "cliente", "proyecto", "subtitulo"?, "version", "fecha", "presenta", "pie" },
  "diapositivas": [ { "tipo": "...", "titulo": "...", ...campos del tipo..., "notas": { ... } } ] }
```

`meta.pie` es el texto del pie de cada diapositiva de contenido. Todas las diapositivas llevan `titulo` (≤ 1 línea a
30 pt, unos 45 caracteres) salvo `portada` (usa `meta`) y `proximos-pasos` (por defecto «Próximos pasos»).

## Tipos, en su orden

| # | `tipo` | campos | cuántos | composición |
|---|---|---|---|---|
| 1 | `portada` | — (usa `meta`) | 1, obligatoria | cliente y proyecto en banda de acento, título, subtítulo, quién presenta, versión y fecha |
| 2 | `agenda` | `puntos[]`: `titulo`, `detalle`? (4-8) | 0-1 | puntos numerados en dos columnas; **es la que se quita para bajar a 10** |
| 3 | `que-y-para-quien` | `cifras[3]`: `etiqueta`, `valor`, `detalle`; `fueraDeAlcance`? | 1 | tres tarjetas con cifra grande (60 pt si `valor` ≤ 6 caracteres; si no, 28 pt) |
| 4 | `por-que-ahora` | `hitos[]`: `fecha`, `titulo`, `detalle` (2-4); `destacado`?: `etiqueta`, `texto` | 1 | línea de tiempo; el último hito, en acento |
| 5 | `idea-clave` | `frase[]` (1-2 líneas), `puntos[]` (2-3), `imagen` | 1 | frase grande (2.ª línea en acento), viñetas e imagen con pie |
| 6 | `modelo-funcional` | `composicion`: `diagrama-y-tarjetas` (`imagen`, `texto`?, `tarjetas[2]`) o `cifras-y-diagrama` (`cifras[3]`: `valor`, `detalle`; `imagen`) | 1-2 | desdoblable |
| 7 | `solucion-tecnica` | `diagrama-y-filas` (`imagen`, `filas[]`: `tecnologia`, `papel`, 1-4) o `diagrama-y-modulos` (`imagen`, `modulos[]` 1-3, `destacados[]` 0-2) | 1-2 | desdoblable |
| 8 | `prototipo` | `principal-y-secundarias` (`imagenes[]` 1-3, la primera grande) o `dos-capturas` (`imagenes[2]`); `nota`? | 1-2 | desdoblable |
| 9 | `plan-de-horas` | `hitos[]`: `nombre`, `horas` (2-8); `total`?; `unidad`? (`h`); `aviso`?; `nota`? | 1 | barras nativas, tarjeta oscura con el total y aviso «Propuesta — pendiente de validar» |
| 10 | `riesgos` | `riesgos[]`: `titulo`, `pregunta`, `nivel` `alto`/`medio`/`bajo` (2-6) | 1 | rejilla de tarjetas 3 × 2, color y etiqueta por nivel |
| 11 | `proximos-pasos` | `pasos[]` (1-4), `cierre`? («Gracias»), `contacto`? (la `web` de la marca) | 1, la última | pasos numerados sobre el panel oscuro |

Un tipo **desdoblable** puede aparecer dos veces seguidas; la composición del segundo es la que se le indique. Con
todos los desdobles y la agenda salen 14; sin ninguno, 10.

**Imagen** = `{ "fichero", "pie", "ajuste"?: "contain" | "cover", "foco"?: "arriba" | "centro" }`. `contain` (por
defecto) para diagramas y capturas: la imagen entera, a su proporción, dentro de la caja del layout. `cover` para fotos:
la caja llena, recortando lo que sobra desde el foco. El pie va debajo, a la anchura que ocupa la imagen de verdad.

## Límites que se hacen cumplir

| regla | quién la cobra |
|---|---|
| de 10 a 14 diapositivas, tipos conocidos, orden de la tabla, obligatorias presentes, máximos por tipo | `validar-contenido.js` |
| cardinalidad de cada lista y campos obligatorios no vacíos | `validar-contenido.js` |
| `total` del plan = suma de `horas` (el total **se calcula**; si el JSON trae uno, tiene que coincidir) | `validar-contenido.js` |
| notas con su formato y ≤ 1.200 caracteres | `validar-contenido.js` y `comprobar.py` |
| cada texto cabe en su caja a su tamaño (cuerpo ≥ 14 pt, pies ≥ 10 pt); **no se encoge** | `generar.js` (medida) |
| colores de la marca de seis cifras sin `#`; logos e imágenes existen | `generar.js` |
| el `.pptx` abre en PowerPoint | `validate.py` del skill |
| 12192000 × 6858000 EMU, proporción de imagen ≤ 1 %, formas dentro, secciones en orden, letra ≥ 10 pt | `comprobar.py` |

Cualquier fallo sale con 1 y nombra el campo (`contenido.diapositivas[5].imagen.fichero: no existe…`); no se escribe
ningún `.pptx`.

## Notas del orador

Texto plano, siempre en este orden:

```
MENSAJE: <la idea de la diapositiva, en una frase>
GUION:
- <2 a 5 puntos: lo que se dice>
DATOS: <cifras y su fuente; [derivado] si lo propone el avatar>
TRANSICION: <frase puente a la siguiente>   (no aparece en la última)
TIEMPO: <minutos> min
```

En el JSON: `"notas": { "mensaje", "guion": [...], "datos", "transicion" (salvo la última), "tiempo": <número> }`.

## Máquina de estados

```avatar-lang
@id: oferta-resumen

state CONTENIDO_RECIBIDO "contenido.json, marca e imagenes preparados fuera del repo"
state VALIDADO "Estructura, marca, imagenes y medida del texto sin errores"
state CONSTRUIDO "pptx escrito con el tema aplicado, validate.py y comprobar.py en verde"
state REVISADO terminal "PDF y PNG revisados por el humano y pptx entregado donde dijo"

action validar: CONTENIDO_RECIBIDO -> VALIDADO {
  title: "validar las entradas"
  description: "validar-contenido.js y las comprobaciones de generar.js antes de escribir"
  requires: CONTENIDO_RECIBIDO
  produces: VALIDADO
}

action construir: VALIDADO -> CONSTRUIDO {
  title: "construir el pptx"
  description: "generar.js, apply_theme, validate.py y comprobar.py"
  requires: VALIDADO
  produces: CONSTRUIDO
}

action revisar: CONSTRUIDO -> REVISADO {
  title: "revisar el render"
  description: "render.ps1 y topng.py; el humano revisa con la lista de QA visual del skill pptx"
  requires: CONSTRUIDO
  produces: REVISADO
}
```
