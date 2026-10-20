# Publica o vídeo da Dra. Tamara "Pensão por morte pro filho maior de idade com autismo" no perfil pessoal @dra.tamarachagas_ com colaboração do @tamarachagas_prev (regra de 15/10: Tamara falando pra câmera vai no pessoal)
# + 3 stories no pessoal e 4 no escritório. Uma vez só, pedido da Talyta em 15/10/2026 (remarcado em 20/10 pra segunda 26/10, 16h).
Set-Location "C:\Users\tamar\TK FILMES"
$p = "clientes/tamara-chagas/reels/2026-10-15-pensao-por-morte"
$js = ".claude/skills/publicar-social-ratos/scripts/publish-graph-api.js"
$log = "$p/publicacao.log"
# tenta de novo (até 3x, 60 s de intervalo) se cair a conexão ANTES de publicar; se já publicou, não repete
function Publicar([string[]]$argsNode) {
  for ($i = 1; $i -le 3; $i++) {
    $saida = (& node --env-file=.env @argsNode 2>&1 | Out-String)
    $saida | Out-File $log -Append -Encoding utf8
    if ($LASTEXITCODE -eq 0 -or $saida -match "publicad") { return 0 }
    "[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] falhou (tentativa $i), tentando de novo em 60 s" | Out-File $log -Append -Encoding utf8
    Start-Sleep -Seconds 60
  }
  return 1
}
"[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] publicando..." | Out-File $log -Encoding utf8
$ok = Publicar @($js,"--conta","DRA_TAMARACHAGAS_","--video","$p/pensao-por-morte-filho-autista-leve.mp4","--caption-file","$p/legenda.md","--colaboradores","tamarachagas_prev")
"[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] reels: codigo $ok" | Out-File $log -Append -Encoding utf8
if ($ok -ne 0) { exit 1 }
foreach ($n in "1-card", "2-notas", "3-conversa") {
  Start-Sleep -Seconds 15
  $ok = Publicar @($js,"--conta","DRA_TAMARACHAGAS_","--images","$p/stories/$n.jpg","--story")
  "[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] pessoal ${n}: codigo $ok" | Out-File $log -Append -Encoding utf8
}
foreach ($n in "01", "02", "03", "04") {
  Start-Sleep -Seconds 15
  $ok = Publicar @($js,"--conta","TAMARACHAGAS_PREV","--images","$p/editorial/$n.jpg","--story")
  "[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] escritorio ${n}: codigo $ok" | Out-File $log -Append -Encoding utf8
}
