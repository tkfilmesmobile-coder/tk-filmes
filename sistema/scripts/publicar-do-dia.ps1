# Publica no Instagram o post do dia que esta na pasta de posts e ainda nao saiu.
# Roda sozinho no GitHub (workflow .github/workflows/publicar-do-dia.yml) e tambem em qualquer PC.
# Autorizacao da Talyta (2026-10-23): post do calendario aprovado sai sem perguntar.
#
# Como acha o post do dia: <Pasta>/<AAAA-MM>/<AAAA-MM-DD>-<nome>-legenda.md
#   + <id>.png (imagem)  ou  <id>-01.png, <id>-02.png... (carrossel)  ou  <id>.mp4 (reels)
# Nunca duplica: antes de publicar, confere no perfil se ja existe post com a mesma primeira linha da legenda.
#
# uso: publicar-do-dia.ps1 -Conta TK_FILMES -Pasta tk-filmes/posts [-Data 2026-10-26] [-DryRun]
param(
  [string]$Conta = 'TK_FILMES',
  [string]$Pasta = 'tk-filmes/posts',
  [string]$Data = '',
  [switch]$DryRun
)
$ErrorActionPreference = 'Stop'
$Root = Split-Path (Split-Path $PSScriptRoot -Parent) -Parent
if (-not $Data) { $Data = [DateTime]::UtcNow.AddHours(-3).ToString('yyyy-MM-dd') }  # horario de Brasilia
$Mes = $Data.Substring(0, 7)
$dir = Join-Path (Join-Path $Root $Pasta) $Mes
$base = 'https://graph.instagram.com/v21.0'
$curl = if ($IsLinux -or $IsMacOS) { 'curl' } else { 'curl.exe' }

# Credenciais: variavel de ambiente (GitHub) ou .env da raiz (PC)
function Cred($nome) {
  $v = [Environment]::GetEnvironmentVariable($nome)
  if (-not $v) {
    $envFile = Join-Path $Root '.env'
    if (Test-Path $envFile) {
      $l = Get-Content $envFile -Encoding UTF8 | Where-Object { $_ -like "$nome=*" } | Select-Object -First 1
      if ($l) { $v = ($l -replace '^[^=]+=', '').Trim() }
    }
  }
  return $v
}
$tok = Cred "INSTAGRAM_ACCESS_TOKEN_$Conta"
$uid = Cred "INSTAGRAM_USER_ID_$Conta"
if (-not $tok -or -not $uid) { Write-Host "Faltam INSTAGRAM_ACCESS_TOKEN_$Conta e INSTAGRAM_USER_ID_$Conta"; exit 1 }

function Limpa($s) { if (-not $s) { return '' }; return (($s -split "`n")[0]).Trim() }
function Form($url, $campos) {
  $campos['access_token'] = $tok
  $body = ($campos.GetEnumerator() | ForEach-Object { [Uri]::EscapeDataString($_.Key) + '=' + [Uri]::EscapeDataString([string]$_.Value) }) -join '&'
  try { return Invoke-RestMethod -Method Post -Uri $url -Body ([Text.Encoding]::UTF8.GetBytes($body)) -ContentType 'application/x-www-form-urlencoded; charset=utf-8' }
  catch { $m = $_.ErrorDetails.Message; if (-not $m) { $m = $_.Exception.Message }; throw ("Instagram recusou: " + ($m -replace [regex]::Escape($tok), '[token]')) }
}
function Espera($id, $segundos) {
  for ($i = 0; $i -lt ($segundos / 3); $i++) {
    Start-Sleep 3
    $s = Invoke-RestMethod "$base/$($id)?fields=status_code&access_token=$tok"
    if ($s.status_code -eq 'FINISHED') { return }
    if ($s.status_code -eq 'ERROR') { throw "o Instagram nao aceitou a midia (container $id)" }
  }
  throw "o Instagram demorou demais pra processar (container $id)"
}
function Sobe($arquivo) {
  $tmp = Join-Path ([IO.Path]::GetTempPath()) ([IO.Path]::GetFileName($arquivo))
  Copy-Item $arquivo $tmp -Force
  $j = & $curl -s -F "files[]=@$tmp" 'https://uguu.se/upload'
  $u = $null
  try { $u = ($j | ConvertFrom-Json).files[0].url } catch {}
  if ($u -notmatch '^https://') { $u = & $curl -s -F 'reqtype=fileupload' -F "fileToUpload=@$tmp" 'https://catbox.moe/user/api.php' }
  if ($u -notmatch '^https://') { throw "nao consegui subir $([IO.Path]::GetFileName($arquivo)) pra um link publico" }
  return $u
}

