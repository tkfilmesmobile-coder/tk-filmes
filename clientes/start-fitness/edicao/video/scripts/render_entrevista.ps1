# Renderiza o vídeo 2 (entrevista) e acerta o volume pro Instagram (loudnorm -14 LUFS, pico -1,5 dBTP).
# Mesmo acabamento do render_final.ps1 (vídeo 1): converte pra yuv420p bt709 faixa de TV (cor igual ao bruto).
# Saída: out/final/<data> · <título> (<versão>).mp4  (e uma cópia no Drive do cliente, se -drive)
param([string]$versao = 'v1', [switch]$drive)
Set-Location (Split-Path $PSScriptRoot)
$env:PATH = "$env:LOCALAPPDATA\Programs\node;$env:PATH"
$ff = "$env:LOCALAPPDATA\CapCut\Apps\9.6.0.4097\ffmpeg.exe"
New-Item -ItemType Directory -Force out\final | Out-Null
$t0 = Get-Date
npx remotion render entrevista-expectativas out/final/_entrevista.mp4 --concurrency=6 --crf=17 --log=error 2>&1 | Select-Object -Last 5
$saida = "out\final\2026-10-28 · Entrevista Expectativas 2ª Corrida ($versao).mp4"
& $ff -v error -y -i out\final\_entrevista.mp4 -vf "scale=in_range=pc:out_range=tv:in_color_matrix=bt601:out_color_matrix=bt709,format=yuv420p" -c:v h264_nvenc -preset p7 -rc vbr -cq 15 -b:v 18M -color_range tv -colorspace bt709 -color_primaries bt709 -color_trc bt709 -af "loudnorm=I=-14:TP=-1.5:LRA=11,aresample=48000" -c:a aac -b:a 256k -movflags +faststart $saida
if (Test-Path $saida) { Remove-Item out\final\_entrevista.mp4 -Confirm:$false }
"render: {0:N0}s -> {1}" -f ((Get-Date) - $t0).TotalSeconds, $saida
if ($drive) {
  $dest = "H:\Meu Drive\Start Fitnes\POSTS\2026-10"
  New-Item -ItemType Directory -Force $dest | Out-Null
  Copy-Item $saida $dest
  "Drive: $dest"
}
