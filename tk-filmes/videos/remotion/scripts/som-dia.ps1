# Trilha do reels "Um dia na TK" (2026-10-29): só os sons reais do dia (teclado, mouse, touchpad, ambiente),
# cada trecho no tempo real (sem a câmera lenta do vídeo), com fade curto entre um e outro.
# BR-021 (celular) e BR-003 (casamento) vêm com música/fala alta de terceiros: no lugar deles entra ambiente da mesa e do jardim.
# Entrada: out/um-dia-final.mp4 (vídeo sem som). Saída: out/um-dia-final-som.mp4
# uso: powershell -File scripts/som-dia.ps1
$ff = "$env:LOCALAPPDATA\CapCut\Apps\9.6.0.4097\ffmpeg.exe"   # o do Remotion não tem os filtros de áudio
$banco = "H:\Meu Drive\TK FILMES\04 BANCO DE B-ROLL"
$raiz = Join-Path $PSScriptRoot ".."
# código do som, início no original (s), frames no vídeo, ganho em dB
$planos = @(
  @("BR-024", 1.5, 38, 8),     # touchpad
  @("BR-022", 20, 26, 22),     # mesa
  @("BR-022", 12, 22, 22),     # teclado
  @("BR-022", 212, 24, 22),    # monitor
  @("BR-022", 213, 24, 22),    # celular (som da mesa no lugar)
  @("BR-022", 65, 19, 22),     # mouse
  @("BR-022", 157, 34, 22),    # pensando
  @("BR-009", 3.0, 22, 4),     # gravando (ambiente do jardim no lugar)
  @("BR-009", 1.0, 22, 4),     # câmera
  @("BR-013", 3.0, 24, 4),     # céu
  @("BR-022", 30, 24, 22),     # digitando
  @("BR-022", 150, 110, 22)    # final
)
$args_ = @("-v", "error", "-y", "-i", (Join-Path $raiz "out\um-dia-final.mp4"))
$fc = ""; $offset = 0; $k = 1
foreach ($p in $planos) {
  $src = (Get-ChildItem $banco -Recurse -File -Filter "$($p[0])*" | Select-Object -First 1).FullName
  $d = $p[2] / 24
  $args_ += @("-ss", "$($p[1])", "-t", ("{0:F3}" -f ($d + 0.1)).Replace(",", "."), "-i", $src)
  $ms = [int][math]::Round($offset / 24 * 1000)
  $saiDe = ("{0:F3}" -f ($d - 0.06)).Replace(",", ".")
  $fc += "[$k`:a]aresample=48000,aformat=channel_layouts=stereo,afftdn=nf=-42,volume=$($p[3])dB,afade=t=in:d=0.05,afade=t=out:st=$($saiDe):d=0.1,adelay=$ms|$ms[a$k];"
  $offset += $p[2]; $k++
}
$total = ("{0:F3}" -f ($offset / 24)).Replace(",", ".")
$fimFade = ("{0:F3}" -f ($offset / 24 - 0.7)).Replace(",", ".")
$entradas = (1..($k - 1) | ForEach-Object { "[a$_]" }) -join ""
$fc += "$($entradas)amix=inputs=$($k - 1):normalize=0,highpass=f=70,loudnorm=I=-18:TP=-2:LRA=11,afade=t=out:st=$($fimFade):d=0.7,atrim=0:$total[som]"
$args_ += @("-filter_complex", $fc, "-map", "0:v", "-map", "[som]", "-c:v", "copy", "-c:a", "aac", "-b:a", "256k", "-ar", "48000", "-movflags", "+faststart", (Join-Path $raiz "out\um-dia-final-som.mp4"))
& $ff @args_
if ($LASTEXITCODE -eq 0) { Write-Host "ok" } else { Write-Host "FALHOU" }
