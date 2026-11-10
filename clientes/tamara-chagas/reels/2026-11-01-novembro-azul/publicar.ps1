# Publica o Reels "Novembro Azul" da Dra. Tamara no @dra.tamarachagas_ com colaboração do @tamarachagas_prev (pedido da Talyta, 01/11/2026, 19h). Uma vez só.
Set-Location "C:\Users\tamar\TK FILMES"
$p = "clientes/tamara-chagas/reels/2026-11-01-novembro-azul"
$log = "$p/publicacao.log"
if ((Test-Path $log) -and (Select-String -Path $log -Pattern "Publicado" -Quiet)) { exit 0 }
"[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] publicando..." | Out-File $log -Append -Encoding utf8
& node --env-file=.env .claude/skills/publicar-social-ratos/scripts/publish-graph-api.js --conta DRA_TAMARACHAGAS_ --video "$p/novembro-azul-leve.mp4" --caption-file "$p/legenda.md" --colaboradores tamarachagas_prev 2>&1 | Out-File $log -Append -Encoding utf8
