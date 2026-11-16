# Agenda na Post for Me (@tk.filmes, Instagram + TikTok) o reels e o carrossel das raízes (aprovados em 16/11/2026)
# e abre espaço na grade (um post por dia), como a Talyta escolheu em 16/11:
#   · post "ser lembrado" (era ter 17/11 12h) -> sáb 13/12 12h
#   · carrossel-planta das referências (era sáb 29/11 12h, mesmo tema) sai da agenda e fica de reserva
#   · reels "O marketing é como uma planta" -> ter 17/11 14h
#   · carrossel "As raízes da sua marca" -> sáb 29/11 12h
# Precisa da POSTFORME_API_KEY no .env da raiz. Saída em agendar-raizes.log.
# uso (de qualquer pasta): powershell -File tk-filmes/posts/2026-11/raizes/agendar-raizes.ps1 [-DryRun]
param([switch]$DryRun)
$raiz = (Resolve-Path (Join-Path $PSScriptRoot "..\..\..\..")).Path
Set-Location $raiz
$s = ".claude/skills/publicar-social-ratos/scripts"
$aqui = "tk-filmes/posts/2026-11/raizes"
$log = "$aqui/agendar-raizes.log"
$teste = @(); if ($DryRun) { $teste = @("--dry-run") }
function Rodar($titulo, [string[]]$a) {
  "[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] $titulo" | Tee-Object -FilePath $log -Append
  & node --env-file=.env @a 2>&1 | Tee-Object -FilePath $log -Append
}
Rodar "ser lembrado -> 13/12 12h (Instagram e TikTok)" (@("$s/reagendar-postforme.js", "sp_H7rMDr2m5xH81nUs5u0z=2026-12-13T12:00:00-03:00", "sp_fLGJb6biVUYhAqCrMjhFs=2026-12-13T12:00:00-03:00") + $teste)
Rodar "carrossel-planta sai da agenda (Instagram e TikTok)" (@("$s/remover-postforme.js", "sp_bo9mZ7INbGRh3mSqKLf", "sp_QhUi2V1aV6ta1V77YNjnJ") + $teste)
# o mp4 não vai pro git: neste PC está na pasta; no outro, vem do Drive (G: ou H:)
$video = "$aqui/reels-raizes-previa-v2.mp4"
if (-not (Test-Path $video)) { $video = @("G:\Meu Drive", "H:\Meu Drive") | ForEach-Object { Join-Path $_ "O marketing é como uma planta - EDITADO.mp4" } | Where-Object { Test-Path $_ } | Select-Object -First 1 }
if (-not $video) { "Não achei o vídeo (nem na pasta nem no Drive). Parei sem agendar o reels." | Tee-Object -FilePath $log -Append; exit 1 }
$jpgs = (1..9 | ForEach-Object { "$aqui/tiktok/carrossel-raizes-{0:D2}.jpg" -f $_ }) -join ","
$pngs = (1..9 | ForEach-Object { "$aqui/carrossel-raizes-{0:D2}.png" -f $_ }) -join ","
$lote = @(
  @("reels raízes · Instagram 17/11 14h", @("--platform", "instagram", "--conta", "tk.filmes", "--video", $video, "--caption-file", "$aqui/reels-raizes-legenda.txt", "--schedule", "2026-11-17T14:00:00-03:00")),
  @("reels raízes · TikTok 17/11 14h", @("--platform", "tiktok", "--account-id", "spc_dzTk21vgIiyZyAYUjTDbg", "--video", $video, "--caption-file", "$aqui/reels-raizes-legenda.txt", "--schedule", "2026-11-17T14:00:00-03:00")),
  @("carrossel raízes · Instagram 29/11 12h", @("--platform", "instagram", "--conta", "tk.filmes", "--images", $pngs, "--caption-file", "$aqui/carrossel-raizes-legenda.txt", "--schedule", "2026-11-29T12:00:00-03:00")),
  @("carrossel raízes · TikTok 29/11 12h", @("--platform", "tiktok", "--account-id", "spc_dzTk21vgIiyZyAYUjTDbg", "--images", $jpgs, "--caption-file", "$aqui/carrossel-raizes-legenda.txt", "--schedule", "2026-11-29T12:00:00-03:00"))
)
$n = 0
foreach ($p in $lote) {
  $n++
  Rodar $p[0] (@("$s/publish-postforme.js") + $p[1] + $teste)
  if (-not $DryRun -and $n -lt $lote.Count) { Start-Sleep -Seconds 60 }
}
"[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] fim" | Tee-Object -FilePath $log -Append
