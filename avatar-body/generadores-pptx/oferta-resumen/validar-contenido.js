// Reglas de estructura de la plantilla oferta-resumen sobre un contenido.json.
// Contrato completo: avatar-mind/scaa/plantillas-pptx/oferta-resumen.md.
//
//   node validar-contenido.js <contenido.json>     -> exit 0, o exit 1 con "campo: motivo" por línea
//
// Lo que esto NO mira (lo mira generar.js, que tiene la marca y las imágenes): que cada texto
// quepa en su caja, que las imágenes existan y que los colores de la marca sean válidos.
"use strict";
const fs = require("fs");
const path = require("path");
const { validarNotas } = require("../lib/notas");

const PLANTILLA = JSON.parse(fs.readFileSync(path.join(__dirname, "plantilla.json"), "utf8"));
const TIPOS = PLANTILLA.tipos.map((t) => t.tipo);

function validarEstructura(c) {
  const errores = [];
  const f = (campo, motivo) => errores.push({ campo, motivo });
  const texto = (v) => typeof v === "string" && v.trim() !== "";
  const pedir = (obj, campo, claves) => {
    for (const k of claves) if (!obj || !texto(obj[k])) f(`${campo}.${k}`, "obligatorio, texto no vacío");
  };
  const lista = (v, campo, min, max) => {
    if (!Array.isArray(v)) { f(campo, `obligatorio: lista de ${min} a ${max} elementos`); return false; }
    if (v.length < min || v.length > max) { f(campo, `${v.length} elemento(s); la plantilla admite de ${min} a ${max}`); return false; }
    return true;
  };
  const imagen = (img, campo) => {
    if (!img || typeof img !== "object") { f(campo, "obligatoria: { fichero, pie, ajuste?, foco? }"); return; }
    pedir(img, campo, ["fichero", "pie"]);
    if (img.ajuste !== undefined && !["contain", "cover"].includes(img.ajuste)) f(`${campo}.ajuste`, `"${img.ajuste}" no vale: contain (por defecto) o cover`);
    if (img.foco !== undefined && !["arriba", "centro"].includes(img.foco)) f(`${campo}.foco`, `"${img.foco}" no vale: arriba o centro`);
    if (img.foco !== undefined && img.ajuste !== "cover") f(`${campo}.foco`, "solo tiene sentido con ajuste: cover");
  };

  if (!c || typeof c !== "object") return [{ campo: "contenido", motivo: "no es un objeto JSON" }];
  if (c.plantilla !== PLANTILLA.id) f("plantilla", `debe ser "${PLANTILLA.id}"`);
  pedir(c.meta, "meta", ["titulo", "cliente", "proyecto", "version", "fecha", "presenta", "pie"]);

  const ds = c.diapositivas;
  if (!Array.isArray(ds)) { f("diapositivas", "obligatorio: lista de diapositivas"); return errores; }
  const { min, max } = PLANTILLA.diapositivas;
  if (ds.length < min || ds.length > max) f("diapositivas", `${ds.length} diapositivas; la plantilla admite de ${min} a ${max}`);

  // Orden y cardinalidad por tipo.
  const cuenta = {};
  let ultimo = -1;
  ds.forEach((d, i) => {
    const campo = `diapositivas[${i}]`;
    const pos = TIPOS.indexOf(d && d.tipo);
    if (pos === -1) { f(`${campo}.tipo`, `"${d && d.tipo}" no es un tipo de la plantilla (${TIPOS.join(", ")})`); return; }
    if (pos < ultimo) f(`${campo}.tipo`, `"${d.tipo}" va fuera de orden: el orden es ${TIPOS.join(" > ")}`);
    ultimo = Math.max(ultimo, pos);
    cuenta[d.tipo] = (cuenta[d.tipo] || 0) + 1;
  });
  for (const t of PLANTILLA.tipos) {
    const n = cuenta[t.tipo] || 0;
    if (t.obligatoria && n === 0) f("diapositivas", `falta la diapositiva obligatoria "${t.tipo}"`);
    if (n > t.maximo) f("diapositivas", `"${t.tipo}" aparece ${n} veces; máximo ${t.maximo}`);
  }

  // Campos de cada tipo.
  ds.forEach((d, i) => {
    if (!d || TIPOS.indexOf(d.tipo) === -1) return;
    const campo = `diapositivas[${i}]`;
    const def = PLANTILLA.tipos.find((t) => t.tipo === d.tipo);
    if (def.composiciones) {
      const comp = d.composicion || def.composiciones[0];
      if (!def.composiciones.includes(comp)) f(`${campo}.composicion`, `"${comp}" no vale para ${d.tipo}: ${def.composiciones.join(" o ")}`);
    }
    if (d.tipo !== "portada" && d.tipo !== "proximos-pasos" && !texto(d.titulo)) f(`${campo}.titulo`, "obligatorio, texto no vacío");
    const comp = d.composicion || (def.composiciones && def.composiciones[0]);
    switch (d.tipo) {
      case "agenda":
        if (lista(d.puntos, `${campo}.puntos`, 4, 8)) d.puntos.forEach((p, j) => pedir(p, `${campo}.puntos[${j}]`, ["titulo"]));
        break;
      case "que-y-para-quien":
        if (lista(d.cifras, `${campo}.cifras`, 3, 3)) d.cifras.forEach((p, j) => pedir(p, `${campo}.cifras[${j}]`, ["etiqueta", "valor", "detalle"]));
        break;
      case "por-que-ahora":
        if (lista(d.hitos, `${campo}.hitos`, 2, 4)) d.hitos.forEach((p, j) => pedir(p, `${campo}.hitos[${j}]`, ["fecha", "titulo", "detalle"]));
        if (d.destacado !== undefined) pedir(d.destacado, `${campo}.destacado`, ["etiqueta", "texto"]);
        break;
      case "idea-clave":
        if (lista(d.frase, `${campo}.frase`, 1, 2)) d.frase.forEach((p, j) => { if (!texto(p)) f(`${campo}.frase[${j}]`, "línea vacía"); });
        if (lista(d.puntos, `${campo}.puntos`, 2, 3)) d.puntos.forEach((p, j) => { if (!texto(p)) f(`${campo}.puntos[${j}]`, "punto vacío"); });
        imagen(d.imagen, `${campo}.imagen`);
        break;
      case "modelo-funcional":
        imagen(d.imagen, `${campo}.imagen`);
        if (comp === "diagrama-y-tarjetas" && lista(d.tarjetas, `${campo}.tarjetas`, 2, 2)) d.tarjetas.forEach((p, j) => pedir(p, `${campo}.tarjetas[${j}]`, ["titulo", "texto"]));
        if (comp === "cifras-y-diagrama" && lista(d.cifras, `${campo}.cifras`, 3, 3)) d.cifras.forEach((p, j) => pedir(p, `${campo}.cifras[${j}]`, ["valor", "detalle"]));
        break;
      case "solucion-tecnica":
        imagen(d.imagen, `${campo}.imagen`);
        if (comp === "diagrama-y-filas" && lista(d.filas, `${campo}.filas`, 1, 4)) d.filas.forEach((p, j) => pedir(p, `${campo}.filas[${j}]`, ["tecnologia", "papel"]));
        if (comp === "diagrama-y-modulos") {
          if (lista(d.modulos, `${campo}.modulos`, 1, 3)) d.modulos.forEach((p, j) => pedir(p, `${campo}.modulos[${j}]`, ["titulo", "texto"]));
          if (d.destacados !== undefined && lista(d.destacados, `${campo}.destacados`, 0, 2)) d.destacados.forEach((p, j) => pedir(p, `${campo}.destacados[${j}]`, ["etiqueta", "texto"]));
        }
        break;
      case "prototipo": {
        const [lo, hi] = comp === "dos-capturas" ? [2, 2] : [1, 3];
        if (lista(d.imagenes, `${campo}.imagenes`, lo, hi)) d.imagenes.forEach((p, j) => imagen(p, `${campo}.imagenes[${j}]`));
        break;
      }
      case "plan-de-horas":
        if (lista(d.hitos, `${campo}.hitos`, 2, 8)) {
          d.hitos.forEach((p, j) => {
            pedir(p, `${campo}.hitos[${j}]`, ["nombre"]);
            if (typeof p.horas !== "number" || !(p.horas > 0)) f(`${campo}.hitos[${j}].horas`, "número mayor que 0");
          });
          const suma = d.hitos.reduce((s, p) => s + (typeof p.horas === "number" ? p.horas : 0), 0);
          if (d.total !== undefined && d.total !== suma) f(`${campo}.total`, `dice ${d.total} y la suma de los hitos es ${suma}; el total se calcula, quítalo o corrígelo`);
        }
        break;
      case "riesgos":
        if (lista(d.riesgos, `${campo}.riesgos`, 2, 6)) d.riesgos.forEach((p, j) => {
          pedir(p, `${campo}.riesgos[${j}]`, ["titulo", "pregunta"]);
          if (!["alto", "medio", "bajo"].includes(p.nivel)) f(`${campo}.riesgos[${j}].nivel`, `"${p.nivel}" no vale: alto, medio o bajo`);
        });
        break;
      case "proximos-pasos":
        if (lista(d.pasos, `${campo}.pasos`, 1, 4)) d.pasos.forEach((p, j) => { if (!texto(p)) f(`${campo}.pasos[${j}]`, "paso vacío"); });
        break;
      default:
        break;
    }
    errores.push(...validarNotas(d.notas, `${campo}.notas`, i === ds.length - 1));
  });
  return errores;
}

module.exports = { validarEstructura, PLANTILLA };

if (require.main === module) {
  const fichero = process.argv[2];
  if (!fichero) { console.error("uso: node validar-contenido.js <contenido.json>"); process.exit(2); }
  let c;
  try { c = JSON.parse(fs.readFileSync(fichero, "utf8")); } catch (e) { console.error(`contenido: no se puede leer como JSON (${e.message})`); process.exit(1); }
  const errores = validarEstructura(c);
  if (errores.length) {
    for (const e of errores) console.error(`contenido.${e.campo}: ${e.motivo}`);
    process.exit(1);
  }
  console.log(`ok ${fichero}: ${c.diapositivas.length} diapositivas`);
}
