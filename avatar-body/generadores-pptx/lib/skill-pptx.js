// Localiza el skill `pptx` instalado y carga de él `apply_theme.js` (decisión D2 del ciclo
// 2026-10-06--generar-pptx-oferta: se usa desde el skill, no se copia al avatar).
//
// Orden de búsqueda:
//   1. variable de entorno PPTX_SKILL_DIR
//   2. clave `generadores-pptx.skill-pptx` de config.local.yaml (raíz del avatar, fuera de git)
//   3. ~/.claude/skills/synced/*/pptx y ~/.claude/skills/pptx
// Una carpeta vale si tiene scripts/apply_theme.js y scripts/office/validate.py.
//
// NODE_PATH deja de ser cosa del usuario: `apply_theme.js` vive fuera de este árbol y busca
// `pptxgenjs` (y el `jszip` que trae) subiendo desde su propia carpeta y luego en NODE_PATH.
// Se fija NODE_PATH dentro del proceso y se reinician las rutas globales de Node antes del require.
//
// CLI: `node lib/skill-pptx.js` imprime la carpeta del skill (lo usa construir.ps1).
"use strict";
const fs = require("fs");
const os = require("os");
const path = require("path");
const Module = require("module");

const RAIZ_AVATAR = path.resolve(__dirname, "..", "..", "..");
const NODE_MODULES = path.resolve(__dirname, "..", "node_modules");

// Lector mínimo del bloque `generadores-pptx:` de config.local.yaml. No es un parser YAML:
// solo entiende `clave: "valor"` con dos espacios de sangría bajo ese bloque, que es la forma
// del config.local.yaml.example.
function leerConfigLocal() {
  const fichero = path.join(RAIZ_AVATAR, "config.local.yaml");
  const out = { fichero, existe: false, salidas: "", marcas: "", skillPptx: "" };
  if (!fs.existsSync(fichero)) return out;
  out.existe = true;
  let dentro = false;
  for (const linea of fs.readFileSync(fichero, "utf8").split(/\r?\n/)) {
    if (/^\S/.test(linea)) dentro = /^generadores-pptx\s*:/.test(linea);
    if (!dentro) continue;
    const m = linea.match(/^\s+([a-z-]+)\s*:\s*("([^"]*)"|'([^']*)'|([^#\s][^#]*?))?\s*(#.*)?$/);
    if (!m) continue;
    const valor = (m[3] ?? m[4] ?? m[5] ?? "").trim();
    if (m[1] === "salidas") out.salidas = valor;
    if (m[1] === "marcas") out.marcas = valor;
    if (m[1] === "skill-pptx") out.skillPptx = valor;
  }
  return out;
}

function esCarpetaDelSkill(dir) {
  return !!dir
    && fs.existsSync(path.join(dir, "scripts", "apply_theme.js"))
    && fs.existsSync(path.join(dir, "scripts", "office", "validate.py"));
}

function candidatos() {
  const lista = [];
  if (process.env.PPTX_SKILL_DIR) lista.push(["PPTX_SKILL_DIR", process.env.PPTX_SKILL_DIR]);
  const cfg = leerConfigLocal();
  if (cfg.skillPptx) lista.push([`${cfg.fichero} (generadores-pptx.skill-pptx)`, cfg.skillPptx]);
  const skills = path.join(os.homedir(), ".claude", "skills");
  const synced = path.join(skills, "synced");
  if (fs.existsSync(synced)) {
    for (const d of fs.readdirSync(synced).sort()) lista.push([`${synced}${path.sep}*`, path.join(synced, d, "pptx")]);
  }
  lista.push([skills, path.join(skills, "pptx")]);
  return lista;
}

function localizarSkill() {
  const vistos = [];
  for (const [origen, dir] of candidatos()) {
    if (esCarpetaDelSkill(dir)) return path.resolve(dir);
    vistos.push(`  - ${dir}  (${origen})`);
  }
  throw new Error(
    "no encuentro el skill `pptx` (hace falta scripts/apply_theme.js y scripts/office/validate.py).\n" +
    `Busqué en:\n${vistos.join("\n") || "  (ningún candidato)"}\n` +
    "Arreglo: fija la variable de entorno PPTX_SKILL_DIR, o la clave `generadores-pptx.skill-pptx` de " +
    "config.local.yaml, con la carpeta del skill (la que contiene SKILL.md)."
  );
}

function fijarNodePath() {
  const actual = (process.env.NODE_PATH || "").split(path.delimiter).filter(Boolean);
  if (!actual.includes(NODE_MODULES)) {
    process.env.NODE_PATH = [NODE_MODULES, ...actual].join(path.delimiter);
    Module._initPaths();
  }
}

function cargarApplyTheme() {
  const dir = localizarSkill();
  fijarNodePath();
  return require(path.join(dir, "scripts", "apply_theme.js")).applyTheme;
}

module.exports = { localizarSkill, cargarApplyTheme, leerConfigLocal };

if (require.main === module) {
  try {
    console.log(localizarSkill());
  } catch (e) {
    console.error(`skill-pptx: ${e.message}`);
    process.exit(1);
  }
}
