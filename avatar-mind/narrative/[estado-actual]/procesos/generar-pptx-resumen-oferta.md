# Proceso: generar el `.pptx` de un resumen de oferta

> Cómo pasa `slide-architect` de un esqueleto a un `.pptx` validado con la plantilla `oferta-resumen`. Contrato de la
> plantilla: [`scaa/plantillas-pptx/oferta-resumen.md`](../../../scaa/plantillas-pptx/oferta-resumen.md). Código y uso de
> las herramientas: [`avatar-body/generadores-pptx/README.md`](../../../../avatar-body/generadores-pptx/README.md).
> Nació en el ciclo `2026-10-06--generar-pptx-oferta`.

## Cuándo se usa

Cuando el humano, o un avatar que encarga el deck, pide el `.pptx` final de un resumen de oferta de proyecto. Si lo
encarga **otro avatar**, el encargo llega por su ventana y `SendMessage` (proceso `coordinar-con-otros-avatares` de
essence), y su contenido, su marca y sus imágenes **se quedan fuera de este repo**.

## La regla que no se negocia

**El repo es público.** Nada de un cliente o proveedor real entra en git: ni el `contenido.json`, ni la marca, ni las
imágenes, ni el `.pptx`, ni el PDF, ni los PNG. Todo eso vive en carpetas locales que dice `config.local.yaml`
(`generadores-pptx.salidas` y `generadores-pptx.marcas`) o en la ruta que dé el humano. Antes de cualquier commit,
`git status` no debe listar nada de eso.

## Pasos

1. **Preparar el sitio, una vez por máquina.** `npm install` en `avatar-body/generadores-pptx/`; `config.local.yaml`
   con `generadores-pptx.salidas` y `generadores-pptx.marcas` (y `skill-pptx` solo si el skill no se encuentra solo).
   `node lib/skill-pptx.js` debe imprimir la carpeta del skill `pptx`.
2. **Partir del esqueleto vigente.** El `.md` de la presentación (en `scaa/presentaciones/` o el que entregue el avatar
   que encarga) es la fuente. Si el contenido aún no está ordenado, se ordena primero en el esqueleto, no en el JSON.
3. **Derivar el `contenido.json`** (decisión D3): cada sección del esqueleto va al `tipo` que le toca según la tabla del
   contrato; las notas del orador salen de las notas del esqueleto con el formato fijo. Lo que propone el avatar y no
   viene del cliente se marca `[derivado]` en `DATOS`. Se guarda **fuera del repo**, junto a sus imágenes.
4. **Comprobar la estructura**: `node oferta-resumen/validar-contenido.js <contenido.json>`. Cada error dice el campo.
5. **Construir**: `herramientas/construir.ps1 -Contenido … -Marca <marcas>/<empresa>/brand.json -Imagenes … -Salida …
   -Prohibidas "<nombres que no deben aparecer>"`. Encadena generar, `validate.py`, `comprobar.py`, render y PNG, y para
   al primer fallo. En `-Prohibidas` van, por ejemplo, el nombre de otro cliente cuyo deck sirvió de base.
6. **Corregir en la entrada, nunca en el `.pptx`.** Si un texto no cabe, se acorta en el JSON (la plantilla no encoge
   la letra); si una imagen se ve mal, se cambia la imagen; si falta una composición, se cambia la plantilla en un ciclo.
   No se retoca a mano un deck generado: la próxima regeneración borraría el retoque.
7. **Revisar el render.** Los PNG de `png/` se miran con la lista de QA visual del skill `pptx` (desbordes,
   solapes, márgenes, contraste, títulos a la misma altura). La revisión final es del humano.
8. **Entregar** en la ruta que diga el humano, con el nombre que pida. Si lo encargó otro avatar, se le dice dónde
   está, no se copia a su repo.

## Qué hace el avatar y qué no

- **Sí**: deriva el JSON, elige composiciones, construye, valida, revisa y propone cortes de texto.
- **No**: diseña la marca (la recibe), inventa contenido del cliente (lo recibe, y marca `[derivado]` lo suyo) ni
  publica nada del cliente.

## Máquina de estados

```avatar-lang
@id: generar-pptx-resumen-oferta

state ENCARGO_RECIBIDO "Peticion de pptx con esqueleto, marca e imagenes identificados"
state CONTENIDO_DERIVADO "contenido.json derivado del esqueleto, fuera del repo, y valido para validar-contenido.js"
state DECK_CONSTRUIDO "construir.ps1 sale con 0: pptx, PDF y PNG en la carpeta de salidas"
state DECK_ENTREGADO terminal "Humano reviso el render y el pptx esta donde dijo; nada del cliente en git"

action derivar-contenido: ENCARGO_RECIBIDO -> CONTENIDO_DERIVADO {
  title: "derivar el contenido"
  description: "Traducir el esqueleto al contenido.json de la plantilla, marcando [derivado] lo propio"
  requires: ENCARGO_RECIBIDO
  produces: CONTENIDO_DERIVADO
}

action construir-deck: CONTENIDO_DERIVADO -> DECK_CONSTRUIDO {
  title: "construir el deck"
  description: "construir.ps1 con contenido, marca, imagenes y palabras prohibidas; corregir en la entrada"
  requires: CONTENIDO_DERIVADO
  produces: DECK_CONSTRUIDO
}

action entregar-deck: DECK_CONSTRUIDO -> DECK_ENTREGADO {
  title: "revisar y entregar"
  description: "QA visual del humano sobre los PNG y entrega en su ruta, con git status limpio de material del cliente"
  requires: DECK_CONSTRUIDO
  produces: DECK_ENTREGADO
}
```
