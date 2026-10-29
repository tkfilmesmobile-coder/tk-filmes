# Render final dos 2 vídeos da diária de 2026-10-28 (Dra. Anna Líbya).
# O Remotion sai em yuvj420p (faixa cheia, bt601): converte pra yuv420p bt709 faixa de TV (como o bruto veio)
# e normaliza o volume em -14 LUFS. Depois rodar a curadoria: python 2026-10-28\curadoria.py
# Uso (na pasta edicao): powershell -ExecutionPolicy Bypass -File scripts\finalizar.ps1
$ErrorActionPreference = "Stop"
$env:PATH = "C:\Users\kumyt\AppData\Local\Programs\node;$env:PATH"
$ff = "$env:LOCALAPPDATA\CapCut\Apps\9.6.0.4097\ffmpeg.exe"
# PC com NVIDIA codifica pelo nvenc; o PC do escritório (Intel Iris Xe) pelo Quick Sync
if (Test-Path "C:\Windows\System32\nvcuda.dll") { $enc = @("-c:v","h264_nvenc","-preset","p7","-rc","vbr","-cq","15","-b:v","18M"); $fmt = "yuv420p" }
else { $enc = @("-c:v","h264_qsv","-global_quality","15"); $fmt = "nv12" }
Set-Location (Split-Path $PSScriptRoot)
New-Item -ItemType Directory -Force out\final | Out-Null
$videos = [ordered]@{ "Apresentacao" = "2026-10-28-dra-anna-libya-apresentacao.mp4"; "Consultorio" = "2026-10-28-dra-anna-libya-consultorio.mp4" }
foreach ($c in $videos.Keys) {
  node node_modules/@remotion/cli/remotion-cli.js render $c "out/final/_$c.mp4" --codec=h264 --crf=16 --audio-bitrate=320k --log=error
  & $ff -v error -y -i "out\final\_$c.mp4" -vf "scale=in_range=pc:out_range=tv:in_color_matrix=bt601:out_color_matrix=bt709,format=$fmt" @enc -color_range tv -colorspace bt709 -color_primaries bt709 -color_trc bt709 -af "loudnorm=I=-14:TP=-1.5:LRA=11,aresample=48000" -c:a aac -b:a 256k -movflags +faststart "out\final\$($videos[$c])"
  Write-Output "out\final\$($videos[$c])"
}
