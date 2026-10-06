// Generador de la plantilla «oferta-resumen» (resumen de oferta de proyecto, 10-14 diapositivas 16:9).
//
//   node generar.js --contenido <contenido.json> --marca <brand.json> --imagenes <dir> --salida <fichero.pptx>
//
// Tres entradas separadas —contenido, marca e imágenes— y ninguna vive en el código.
// Contrato de la plantilla: avatar-mind/scaa/plantillas-pptx/oferta-resumen.md.
// Si algo no cuadra (estructura, color, imagen, texto que no cabe), sale con 1, dice el campo y
// el motivo, y no escribe ningún .pptx. Escribe primero a un temporal y lo renombra al final.
//
// Adaptado del deck.js del avatar 01a10c4d-41b7-7540-9a80-167285ca3a73 (generadores-entregable/resumen,
// 2026-10-05): misma estructura de tema, layouts y motivos; sin su contenido, su marca ni sus imágenes.
"use strict";
const fs = require("fs");
const path = require("path");
const pptxgen = require("pptxgenjs");
const { cargarApplyTheme } = require("../lib/skill-pptx");
const { cargarMarca, ErrorDeEntrada } = require("../lib/marca");
const { crearKit, medir } = require("../lib/componentes");
const { contain } = require("../lib/imagen");
const { componerNotas } = require("../lib/notas");
const { validarEstructura, PLANTILLA } = require("./validar-contenido");

const W = 13.333;
const H = 7.5;
const M = 0.6;

function argumentos(argv) {
  const a = {};
  for (let i = 2; i < argv.length; i += 2) {
    const k = argv[i];
    if (!k.startsWith("--")) throw new Error(`argumento inesperado "${k}"`);
    a[k.slice(2)] = argv[i + 1];
  }
  for (const k of ["contenido", "marca", "imagenes", "salida"]) {
    if (!a[k]) throw new Error(`falta --${k}. Uso: node generar.js --contenido <json> --marca <brand.json> --imagenes <dir> --salida <pptx>`);
  }
  return a;
}

