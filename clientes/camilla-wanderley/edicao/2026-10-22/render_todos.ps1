# Renderiza os vídeos da diária de 2026-10-22, exporta em yuv420p (faixa de TV, abre em qualquer player e no
# Instagram) e confere cada um. Log em out\2026-10-22\render.log.
param([string[]]$ids = @('vlog-2026-10-22','feedback-robervania','feedback-colaboradora-cip','clareamento-noiva','clareamento-caseiro-erro','implante-sem-abrir-gengiva','espaco-entre-dentes-resina'), [string]$nomeLog = 'render.log')
$ErrorActionPreference = 'Continue'
$ids = @($ids | ForEach-Object { $_ -split ',' } | Where-Object { $_ })  # -File passa "a,b,c" como um texto só
$env:Path = "$env:LOCALAPPDATA\Programs\node;$env:Path"
$pv = Join-Path $PSScriptRoot '..\perfil-video'
Set-Location $pv
$out = 'out\2026-10-22'
New-Item -ItemType Directory -Force $out | Out-Null
$log = Join-Path $out $nomeLog  # um log por lote (dois lotes ao mesmo tempo não brigam pelo arquivo)
$ff = 'node_modules\@remotion\compositor-win32-x64-msvc\ffmpeg.exe'
$py = "$env:LOCALAPPDATA\Programs\Python312\python.exe"
"[$(Get-Date -Format 'HH:mm:ss')] inicio: $($ids -join ', ')" | Out-File $log -Append -Encoding utf8
foreach ($id in $ids) {
  $t = Get-Date
  & npx.cmd remotion render $id "$out\$id-render.mp4" --concurrency=4 --log=error 2>&1 | Out-File $log -Append -Encoding utf8
  if (Test-Path "$out\$id-render.mp4") {
    & $ff -v error -y -i "$out\$id-render.mp4" -vf "scale=in_range=pc:out_range=tv,format=yuv420p" -color_range tv -c:v libx264 -profile:v high -crf 18 -preset medium -c:a aac -b:a 192k -movflags +faststart "$out\$id.mp4" 2>&1 | Out-File $log -Append -Encoding utf8
    & $py (Join-Path $PSScriptRoot 'conferir.py') "$out\$id.mp4" "$out\$id-conferir.jpg" 2>&1 | Out-File $log -Append -Encoding utf8
    "[$(Get-Date -Format 'HH:mm:ss')] $id ok em $([int]((Get-Date) - $t).TotalSeconds)s" | Out-File $log -Append -Encoding utf8
  } else {
    "[$(Get-Date -Format 'HH:mm:ss')] $id FALHOU" | Out-File $log -Append -Encoding utf8
  }
}
"[$(Get-Date -Format 'HH:mm:ss')] fim" | Out-File $log -Append -Encoding utf8
