# Prepara a mídia de um episódio do quadro "Bastidor TK" em tk-filmes/videos/remotion/public/bastidor/<id>/:
# miniaturas dos takes (takes/NN.jpg), o bruto principal e o vídeo pronto em H.264 (o Remotion não lê HEVC do iPhone).
# uso: powershell -File preparar-midia.ps1 <id> <pasta_brutos> <bruto_principal> <video_pronto>
param([string]$id, [string]$brutos, [string]$bruto, [string]$pronto)
$ff = "$env:LOCALAPPDATA\CapCut\Apps\9.6.0.4097\ffmpeg.exe"
$dest = "C:\Users\kumyt\Documents\Projeto TK FILMES\TK FILMES\tk-filmes\videos\remotion\public\bastidor\$id"
New-Item -ItemType Directory -Force "$dest\takes" | Out-Null
$i = 0
Get-ChildItem $brutos -File | Where-Object { $_.Extension -match 'mov|mp4' -and $_.Length -gt 200KB } | Sort-Object Name | ForEach-Object {
  $i++
  & $ff -v error -y -ss 1.5 -i $_.FullName -frames:v 1 -vf "scale=270:480:force_original_aspect_ratio=increase,crop=270:480" -q:v 4 ("$dest\takes\{0:D2}.jpg" -f $i)
}
& $ff -v error -y -i $bruto -vf "scale=1080:1920" -c:v h264_nvenc -preset p5 -cq 20 -c:a aac -b:a 192k -movflags +faststart "$dest\bruto.mp4"
& $ff -v error -y -i $pronto -c:v h264_nvenc -preset p5 -cq 18 -c:a aac -b:a 256k -movflags +faststart "$dest\pronto.mp4"
Write-Host "$id : $i takes"
