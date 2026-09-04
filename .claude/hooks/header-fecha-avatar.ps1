$avatarDir = if ($env:CLAUDE_PROJECT_DIR) { $env:CLAUDE_PROJECT_DIR } else { '.' }
$configPath = Join-Path $avatarDir 'config.yml'
$nombreAvatar = ''
if (Test-Path -LiteralPath $configPath) {
    foreach ($linea in (Get-Content -LiteralPath $configPath -Encoding UTF8)) {
        if ($nombreAvatar -eq '' -and $linea -match '^\s*name:\s*([^\s#]+)') {
            $nombreAvatar = $Matches[1]
        }
    }
}
if ($nombreAvatar -eq '') {
    $nombreAvatar = Split-Path -Leaf (Resolve-Path -LiteralPath $avatarDir)
}
Write-Output ('SCAAMN encabezado: comienza tu respuesta con la linea de fecha/hora: ' + [char]0xD83D + [char]0xDFE6 + [char]0xD83D + [char]0xDFEA + ' <FECHA-HORA> - <NOMBRE-AVATAR> ' + [char]0xD83D + [char]0xDFEA + [char]0xD83D + [char]0xDFE6 + ' usando la hora actual = ' + (Get-Date -Format 'dd/MM/yyyy HH:mm') + ' y el avatar actual = ' + $nombreAvatar + '.')
