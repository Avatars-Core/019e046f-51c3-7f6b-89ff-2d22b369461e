Lee `../019d8dc4-d3e0-76ca-b047-70e2b5b71674/avatar-body/sudo-temporal/README.md` § *Instalación en un equipo nuevo* y ejecuta el
one-liner que allí describe desde la raíz de essence: crea `~/.local/bin` si no existe y
symlinka en él `activar-sudo-sin-clave` y `desactivar-sudo-sin-clave`.

Es idempotente — se puede volver a invocar sin error. No pide argumentos.
