# Publica o carrossel 4 do calendário (Dia das Crianças, "O medo de dentista começa na infância")
# no @dra.camillawanderley. Chamado pelo Agendador de Tarefas do Windows
# (tarefa "TK - Camilla post 04 12-10 12h"), uma vez só.
Set-Location "C:\Users\tamar\TK FILMES"
$d = "clientes/camilla-wanderley/posts/2026-10/04-medo-comeca-na-infancia"
$js = ".claude/skills/publicar-social-ratos/scripts/publish-graph-api.js"
$log = "$d/publicacao.log"
$imagens = (1..6 | ForEach-Object { "$d/{0:D2}.png" -f $_ }) -join ","
"[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] publicando carrossel..." | Out-File $log -Encoding utf8
node --env-file=.env $js --conta DRA_CAMILLAWANDERLEY --images "$imagens" --caption-file "$d/legenda.md" 2>&1 | Out-File $log -Append -Encoding utf8
"[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] fim (codigo $LASTEXITCODE)" | Out-File $log -Append -Encoding utf8
