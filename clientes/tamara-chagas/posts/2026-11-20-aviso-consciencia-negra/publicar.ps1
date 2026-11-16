# Publica o aviso do feriado de 20/11 (Consciência Negra) no feed do @tamarachagas_prev, qui 19/11 às 10h (pedido da Talyta, 16/11/2026).
# Só o post (stories pausados). Não repete: se o log já diz "Publicado", não faz nada.
Set-Location "C:\Users\tamar\TK FILMES"
$p = "clientes/tamara-chagas/posts/2026-11-20-aviso-consciencia-negra"
$log = "$p/publicacao.log"
if ((Test-Path $log) -and (Select-String -Path $log -Pattern "Publicado" -Quiet)) { exit 0 }
for ($i = 1; $i -le 3; $i++) {
  "[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] publicando (tentativa $i)..." | Out-File $log -Append -Encoding utf8
  $saida = (& node --env-file=.env .claude/skills/publicar-social-ratos/scripts/publish-graph-api.js --conta TAMARACHAGAS_PREV --images "$p/post.jpg" --caption-file "$p/legenda.md" 2>&1 | Out-String)
  $saida | Out-File $log -Append -Encoding utf8
  if ($saida -match "Publicado") { exit 0 }
  Start-Sleep -Seconds 120
}
exit 1
