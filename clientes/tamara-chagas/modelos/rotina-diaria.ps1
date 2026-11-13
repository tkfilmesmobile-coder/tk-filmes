# ROTINA DIÁRIA DA TAMARA · REGRA IMUTÁVEL (Talyta, 12/11/2026): "de forma alguma os stories e o feed podem deixar de sair".
# Todo dia útil, às 7h30 (tarefa do Windows no PC kumyt, acorda o PC e roda assim que ligar se estiver desligado):
#  1. FEED: publica a arte do dia (posts/<data>-*) no @tamarachagas_prev em colaboração com o @dra.tamarachagas_ e no
#     TikTok. Se ninguém preparou arte pro dia, puxa a próxima da reserva (posts/reserva/) e publica.
#  2. STORIES: se o lote do dia (stories/<data>-b-roll/ordem.txt) não existe, monta na hora com o banco conferido
#     (modelos/stories_dia.py: 15+ stories no modelo de 11/11) e publica tudo no @tamarachagas_prev.
#  3. Falhou algo: tenta de novo e deixa recado em _memoria/recados/.
# uso: rotina-diaria.ps1 [-Data AAAA-MM-DD]
param([string]$Data = (Get-Date -Format "yyyy-MM-dd"))
$ErrorActionPreference = "Continue"
Set-Location "C:\Users\kumyt\Documents\Projeto TK FILMES\TK FILMES"
$env:Path = "C:\Users\kumyt\AppData\Local\Programs\node;" + $env:Path
$node = "C:\Users\kumyt\AppData\Local\Programs\node\node.exe"
$py = "C:\Users\kumyt\tools\python312\python.exe"
$t = "clientes/tamara-chagas"
$log = "$t/stories/rotina-diaria.log"
function Linha([string]$x) { "[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] $x" | Out-File $log -Append -Encoding utf8 }
function Recado([string]$assunto, [string]$texto) {
  $r = "_memoria/recados/$Data-pc-kumyt-rotina-tamara-$assunto.md"
  "de: rotina diária da Tamara (PC kumyt)`nquando: $(Get-Date -Format 'yyyy-MM-dd HH:mm')`nprecisa de ação: sim`n`n$texto" | Out-File $r -Encoding utf8
}
$dia = [datetime]::ParseExact($Data, "yyyy-MM-dd", $null)
if ($dia.DayOfWeek -in @("Saturday", "Sunday")) { Linha "$Data é fim de semana: nada a fazer"; exit 0 }
$cfg = Get-Content "$t/stories/auto/config.json" -Raw -Encoding utf8 | ConvertFrom-Json
if ($cfg.sem_expediente -contains $Data) { Linha "$Data é feriado ou dia sem expediente (stories/auto/config.json): nada a fazer"; exit 0 }
Linha "== início da rotina de $Data"

# espera a internet (o PC às vezes acorda sem rede), até 15 min
for ($w = 0; $w -lt 30; $w++) {
  try { Invoke-WebRequest -Uri "https://graph.instagram.com/" -Method Head -TimeoutSec 10 -UseBasicParsing | Out-Null; break }
  catch { if ($_.Exception.Response) { break }; Start-Sleep -Seconds 30 }
}