function construir(contenido, marca, dirImagenes) {
  const errores = [];
  const pres = new pptxgen();
  pres.layout = "LAYOUT_WIDE";
  pres.theme = { headFontFace: marca.tema.headFontFace, bodyFontFace: marca.tema.bodyFontFace };
  pres.author = marca.nombre;
  pres.company = marca.empresaXml;
  pres.title = `${contenido.meta.cliente} · ${contenido.meta.proyecto} · ${contenido.meta.titulo}`;
  const k = crearKit(pres, marca, errores);
  const { C, HEX, texto, tarjeta, circuloNumerado, insignia, imagen, pieDeImagen } = k;
  const ruta = (f) => path.resolve(dirImagenes, f);
  const meta = contenido.meta;

  // ---------- layouts (marco de cada diapositiva; el contenido se compone encima) ----------
  const logoPrincipal = contain({ x: 0.8, y: 0.8, w: 3.6, h: 1.4 }, marca.logos.principal, { h: "izquierda", v: "arriba" });
  const panelOscuro = { rect: { x: 5.2, y: 0, w: W - 5.2, h: H, fill: { color: C.text1 } } };
  for (const nombre of ["PORTADA", "CIERRE"]) {
    pres.defineSlideMaster({
      title: nombre,
      background: { color: C.background1 },
      objects: [panelOscuro, { image: { ...logoPrincipal, path: marca.logos.principal.ruta } }],
    });
  }
  const logoPie = contain({ x: W - M - 1.4, y: H - 0.56, w: 1.4, h: 0.42 }, marca.logos.pie, { h: "derecha", v: "centro" });
  pres.defineSlideMaster({
    title: "CONTENIDO",
    background: { color: C.background1 },
    margin: [0.5, M, 0.6, M],
    objects: [
      { image: { ...logoPie, path: marca.logos.pie.ruta } },
      { text: { text: meta.pie, options: { x: M, y: H - 0.5, w: 7.5, h: 0.35, fontSize: 10, color: C.accent6, margin: 0 } } },
      { placeholder: { options: { name: "title", type: "title", x: 1.45, y: 0.4, w: W - 2.05, h: 0.85, fontSize: 30, bold: true, color: C.text1, valign: "middle", align: "left", margin: 0 }, text: "" } },
    ],
    slideNumber: { x: W - M - 2.1, y: H - 0.5, w: 0.5, h: 0.35, fontSize: 10, color: C.accent1, bold: true },
  });

  const seccionDe = Object.fromEntries(PLANTILLA.tipos.map((t) => [t.tipo, t.seccion]));
  const contenidas = PLANTILLA.secciones.filter((s) => s !== "Apertura" && s !== "Cierre");
  let seccionActual = null;

  function nueva(d, i, layout) {
    const seccion = seccionDe[d.tipo];
    if (seccion !== seccionActual) { pres.addSection({ title: seccion }); seccionActual = seccion; }
    const s = pres.addSlide({ masterName: layout, sectionTitle: seccion });
    if (layout === "CONTENIDO") {
      // El título va en el placeholder; se mide con la geometría del layout.
      const opts = { x: 1.45, y: 0.4, w: W - 2.05, h: 0.85, fontSize: 30, bold: true, margin: 0 };
      const m = medir(d.titulo, opts);
      if (!m.cabe) errores.push({ campo: `diapositivas[${i}].titulo`, motivo: `no cabe en una línea a 30 pt; acórtalo` });
      s.addText(d.titulo, { placeholder: "title" });
      const n = contenidas.indexOf(seccion);
      if (n >= 0) insignia(s, n + 1);
    }
    return s;
  }

  // Imagen con su pie debajo, a la anchura que ocupa de verdad.
  function imagenConPie(s, campo, img, caja, alinear) {
    const occ = imagen(s, `${campo}.fichero`, ruta(img.fichero), caja, { ajuste: img.ajuste, foco: img.foco, alinear, alt: img.pie });
    pieDeImagen(s, `${campo}.pie`, img.pie, occ.x, occ.y + occ.h + 0.08, occ.w);
    return occ;
  }

  const ds = contenido.diapositivas;
  ds.forEach((d, i) => {
    const campo = `diapositivas[${i}]`;
    const comp = d.composicion || (PLANTILLA.tipos.find((t) => t.tipo === d.tipo).composiciones || [])[0];
    let s;
    switch (d.tipo) {
      case "portada": {
        s = nueva(d, i, "PORTADA");
        texto(s, "meta.presenta", `Presenta: ${meta.presenta}`, { x: 0.8, y: 5.65, w: 4.1, h: 0.45, fontSize: 14, bold: true, color: C.text1 });
        texto(s, "meta.version", `${meta.version} · ${meta.fecha}`, { x: 0.8, y: 6.12, w: 4.1, h: 0.4, fontSize: 12, color: C.accent6 });
        s.addShape(pres.shapes.RECTANGLE, { x: 5.9, y: 1.9, w: 6.9, h: 2.0, fill: { color: C.accent1 }, line: { color: C.accent1 }, objectName: "Banda del título" });
        texto(s, "meta.cliente", [
          { text: meta.cliente.toUpperCase(), options: { breakLine: true } },
          { text: meta.proyecto.toUpperCase() },
        ], { x: 6.15, y: 1.9, w: 6.45, h: 2.0, fontSize: 30, bold: true, color: C.background1, align: "right", valign: "middle" });
        texto(s, "meta.titulo", meta.titulo, { x: 5.9, y: 4.15, w: 6.9, h: 0.6, fontSize: 26, color: C.background1, align: "right" });
        if (meta.subtitulo) texto(s, "meta.subtitulo", meta.subtitulo, { x: 5.9, y: 4.8, w: 6.9, h: 0.9, fontSize: 15, color: C.accent4, align: "right", valign: "top" });
        break;
      }
      case "agenda": {
        s = nueva(d, i, "CONTENIDO");
        const izquierda = Math.ceil(d.puntos.length / 2);
        d.puntos.forEach((p, j) => {
          const col = j < izquierda ? 0 : 1;
          const fila = col === 0 ? j : j - izquierda;
          const x = M + col * 6.2;
          const y = 1.65 + fila * 1.2;
          circuloNumerado(s, j + 1, x, y + 0.12, 0.66, 18);
          const runs = [{ text: p.titulo, options: { bold: true, fontSize: 18, color: C.text1, breakLine: !!p.detalle } }];
          if (p.detalle) runs.push({ text: p.detalle, options: { fontSize: 14, color: C.accent6 } });
          texto(s, `${campo}.puntos[${j}]`, runs, { x: x + 0.85, y, w: 5.1, h: 0.9, valign: "middle" });
        });
        break;
      }
      case "que-y-para-quien": {
        s = nueva(d, i, "CONTENIDO");
        d.cifras.forEach((c, j) => {
          const x = M + j * 4.1, y = 1.8, w = 3.8, h = 3.6;
          tarjeta(s, { x, y, w, h });
          texto(s, `${campo}.cifras[${j}].etiqueta`, c.etiqueta.toUpperCase(), { x: x + 0.3, y: y + 0.3, w: w - 0.6, h: 0.35, fontSize: 12, bold: true, color: C.accent1, charSpacing: 2 });
          texto(s, `${campo}.cifras[${j}].valor`, c.valor, { x: x + 0.3, y: y + 0.75, w: w - 0.6, h: 1.4, fontSize: c.valor.length <= 6 ? 60 : 28, bold: true, color: C.text1, valign: "middle" });
          texto(s, `${campo}.cifras[${j}].detalle`, c.detalle, { x: x + 0.3, y: y + 2.3, w: w - 0.6, h: 1.05, fontSize: 15, color: C.text2, valign: "top" });
        });
        if (d.fueraDeAlcance) {
          texto(s, `${campo}.fueraDeAlcance`, [
            { text: "Fuera del alcance: ", options: { bold: true } },
            { text: d.fueraDeAlcance },
          ], { x: M, y: 5.75, w: W - 2 * M, h: 0.75, fontSize: 14, italic: true, color: C.accent6, valign: "top" });
        }
        break;
      }
      case "por-que-ahora": {
        s = nueva(d, i, "CONTENIDO");
        const y0 = 2.85, x0 = 0.9, ancho = W - 2 * x0;
        s.addShape(pres.shapes.LINE, { x: x0, y: y0, w: ancho, h: 0, line: { color: C.accent4, width: 2 }, objectName: "Línea de tiempo" });
        const n = d.hitos.length, col = ancho / n;
        d.hitos.forEach((h, j) => {
          const x = x0 + j * col, w = col - 0.3, ultimo = j === n - 1;
          s.addShape(pres.shapes.OVAL, { x: x + w / 2 - 0.22, y: y0 - 0.22, w: 0.44, h: 0.44, fill: { color: ultimo ? C.accent1 : C.text1 }, line: { color: C.background1, width: 2 }, objectName: `Hito ${j + 1}` });
          texto(s, `${campo}.hitos[${j}].fecha`, h.fecha, { x, y: 1.75, w, h: 0.6, fontSize: 24, bold: true, color: ultimo ? C.accent1 : C.text1, align: "center" });
          texto(s, `${campo}.hitos[${j}]`, [
            { text: h.titulo, options: { bold: true, fontSize: 17, breakLine: true } },
            { text: h.detalle, options: { fontSize: 14 } },
          ], { x, y: 3.3, w, h: 1.55, align: "center", valign: "top", color: C.text2 });
        });
        if (d.destacado) {
          tarjeta(s, { x: x0, y: 5.1, w: ancho, h: 1.1 }, C.accent5);
          texto(s, `${campo}.destacado`, [
            { text: `${d.destacado.etiqueta}: `, options: { bold: true, color: C.accent1 } },
            { text: d.destacado.texto },
          ], { x: x0 + 0.3, y: 5.1, w: ancho - 0.6, h: 1.1, fontSize: 16, color: C.text1, valign: "middle" });
        }
        break;
      }
      case "idea-clave": {
        s = nueva(d, i, "CONTENIDO");
        texto(s, `${campo}.frase`, d.frase.map((l, j) => ({ text: l, options: { breakLine: j < d.frase.length - 1, color: j === 0 ? C.text1 : C.accent1 } })),
          { x: M, y: 1.6, w: 6.6, h: 2.3, fontSize: 32, bold: true, valign: "top" });
        texto(s, `${campo}.puntos`, d.puntos.map((p, j) => ({ text: p, options: { bullet: true, breakLine: j < d.puntos.length - 1 } })),
          { x: M, y: 4.05, w: 6.6, h: 2.4, fontSize: 16, color: C.text2, paraSpaceAfter: 10, valign: "top" });
        imagenConPie(s, `${campo}.imagen`, d.imagen, { x: 7.7, y: 1.45, w: 5.03, h: 4.85 }, { h: "centro", v: "arriba" });
        break;
      }
      case "modelo-funcional": {
        s = nueva(d, i, "CONTENIDO");
        if (comp === "cifras-y-diagrama") {
          d.cifras.forEach((c, j) => {
            const x = M + j * 4.1;
            texto(s, `${campo}.cifras[${j}].valor`, c.valor, { x, y: 1.45, w: 3.8, h: 0.8, fontSize: 36, bold: true, color: C.accent1 });
            texto(s, `${campo}.cifras[${j}].detalle`, c.detalle, { x, y: 2.25, w: 3.8, h: 0.7, fontSize: 14, color: C.text2, valign: "top" });
          });
          imagenConPie(s, `${campo}.imagen`, d.imagen, { x: M, y: 3.1, w: W - 2 * M, h: 3.25 }, { h: "centro", v: "arriba" });
        } else {
          const occ = imagenConPie(s, `${campo}.imagen`, d.imagen, { x: M, y: 1.5, w: 7.85, h: 3.95 }, { h: "izquierda", v: "arriba" });
          if (d.texto) texto(s, `${campo}.texto`, d.texto, { x: M, y: occ.y + occ.h + 0.5, w: 7.85, h: 0.65, fontSize: 14, color: C.text2, valign: "top" });
          const x = 8.75, w = W - M - 8.75;
          d.tarjetas.forEach((t, j) => {
            const y = 1.5 + j * 2.6;
            tarjeta(s, { x, y, w, h: 2.4 }, j === 1 ? C.accent5 : C.background2);
            texto(s, `${campo}.tarjetas[${j}]`, [
              { text: t.titulo, options: { bold: true, fontSize: 20, color: j === 1 ? C.accent1 : C.text1, breakLine: true } },
              { text: t.texto, options: { fontSize: 15, color: C.text1 } },
            ], { x: x + 0.3, y: y + 0.2, w: w - 0.6, h: 2.0, valign: "top" });
          });
        }
        break;
      }
      case "solucion-tecnica": {
        s = nueva(d, i, "CONTENIDO");
        if (comp === "diagrama-y-modulos") {
          imagenConPie(s, `${campo}.imagen`, d.imagen, { x: M, y: 1.5, w: 5.1, h: 4.85 }, { h: "izquierda", v: "arriba" });
          const x = 6.0, w = W - M - 6.0, n = d.modulos.length, cw = (w - (n - 1) * 0.11) / n;
          d.modulos.forEach((mo, j) => {
            const xx = x + j * (cw + 0.11);
            tarjeta(s, { x: xx, y: 1.55, w: cw, h: 2.0 });
            texto(s, `${campo}.modulos[${j}]`, [
              { text: mo.titulo, options: { bold: true, fontSize: 16, color: C.text1, breakLine: true } },
              { text: mo.texto, options: { fontSize: 14, color: C.text2 } },
            ], { x: xx + 0.15, y: 1.65, w: cw - 0.3, h: 1.8, valign: "top" });
          });
          (d.destacados || []).forEach((de, j) => {
            const y = 3.8 + j * 1.5;
            tarjeta(s, { x, y, w, h: 1.25 }, j === 0 ? C.accent5 : C.background2);
            texto(s, `${campo}.destacados[${j}]`, [
              { text: `${de.etiqueta}: `, options: { bold: true, color: C.accent1 } },
              { text: de.texto },
            ], { x: x + 0.25, y, w: w - 0.5, h: 1.25, fontSize: 15, color: C.text1, valign: "middle" });
          });
        } else {
          imagenConPie(s, `${campo}.imagen`, d.imagen, { x: M, y: 1.5, w: 6.2, h: 4.85 }, { h: "izquierda", v: "arriba" });
          const x = 7.1, w = W - M - 7.1;
          d.filas.forEach((f, j) => {
            const y = 1.55 + j * 1.3;
            tarjeta(s, { x, y, w, h: 1.1 });
            texto(s, `${campo}.filas[${j}].tecnologia`, f.tecnologia, { x: x + 0.25, y, w: 1.75, h: 1.1, fontSize: 18, bold: true, color: C.accent1, valign: "middle" });
            texto(s, `${campo}.filas[${j}].papel`, f.papel, { x: x + 2.05, y, w: w - 2.3, h: 1.1, fontSize: 14, color: C.text1, valign: "middle" });
          });
        }
        break;
      }
      case "prototipo": {
        s = nueva(d, i, "CONTENIDO");
        let fondo = 1.5;
        if (comp === "dos-capturas") {
          const w = (W - 2 * M - 0.33) / 2;
          d.imagenes.forEach((img, j) => {
            const occ = imagenConPie(s, `${campo}.imagenes[${j}]`, img, { x: M + j * (w + 0.33), y: 1.5, w, h: 4.4 }, { h: "centro", v: "centro" });
            fondo = Math.max(fondo, occ.y + occ.h + 0.4);
          });
        } else {
          const [principal, ...secundarias] = d.imagenes;
          const occ = imagenConPie(s, `${campo}.imagenes[0]`, principal, { x: M, y: 1.5, w: 7.78, h: 4.45 }, { h: "izquierda", v: "arriba" });
          fondo = occ.y + occ.h + 0.4;
          const alto = secundarias.length === 2 ? 2.25 : 4.45;
          secundarias.forEach((img, j) => {
            imagenConPie(s, `${campo}.imagenes[${j + 1}]`, img, { x: 8.73, y: 1.5 + j * 2.75, w: W - M - 8.73, h: alto }, { h: "izquierda", v: "arriba" });
          });
        }
        if (d.nota) texto(s, `${campo}.nota`, d.nota, { x: M, y: Math.max(fondo, 6.3), w: 7.78, h: 0.4, fontSize: 14, bold: true, color: C.text2 });
        break;
      }
      case "plan-de-horas": {
        s = nueva(d, i, "CONTENIDO");
        const unidad = d.unidad || "h";
        const total = d.hitos.reduce((a, h) => a + h.horas, 0);
        const aviso = d.aviso || "Propuesta — pendiente de validar";
        s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: M, y: 1.45, w: 4.6, h: 0.5, rectRadius: 0.1, fill: { color: C.accent5 }, line: { color: C.accent1, width: 1 }, objectName: "Aviso" });
        texto(s, `${campo}.aviso`, aviso, { x: M, y: 1.45, w: 4.6, h: 0.5, fontSize: 15, bold: true, color: C.accent1, align: "center", valign: "middle" });
        const maximo = Math.max(...d.hitos.map((h) => h.horas));
        s.addChart(pres.charts.BAR, [{ name: unidad, labels: d.hitos.map((h) => h.nombre), values: d.hitos.map((h) => h.horas) }], {
          x: M, y: 2.15, w: 8.6, h: 4.5, barDir: "bar", catAxisOrientation: "maxMin",
          chartColors: [HEX.accent1], showValue: true, dataLabelPosition: "outEnd", dataLabelFormatCode: `0" ${unidad}"`,
          dataLabelColor: HEX.dk1, dataLabelFontSize: 13, dataLabelFontFace: "+mn-lt",
          catAxisLabelColor: HEX.dk1, catAxisLabelFontSize: 13, catAxisLabelFontFace: "+mn-lt", valAxisHidden: true,
          valAxisMaxVal: Math.ceil((maximo * 1.35) / 5) * 5, valGridLine: { style: "none" }, catGridLine: { style: "none" },
          showLegend: false, barGapWidthPct: 60, showTitle: false, objectName: "Gráfico del plan",
        });
        tarjeta(s, { x: 9.7, y: 2.15, w: W - M - 9.7, h: 4.5 }, C.text1);
        const runs = [
          { text: `${total} ${unidad}`, options: { fontSize: 54, bold: true, color: C.background1, breakLine: true } },
          { text: "en total", options: { fontSize: 16, color: C.accent4, breakLine: !!d.nota } },
        ];
        if (d.nota) runs.push({ text: d.nota, options: { fontSize: 15, color: C.background1 } });
        texto(s, `${campo}.nota`, runs, { x: 9.95, y: 2.35, w: W - M - 9.95 - 0.25, h: 4.1, valign: "middle", paraSpaceAfter: 6 });
        break;
      }
      case "riesgos": {
        s = nueva(d, i, "CONTENIDO");
        const estilo = {
          alto: { relleno: C.accent5, titulo: C.accent1, pastilla: C.accent1, letra: C.background1 },
          medio: { relleno: C.background2, titulo: C.text1, pastilla: C.text2, letra: C.background1 },
          bajo: { relleno: C.background1, titulo: C.text1, pastilla: C.accent4, letra: C.text1 },
        };
        d.riesgos.forEach((r, j) => {
          const col = j % 3, fila = Math.floor(j / 3);
          const x = M + col * 4.1, y = 1.6 + fila * 2.45, w = 3.8, h = 2.2, e = estilo[r.nivel];
          tarjeta(s, { x, y, w, h }, e.relleno);
          s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: x + w - 1.1, y: y + 0.3, w: 0.85, h: 0.32, rectRadius: 0.08, fill: { color: e.pastilla }, line: { color: e.pastilla }, objectName: "Nivel" });
          texto(s, `${campo}.riesgos[${j}].nivel`, r.nivel.toUpperCase(), { x: x + w - 1.1, y: y + 0.3, w: 0.85, h: 0.32, fontSize: 10, bold: true, color: e.letra, align: "center", valign: "middle" });
          texto(s, `${campo}.riesgos[${j}].titulo`, r.titulo, { x: x + 0.3, y: y + 0.22, w: w - 1.5, h: 0.5, fontSize: 18, bold: true, color: e.titulo, valign: "middle" });
          texto(s, `${campo}.riesgos[${j}].pregunta`, r.pregunta, { x: x + 0.3, y: y + 0.85, w: w - 0.6, h: 1.2, fontSize: 15, color: C.text1, valign: "top" });
        });
        break;
      }
      case "proximos-pasos": {
        s = nueva(d, i, "CIERRE");
        texto(s, `${campo}.cierre`, d.cierre || "Gracias", { x: 0.8, y: 3.0, w: 4.0, h: 0.8, fontSize: 36, bold: true, color: C.text1 });
        const contacto = d.contacto || marca.web;
        if (contacto) texto(s, `${campo}.contacto`, contacto, { x: 0.8, y: 3.8, w: 4.1, h: 0.5, fontSize: 16, color: C.accent1 });
        texto(s, `${campo}.titulo`, d.titulo || "Próximos pasos", { x: 5.9, y: 0.8, w: 6.9, h: 0.8, fontSize: 32, bold: true, color: C.background1 });
        d.pasos.forEach((p, j) => {
          const y = 2.0 + j * 1.15;
          circuloNumerado(s, j + 1, 5.9, y + 0.1, 0.66, 18);
          texto(s, `${campo}.pasos[${j}]`, p, { x: 6.8, y, w: 6.0, h: 0.86, fontSize: 18, color: C.background1, valign: "middle" });
        });
        break;
      }
      default:
        errores.push({ campo: `${campo}.tipo`, motivo: `tipo sin composición: "${d.tipo}"` });
        return;
    }
    s.addNotes(componerNotas(d.notas, i === ds.length - 1));
  });
  return { pres, errores };
}

