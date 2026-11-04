# Renderiza a chamada "Live Black Day" da Pingo de Gente e acerta o volume pro Instagram (loudnorm -14 LUFS, pico -1,5 dBTP).
# Saída: out/final/<data> · Live Black Day Pingo de Gente (<versão>).mp4  (e cópia no Drive da cliente, se -drive)
# Mesmo caminho do render_final.ps1 da Start Fitness (2026-10-28).
param([string]$versao = 'v1', [switch]$drive)
Set-Location (Split-Path $PSScriptRoot)
$env:PATH = "$env:LOCALAPPDATA\Programs\node;$env:PATH"
$ff = "$env:LOCALAPPDATA\CapCut\Apps\9.6.0.4097\ffmpeg.exe"  # o do Remotion é enxuto, sem loudnorm
New-Item -ItemType Directory -Force out\final | Out-Null
$t0 = Get-Date
npx remotion render live-black-day out/final/_bruto.mp4 --concurrency=6 --crf=17 --log=error 2>&1 | Select-Object -Last 5
# sem "·" no nome: o PowerShell 5.1 lê este arquivo como ANSI e o ponto do meio vira "Â·"
$saida = "out\final\04-11-2026 - Live Black Day Pingo de Gente ($versao).mp4"
# o Remotion sai em faixa cheia bt601: converte pra yuv420p bt709 faixa de TV, como o bruto veio (sem isso o rosto fica mais vermelho)
& $ff -v error -y -i out\final\_bruto.mp4 -vf "scale=in_range=pc:out_range=tv:in_color_matrix=bt601:out_color_matrix=bt709,format=yuv420p" -c:v h264_nvenc -preset p7 -rc vbr -cq 15 -b:v 18M -color_range tv -colorspace bt709 -color_primaries bt709 -color_trc bt709 -af "loudnorm=I=-14:TP=-1.5:LRA=11,aresample=48000" -c:a aac -b:a 256k -movflags +faststart $saida
if (Test-Path $saida) { Remove-Item out\final\_bruto.mp4 -Confirm:$false }
"render: {0:N0}s -> {1}" -f ((Get-Date) - $t0).TotalSeconds, $saida
if ($drive) {
  $dest = "H:\Meu Drive\Pingo de Gente"
  New-Item -ItemType Directory -Force $dest | Out-Null
  Copy-Item $saida $dest
  "Drive: $dest"
}
