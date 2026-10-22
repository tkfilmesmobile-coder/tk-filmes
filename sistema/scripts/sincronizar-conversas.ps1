# Sincroniza as conversas do Claude Code entre os computadores, pelo Google Drive.
# As conversas moram em %USERPROFILE%\.claude\projects; a cópia compartilhada fica em
# "<Google Drive>\Meu Drive\Claude Code - conversas". Vai e volta: o arquivo mais novo ganha.
# Nada é apagado de nenhum lado.
# Regra de uso: não abrir a MESMA conversa nos dois computadores ao mesmo tempo.
# O nome da pasta de cada projeto leva o usuário do Windows (C--Users-tamar-TK-FILMES).
# Na nuvem esse começo vira "CASA", e cada computador troca de volta pro próprio usuário.
# Log: %LOCALAPPDATA%\TK-sincronizacao\conversas.log

$ErrorActionPreference = 'Continue'

$logDir = Join-Path $env:LOCALAPPDATA 'TK-sincronizacao'
New-Item -ItemType Directory -Force -Path $logDir | Out-Null
$log = Join-Path $logDir 'conversas.log'
if ((Test-Path $log) -and (Get-Item $log).Length -gt 1MB) { Move-Item $log "$log.old" -Force }
function Log($m) { Add-Content -Path $log -Value ("{0}  {1}" -f (Get-Date -Format 'yyyy-MM-dd HH:mm:ss'), $m) -Encoding UTF8 }

$local = Join-Path $env:USERPROFILE '.claude\projects'
New-Item -ItemType Directory -Force -Path $local | Out-Null

# Acha o Google Drive (a letra pode mudar de um computador pro outro)
$drive = $null
foreach ($d in Get-PSDrive -PSProvider FileSystem) {
    foreach ($nome in 'Meu Drive', 'My Drive') {
        $p = Join-Path $d.Root $nome
        if (Test-Path -LiteralPath $p) { $drive = $p; break }
    }
    if ($drive) { break }
}
if (-not $drive) { Log 'parado: Google Drive nao esta aberto neste computador'; exit 0 }
$nuvem = Join-Path $drive 'Claude Code - conversas'
New-Item -ItemType Directory -Force -Path $nuvem | Out-Null

$prefixo = $env:USERPROFILE -replace '[^A-Za-z0-9]', '-'   # ex.: C--Users-tamar
$opcoes = @('/E', '/XO', '/FFT', '/R:1', '/W:2', '/NP', '/NJH', '/NJS', '/NFL', '/NDL', '/XJ')

function Copiar($de, $para) {
    & robocopy.exe $de $para @opcoes | Out-Null
    if ($LASTEXITCODE -ge 8) { Log "erro ($LASTEXITCODE) copiando $de -> $para" ; return 0 }
    return $LASTEXITCODE
}

$mudou = 0
# Daqui pra nuvem
foreach ($pasta in Get-ChildItem -LiteralPath $local -Directory) {
    if (-not $pasta.Name.StartsWith($prefixo)) { continue }
    $destino = Join-Path $nuvem ('CASA' + $pasta.Name.Substring($prefixo.Length))
    $mudou += [int]((Copiar $pasta.FullName $destino) -band 1)
}
# Da nuvem pra cá
foreach ($pasta in Get-ChildItem -LiteralPath $nuvem -Directory) {
    if (-not $pasta.Name.StartsWith('CASA')) { continue }
    $destino = Join-Path $local ($prefixo + $pasta.Name.Substring(4))
    $mudou += [int]((Copiar $pasta.FullName $destino) -band 1)
}
# Skills globais (%USERPROFILE%\.claude\skills), nos dois sentidos
$skillsLocal = Join-Path $env:USERPROFILE '.claude\skills'
$skillsNuvem = Join-Path $nuvem '_skills-globais'
if (Test-Path -LiteralPath $skillsLocal) { $mudou += [int]((Copiar $skillsLocal $skillsNuvem) -band 1) }
if (Test-Path -LiteralPath $skillsNuvem) { $mudou += [int]((Copiar $skillsNuvem $skillsLocal) -band 1) }

if ($mudou -gt 0) { Log "conversas sincronizadas ($mudou pasta(s) com novidade)" }
