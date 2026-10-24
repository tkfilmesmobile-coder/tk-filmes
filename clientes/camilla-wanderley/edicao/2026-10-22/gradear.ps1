# Aplica o color grade fixo da Camilla (look CAMILLA de scripts/grade.py) nos clipes usados na montagem.
# Entrada: public/midia/2026-10-23/sdr/<IMG>.mp4  ·  Saída: public/midia/2026-10-23/grade/<IMG>.mp4
$pv = Join-Path $PSScriptRoot '..\perfil-video'
Set-Location $pv
$py = "$env:LOCALAPPDATA\Programs\Python312\python.exe"
$cortes = Get-Content (Join-Path $PSScriptRoot 'cortes.json') -Raw -Encoding UTF8 | ConvertFrom-Json
$arqs = $cortes.videos.trechos.arq | Sort-Object -Unique
New-Item -ItemType Directory -Force 'public\midia\2026-10-23\grade' | Out-Null
foreach ($a in $arqs) {
  $saida = "public\midia\2026-10-23\grade\$a.mp4"
  if (Test-Path $saida) { continue }
  $t = Get-Date
  & $py scripts\grade.py clipe CAMILLA "public\midia\2026-10-23\sdr\$a.mp4" $saida
  "$a {0:N0}s" -f ((Get-Date) - $t).TotalSeconds
}
"fim"
