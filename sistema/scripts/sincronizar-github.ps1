# Sincroniza esta pasta com o GitHub sozinho (o Agendador do Windows roda a cada 15 min).
# Traz o que mudou no outro computador e manda o que mudou aqui.
# Nunca sobe segredo nem arquivo acima de 50 MB, nunca força nada.
# Se o mesmo arquivo mudou nos dois computadores, para, deixa recado e espera a Talyta.
# Log (fora do git, pra não virar commit): %LOCALAPPDATA%\TK-sincronizacao\github.log

$ErrorActionPreference = 'Continue'
try { [Console]::OutputEncoding = [Text.Encoding]::UTF8 } catch {}

$raiz = (Resolve-Path (Join-Path $PSScriptRoot '..\..')).Path
Set-Location -LiteralPath $raiz

$logDir = Join-Path $env:LOCALAPPDATA 'TK-sincronizacao'
New-Item -ItemType Directory -Force -Path $logDir | Out-Null
$log = Join-Path $logDir 'github.log'
if ((Test-Path $log) -and (Get-Item $log).Length -gt 1MB) { Move-Item $log "$log.old" -Force }
function Log($m) { Add-Content -Path $log -Value ("{0}  {1}" -f (Get-Date -Format 'yyyy-MM-dd HH:mm:ss'), $m) -Encoding UTF8 }

function RodarGit {
    $saida = & git.exe -c core.quotepath=false @args 2>&1 | ForEach-Object { "$_" }
    $script:gitSaida = ($saida -join "`n")
    return $LASTEXITCODE
}

function Recado($assunto, $precisaAcao, $texto) {
    $hoje = Get-Date -Format 'yyyy-MM-dd'
    $dir = Join-Path $raiz '_memoria\recados'
    New-Item -ItemType Directory -Force -Path $dir | Out-Null
    $arq = Join-Path $dir "$hoje-$origem-$assunto.md"
    if (Test-Path -LiteralPath $arq) { return }   # um recado por assunto por dia, sem virar commit a cada 15 min
    $corpo = "de: sincronizacao automatica ($origem)`nquando: $(Get-Date -Format 'yyyy-MM-dd HH:mm')`nprecisa de acao: $precisaAcao`n`n$texto`n"
    Set-Content -Path $arq -Value $corpo -Encoding UTF8
}

# Quem é esta máquina
$origem = (Get-Content -LiteralPath (Join-Path $raiz '.origem') -ErrorAction SilentlyContinue | Select-Object -First 1)
if (-not $origem) { Log 'parado: falta o arquivo .origem nesta maquina'; exit 0 }
$origem = $origem.Trim()

# Junção pela metade esperando gente: não mexe
foreach ($p in '.git\rebase-merge', '.git\rebase-apply', '.git\MERGE_HEAD') {
    if (Test-Path (Join-Path $raiz $p)) { Log "parado: tem uma juncao pela metade ($p); precisa de gente"; exit 0 }
}
# Outro git rodando agora (um /syncar, uma sessão): tenta na próxima
if (Test-Path (Join-Path $raiz '.git\index.lock')) { Log 'pulado: outro git rodando agora'; exit 0 }

# 1. Junta tudo que mudou aqui (o .gitignore já tira vídeo, áudio etc.)
RodarGit add -A | Out-Null
RodarGit diff --cached --name-only --diff-filter=ACMR | Out-Null
$staged = @($gitSaida -split "`n" | Where-Object { $_ })

# 2. Barra arquivo pesado
$barrados = @()
foreach ($f in $staged) {
    $item = Get-Item -LiteralPath (Join-Path $raiz $f) -ErrorAction SilentlyContinue
    if ($item -and $item.Length -gt 50MB) { RodarGit reset -q -- $f | Out-Null; $barrados += "$f (pesado, $([math]::Round($item.Length/1MB)) MB)" }
}

