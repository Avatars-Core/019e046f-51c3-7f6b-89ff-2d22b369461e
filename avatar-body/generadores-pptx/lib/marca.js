// Lee y valida un brand.json (formato en avatar-body/marcas/README.md).
// Devuelve { nombre, empresa, empresaXml, web, tema, logos: { principal, pie } } con las rutas
// de los logos ya resueltas (relativas a la carpeta del brand.json) y sus píxeles reales.
// Cualquier fallo lanza ErrorDeEntrada con el campo y el motivo: nada se escribe.
"use strict";
const fs = require("fs");
const path = require("path");
const { dimensiones } = require("./imagen");

const RANURAS = ["dk1", "lt1", "dk2", "lt2", "accent1", "accent2", "accent3", "accent4", "accent5", "accent6", "hlink", "folHlink"];
// Fuentes que PowerPoint trae y que el render de revisión pinta con su ancho real (skill pptx § Typography).
const FUENTES_SEGURAS = ["Arial", "Calibri", "Cambria", "Times New Roman", "Courier New", "Bookman Old Style", "Century Schoolbook"];

class ErrorDeEntrada extends Error {
  constructor(errores) {
    super(errores.map((e) => `${e.campo}: ${e.motivo}`).join("\n"));
    this.errores = errores;
  }
}

function escaparXml(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function cargarMarca(ficheroMarca) {
  const errores = [];
  const fallo = (campo, motivo) => errores.push({ campo: `marca.${campo}`, motivo });
  if (!ficheroMarca || !fs.existsSync(ficheroMarca)) {
    throw new ErrorDeEntrada([{ campo: "marca", motivo: `no existe el fichero de marca "${ficheroMarca}"` }]);
  }
  let b;
  try {
    b = JSON.parse(fs.readFileSync(ficheroMarca, "utf8"));
  } catch (e) {
    throw new ErrorDeEntrada([{ campo: "marca", motivo: `no es JSON válido (${e.message})` }]);
  }
  const dir = path.dirname(path.resolve(ficheroMarca));
  for (const k of ["nombre", "empresa"]) {
    if (typeof b[k] !== "string" || !b[k].trim()) fallo(k, "obligatorio, texto no vacío");
  }
  const tema = b.tema || {};
  if (typeof tema.name !== "string" || !tema.name.trim()) fallo("tema.name", "obligatorio, texto no vacío");
  const colores = tema.colors || {};
  for (const k of RANURAS) {
    const v = colores[k];
    if (typeof v !== "string" || !/^[0-9A-Fa-f]{6}$/.test(v)) {
      const pista = typeof v === "string" && v.startsWith("#") ? " (quita el '#')" : "";
      fallo(`tema.colors.${k}`, `"${v}" no es un color de seis cifras hexadecimales sin '#'${pista}`);
    }
  }
  const fuentes = { head: tema.headFontFace || "Calibri", body: tema.bodyFontFace || "Calibri" };
  for (const [k, f] of Object.entries(fuentes)) {
    if (!FUENTES_SEGURAS.includes(f)) {
      console.warn(`aviso marca.tema.${k}FontFace: "${f}" no está en la lista segura (${FUENTES_SEGURAS.join(", ")}); el render de revisión puede no reflejar el ancho real del texto.`);
    }
  }
  const logos = {};
  for (const k of ["principal", "pie"]) {
    const rel = b.logos && b.logos[k];
    if (typeof rel !== "string" || !rel) { fallo(`logos.${k}`, "obligatorio: ruta del PNG, relativa al brand.json"); continue; }
    const ruta = path.resolve(dir, rel);
    if (!fs.existsSync(ruta)) { fallo(`logos.${k}`, `no existe "${ruta}"`); continue; }
    try {
      logos[k] = { ruta, ...dimensiones(ruta) };
    } catch (e) {
      fallo(`logos.${k}`, e.message);
    }
  }
  if (errores.length) throw new ErrorDeEntrada(errores);
  return {
    nombre: b.nombre,
    empresa: b.empresa,
    // pptxgenjs escribe `company` sin escapar en docProps/app.xml (skill pptx): se escapa aquí.
    empresaXml: escaparXml(b.empresa),
    web: b.web || "",
    tema: {
      name: tema.name,
      headFontFace: fuentes.head,
      bodyFontFace: fuentes.body,
      colors: Object.fromEntries(RANURAS.map((k) => [k, colores[k].toUpperCase()])),
    },
    logos,
  };
}

module.exports = { cargarMarca, ErrorDeEntrada };
