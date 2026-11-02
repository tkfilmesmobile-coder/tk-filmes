# Corta os trechos "sem direção" dos brutos (com o som original) pra public/bastidor/<id>/falha-NN.mp4 (1080x1920, 24 fps, H.264).
# uso: powershell -File cortar-falhas.ps1 <id> <pasta_brutos> "IMG_0525:0.0:1.4" "IMG_0528:0.4:3.0" ...
# Pra acrescentar trechos sem sobrescrever os que já existem: -inicio 7 (o primeiro novo vira falha-07).
param([string]$id, [string]$brutos, [int]$inicio = 1, [Parameter(ValueFromRemainingArguments = $true)][string[]]$trechos)
$ff = "$env:LOCALAPPDATA\CapCut\Apps\9.6.0.4097\ffmpeg.exe"
$dest = "C:\Users\kumyt\Documents\Projeto TK FILMES\TK FILMES\tk-filmes\videos\remotion\public\bastidor\$id"
New-Item -ItemType Directory -Force $dest | Out-Null
$n = $inicio - 1
foreach ($t in $trechos) {
  $n++
  $p = $t.Split(":"); $arq = (Get-ChildItem $brutos -File -Filter "$($p[0]).*" | Select-Object -First 1).FullName
  $dur = [double]::Parse($p[2], [Globalization.CultureInfo]::InvariantCulture) - [double]::Parse($p[1], [Globalization.CultureInfo]::InvariantCulture)
  $d = $dur.ToString([Globalization.CultureInfo]::InvariantCulture)
  & $ff -v error -y -ss $p[1] -t $d -i $arq -vf "scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,fps=24" -c:v h264_nvenc -preset p5 -cq 19 -c:a aac -b:a 192k -ar 48000 -ac 2 ("$dest\falha-{0:D2}.mp4" -f $n)
  Write-Host ("falha-{0:D2} <- {1} {2}-{3}" -f $n, $p[0], $p[1], $p[2])
}
