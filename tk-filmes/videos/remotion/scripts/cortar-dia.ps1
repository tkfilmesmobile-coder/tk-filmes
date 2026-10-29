# Corta e enquadra os trechos de b-roll do reels "Um dia na TK" (2026-10-29) em public/dia/*.mp4 (1080x1920, sem som).
# Cada linha: nome, código do b-roll, início (s), duração (s), recorte (largura:altura:x:y na resolução original, ou "" pra usar o quadro todo).
# uso: powershell -File scripts/cortar-dia.ps1
$ff = Join-Path $PSScriptRoot "..\node_modules\@remotion\compositor-win32-x64-msvc\ffmpeg.exe"
$banco = "H:\Meu Drive\TK FILMES\04 BANCO DE B-ROLL"
$saida = Join-Path $PSScriptRoot "..\public\dia"
New-Item -ItemType Directory -Force $saida | Out-Null
$cortes = @(
  @("s01-touchpad",   "BR-024", 1.5,   3.0, ""),
  @("s02-mesa",       "BR-022", 20,    3.0, ""),
  @("s03-teclado",    "BR-022", 12,    3.0, "908:1614:432:1459"),
  @("s04-monitor",    "BR-022", 212,   3.0, "864:1536:1253:691"),
  @("s05-celular",    "BR-021", 1.0,   3.0, "778:1383:151:537"),
  @("s06-mouse",      "BR-022", 65,    3.0, "692:1230:778:1843"),
  @("s07-pensando",   "BR-022", 157,   3.5, "1080:1920:0:420"),
  @("s08-gravando",   "BR-003", 1.5,   2.0, "1728:3072:216:300"),
  @("s09-camera",     "BR-009", 1.0,   2.0, "1080:1920:540:192"),
  @("s10-ceu",        "BR-013", 3.0,   2.0, "1512:2688:540:0"),
  @("s11-digitando",  "BR-022", 30,    3.0, "1296:2304:0:768"),
  @("s12-touchpad2",  "BR-024", 14,    3.0, "594:1056:243:120"),
  @("s13-final",      "BR-022", 150,   7.5, "")
)
foreach ($c in $cortes) {
  $orig = Get-ChildItem $banco -Recurse -File -Filter "$($c[1])*" | Select-Object -First 1
  $vf = if ($c[4]) { "crop=$($c[4]),scale=1080:1920" } else { "scale=1080:1920" }
  & $ff -v error -y -ss $c[2] -t $c[3] -i $orig.FullName -vf $vf -an -c:v libx264 -preset medium -crf 17 -pix_fmt yuv420p "$saida\$($c[0]).mp4"
  if ($LASTEXITCODE -ne 0) { Write-Host "FALHOU: $($c[0])" } else { Write-Host "ok $($c[0])" }
}
