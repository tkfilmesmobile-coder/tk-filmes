# Renderiza os episódios do quadro "Bastidor TK" e finaliza (cor yuv420p bt709 faixa de TV, som -14 LUFS).
# Usa o Chrome instalado (o navegador interno do Remotion não baixa neste PC).
# uso: powershell -File render-bastidor.ps1 AntesDepoisStart TimelapseStart ...
param([Parameter(ValueFromRemainingArguments = $true)][string[]]$comps)
$env:Path = "C:\Users\kumyt\AppData\Local\Programs\node;$env:Path"
$raiz = "C:\Users\kumyt\Documents\Projeto TK FILMES\TK FILMES\tk-filmes\videos\remotion"
$ff = "$env:LOCALAPPDATA\CapCut\Apps\9.6.0.4097\ffmpeg.exe"
Set-Location $raiz
foreach ($c in $comps) {
  & npx.cmd remotion render src/index.ts $c "out/bastidor/_$c.mp4" --codec=h264 --crf=17 --log=error "--browser-executable=C:\Program Files\Google\Chrome\Application\chrome.exe"
  & $ff -v error -y -i "out/bastidor/_$c.mp4" -vf "scale=in_range=pc:out_range=tv:in_color_matrix=bt601:out_color_matrix=bt709,format=yuv420p" -c:v h264_nvenc -preset p7 -rc vbr -cq 16 -b:v 16M -color_range tv -colorspace bt709 -color_primaries bt709 -color_trc bt709 -af "loudnorm=I=-14:TP=-1.5:LRA=11,aresample=48000" -c:a aac -b:a 256k -movflags +faststart "out/bastidor/$c.mp4"
  Write-Host "ok $c"
}
