# Publica os 7 stories do vídeo oficial do Natal (pedido da Talyta, 06/11/2026: "Sim, faça os stories"):
# 3 no pessoal @dra.tamarachagas_ (Post for Me) e 4 no escritório @tamarachagas_prev (Graph API). Log em publicacao.log.
Set-Location "C:\Users\kumyt\Documents\Projeto TK FILMES\TK FILMES"
$env:Path = "C:\Users\kumyt\AppData\Local\Programs\node;" + $env:Path
$p = "clientes/tamara-chagas/reels/2026-11-natal-oficial/stories"
$log = "$p/publicacao.log"
function Linha([string]$t) { "[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] $t" | Out-File $log -Append -Encoding utf8; $t }

$pessoal = @(@("p1-papai-noel.mp4", "O Natal chegou"), @("p2-veludo.mp4", "Veludo"), @("p3-fachada.mp4", "Vídeo oficial no feed"))
foreach ($s in $pessoal) {
  $o = (node --env-file=.env .claude/skills/publicar-social-ratos/scripts/publish-postforme.js --platform instagram --conta dra.tamarachagas_ --video "$p/$($s[0])" --placement stories --caption $s[1] 2>&1 | Out-String)
  Linha "pessoal $($s[0])`n$o"
  Start-Sleep -Seconds 15
}
foreach ($a in "e1-espiral.mp4", "e2-detalhes.mp4", "e3-arvore.mp4", "e4-fachada.mp4") {
  $ok = $false
  for ($i = 1; $i -le 3 -and -not $ok; $i++) {
    $o = (node --env-file=.env .claude/skills/publicar-social-ratos/scripts/publish-graph-api.js --conta TAMARACHAGAS_PREV --video "$p/$a" --story 2>&1 | Out-String)
    Linha "escritorio $a (tentativa $i)`n$o"
    if ($LASTEXITCODE -eq 0 -or $o -match "publicad") { $ok = $true } else { Start-Sleep -Seconds 60 }
  }
  Start-Sleep -Seconds 20
}
Linha "fim"
