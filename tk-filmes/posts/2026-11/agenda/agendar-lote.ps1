# Agenda na Post for Me (@tk.filmes) as peças prontas de novembro/2026, uma por vez, com 75 s entre elas
# (a Post for Me bloqueia depois de uns 5 posts seguidos). Saída de cada uma em agendar-lote.log.
# uso: powershell -File agendar-lote.ps1 [-DryRun]
param([switch]$DryRun)
$raiz = "C:\Users\kumyt\Documents\Projeto TK FILMES\TK FILMES"
$node = "C:\Users\kumyt\AppData\Local\Programs\node\node.exe"
$script = ".claude/skills/publicar-social-ratos/scripts/publish-postforme.js"
$ag = "tk-filmes/posts/2026-11/agenda"
$out = "tk-filmes/posts/2026-10"
$lote = @(
  @{ quando = "2026-11-03T14:00:00-03:00"; video = (Get-ChildItem "H:\Meu Drive" -File -Filter "A virada n*o foi sorte - EDITADO.mp4" | Select-Object -First 1).FullName; leg = "$ag/2026-11-03-reels-v10-legenda.txt" },
  @{ quando = "2026-11-04T14:00:00-03:00"; video = "H:\Meu Drive\Um dia na TK - EDITADO.mp4"; leg = "$ag/2026-11-04-reels-um-dia-na-tk-legenda.txt" },
  @{ quando = "2026-11-05T12:00:00-03:00"; img = "$out/2026-10-27-tweet-abandonado.png"; leg = "$out/2026-10-27-tweet-abandonado-legenda.md" },
  @{ quando = "2026-11-06T12:00:00-03:00"; img = "$out/2026-10-29-conversa-bombar-escondido.png"; leg = "$out/2026-10-29-conversa-bombar-escondido-legenda.md" },
  @{ quando = "2026-11-09T12:00:00-03:00"; img = "$out/2026-10-28-tweet-nao-sei-falar.png"; leg = "$out/2026-10-28-tweet-nao-sei-falar-legenda.md" },
  @{ quando = "2026-11-16T12:00:00-03:00"; img = "$out/2026-10-30-frase-boleto.png"; leg = "$out/2026-10-30-frase-boleto-legenda.md" },
  @{ quando = "2026-11-23T12:00:00-03:00"; img = "$out/2026-10-26-conversa-viral.png"; leg = "$out/2026-10-26-conversa-viral-legenda.md" },
  @{ quando = "2026-11-24T12:00:00-03:00"; img = "$out/2026-10-19-conversa-academia.png"; leg = "$out/2026-10-19-conversa-academia-legenda.md" }
)
Set-Location $raiz
$log = "$ag/agendar-lote.log"
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
