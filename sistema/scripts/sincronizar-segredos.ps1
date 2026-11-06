# Sincroniza o .env (senhas, chaves e tokens) entre os computadores pelo Google Drive da TK,
# sem nunca passar pelo GitHub (pedido da Talyta, 2026-11-03).
# Cópia compartilhada: "<Drive da TK>\Meu Drive\TK - segredos\.env" (pasta privada, não compartilhar).
# Junta linha por linha (cada CHAVE=valor): o que mudou só de um lado vai pro outro; se a mesma
# chave mudou nos dois lados, ganha o arquivo mais novo. Chave nova entra; nada é apagado.
# Nunca escreve valor no registro, só o nome da chave.
# Log: %LOCALAPPDATA%\TK-sincronizacao\segredos.log

$ErrorActionPreference = 'Stop'
$raiz = Split-Path (Split-Path $PSScriptRoot -Parent) -Parent
$envLocal = Join-Path $raiz '.env'

$logDir = Join-Path $env:LOCALAPPDATA 'TK-sincronizacao'
New-Item -ItemType Directory -Force -Path $logDir | Out-Null
$log = Join-Path $logDir 'segredos.log'
$base = Join-Path $logDir 'segredos-base.env'   # como os dois lados estavam na última junção
function Log($m) { Add-Content -Path $log -Value ("{0}  {1}" -f (Get-Date -Format 'yyyy-MM-dd HH:mm:ss'), $m) -Encoding UTF8 }

# Acha o Drive da TK: o que tem a pasta "TK FILMES" (num PC pode haver mais de uma conta montada)
$drive = $null
foreach ($d in Get-PSDrive -PSProvider FileSystem) {
    foreach ($nome in 'Meu Drive', 'My Drive') {
        $p = Join-Path $d.Root $nome
        if ((Test-Path -LiteralPath $p) -and (Test-Path -LiteralPath (Join-Path $p 'TK FILMES'))) { $drive = $p; break }
    }
    if ($drive) { break }
}
if (-not $drive) { Log 'parado: Drive da TK (com a pasta TK FILMES) nao esta aberto neste computador'; exit 0 }
$pastaNuvem = Join-Path $drive 'TK - segredos'
New-Item -ItemType Directory -Force -Path $pastaNuvem | Out-Null
$envNuvem = Join-Path $pastaNuvem '.env'

function Ler($arq) {
    $r = [ordered]@{}
    if (Test-Path -LiteralPath $arq) {
        foreach ($l in [IO.File]::ReadAllLines($arq)) {
            if ($l -match '^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=(.*)$') { $r[$Matches[1]] = $Matches[2] }
        }
    }
    return $r
}
function Hora($arq) { if (Test-Path -LiteralPath $arq) { (Get-Item -LiteralPath $arq).LastWriteTimeUtc } else { [datetime]::MinValue } }

try {
    if (-not (Test-Path -LiteralPath $envLocal) -and -not (Test-Path -LiteralPath $envNuvem)) { Log 'nada a fazer: nao existe .env em nenhum lado'; exit 0 }
    $L = Ler $envLocal; $N = Ler $envNuvem; $B = Ler $base
    $localMaisNovo = (Hora $envLocal) -ge (Hora $envNuvem)

    $final = [ordered]@{}; $trouxe = @(); $levou = @(); $conflito = @()
    $chaves = @($L.Keys) + @($N.Keys | Where-Object { -not $L.Contains($_) })
    foreach ($k in $chaves) {
        $temL = $L.Contains($k); $temN = $N.Contains($k)
        if ($temL -and -not $temN) { $final[$k] = $L[$k]; $levou += $k; continue }
        if ($temN -and -not $temL) { $final[$k] = $N[$k]; $trouxe += $k; continue }
        if ($L[$k] -ceq $N[$k]) { $final[$k] = $L[$k]; continue }
        $b = $(if ($B.Contains($k)) { $B[$k] } else { $null })
        if ($N[$k] -ceq $b) { $final[$k] = $L[$k]; $levou += $k }
        elseif ($L[$k] -ceq $b) { $final[$k] = $N[$k]; $trouxe += $k }
        else { $final[$k] = $(if ($localMaisNovo) { $L[$k] } else { $N[$k] }); $conflito += $k }
    }

    # Monta o arquivo: mantém comentários e ordem do .env local, chaves novas no fim
    $linhas = New-Object System.Collections.Generic.List[string]
    $usadas = @{}
    if (Test-Path -LiteralPath $envLocal) {
        foreach ($l in [IO.File]::ReadAllLines($envLocal)) {
            if ($l -match '^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=') { $k = $Matches[1]; if (-not $usadas[$k]) { $linhas.Add("$k=$($final[$k])"); $usadas[$k] = $true } }
            else { $linhas.Add($l) }
        }
    }
    foreach ($k in $final.Keys) { if (-not $usadas[$k]) { $linhas.Add("$k=$($final[$k])"); $usadas[$k] = $true } }

    $utf8 = New-Object Text.UTF8Encoding $false
    $texto = ($linhas -join "`r`n") + "`r`n"
    $atualL = $(if (Test-Path -LiteralPath $envLocal) { [IO.File]::ReadAllText($envLocal) } else { '' })
    $atualN = $(if (Test-Path -LiteralPath $envNuvem) { [IO.File]::ReadAllText($envNuvem) } else { '' })
    if ($atualL -cne $texto) { [IO.File]::WriteAllText($envLocal, $texto, $utf8) }
    if ($atualN -cne $texto) { [IO.File]::WriteAllText($envNuvem, $texto, $utf8) }
    [IO.File]::WriteAllText($base, $texto, $utf8)

    if ($trouxe.Count) { Log ("trouxe do Drive: " + ($trouxe -join ', ')) }
    if ($levou.Count) { Log ("levou pro Drive: " + ($levou -join ', ')) }
    if ($conflito.Count) { Log ("mudou nos dois lados, ficou o mais novo (" + $(if ($localMaisNovo) { 'deste PC' } else { 'do Drive' }) + "): " + ($conflito -join ', ')) }
} catch {
    Log ("erro: " + $_.Exception.Message)
}