Write-Host "Data: $Data | conta: $Conta | pasta: $Pasta/$Mes$(if ($DryRun) { ' | SIMULACAO, nao publica' })"
if (-not (Test-Path $dir)) { Write-Host "Sem pasta $Pasta/$Mes. Nada pra hoje."; exit 0 }
$legendas = Get-ChildItem $dir -File -Filter "$Data-*-legenda.md" | Sort-Object Name
if (-not $legendas) { Write-Host "Nenhum post marcado pra $Data nesta pasta."; exit 0 }

$recentes = (Invoke-RestMethod "$base/$uid/media?fields=caption,permalink&limit=30&access_token=$tok").data
$falhou = $false
foreach ($leg in $legendas) {
  $id = $leg.Name -replace '-legenda\.md$', ''
  $log = Join-Path $dir "$id-publicacao.log"
  $caption = ([IO.File]::ReadAllText($leg.FullName, [Text.Encoding]::UTF8)).Trim()
  $primeira = Limpa $caption
  function L($m) { $linha = "[$([DateTime]::UtcNow.AddHours(-3).ToString('yyyy-MM-dd HH:mm:ss'))] $m"; Write-Host $linha; if (-not $DryRun) { try { Add-Content -Path $log -Value $linha -Encoding UTF8 } catch {} } }

  $ja = $recentes | Where-Object { (Limpa $_.caption) -eq $primeira } | Select-Object -First 1
  if ($ja) { Write-Host "$id ja esta no perfil: $($ja.permalink)"; continue }

  $video = Join-Path $dir "$id.mp4"
  $slides = @(Get-ChildItem $dir -File -Filter "$id-0?.png" | Sort-Object Name)
  $img = Join-Path $dir "$id.png"
  if (Test-Path $video) { $tipo = 'reels' } elseif ($slides.Count -ge 2) { $tipo = "carrossel ($($slides.Count) slides)" } elseif (Test-Path $img) { $tipo = 'imagem' }
  else { Write-Host "$id sem imagem nem video nesta copia (video fica no PC e no Drive). Pulando."; continue }

  if ($DryRun) { Write-Host "PUBLICARIA $id como $tipo. Legenda comeca: $primeira"; continue }
  try {
    L "publicando $id como $tipo (robo-publicacao)"
    if ($tipo -eq 'reels') {
      $c = Form "$base/$uid/media" @{ media_type = 'REELS'; video_url = (Sobe $video); caption = $caption }
      Espera $c.id 300
    } elseif ($tipo -like 'carrossel*') {
      $filhos = @()
      foreach ($s in $slides) { $f = Form "$base/$uid/media" @{ image_url = (Sobe $s.FullName); is_carousel_item = 'true' }; Espera $f.id 60; $filhos += $f.id }
      $c = Form "$base/$uid/media" @{ media_type = 'CAROUSEL'; children = ($filhos -join ','); caption = $caption }
      Espera $c.id 60
    } else {
      $c = Form "$base/$uid/media" @{ image_url = (Sobe $img); caption = $caption }
      Espera $c.id 60
    }
    $p = Form "$base/$uid/media_publish" @{ creation_id = $c.id }
    $link = (Invoke-RestMethod "$base/$($p.id)?fields=permalink&access_token=$tok").permalink
    L "Publicado!"
    L "Link: $link"
  } catch {
    L "FALHOU: $($_.Exception.Message)"
    $falhou = $true
  }
}
if ($falhou) { exit 1 }
exit 0
