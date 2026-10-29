# Publica no @cabelosmagalhaes o conteúdo do dia (reel ou post fixo), sem pedir aprovação (calendário aprovado pela
# Talyta em 2026-10-24). Chamado pelo Agendador de Tarefas do Windows deste PC (tarefas "TK - Ary AAAA-MM-DD").
# Lê clientes/ary-magalhaes/publicacao/<Data>/:  video.mp4 -> reels | 01.jpg..NN.jpg -> foto ou carrossel | legenda.txt
# Antes de publicar, renova o acesso do Instagram (vale 60 dias a cada renovação). Se falhar, tenta de novo (3x) e deixa recado.
# uso: publicar-agendado-pc-kumyt.ps1 -Data 2026-10-28 [-Teste]   (-Teste confere tudo e não publica)
param([Parameter(Mandatory=$true)][string]$Data, [switch]$Teste)
$raiz = (Resolve-Path (Join-Path $PSScriptRoot "..\..\..")).Path
Set-Location $raiz
$d = "clientes/ary-magalhaes/publicacao/$Data"
$log = "$d/publicacao.log"
$node = "$env:LOCALAPPDATA\Programs\node\node.exe"
$js = ".claude/skills/publicar-social-ratos/scripts/publish-graph-api.js"
$conta = "CABELOSMAGALHAES"
function L($t) { "[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] $t" | Out-File $log -Append -Encoding utf8 }
function Recado($t) {
  $r = "_memoria/recados/$(Get-Date -Format 'yyyy-MM-dd')-dono-ary-publicacao-$Data.md"
  "de: robô de publicação da Ary (Agendador do Windows, PC kumyt)`nquando: $(Get-Date -Format 'yyyy-MM-dd HH:mm')`nprecisa de ação: sim`n`n$t`nRegistro: $log" | Out-File $r -Encoding utf8
}

if (-not (Test-Path $d)) { New-Item -ItemType Directory -Force $d | Out-Null; L "sem pasta de publicação pra $Data"; Recado "Não existe pasta de publicação pra $Data."; exit 1 }
if ((Test-Path $log) -and (Select-String -Path $log -Pattern "PUBLICADO" -SimpleMatch -Quiet)) { L "já publicado antes; nada a fazer"; exit 0 }
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

# 2. O que publicar
$leg = "$d/legenda.txt"
if (Test-Path "$d/video.mp4") {
  $args1 = @("--video", "$d/video.mp4"); $tipo = "reels"
  if (Test-Path "$d/capa.jpg") { $args1 += @("--cover", "$d/capa.jpg"); $tipo = "reels com capa" }
}
else {
  $imgs = Get-ChildItem "$d/[0-9][0-9].jpg" | Sort-Object Name | ForEach-Object { "$d/" + $_.Name }
  if (-not $imgs) { L "pasta sem vídeo nem imagem"; Recado "A pasta de ${Data} está vazia: nada publicado."; exit 1 }
  $args1 = @("--images", ($imgs -join ",")); $tipo = $(if ($imgs.Count -gt 1) { "carrossel ($($imgs.Count))" } else { "foto" })
}
if (-not (Test-Path $leg)) { L "sem legenda.txt"; Recado "Falta a legenda de ${Data}: nada publicado."; exit 1 }
if ($Teste) { L "teste ok: $tipo, legenda $((Get-Item $leg).Length) bytes, node $(& $node --version)"; exit 0 }

# 3. Publica (até 3 tentativas se cair antes de publicar; se já publicou, não repete)
for ($t = 1; $t -le 3; $t++) {
  L "publicando $tipo (tentativa $t)..."
  $saida = (& $node --env-file=.env $js --conta $conta @args1 --caption-file $leg 2>&1 | Out-String)
  $saida | Out-File $log -Append -Encoding utf8
  if ($LASTEXITCODE -eq 0 -or $saida -match "(?i)publicad|permalink|instagram\.com/(p|reel)/") { L "PUBLICADO: $tipo"; exit 0 }
  Start-Sleep -Seconds 90
}
Recado "O $tipo de $Data não foi publicado depois de 3 tentativas. Rode de novo: clientes/ary-magalhaes/modelos/publicar-agendado-pc-kumyt.ps1 -Data $Data"
exit 1
