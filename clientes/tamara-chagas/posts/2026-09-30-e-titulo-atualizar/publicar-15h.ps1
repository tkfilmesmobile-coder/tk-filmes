# Publicação agendada (uma vez só), a pedido da Talyta: post "e-Título: atualize antes de domingo" no
# @tamarachagas_prev em 2026-09-30 às 15h, em colaboração com o @dra.tamarachagas_, seguido do trio de
# stories sobre o assunto (regra de 2026-09-30). Log em publicar-15h.log.
Set-Location "C:\Users\tamar\TK FILMES"
$d = "clientes/tamara-chagas/posts/2026-09-30-e-titulo-atualizar"
$log = "$d/publicar-15h.log"
"[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] publicando post..." | Out-File $log -Encoding utf8
node --env-file=.env .claude/skills/publicar-social-ratos/scripts/publish-graph-api.js --conta TAMARACHAGAS_PREV --images "$d/post.jpg" --caption-file "$d/legenda.md" --colaboradores "dra.tamarachagas_" 2>&1 | Out-File $log -Append -Encoding utf8
"[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] post: codigo $LASTEXITCODE" | Out-File $log -Append -Encoding utf8
if ($LASTEXITCODE -eq 0) {
  foreach ($n in "1-card", "2-notas", "3-conversa") {
    Start-Sleep -Seconds 20
    node --env-file=.env .claude/skills/publicar-social-ratos/scripts/publish-graph-api.js --conta TAMARACHAGAS_PREV --images "$d/stories/$n.jpg" --story 2>&1 | Out-File $log -Append -Encoding utf8
    "[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] story ${n}: codigo $LASTEXITCODE" | Out-File $log -Append -Encoding utf8
  }
}
