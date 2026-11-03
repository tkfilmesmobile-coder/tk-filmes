# Publica no @dra.camillawanderley o post do dia e os stories dele, sem pedir aprovação (pedido da Talyta, 2026-10-24).
# Chamado pelo Agendador de Tarefas do Windows (tarefas "TK - Camilla AAAA-MM-DD"): começa às 12h do dia e repete a cada
# 30 min até as 22h, então quem falhou (rede, PC dormindo) tenta de novo no mesmo dia. Nunca publica duas vezes:
# post já publicado não sai de novo, e só os stories que faltaram são reenviados. Dia que já passou não é publicado
# atrasado (deixa recado), pra não acumular dois posts no mesmo dia; pra forçar, use -Forcar.
# Lê clientes/camilla-wanderley/publicacao/<Data>/ (montada por calendarios/prepara_publicacao_2026-11-12.py):
#   video.mp4 -> reels | 01.jpg..NN.jpg -> carrossel (ou foto única) | legenda.md | story-*.jpg -> stories, na ordem
# Antes de publicar, renova o acesso do Instagram (vale 60 dias a cada renovação). Se algo falhar, deixa recado.
# uso: publicar-agendado.ps1 -Data 2026-10-26 [-Teste] [-Forcar]   (-Teste confere tudo e não publica)
param([Parameter(Mandatory=$true)][string]$Data, [switch]$Teste, [switch]$Forcar)
$raiz = "C:\Users\kumyt\Documents\Projeto TK FILMES\TK FILMES"
Set-Location $raiz
$d = "clientes/camilla-wanderley/publicacao/$Data"
$log = "$d/publicacao.log"
$node = "$env:LOCALAPPDATA\Programs\node\node.exe"
$js = ".claude/skills/publicar-social-ratos/scripts/publish-graph-api.js"
$conta = "DRA_CAMILLAWANDERLEY"
function L($t) { "[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] $t" | Out-File $log -Append -Encoding utf8 }
function Recado($t) {
  $r = "_memoria/recados/$Data-dono-camilla-publicacao.md"
  "de: robô de publicação da Camilla (Agendador do Windows, PC do dono)`nquando: $(Get-Date -Format 'yyyy-MM-dd HH:mm')`nprecisa de ação: sim`n`n$t`nRegistro: $log" | Out-File $r -Encoding utf8
}
function NoLog($p) { (Test-Path $log) -and (Select-String -Path $log -Pattern $p -Quiet) }

if (-not (Test-Path $d)) { New-Item -ItemType Directory -Force $d | Out-Null; L "sem pasta de publicação pra $Data"; Recado "Não existe pasta de publicação pra $Data."; exit 1 }
if (NoLog "TUDO PUBLICADO") { exit 0 }
$hoje = (Get-Date).ToString("yyyy-MM-dd")
if (-not $Forcar -and -not $Teste) {
  if ($Data -gt $hoje) { exit 0 }
  if ($Data -lt $hoje) {
    if (-not (NoLog "dia passou")) { L "o dia passou sem publicar; não publico atrasado"; Recado "O post de $Data não saiu no dia (PC desligado ou falha). Não publiquei atrasado pra não juntar dois posts no mesmo dia. Pra publicar mesmo assim: clientes/camilla-wanderley/modelos/publicar-agendado.ps1 -Data $Data -Forcar" }
    exit 1
  }
}
L "início$(if ($Teste) { ' (teste, não publica)' })$(if ($Forcar) { ' (forçado)' })"

# 1. Renova o acesso do Instagram e grava no .env (o token nunca vai pro registro); se o arquivo estiver ocupado, insiste
try {
  $linhas = [IO.File]::ReadAllLines("$raiz\.env")
  $i = [Array]::FindIndex($linhas, [Predicate[string]]{ param($x) $x -like "INSTAGRAM_ACCESS_TOKEN_$conta=*" })
  $tok = $linhas[$i].Split("=", 2)[1].Trim('"')
  $r = Invoke-RestMethod "https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token=$tok" -TimeoutSec 60
  if ($r.access_token -and -not $Teste) {
    $linhas[$i] = "INSTAGRAM_ACCESS_TOKEN_$conta=$($r.access_token)"
    $gravou = $false
    for ($t = 1; $t -le 10 -and -not $gravou; $t++) {
      try { [IO.File]::WriteAllLines("$raiz\.env", $linhas, (New-Object Text.UTF8Encoding $false)); $gravou = $true } catch { Start-Sleep -Seconds 3 }
    }
    L $(if ($gravou) { "acesso do Instagram renovado (vale mais $([math]::Round($r.expires_in/86400)) dias)" } else { "renovei o acesso mas não consegui gravar (.env ocupado); sigo com o atual" })
  }
} catch { L "não renovei o acesso agora ($($_.Exception.Message)); sigo com o atual" }

