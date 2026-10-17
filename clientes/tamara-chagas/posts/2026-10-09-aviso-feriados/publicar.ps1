# Publica o post e o story de "2026-10-09-aviso-feriados" no @tamarachagas_prev (uma vez só, pedido da Talyta em 08/10/2026).
Set-Location "C:\Users\tamar\TK FILMES"
$p = "clientes/tamara-chagas/posts/2026-10-09-aviso-feriados"
$js = ".claude/skills/publicar-social-ratos/scripts/publish-graph-api.js"
$log = "$p/publicacao.log"
"[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] publicando..." | Out-File $log -Encoding utf8
node --env-file=.env $js --conta TAMARACHAGAS_PREV --images "$p/post.jpg" --caption-file "$p/legenda.md" 2>&1 | Out-File $log -Append -Encoding utf8
"[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] post: codigo $LASTEXITCODE" | Out-File $log -Append -Encoding utf8
Start-Sleep -Seconds 15
node --env-file=.env $js --conta TAMARACHAGAS_PREV --images "$p/story.jpg" --story 2>&1 | Out-File $log -Append -Encoding utf8
"[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] story: codigo $LASTEXITCODE" | Out-File $log -Append -Encoding utf8
