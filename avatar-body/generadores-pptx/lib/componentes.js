// Motivos visuales reutilizables por cualquier plantilla, y la comprobación de que el texto cabe.
//
// Regla de la casa (plan del ciclo 2026-10-06--generar-pptx-oferta): el texto NO se encoge.
// Cada caja de texto se mide antes de añadirse; si el texto no cabe a su tamaño, se anota un
// error con el campo del contenido.json que lo trae, y el generador no escribe el .pptx.
//
// La medida es una estimación conservadora para Calibri (anchura media por tipo de carácter y
// salto de línea por palabras). No sustituye a mirar el render: lo complementa.
"use strict";
const { dimensiones, contain, cover, ocupado } = require("./imagen");

// Anchura aproximada de cada carácter en em (Calibri). Negrita, un 6 % más ancha.
function anchoEm(ch) {
  if (ch === " ") return 0.23;
  if (/[0-9]/.test(ch)) return 0.51;
  if (/[A-ZÁÉÍÓÚÜÑ]/.test(ch)) return 0.6;
  if (/[mwMW@%]/.test(ch)) return 0.8;
  if (/[iljtfrI.,;:'!|()]/.test(ch)) return 0.28;
  return 0.49;
}
function anchoPulgadas(texto, pt, negrita) {
  let em = 0;
  for (const ch of texto) em += anchoEm(ch);
  return (em * pt * (negrita ? 1.06 : 1)) / 72;
}

// Normaliza el contenido de addText a párrafos: [{ pt, negrita, texto, vineta }].
function aParrafos(contenido, opts) {
  const base = { pt: opts.fontSize || 18, negrita: !!opts.bold, vineta: !!opts.bullet };
  const runs = typeof contenido === "string" ? [{ text: contenido, options: {} }] : contenido;
  const parrafos = [];
  let actual = null;
  for (const r of runs) {
    const o = r.options || {};
    const trozos = String(r.text).split("\n");
    trozos.forEach((t, i) => {
      if (!actual) actual = { pt: 0, negrita: false, texto: "", vineta: base.vineta || !!o.bullet };
      actual.pt = Math.max(actual.pt, o.fontSize || base.pt);
      actual.negrita = actual.negrita || (o.bold ?? base.negrita);
      actual.texto += t;
      if (i < trozos.length - 1) { parrafos.push(actual); actual = null; }
    });
    if (o.breakLine && actual) { parrafos.push(actual); actual = null; }
  }
  if (actual) parrafos.push(actual);
  return parrafos;
}

// Devuelve { cabe, lineas, altoPt, motivo } para un texto en una caja (pulgadas).
function medir(contenido, opts) {
  const margen = opts.margin === 0 ? 0 : 0.1;
  const parrafos = aParrafos(contenido, opts);
  let altoPt = 0;
  let lineas = 0;
  for (const p of parrafos) {
    const ancho = opts.w - 2 * margen - (p.vineta ? 0.35 : 0);
    let n = 1;
    let linea = 0;
    for (const palabra of p.texto.split(/\s+/).filter(Boolean)) {
      const a = anchoPulgadas(palabra, p.pt, p.negrita);
      if (a > ancho) return { cabe: false, motivo: `la palabra «${palabra}» no cabe en una línea de ${ancho.toFixed(2)}" a ${p.pt} pt` };
      const conEspacio = linea === 0 ? a : linea + anchoPulgadas(" ", p.pt, p.negrita) + a;
      if (conEspacio > ancho) { n += 1; linea = a; } else linea = conEspacio;
    }
    lineas += n;
    altoPt += n * p.pt * 1.2;
  }
  altoPt += (opts.paraSpaceAfter || 0) * Math.max(0, parrafos.length - 1);
  const disponible = (opts.h - (opts.margin === 0 ? 0 : 0.1)) * 72;
  return { cabe: altoPt <= disponible * 1.02, lineas, altoPt, disponible };
}

function crearKit(pres, marca, errores) {
  const C = pres.SchemeColor;
  const HEX = marca.tema.colors;
  const sombra = () => ({ type: "outer", color: "000000", opacity: 0.14, blur: 6, offset: 2, angle: 90 });

  // Añade texto midiendo antes. `campo` = ruta del contenido.json que trae el texto.
  function texto(slide, campo, contenido, opts) {
    const o = { margin: 0, isTextBox: true, ...opts };
    const m = medir(contenido, o);
    if (!m.cabe) {
      errores.push({
        campo,
        motivo: m.motivo || `no cabe: necesita ~${m.lineas} línea(s) (${Math.round(m.altoPt)} pt de alto) y la caja da ${Math.round(m.disponible)} pt. Acórtalo: la plantilla no encoge el texto.`,
      });
    }
    slide.addText(contenido, o);
  }

  function tarjeta(slide, caja, relleno) {
    const color = relleno || C.background2;
    slide.addShape(pres.shapes.RECTANGLE, { ...caja, fill: { color }, line: { color }, shadow: sombra(), objectName: "Tarjeta" });
  }

  function circuloNumerado(slide, n, x, y, d, pt, relleno) {
    const color = relleno || C.accent1;
    slide.addShape(pres.shapes.OVAL, { x, y, w: d, h: d, fill: { color }, line: { color }, objectName: `Círculo ${n}` });
    slide.addText(String(n), { x, y, w: d, h: d, fontSize: pt, bold: true, color: C.background1, align: "center", valign: "middle", margin: 0, isTextBox: true, objectName: `Número ${n}` });
  }

  // Número de bloque en círculo de acento, junto al título (motivo de la plantilla).
  function insignia(slide, n) {
    circuloNumerado(slide, n, 0.6, 0.45, 0.75, 22);
  }

  // Coloca una imagen en una caja respetando sus píxeles reales. Devuelve la caja ocupada.
  function imagen(slide, campo, ruta, caja, opts = {}) {
    let px;
    try {
      px = dimensiones(ruta);
    } catch (e) {
      errores.push({ campo, motivo: e.message });
      return { ...caja };
    }
    const colocada = opts.ajuste === "cover" ? cover(caja, px, opts.foco) : contain(caja, px, opts.alinear);
    slide.addImage({ path: ruta, ...colocada, shadow: opts.sombra === false ? undefined : sombra(), altText: opts.alt || "", objectName: opts.nombre || "Imagen" });
    return ocupado(colocada);
  }

  function pieDeImagen(slide, campo, t, x, y, w) {
    texto(slide, campo, t, { x, y, w, h: 0.3, fontSize: 11, italic: true, color: C.accent6, align: "center", objectName: "Pie de imagen" });
  }

  return { C, HEX, texto, tarjeta, circuloNumerado, insignia, imagen, pieDeImagen, sombra };
}

module.exports = { crearKit, medir };