# 2. Reels sem arquivo na pasta (caso da Mari): procura no Drive
if (-not (Test-Path "$d/video.mp4") -and -not (Test-Path "$d/01.jpg")) {
  $achado = Get-ChildItem "H:\Meu Drive\Dra. Camilla Wanderlley\VÍDEOS EDITADOS\2026-10", "H:\Meu Drive\Dra. Camilla Wanderlley\Para edição" -Filter *.mp4 -Recurse -ErrorAction SilentlyContinue |
    Where-Object { $_.Name -match '(?i)mari' } | Sort-Object LastWriteTime -Descending | Select-Object -First 1
  if (-not $achado) { L "vídeo do dia não encontrado no Drive; nada publicado"; Recado "O reels de $Data não saiu: o vídeo não está no Drive (VÍDEOS EDITADOS/2026-10, com 'Mari' no nome)."; exit 1 }
  if ($achado.Length -gt 120MB) {
    $ff = "clientes/camilla-wanderley/edicao/perfil-video/node_modules/@remotion/compositor-win32-x64-msvc/ffmpeg.exe"
    & $ff -v error -y -i $achado.FullName -vf "scale=1080:1920,format=yuv420p" -c:v h264_nvenc -b:v 8000k -maxrate 10000k -bufsize 16000k -c:a aac -b:a 160k -movflags +faststart "$d/video.mp4"
  } else { Copy-Item $achado.FullName "$d/video.mp4" }
  L "vídeo do Drive: $($achado.Name)"
}

# 3. Post do dia (só se ainda não saiu)
$leg = "$d/legenda.md"
if (Test-Path "$d/video.mp4") { $args1 = @("--video", "$d/video.mp4"); $tipo = "reels" }
else {
  $imgs = Get-ChildItem "$d/[0-9][0-9].jpg" | Sort-Object Name | ForEach-Object { "$d/" + $_.Name }
  $args1 = @("--images", ($imgs -join ",")); $tipo = $(if ($imgs.Count -gt 1) { "carrossel ($($imgs.Count))" } else { "foto" })
}
$stories = Get-ChildItem "$d/story-*.jpg" -ErrorAction SilentlyContinue | Sort-Object Name
if ($Teste) { L "teste ok: $tipo, legenda $((Get-Item $leg).Length) bytes, $($stories.Count) stories, node $(& $node --version)"; exit 0 }
if (NoLog "post: fim \(código 0\)") { L "post já tinha saído; sigo pros stories" }
else {
  L "publicando $tipo..."
  & $node --env-file=.env $js --conta $conta @args1 --caption-file $leg 2>&1 | Out-File $log -Append -Encoding utf8
  $cod = $LASTEXITCODE
  L "post: fim (código $cod)"
  if ($cod -ne 0) { Recado "O post de $Data ($tipo) falhou (código $cod). O robô tenta de novo a cada 30 min até as 22h."; exit 1 }
}

# 4. Stories que ainda não saíram, na ordem, com pausa pro Instagram liberar
$falta = 0
foreach ($s in $stories) {
  if (NoLog "story ok: $($s.Name)") { continue }
  Start-Sleep -Seconds 20
  L "story $($s.Name)..."
  & $node --env-file=.env $js --conta $conta --images ("$d/" + $s.Name) --story 2>&1 | Out-File $log -Append -Encoding utf8
  if ($LASTEXITCODE -eq 0) { L "story ok: $($s.Name)" } else { L "story $($s.Name) falhou (código $LASTEXITCODE)"; $falta++ }
}
if ($falta -gt 0) { Recado "O post de $Data saiu, mas $falta stories falharam. O robô tenta de novo a cada 30 min até as 22h."; exit 1 }
if (Test-Path "_memoria/recados/$Data-dono-camilla-publicacao.md") { Remove-Item "_memoria/recados/$Data-dono-camilla-publicacao.md" }
L "TUDO PUBLICADO: 1 post ($tipo) + $($stories.Count) stories"
