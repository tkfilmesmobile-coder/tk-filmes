# Publica o Reels "Parte 1 · Trabalhador rural" no @tamarachagas_prev (colab @dra.tamarachagas_) às 16h de 08/10/2026,
# depois os stories: pessoal (card, notas, conversa) no @dra.tamarachagas_ e editorial (01-04) no escritório. Pedido da Talyta.
Set-Location "C:\Users\tamar\TK FILMES"
$d = "clientes/tamara-chagas/reels/2026-10-08-feira-perguntas"
$p = "$d/parte1"
$js = ".claude/skills/publicar-social-ratos/scripts/publish-graph-api.js"
$log = "$p/publicacao.log"
"[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] publicando Reels parte 1..." | Out-File $log -Encoding utf8
node --env-file=.env $js --conta TAMARACHAGAS_PREV --video "$d/parte1-trabalhador-rural-leve.mp4" --caption-file "$p/legenda.md" --colaboradores "dra.tamarachagas_" 2>&1 | Out-File $log -Append -Encoding utf8
$ok = $LASTEXITCODE
"[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] reels: codigo $ok" | Out-File $log -Append -Encoding utf8
if ($ok -ne 0) { exit 1 }
foreach ($n in "1-card", "2-notas", "3-conversa") {
  Start-Sleep -Seconds 15
  node --env-file=.env $js --conta DRA_TAMARACHAGAS_ --images "$p/stories/$n.jpg" --story 2>&1 | Out-File $log -Append -Encoding utf8
  "[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] pessoal ${n}: codigo $LASTEXITCODE" | Out-File $log -Append -Encoding utf8
}
foreach ($n in "01", "02", "03", "04") {
  Start-Sleep -Seconds 15
  node --env-file=.env $js --conta TAMARACHAGAS_PREV --images "$p/editorial/$n.jpg" --story 2>&1 | Out-File $log -Append -Encoding utf8
  "[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] escritorio ${n}: codigo $LASTEXITCODE" | Out-File $log -Append -Encoding utf8
}
