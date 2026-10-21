# Publica o carrossel "o caso da Mari" (6 slides) no @dra.camillawanderley. Agendador do Windows
# (tarefa "TK - Camilla carrossel Mari 22-10 12h"), uma vez só.
Set-Location "C:\Users\tamar\TK FILMES"
$d = "clientes/camilla-wanderley/posts/2026-10/07-carrossel-mari"
$js = ".claude/skills/publicar-social-ratos/scripts/publish-graph-api.js"
$log = "$d/publicacao.log"
$imagens = (1..6 | ForEach-Object { "$d/{0:D2}.png" -f $_ }) -join ","
"[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] publicando carrossel..." | Out-File $log -Encoding utf8
node --env-file=.env $js --conta DRA_CAMILLAWANDERLEY --images "$imagens" --caption-file "$d/legenda.md" 2>&1 | Out-File $log -Append -Encoding utf8
"[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] fim (codigo $LASTEXITCODE)" | Out-File $log -Append -Encoding utf8
