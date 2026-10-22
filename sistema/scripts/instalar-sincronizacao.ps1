# Liga a sincronização automática neste computador (rodar uma vez por máquina).
# A cada 15 minutos, e também ao entrar no Windows:
#   - arquivos da pasta TK FILMES  <->  GitHub        (sincronizar-github.ps1)
#   - conversas do Claude Code     <->  Google Drive  (sincronizar-conversas.ps1)
#
# Uso, no PowerShell, dentro da pasta TK FILMES:
#   powershell -ExecutionPolicy Bypass -File sistema\scripts\instalar-sincronizacao.ps1 -Origem pc-casa
# -Origem é o nome desta máquina (vai no diário e nos commits). Cada computador tem o seu.
# Só precisa dele se esta máquina ainda não tem o arquivo .origem.
#
# NÃO copia as postagens agendadas do Instagram: elas ficam num computador só,
# senão cada post sai duas vezes.

param([string]$Origem)

$raiz = (Resolve-Path (Join-Path $PSScriptRoot '..\..')).Path
$arqOrigem = Join-Path $raiz '.origem'

if (-not (Test-Path -LiteralPath $arqOrigem)) {
    if (-not $Origem) { Write-Host 'Falta dizer o nome deste computador. Ex.: -Origem pc-casa'; exit 1 }
    Set-Content -LiteralPath $arqOrigem -Value $Origem.Trim() -Encoding ASCII
    Write-Host "Este computador agora se chama '$($Origem.Trim())'."
}

$vbs = Join-Path $PSScriptRoot 'sincronizar-oculto.vbs'
$acao = New-ScheduledTaskAction -Execute 'wscript.exe' -Argument "`"$vbs`""
$cada15 = New-ScheduledTaskTrigger -Once -At (Get-Date).AddMinutes(1) -RepetitionInterval (New-TimeSpan -Minutes 15)
$aoEntrar = New-ScheduledTaskTrigger -AtLogOn -User $env:USERNAME
$config = New-ScheduledTaskSettingsSet -StartWhenAvailable -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries `
    -MultipleInstances IgnoreNew -ExecutionTimeLimit (New-TimeSpan -Minutes 30)
$quem = New-ScheduledTaskPrincipal -UserId $env:USERNAME -LogonType Interactive -RunLevel Limited

Register-ScheduledTask -TaskName 'TK - Sincronizar GitHub e conversas' -Action $acao -Trigger @($cada15, $aoEntrar) `
    -Settings $config -Principal $quem -Description 'Arquivos da TK FILMES <-> GitHub e conversas do Claude <-> Google Drive, a cada 15 min. Log em %LOCALAPPDATA%\TK-sincronizacao.' -Force | Out-Null

Write-Host 'Pronto: a sincronizacao roda a cada 15 minutos e ao entrar no Windows.'
Write-Host "Pra ver o que ela fez: $env:LOCALAPPDATA\TK-sincronizacao"
