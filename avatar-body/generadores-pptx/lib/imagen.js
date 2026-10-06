// Geometría de imágenes a partir de sus píxeles reales. Ningún número de proporción vive en el
// código: si cambia una imagen, cambia su caja, y nada se deforma en silencio.
//
//   contain(caja, img, alinear) -> { x, y, w, h }            la imagen entera dentro de la caja
//   cover(caja, img, foco)      -> { x, y, w, h, sizing }     la caja llena, recortando lo que sobra
//
// `caja` = { x, y, w, h } en pulgadas; `img` = { w, h } en píxeles.
"use strict";
const fs = require("fs");
const { imageSize } = require("image-size");

function dimensiones(ruta) {
  if (!fs.existsSync(ruta)) throw new Error(`no existe la imagen "${ruta}"`);
  const d = imageSize(fs.readFileSync(ruta));
  if (!d || !d.width || !d.height) throw new Error(`no se pueden leer las dimensiones de "${ruta}"`);
  // EXIF: una foto girada 90° se ve con los lados cambiados.
  const girada = d.orientation && d.orientation >= 5;
  return girada ? { w: d.height, h: d.width } : { w: d.width, h: d.height };
}

// alinear.h: "izquierda" | "centro" | "derecha"; alinear.v: "arriba" | "centro" | "abajo".
function contain(caja, img, alinear = {}) {
  const escala = Math.min(caja.w / img.w, caja.h / img.h);
  const w = img.w * escala;
  const h = img.h * escala;
  const libreX = caja.w - w;
  const libreY = caja.h - h;
  const fx = { izquierda: 0, centro: 0.5, derecha: 1 }[alinear.h || "centro"];
  const fy = { arriba: 0, centro: 0.5, abajo: 1 }[alinear.v || "arriba"];
  return { x: caja.x + libreX * fx, y: caja.y + libreY * fy, w, h };
}

// foco: "arriba" | "centro". La forma ocupa la caja; `sizing.crop` de pptxgenjs recorta la
// imagen escalada (w, h) por la ventana (sizing.x, sizing.y, caja.w, caja.h).
function cover(caja, img, foco = "centro") {
  const escala = Math.max(caja.w / img.w, caja.h / img.h);
  const w = img.w * escala;
  const h = img.h * escala;
  const cx = (w - caja.w) / 2;
  const cy = foco === "arriba" ? 0 : (h - caja.h) / 2;
  return { x: caja.x, y: caja.y, w, h, sizing: { type: "crop", x: cx, y: cy, w: caja.w, h: caja.h } };
}

// Caja final que ocupa en la diapositiva lo que devuelven contain/cover.
function ocupado(colocada) {
  return colocada.sizing
    ? { x: colocada.x, y: colocada.y, w: colocada.sizing.w, h: colocada.sizing.h }
    : { x: colocada.x, y: colocada.y, w: colocada.w, h: colocada.h };
}

module.exports = { dimensiones, contain, cover, ocupado };
