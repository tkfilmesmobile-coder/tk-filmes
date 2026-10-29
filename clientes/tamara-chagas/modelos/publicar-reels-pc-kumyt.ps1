# Publica um Reels da Tamara a partir do PC kumyt (o PC do escritório parou em 23/10/2026; pedido da Talyta em 27/10).
# Reels no perfil pessoal @dra.tamarachagas_ com colaboração do @tamarachagas_prev + 3 stories no pessoal e 4 no escritório.
# Não repete: se o publicacao.log da pasta já tem "Publicado como Reels", sai sem fazer nada.
# uso: publicar-reels-pc-kumyt.ps1 -Pasta clientes/tamara-chagas/reels/<pasta> -Video <arquivo.mp4>
param([Parameter(Mandatory)][string]$Pasta, [Parameter(Mandatory)][string]$Video)
Set-Location "C:\Users\kumyt\Documents\Projeto TK FILMES\TK FILMES"
$node = "C:\Users\kumyt\AppData\Local\Programs\node\node.exe"
$js = ".claude/skills/publicar-social-ratos/scripts/publish-graph-api.js"
$log = "$Pasta/publicacao.log"
function Linha([string]$t) { "[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] $t" | Out-File $log -Append -Encoding utf8 }

if ((Test-Path $log) -and (Select-String -Path $log -Pattern "Publicado como Reels" -Quiet)) { Linha "já publicado antes; nada a fazer (PC kumyt)"; exit 0 }
if (-not (Test-Path "$Pasta/$Video")) { Linha "SEM VÍDEO: $Pasta/$Video não existe (PC kumyt)"; exit 1 }

# o PC às vezes acorda sem internet: espera a conexão com o Instagram (até 15 min)
for ($w = 0; $w -lt 30; $w++) {
  try { Invoke-WebRequest -Uri "https://graph.instagram.com/" -Method Head -TimeoutSec 10 -UseBasicParsing | Out-Null; break }
  catch { if ($_.Exception.Response) { break }; Start-Sleep -Seconds 30 }
}

# até 3 tentativas, 60 s entre elas; se já publicou, não repete
function Publicar([string[]]$argsNode) {
  for ($i = 1; $i -le 3; $i++) {
    $saida = (& $node --env-file=.env @argsNode 2>&1 | Out-String)
    $saida | Out-File $log -Append -Encoding utf8
    if ($LASTEXITCODE -eq 0 -or $saida -match "publicad") { return 0 }
    Linha "falhou (tentativa $i), tentando de novo em 60 s"
    Start-Sleep -Seconds 60
  }
  return 1
}

Linha "publicando do PC kumyt..."
$ok = Publicar @($js, "--conta", "DRA_TAMARACHAGAS_", "--video", "$Pasta/$Video", "--caption-file", "$Pasta/legenda.md", "--colaboradores", "tamarachagas_prev")
Linha "reels: codigo $ok"
if ($ok -ne 0) { exit 1 }
foreach ($n in "1-card", "2-notas", "3-conversa") {
  Start-Sleep -Seconds 15
  $ok = Publicar @($js, "--conta", "DRA_TAMARACHAGAS_", "--images", "$Pasta/stories/$n.jpg", "--story")
  Linha "pessoal ${n}: codigo $ok"
}
foreach ($n in "01", "02", "03", "04") {
  Start-Sleep -Seconds 15
  $ok = Publicar @($js, "--conta", "TAMARACHAGAS_PREV", "--images", "$Pasta/editorial/$n.jpg", "--story")
  Linha "escritorio ${n}: codigo $ok"
}
