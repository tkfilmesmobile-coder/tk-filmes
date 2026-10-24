# Publica no @dra.camillawanderley o post do dia e os stories dele, sem pedir aprovação (pedido da Talyta, 2026-10-24).
# Chamado pelo Agendador de Tarefas do Windows (tarefas "TK - Camilla AAAA-MM-DD"), uma vez por data do calendário.
# Lê clientes/camilla-wanderley/publicacao/<Data>/ (montada por calendarios/prepara_publicacao_2026-11-12.py):
#   video.mp4 -> reels | 01.jpg..NN.jpg -> carrossel (ou foto única) | legenda.md | story-*.jpg -> stories, na ordem
# Antes de publicar, renova o acesso do Instagram (vale 60 dias a cada renovação). Se algo falhar, deixa recado.
# uso: publicar-agendado.ps1 -Data 2026-10-26 [-Teste]   (-Teste confere tudo e não publica)
param([Parameter(Mandatory=$true)][string]$Data, [switch]$Teste)
$raiz = "C:\Users\kumyt\Documents\Projeto TK FILMES\TK FILMES"
Set-Location $raiz
$d = "clientes/camilla-wanderley/publicacao/$Data"
$log = "$d/publicacao.log"
$node = "$env:LOCALAPPDATA\Programs\node\node.exe"
$js = ".claude/skills/publicar-social-ratos/scripts/publish-graph-api.js"
$conta = "DRA_CAMILLAWANDERLEY"
function L($t) { "[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] $t" | Out-File $log -Append -Encoding utf8 }
function Recado($t) {
  $r = "_memoria/recados/$(Get-Date -Format 'yyyy-MM-dd')-dono-camilla-publicacao-$Data.md"
  "de: robô de publicação da Camilla (Agendador do Windows, este PC)`nquando: $(Get-Date -Format 'yyyy-MM-dd HH:mm')`nprecisa de ação: sim`n`n$t`nRegistro: $log" | Out-File $r -Encoding utf8
}

if (-not (Test-Path $d)) { New-Item -ItemType Directory -Force $d | Out-Null; L "sem pasta de publicação pra $Data"; Recado "Não existe pasta de publicação pra $Data."; exit 1 }
if ((Test-Path $log) -and (Select-String -Path $log -Pattern "TUDO PUBLICADO" -Quiet)) { L "já publicado antes; nada a fazer"; exit 0 }
L "início$(if ($Teste) { ' (teste, não publica)' })"

# 1. Renova o acesso do Instagram e grava no .env (o token nunca vai pro registro)
try {
  $linhas = [IO.File]::ReadAllLines("$raiz\.env")
  $i = [Array]::FindIndex($linhas, [Predicate[string]]{ param($x) $x -like "INSTAGRAM_ACCESS_TOKEN_$conta=*" })
  $tok = $linhas[$i].Split("=", 2)[1].Trim('"')
  $r = Invoke-RestMethod "https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token=$tok" -TimeoutSec 60
  if ($r.access_token) {
    if (-not $Teste) { $linhas[$i] = "INSTAGRAM_ACCESS_TOKEN_$conta=$($r.access_token)"; [IO.File]::WriteAllLines("$raiz\.env", $linhas, (New-Object Text.UTF8Encoding $false)) }
    L "acesso do Instagram renovado (vale mais $([math]::Round($r.expires_in/86400)) dias)"
  }
} catch { L "não renovei o acesso agora ($($_.Exception.Message)); sigo com o atual" }

# 2. Reels da Mari: o arquivo vem do Drive, se ainda não estiver na pasta
if (-not (Test-Path "$d/video.mp4") -and -not (Test-Path "$d/01.jpg")) {
  $achado = Get-ChildItem "H:\Meu Drive\Dra. Camilla Wanderlley\VÍDEOS EDITADOS\2026-10", "H:\Meu Drive\Dra. Camilla Wanderlley\Para edição" -Filter *.mp4 -Recurse -ErrorAction SilentlyContinue |
    Where-Object { $_.Name -match '(?i)mari' } | Sort-Object LastWriteTime -Descending | Select-Object -First 1
  if (-not $achado) { L "vídeo do dia não encontrado (Drive: VÍDEOS EDITADOS/2026-10 ou Para edição, nome com 'Mari'); nada publicado"; Recado "O reels de $Data não saiu: o vídeo não está no Drive (VÍDEOS EDITADOS/2026-10, com 'Mari' no nome). Coloque o arquivo lá e rode de novo: clientes/camilla-wanderley/modelos/publicar-agendado.ps1 -Data $Data"; exit 1 }
  if ($achado.Length -gt 120MB) {
    $ff = "clientes/camilla-wanderley/edicao/perfil-video/node_modules/@remotion/compositor-win32-x64-msvc/ffmpeg.exe"
    & $ff -v error -y -i $achado.FullName -vf "scale=1080:1920,format=yuv420p" -c:v h264_nvenc -b:v 8000k -maxrate 10000k -bufsize 16000k -c:a aac -b:a 160k -movflags +faststart "$d/video.mp4"
  } else { Copy-Item $achado.FullName "$d/video.mp4" }
  L "vídeo do Drive: $($achado.Name)"
}

# 3. Post do dia
$leg = "$d/legenda.md"
if (Test-Path "$d/video.mp4") { $args1 = @("--video", "$d/video.mp4"); $tipo = "reels" }
else {
  $imgs = Get-ChildItem "$d/[0-9][0-9].jpg" | Sort-Object Name | ForEach-Object { "$d/" + $_.Name }
  $args1 = @("--images", ($imgs -join ",")); $tipo = $(if ($imgs.Count -gt 1) { "carrossel ($($imgs.Count))" } else { "foto" })
}
$stories = Get-ChildItem "$d/story-*.jpg" -ErrorAction SilentlyContinue | Sort-Object Name
if ($Teste) {
  L "teste ok: $tipo, legenda $((Get-Item $leg).Length) bytes, $($stories.Count) stories, node $(& $node --version)"
  exit 0
}
L "publicando $tipo..."
& $node --env-file=.env $js --conta $conta @args1 --caption-file $leg 2>&1 | Out-File $log -Append -Encoding utf8
$cod = $LASTEXITCODE
L "post: fim (código $cod)"
if ($cod -ne 0) { Recado "O post de $Data ($tipo) não foi publicado (código $cod). Os stories não saíram. Rode de novo: clientes/camilla-wanderley/modelos/publicar-agendado.ps1 -Data $Data"; exit 1 }

# 4. Stories, na ordem, com pausa pro Instagram liberar
$ok = 0
foreach ($s in $stories) {
  Start-Sleep -Seconds 20
  L "story $($s.Name)..."
  & $node --env-file=.env $js --conta $conta --images ("$d/" + $s.Name) --story 2>&1 | Out-File $log -Append -Encoding utf8
  if ($LASTEXITCODE -eq 0) { $ok++ } else { L "story $($s.Name) falhou (código $LASTEXITCODE)" }
}
if ($ok -lt $stories.Count) { Recado "O post de $Data saiu, mas só $ok de $($stories.Count) stories foram publicados. Veja o registro." }
L "TUDO PUBLICADO: 1 post ($tipo) + $ok de $($stories.Count) stories"