# 3. Barra arquivo com cara de segredo (só olha as linhas novas)
$padroes = @(
    'sk-[A-Za-z0-9_-]{20,}', 'ghp_[A-Za-z0-9]{30,}', 'github_pat_[A-Za-z0-9_]{30,}', 'AKIA[0-9A-Z]{16}',
    '-----BEGIN [A-Z ]*PRIVATE KEY', 'EAA[A-Za-z0-9]{60,}', 'AIza[0-9A-Za-z_-]{35}', 'xox[baprs]-[A-Za-z0-9-]{10,}',
    '(?i)(password|senha|api[_-]?key|secret|access[_-]?token)\s*[:=]\s*["''][^"''\s$]{12,}["'']'
)
# a borda impede falso alarme no meio de imagem embutida (base64 em SVG/HTML)
$regex = ($padroes | ForEach-Object { "(?<![A-Za-z0-9+/])(?:$_)(?![A-Za-z0-9+/])" }) -join '|'
RodarGit diff --cached -U0 --diff-filter=ACMR --no-color | Out-Null
$atual = $null; $comSegredo = @{}
foreach ($linha in ($gitSaida -split "`n")) {
    if ($linha.StartsWith('+++ b/')) { $atual = $linha.Substring(6); continue }
    if ($atual -and $linha.StartsWith('+') -and -not $linha.StartsWith('+++') -and $linha -match $regex) { $comSegredo[$atual] = $true }
}
foreach ($f in $comSegredo.Keys) { RodarGit reset -q -- $f | Out-Null; $barrados += "$f (parece ter senha ou chave)" }

if ($barrados.Count -gt 0) {
    Log ("ficou de fora: " + ($barrados -join '; '))
    $lista = ($barrados | ForEach-Object { "- $_" }) -join "`n"
    Recado 'sincronizacao-barrados' 'sim' "Estes arquivos mudaram aqui mas NAO subiram pro GitHub (continuam salvos neste computador):`n`n$lista`n`nSe for senha ou chave, o lugar dela e o .env. Se for arquivo pesado, ele fica no computador e no Drive."
    RodarGit add -- "_memoria/recados" | Out-Null
}

# 4. Guarda o que mudou aqui
RodarGit diff --cached --name-only | Out-Null
$n = @($gitSaida -split "`n" | Where-Object { $_ }).Count
if ($n -gt 0) {
    if ((RodarGit commit -q -m "sync automatico ($origem): $n arquivo(s)") -ne 0) { Log "erro ao guardar: $gitSaida"; exit 0 }
    Log "guardado: $n arquivo(s)"
}

# 5. Traz o que mudou no outro computador
if ((RodarGit pull --rebase --autostash -q) -ne 0) {
    $emConflito = ''
    if ((Test-Path '.git\rebase-merge') -or (Test-Path '.git\rebase-apply')) {
        RodarGit diff --name-only --diff-filter=U | Out-Null
        $emConflito = $gitSaida
        RodarGit rebase --abort | Out-Null
        Log "parado: o mesmo arquivo mudou nos dois computadores: $($emConflito -replace "`n", ', ')"
        $lista = (($emConflito -split "`n" | Where-Object { $_ }) | ForEach-Object { "- $_" }) -join "`n"
        Recado 'sincronizacao-conflito' 'sim' "O mesmo arquivo foi mexido neste computador e no outro, e eu nao junto sozinho pra nao apagar nada:`n`n$lista`n`nNada se perdeu: o trabalho deste computador esta guardado aqui. A sincronizacao automatica fica esperando ate alguem juntar. E so pedir pro Claude: 'synca' (o /syncar junta com voce)."
        RodarGit add -- "_memoria/recados" | Out-Null
        RodarGit commit -q -m "sync automatico ($origem): recado de conflito" | Out-Null
    } else {
        Log "nao consegui trazer (internet?): $gitSaida"
    }
    exit 0
}

# 6. Manda o que mudou aqui
RodarGit rev-list --count '@{u}..HEAD' | Out-Null
if ([int]($gitSaida.Trim()) -gt 0) {
    if ((RodarGit push -q) -ne 0) { Log "nao consegui mandar: $gitSaida" } else { Log 'enviado pro GitHub' }
}
