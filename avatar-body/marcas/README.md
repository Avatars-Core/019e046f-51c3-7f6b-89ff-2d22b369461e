# marcas — la identidad corporativa que recibe el generador de `.pptx`

Una marca es una carpeta con un `brand.json` y sus logos. El generador la **recibe**: no la diseña ni la corrige.

## Qué se versiona aquí y qué no

**El repo es público.** Aquí solo vive la marca **ficticia** `demo/` («Ejemplo Consultoría»), y de ella solo el
`brand.json` y el script que dibuja sus logos: los PNG se generan y no se versionan.

Las **marcas reales** (de la empresa que presenta o de un cliente) viven **fuera del repo**, en la carpeta que diga la
clave `generadores-pptx.marcas` de `config.local.yaml` (decisión D1 del ciclo `2026-10-06--generar-pptx-oferta`). El
`.gitignore` ignora cualquier carpeta de aquí que no sea `demo/`, y cualquier PNG de `demo/`, para que un descuido no
publique un logo.

## Formato de `brand.json`

```json
{
  "nombre": "Ejemplo Consultoría",
  "empresa": "Ejemplo Consultoría & Asociados",
  "web": "www.ejemplo-consultoria.invalid",
  "tema": {
    "name": "Ejemplo Consultoría",
    "headFontFace": "Calibri",
    "bodyFontFace": "Calibri",
    "colors": { "dk1": "113A3A", "lt1": "FFFFFF", "dk2": "24524F", "lt2": "EEF4F2",
                "accent1": "C8611F", "accent2": "113A3A", "accent3": "24524F", "accent4": "8FB8B0",
                "accent5": "F8E1CF", "accent6": "5E6B68", "hlink": "24524F", "folHlink": "5E6B68" }
  },
  "logos": { "principal": "logo-claro.png", "pie": "logo-pie.png" }
}
```

| campo | regla |
|---|---|
| `nombre`, `empresa` | obligatorios. `empresa` va a las propiedades del `.pptx`; el `&` se escapa solo |
| `web` | opcional; contacto por defecto de la diapositiva de cierre |
| `tema.colors` | las doce ranuras, **seis cifras hexadecimales sin `#`**. Un `#` o un color de ocho cifras corrompen el fichero, así que el generador para y nombra el campo |
| `tema.*FontFace` | por defecto Calibri. Una fuente fuera de la lista segura del skill `pptx` es un **aviso**, no un error |
| `logos.principal` | logo para fondo claro (portada y cierre). Ruta relativa al `brand.json` |
| `logos.pie` | logo pequeño del pie de cada diapositiva de contenido |

**Para qué sirve cada color** en la plantilla `oferta-resumen`: `dk1` es el color dominante (títulos, panel oscuro de
portada y cierre); `accent1` es el acento único (insignias, cifras, destacados); `lt2` y `accent5` son los fondos de las
tarjetas; `accent4` y `accent6` son los tonos de apoyo (subtítulos y pies). Las proporciones de los logos salen de sus
píxeles: cualquier tamaño vale.

## Cómo se da de alta una marca real

1. Crear fuera del repo `<carpeta de marcas>/<empresa>/` con su `brand.json` y sus logos en PNG (mejor en alta resolución).
2. Poner esa carpeta de marcas en `generadores-pptx.marcas` de `config.local.yaml`.
3. Construir con `-Marca <carpeta de marcas>/<empresa>/brand.json`.
