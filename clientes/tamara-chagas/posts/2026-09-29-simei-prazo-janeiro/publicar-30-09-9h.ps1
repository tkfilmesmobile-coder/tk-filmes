# Publicação agendada (uma vez só), a pedido da Talyta: post "Simei / prazo janeiro" no @tamarachagas_prev
# em 2026-09-30 às 9h, em colaboração com o @dra.tamarachagas_. Resultado em publicar-30-09-9h.log nesta pasta.
Set-Location "C:\Users\tamar\TK FILMES"
$d = "clientes/tamara-chagas/posts/2026-09-29-simei-prazo-janeiro"
"[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] publicando..." | Out-File "$d/publicar-30-09-9h.log" -Encoding utf8
node --env-file=.env .claude/skills/publicar-social-ratos/scripts/publish-graph-api.js --conta TAMARACHAGAS_PREV --images "$d/post.png" --caption-file "$d/legenda.md" --colaboradores "dra.tamarachagas_" 2>&1 | Out-File "$d/publicar-30-09-9h.log" -Append -Encoding utf8
"[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] fim (código $LASTEXITCODE)" | Out-File "$d/publicar-30-09-9h.log" -Append -Encoding utf8