async function main() {
  let a;
  try { a = argumentos(process.argv); } catch (e) { console.error(e.message); return 2; }
  const informar = (errores) => { for (const e of errores) console.error(`${e.campo}: ${e.motivo}`); };

  let contenido;
  try { contenido = JSON.parse(fs.readFileSync(a.contenido, "utf8")); } catch (e) { console.error(`contenido: no se puede leer como JSON (${e.message})`); return 1; }
  const estructura = validarEstructura(contenido);
  if (estructura.length) { informar(estructura.map((e) => ({ ...e, campo: `contenido.${e.campo}` }))); return 1; }

  let marca;
  try { marca = cargarMarca(a.marca); } catch (e) {
    if (e instanceof ErrorDeEntrada) { informar(e.errores); return 1; }
    throw e;
  }
  if (!fs.existsSync(a.imagenes)) { console.error(`imagenes: no existe la carpeta "${a.imagenes}"`); return 1; }

  const { pres, errores } = construir(contenido, marca, a.imagenes);
  if (errores.length) { informar(errores.map((e) => ({ ...e, campo: `contenido.${e.campo}` }))); console.error("no se ha escrito ningún .pptx"); return 1; }

  const applyTheme = cargarApplyTheme();
  const salida = path.resolve(a.salida);
  fs.mkdirSync(path.dirname(salida), { recursive: true });
  const temporal = salida.replace(/\.pptx$/i, "") + `.tmp-${process.pid}.pptx`;
  try {
    await pres.writeFile({ fileName: temporal });
    await applyTheme(temporal, marca.tema);
    fs.renameSync(temporal, salida);
  } catch (e) {
    if (fs.existsSync(temporal)) fs.unlinkSync(temporal);
    console.error(`escritura: ${e.message}`);
    return 1;
  }
  console.log(`ok ${salida} (${contenido.diapositivas.length} diapositivas)`);
  return 0;
}

module.exports = { construir };

if (require.main === module) {
  main().then((code) => process.exit(code), (e) => { console.error(e.stack || e.message); process.exit(1); });
}