# ---------- 1. FEED ----------
$feed = Get-ChildItem "$t/posts" -Directory -Filter "$Data-*" | Where-Object { Test-Path "$($_.FullName)/post.png" } | Select-Object -First 1
if (-not $feed) {
  $res = Get-ChildItem "$t/posts/reserva" -Directory -ErrorAction SilentlyContinue | Where-Object { Test-Path "$($_.FullName)/post.png" } | Sort-Object Name | Select-Object -First 1
  if ($res) {
    $novo = "$t/posts/$Data-$($res.Name -replace '^\d+-', '')"
    Move-Item $res.FullName $novo
    $feed = Get-Item $novo
    Linha "feed: sem arte do dia, usei a da reserva ($($res.Name))"
    $sobra = (Get-ChildItem "$t/posts/reserva" -Directory -ErrorAction SilentlyContinue | Measure-Object).Count
    if ($sobra -lt 3) { Recado "reserva-feed" "A reserva de artes do feed está com $sobra arte(s). Produzir mais em clientes/tamara-chagas/posts/reserva/ (padrão post-tamara, fonte oficial)." }
  } else { Linha "FEED: SEM ARTE DO DIA E SEM RESERVA"; Recado "feed-sem-arte" "Não havia arte do dia nem reserva: o feed de $Data NÃO saiu. Produzir arte e publicar." }
}
if ($feed -and -not (Test-Path "$($feed.FullName)/.publicado")) {
  $ok = $false
  for ($i = 1; $i -le 3 -and -not $ok; $i++) {
    $s = (& $node --env-file=.env .claude/skills/publicar-social-ratos/scripts/publish-graph-api.js --conta TAMARACHAGAS_PREV --images "$($feed.FullName)/post.png" --caption-file "$($feed.FullName)/legenda.md" --colaboradores dra.tamarachagas_ 2>&1 | Out-String)
    Linha "feed $($feed.Name) (tentativa $i)`n$s"
    if ($s -match "Publicado!") { $ok = $true } else { Start-Sleep -Seconds 90 }
  }
  if ($ok) {
    "publicado em $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" | Out-File "$($feed.FullName)/.publicado" -Encoding utf8
    $s = (& $node --env-file=.env .claude/skills/publicar-social-ratos/scripts/publish-postforme.js --platform tiktok --conta tamarachagas.prev --images "$($feed.FullName)/post.png" --caption-file "$($feed.FullName)/legenda.md" 2>&1 | Out-String)
    Linha "tiktok $($feed.Name)`n$s"
  } else { Recado "feed-falhou" "O feed de $Data ($($feed.Name)) falhou 3 vezes. Ver $log." }
}

# ---------- 2. STORIES ----------
$lote = "$t/stories/$Data-b-roll"
if (-not (Test-Path "$lote/ordem.txt")) {
  $saud = if ((Get-Date).Hour -lt 12) { "Bom dia" } else { "Boa tarde" }
  Linha "stories: sem lote pronto, montando agora ($saud)"
  $s = (& $py "$t/modelos/stories_dia.py" $Data --saudacao $saud 2>&1 | Out-String)
  Linha $s
}
# lote montado antes da arte do feed: a arte entra como story antes do "até amanhã"
if ($feed -and (Test-Path "$lote/ordem.txt") -and -not (Test-Path "$lote/.publicado")) {
  $nomeArte = "arte-$($feed.Name.Substring(11)).jpg"
  $ordem = @(Get-Content "$lote/ordem.txt" -Encoding utf8)
  $story = @("$($feed.FullName)/story.png", "$($feed.FullName)/story.jpg") | Where-Object { Test-Path $_ } | Select-Object -First 1
  if ($story -and ($ordem -notcontains $nomeArte)) {
    Add-Type -AssemblyName System.Drawing
    $img = [Drawing.Image]::FromFile((Resolve-Path $story)); $img.Save((Join-Path (Resolve-Path $lote) $nomeArte), [Drawing.Imaging.ImageFormat]::Jpeg); $img.Dispose()
    $ordem = $ordem[0..($ordem.Count - 2)] + $nomeArte + $ordem[-1]
    [IO.File]::WriteAllLines((Join-Path (Resolve-Path $lote) "ordem.txt"), [string[]]$ordem, (New-Object Text.UTF8Encoding $false))
    Linha "stories: arte do feed ($nomeArte) inserida no lote"
  }
}
if (Test-Path "$lote/ordem.txt") {
  if (-not (Test-Path "$lote/.publicado")) { & "$t/modelos/publicar-stories-dia-pc-kumyt.ps1" -Data $Data -Forcar }
  $p = Get-Content "$lote/.publicado" -ErrorAction SilentlyContinue
  Linha "stories: $p"
  if ($p -notmatch "falhas: 0") { Recado "stories-falhas" "Lote de stories de $Data com falhas: $p. Ver stories/publicacao-diaria.log." }
} else { Recado "stories-sem-lote" "O lote de stories de $Data não pôde ser montado. Ver $log." }
Linha "== fim da rotina de $Data"
