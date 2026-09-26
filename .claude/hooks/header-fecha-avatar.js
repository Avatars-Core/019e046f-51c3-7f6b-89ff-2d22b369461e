#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const avatarDir = process.env.CLAUDE_PROJECT_DIR || process.cwd();
const configPath = path.join(avatarDir, 'config.yml');
let nombreAvatar = '';

if (fs.existsSync(configPath)) {
  const contenido = fs.readFileSync(configPath, 'utf8');
  for (const linea of contenido.split(/\r?\n/)) {
    if (nombreAvatar === '') {
      const match = linea.match(/^\s*name:\s*([^\s#]+)/);
      if (match) {
        nombreAvatar = match[1];
      }
    }
  }
}

if (nombreAvatar === '') {
  nombreAvatar = path.basename(path.resolve(avatarDir));
}

function formatearFechaHora(fecha) {
  const dosDigitos = (n) => String(n).padStart(2, '0');
  const dia = dosDigitos(fecha.getDate());
  const mes = dosDigitos(fecha.getMonth() + 1);
  const anio = fecha.getFullYear();
  const horas = dosDigitos(fecha.getHours());
  const minutos = dosDigitos(fecha.getMinutes());
  return `${dia}/${mes}/${anio} ${horas}:${minutos}`;
}

const fechaHora = formatearFechaHora(new Date());

process.stdout.write(
  'SCAAMN encabezado: comienza tu respuesta con la linea de fecha/hora: ' +
    '🟦🟪 <FECHA-HORA> - <NOMBRE-AVATAR> 🟪🟦' +
    ' usando la hora actual = ' + fechaHora +
    ' y el avatar actual = ' + nombreAvatar + '.\n'
);
