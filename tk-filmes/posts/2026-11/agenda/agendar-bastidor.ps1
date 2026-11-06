# Agenda na Post for Me (@tk.filmes) as 6 peças do quadro Bastidor TK (Start 11-13/11, Anna 17-19/11).
# Arquivos na raiz do Drive (achados pelo começo do nome, por causa dos acentos). Saída em agendar-bastidor.log.
# uso: powershell -File agendar-bastidor.ps1 [-DryRun]
param([switch]$DryRun)
$raiz = "C:\Users\kumyt\Documents\Projeto TK FILMES\TK FILMES"
$node = "C:\Users\kumyt\AppData\Local\Programs\node\node.exe"
$script = ".claude/skills/publicar-social-ratos/scripts/publish-postforme.js"
$ag = "tk-filmes/posts/2026-11/agenda"
function Drive($filtro) { (Get-ChildItem "H:\Meu Drive" -File -Filter $filtro | Select-Object -First 1).FullName }
function Slides($quem) { (1..3 | ForEach-Object { Drive "Bastidor TK - $quem - carrossel $_.png" }) -join "," }
$lote = @(
  @{ quando = "2026-11-11T14:00:00-03:00"; video = (Drive "Bastidor TK - Start - sem dire*o x com dire*o.mp4"); leg = "$ag/2026-11-11-bastidor-start-sem-direcao-legenda.txt" },
  @{ quando = "2026-11-12T12:00:00-03:00"; img = (Slides "Start"); leg = "$ag/2026-11-12-bastidor-start-carrossel-legenda.txt" },
  @{ quando = "2026-11-13T14:00:00-03:00"; video = (Drive "Bastidor TK - Start - p*s-produ*o x resultado final.mp4"); leg = "$ag/2026-11-13-bastidor-start-pos-legenda.txt" },
  @{ quando = "2026-11-17T14:00:00-03:00"; video = (Drive "Bastidor TK - Anna L*bya - sem dire*o x com dire*o.mp4"); leg = "$ag/2026-11-17-bastidor-anna-sem-direcao-legenda.txt" },
  @{ quando = "2026-11-18T12:00:00-03:00"; img = (Slides "Anna L*bya"); leg = "$ag/2026-11-18-bastidor-anna-carrossel-legenda.txt" },
  @{ quando = "2026-11-19T14:00:00-03:00"; video = (Drive "Bastidor TK - Anna L*bya - p*s-produ*o x resultado final.mp4"); leg = "$ag/2026-11-19-bastidor-anna-pos-legenda.txt" }
)
Set-Location $raiz
$log = "$ag/agendar-bastidor.log"
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
