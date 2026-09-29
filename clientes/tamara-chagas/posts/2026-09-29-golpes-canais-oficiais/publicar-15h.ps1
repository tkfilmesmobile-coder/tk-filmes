# Publicação agendada (uma vez só): post "golpes / canais oficiais" no @tamarachagas_prev às 15h de 2026-09-29.
# Criado pelo agente a pedido da Talyta. Resultado fica em publicar-15h.log nesta pasta.
Set-Location "C:\Users\tamar\TK FILMES"
$d = "clientes/tamara-chagas/posts/2026-09-29-golpes-canais-oficiais"
"[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] publicando..." | Out-File "$d/publicar-15h.log" -Encoding utf8
node --env-file=.env .claude/skills/publicar-social-ratos/scripts/publish-graph-api.js --conta TAMARACHAGAS_PREV --images "$d/post.png" --caption-file "$d/legenda.md" --colaboradores "dra.tamarachagas_" 2>&1 | Out-File "$d/publicar-15h.log" -Append -Encoding utf8
"[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] fim (código $LASTEXITCODE)" | Out-File "$d/publicar-15h.log" -Append -Encoding utf8
