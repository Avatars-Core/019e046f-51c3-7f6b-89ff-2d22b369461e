// Notas del orador con formato fijo (contrato en avatar-mind/scaa/plantillas-pptx/index.md):
//
//   MENSAJE: <la idea de la diapositiva, en una frase>
//   GUION:
//   - <2 a 5 puntos>
//   DATOS: <cifras y su fuente; [derivado] si lo propone el avatar>
//   TRANSICION: <frase puente>        (no aparece en la última diapositiva)
//   TIEMPO: <minutos> min
"use strict";

const MAX_CARACTERES = 1200;

// Devuelve la lista de errores { campo, motivo } de unas notas. `campo` es el prefijo
// (p. ej. "diapositivas[3].notas").
function validarNotas(notas, campo, esUltima) {
  const out = [];
  const f = (c, m) => out.push({ campo: `${campo}.${c}`, motivo: m });
  if (!notas || typeof notas !== "object") return [{ campo, motivo: "obligatorias (mensaje, guion, datos, transicion, tiempo)" }];
  if (typeof notas.mensaje !== "string" || !notas.mensaje.trim()) f("mensaje", "obligatorio, una frase");
  if (!Array.isArray(notas.guion) || notas.guion.length < 2 || notas.guion.length > 5) f("guion", "de 2 a 5 puntos");
  else notas.guion.forEach((p, i) => { if (typeof p !== "string" || !p.trim()) f(`guion[${i}]`, "punto vacío"); });
  if (typeof notas.datos !== "string" || !notas.datos.trim()) f("datos", "obligatorio: cifras y fuente, o «sin cifras»");
  if (esUltima && notas.transicion) f("transicion", "la última diapositiva no lleva transición");
  if (!esUltima && (typeof notas.transicion !== "string" || !notas.transicion.trim())) f("transicion", "obligatoria salvo en la última diapositiva");
  if (typeof notas.tiempo !== "number" || !(notas.tiempo > 0) || notas.tiempo > 10) f("tiempo", "minutos, número entre 0 y 10");
  if (!out.length) {
    const largo = componerNotas(notas, esUltima).length;
    if (largo > MAX_CARACTERES) out.push({ campo, motivo: `las notas compuestas ocupan ${largo} caracteres; el máximo es ${MAX_CARACTERES}` });
  }
  return out;
}

function componerNotas(notas, esUltima) {
  const lineas = [`MENSAJE: ${notas.mensaje.trim()}`, "GUION:"];
  for (const p of notas.guion) lineas.push(`- ${p.trim()}`);
  lineas.push(`DATOS: ${notas.datos.trim()}`);
  if (!esUltima) lineas.push(`TRANSICION: ${notas.transicion.trim()}`);
  lineas.push(`TIEMPO: ${String(notas.tiempo).replace(".", ",")} min`);
  return lineas.join("\n");
}

module.exports = { validarNotas, componerNotas, MAX_CARACTERES };
