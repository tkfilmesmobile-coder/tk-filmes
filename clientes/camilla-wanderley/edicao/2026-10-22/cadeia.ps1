# Refaz a cor de todos os trechos, remonta os planos e renderiza os vídeos, em sequência.
# Log em perfil-video\out\2026-10-22\cadeia.log
param([string]$ids = 'vlog-2026-10-22,feedback-robervania,feedback-colaboradora-cip,clareamento-noiva,clareamento-caseiro-erro,espaco-entre-dentes-resina')
Set-Location $PSScriptRoot
$py = "$env:LOCALAPPDATA\Programs\Python312\python.exe"
$log = Join-Path $PSScriptRoot '..\perfil-video\out\2026-10-22\cadeia.log'
"[$(Get-Date -Format 'HH:mm:ss')] cor" | Out-File $log -Encoding utf8
& $py gradear.py --refazer 2>&1 | Out-File $log -Append -Encoding utf8
"[$(Get-Date -Format 'HH:mm:ss')] montagem" | Out-File $log -Append -Encoding utf8
& $py montar.py 2>&1 | Where-Object { $_ -notmatch 'WARN|graph engine' } | Out-File $log -Append -Encoding utf8
"[$(Get-Date -Format 'HH:mm:ss')] render" | Out-File $log -Append -Encoding utf8
& powershell -ExecutionPolicy Bypass -File (Join-Path $PSScriptRoot 'render_todos.ps1') -ids $ids -nomeLog render-v4.log
"[$(Get-Date -Format 'HH:mm:ss')] fim" | Out-File $log -Append -Encoding utf8
