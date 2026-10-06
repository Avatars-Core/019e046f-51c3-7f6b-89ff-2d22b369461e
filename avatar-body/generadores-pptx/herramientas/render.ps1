# Exporta un .pptx a PDF con PowerPoint por COM, sin molestar al PowerPoint del humano.
#
#   powershell -NoProfile -ExecutionPolicy Bypass -File render.ps1 -Entrada <deck.pptx> -Pdf <deck.pdf>
#
# Garantias (test T8 del ciclo 2026-10-06--generar-pptx-oferta):
#   - abre la presentacion en solo lectura y SIN ventana;
#   - si el .pptx esta abierto para edicion (existe su fichero de bloqueo ~$), se niega;
#   - cierra solo lo que abrio, en try/finally, y libera los objetos COM;
#   - llama a Quit solo si no habia PowerPoint abierto antes y no queda ninguna presentacion:
#     COM se engancha a la instancia del humano si la hay, y Quit la cerraria con todo dentro.
# Sale con 0 y escribe "paginas: N" si todo fue bien. Fichero en ASCII a proposito: PowerShell 5.1
# lee sin BOM como ANSI.
param(
  [Parameter(Mandatory = $true)][string]$Entrada,
  [Parameter(Mandatory = $true)][string]$Pdf
)
$ErrorActionPreference = 'Stop'

$entradaAbs = (Resolve-Path -LiteralPath $Entrada).Path
$pdfAbs = [System.IO.Path]::GetFullPath($Pdf)
$bloqueo = Join-Path (Split-Path -Parent $entradaAbs) ('~$' + (Split-Path -Leaf $entradaAbs))
if (Test-Path -LiteralPath $bloqueo) {
  Write-Error "render: '$entradaAbs' esta abierto para edicion (existe $bloqueo). Cierralo en PowerPoint y repite."
  exit 3
}
if (Test-Path -LiteralPath $pdfAbs) { Remove-Item -LiteralPath $pdfAbs }

$habiaPowerPoint = @(Get-Process -Name POWERPNT -ErrorAction SilentlyContinue).Count -gt 0
$app = $null
$pres = $null
$paginas = -1
try {
  $app = New-Object -ComObject PowerPoint.Application
  # Open(FileName, ReadOnly = msoTrue, Untitled = msoFalse, WithWindow = msoFalse)
  $pres = $app.Presentations.Open($entradaAbs, -1, 0, 0)
  $paginas = $pres.Slides.Count
  $pres.SaveAs($pdfAbs, 32)   # 32 = ppSaveAsPDF
}
finally {
  if ($null -ne $pres) {
    try { $pres.Close() } catch { }
    [void][System.Runtime.InteropServices.Marshal]::ReleaseComObject($pres)
    $pres = $null
  }
  if ($null -ne $app) {
    $quedan = 0
    try { $quedan = $app.Presentations.Count } catch { }
    if (-not $habiaPowerPoint -and $quedan -eq 0) {
      try { $app.Quit() } catch { }
    }
    [void][System.Runtime.InteropServices.Marshal]::ReleaseComObject($app)
    $app = $null
  }
  [System.GC]::Collect()
  [System.GC]::WaitForPendingFinalizers()
}

if (-not (Test-Path -LiteralPath $pdfAbs)) {
  Write-Error "render: PowerPoint no ha escrito '$pdfAbs'."
  exit 1
}
Write-Output "pdf: $pdfAbs"
Write-Output "paginas: $paginas"
exit 0
