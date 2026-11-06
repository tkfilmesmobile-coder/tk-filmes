# Agenda na Post for Me (@tk.filmes) os 3 reels falados de novembro e o post de cada um no dia seguinte
# (regra 2026-11-04: calendário mesclado por estilo; vídeo → no dia seguinte o post sobre ele). Saída em agendar-reels-novos.log.
# uso: powershell -File agendar-reels-novos.ps1 [-DryRun]
param([switch]$DryRun)
$raiz = "C:\Users\kumyt\Documents\Projeto TK FILMES\TK FILMES"
$node = "C:\Users\kumyt\AppData\Local\Programs\node\node.exe"
$script = ".claude/skills/publicar-social-ratos/scripts/publish-postforme.js"
$ag = "tk-filmes/posts/2026-11/agenda"
function Drive($filtro) { (Get-ChildItem "H:\Meu Drive" -File -Filter $filtro | Select-Object -First 1).FullName }
$lote = @(
  @{ quando = "2026-11-10T14:00:00-03:00"; video = (Drive "Quanto tempo leva 1 minuto - EDITADO.mp4"); leg = "$ag/2026-11-10-reels-tempo-legenda.txt" },
  @{ quando = "2026-11-11T12:00:00-03:00"; img = (Drive "Post TK - Quanto tempo leva 1 minuto.png"); leg = "$ag/2026-11-11-post-tempo-legenda.txt" },
  @{ quando = "2026-11-16T14:00:00-03:00"; video = (Drive "Viralizar n*o * o objetivo - EDITADO.mp4"); leg = "$ag/2026-11-16-reels-viralizar-legenda.txt" },
  @{ quando = "2026-11-17T12:00:00-03:00"; img = (Drive "Post TK - Viralizar * sorte.png"); leg = "$ag/2026-11-17-post-viralizar-legenda.txt" },
  @{ quando = "2026-11-23T14:00:00-03:00"; video = (Drive "Postar por postar * barulho - EDITADO.mp4"); leg = "$ag/2026-11-23-reels-barulho-legenda.txt" },
  @{ quando = "2026-11-24T12:00:00-03:00"; img = (Drive "Post TK - Postar por postar * barulho.png"); leg = "$ag/2026-11-24-post-barulho-legenda.txt" }
)
Set-Location $raiz
$log = "$ag/agendar-reels-novos.log"
$n = 0
foreach ($p in $lote) {
  $n++
  $a = @("--env-file=.env", $script, "--platform", "instagram", "--conta", "tk.filmes", "--caption-file", $p.leg, "--schedule", $p.quando)
  if ($p.video) { $a += @("--video", $p.video) } else { $a += @("--images", $p.img) }
  if ($DryRun) { $a += "--dry-run" }
  "[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] $n/$($lote.Count) $($p.quando) $($p.video)$($p.img)" | Tee-Object -FilePath $log -Append
  & $node @a 2>&1 | Tee-Object -FilePath $log -Append
  if (-not $DryRun -and $n -lt $lote.Count) { Start-Sleep -Seconds 75 }
}
"[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] fim" | Tee-Object -FilePath $log -Append
