# Renderiza a chamada e acerta o volume pro Instagram (loudnorm -14 LUFS, pico -1,5 dBTP).
# Saída: out/final/<data> · <título>.mp4  (e uma cópia no Drive do cliente, se -drive)
param([string]$versao = 'v1', [switch]$drive)
Set-Location (Split-Path $PSScriptRoot)
$env:PATH = "$env:LOCALAPPDATA\Programs\node;$env:PATH"
$ff = "$env:LOCALAPPDATA\CapCut\Apps\9.6.0.4097\ffmpeg.exe"  # o do Remotion é enxuto, sem loudnorm
New-Item -ItemType Directory -Force out\final | Out-Null
$t0 = Get-Date
npx remotion render chamada-corrida out/final/_chamada.mp4 --concurrency=6 --crf=17 --log=error 2>&1 | Select-Object -Last 5
$saida = "out\final\2026-10-28 · Chamada 2ª Corrida Start Fitness ($versao).mp4"
& $ff -v error -y -i out\final\_chamada.mp4 -c:v copy -af "loudnorm=I=-14:TP=-1.5:LRA=11,aresample=48000" -c:a aac -b:a 256k -movflags +faststart $saida
if (Test-Path $saida) { Remove-Item out\final\_chamada.mp4 -Confirm:$false }
"render: {0:N0}s -> {1}" -f ((Get-Date) - $t0).TotalSeconds, $saida
if ($drive) {
  $dest = "H:\Meu Drive\Start Fitnes\POSTS\2026-10"
  New-Item -ItemType Directory -Force $dest | Out-Null
  Copy-Item $saida $dest
  "Drive: $dest"
}
