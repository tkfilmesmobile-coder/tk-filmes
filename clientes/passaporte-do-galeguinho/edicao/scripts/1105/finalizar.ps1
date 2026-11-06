# Volume final do vídeo renderizado: mede o volume integrado, sobe até -14 LUFS e segura o pico em -1,5 dBTP.
# A imagem é copiada sem recodificar. Uso: powershell -File scripts\1105\finalizar.ps1 out\1105-edicao-v2.mp4 out\saida.mp4
param([Parameter(Mandatory=$true)][string]$Entrada, [Parameter(Mandatory=$true)][string]$Saida, [double]$Alvo = -14)
$FF = "$env:LOCALAPPDATA\CapCut\Apps\9.6.0.4097\ffmpeg.exe"
$r = cmd /c "`"$FF`" -hide_banner -nostats -i `"$Entrada`" -af ebur128=peak=true -f null - 2>&1"
$resumo = ($r -join "`n"); $resumo = $resumo.Substring($resumo.LastIndexOf("Summary"))
$I = [double]([regex]::Match($resumo, "I:\s+(-?[\d.]+) LUFS").Groups[1].Value)
$ganho = [math]::Round($Alvo - $I, 2)
"medido: $I LUFS -> ganho de $ganho dB"
# limitador em -1,5 dBTP (0,841 linear), com ataque curto; o volume sobe antes
& $FF -v error -y -i $Entrada -c:v copy -af "volume=${ganho}dB,alimiter=limit=0.70:attack=3:release=60:level=false" -c:a aac -b:a 256k -ar 48000 -movflags +faststart $Saida
$r2 = cmd /c "`"$FF`" -hide_banner -nostats -i `"$Saida`" -af ebur128=peak=true -f null - 2>&1"
$s2 = ($r2 -join "`n"); $s2 = $s2.Substring($s2.LastIndexOf("Summary"))
"final: " + [regex]::Match($s2, "I:\s+(-?[\d.]+) LUFS").Groups[1].Value + " LUFS, pico real " + [regex]::Match($s2, "Peak:\s+(-?[\d.]+) dBFS").Groups[1].Value + " dBFS"
