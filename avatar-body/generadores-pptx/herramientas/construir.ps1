# Construye un .pptx de punta a punta y para al primer fallo:
#   generar.js -> validate.py (skill pptx) -> comprobar.py -> render.ps1 (PDF) -> topng.py (PNG)
#
#   powershell -NoProfile -ExecutionPolicy Bypass -File construir.ps1 `
#     -Contenido <contenido.json> -Marca <brand.json> -Imagenes <carpeta> [-Salida <deck.pptx>] `
#     [-Plantilla oferta-resumen] [-Dpi 110] [-Prohibidas "a,b"] [-SinRender]
#
# Sin -Salida, el .pptx va a la carpeta `generadores-pptx.salidas` de config.local.yaml (fuera del
# repo) y, si no hay, a avatar-body/generadores-pptx/salidas/ (ignorada por git). El PDF va al lado
# del .pptx y los PNG a <carpeta del .pptx>/png/. Sale con el codigo del paso que fallo.
# Fichero en ASCII a proposito: PowerShell 5.1 lee sin BOM como ANSI.
param(
  [Parameter(Mandatory = $true)][string]$Contenido,
  [Parameter(Mandatory = $true)][string]$Marca,
  [Parameter(Mandatory = $true)][string]$Imagenes,
  [string]$Salida = "",
  [string]$Plantilla = "oferta-resumen",
  [int]$Dpi = 110,
  [string]$Prohibidas = "",
  [switch]$SinRender
)
$ErrorActionPreference = 'Stop'
$gen = Split-Path -Parent $PSScriptRoot

function Paso([string]$nombre, [scriptblock]$orden) {
  Write-Output "== $nombre"
  & $orden
  if ($LASTEXITCODE -ne 0) {
    Write-Output "construir: fallo en '$nombre' (codigo $LASTEXITCODE). Se para aqui."
    exit $LASTEXITCODE
  }
}

$contenidoAbs = (Resolve-Path -LiteralPath $Contenido).Path
$marcaAbs = (Resolve-Path -LiteralPath $Marca).Path
$imagenesAbs = (Resolve-Path -LiteralPath $Imagenes).Path
if (-not $Salida) {
  $lib = (Join-Path $gen 'lib/skill-pptx.js') -replace '\\', '/'
  $carpeta = (& node -e "console.log(require('$lib').leerConfigLocal().salidas)").Trim()
  if (-not $carpeta) { $carpeta = Join-Path $gen 'salidas' }
  $Salida = Join-Path $carpeta (([System.IO.Path]::GetFileNameWithoutExtension($contenidoAbs)) + '.pptx')
}
$pptx = [System.IO.Path]::GetFullPath($Salida)
$base = [System.IO.Path]::Combine([System.IO.Path]::GetDirectoryName($pptx), [System.IO.Path]::GetFileNameWithoutExtension($pptx))
$pdf = "$base.pdf"
$png = Join-Path ([System.IO.Path]::GetDirectoryName($pptx)) ('png/' + [System.IO.Path]::GetFileNameWithoutExtension($pptx))

$skill = (& node (Join-Path $gen 'lib/skill-pptx.js'))
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
$validate = Join-Path $skill 'scripts/office/validate.py'

Paso 'generar' { node (Join-Path $gen "$Plantilla/generar.js") --contenido $contenidoAbs --marca $marcaAbs --imagenes $imagenesAbs --salida $pptx }
Paso 'validate.py' { python $validate $pptx }
# PowerShell 5.1 se come los argumentos vacios: --prohibidas solo va si trae algo.
$extra = @()
if ($Prohibidas) { $extra = @('--prohibidas', $Prohibidas) }
Paso 'comprobar' { python (Join-Path $gen 'herramientas/comprobar.py') $pptx --plantilla $Plantilla @extra }
if (-not $SinRender) {
  Paso 'render' { powershell -NoProfile -ExecutionPolicy Bypass -File (Join-Path $gen 'herramientas/render.ps1') -Entrada $pptx -Pdf $pdf }
  Paso 'png' { python (Join-Path $gen 'herramientas/topng.py') $pdf $png --dpi $Dpi }
}
Write-Output "construir: ok"
Write-Output "  pptx: $pptx"
if (-not $SinRender) {
  Write-Output "  pdf:  $pdf"
  Write-Output "  png:  $png-NN.png"
}
exit 0
