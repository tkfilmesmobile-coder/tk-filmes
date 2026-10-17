# Publica o post e o story de "2026-10-13-emancipacao-uniao" no @tamarachagas_prev (uma vez só, pedido da Talyta em 08/10/2026).
Set-Location "C:\Users\tamar\TK FILMES"
$p = "clientes/tamara-chagas/posts/2026-10-13-emancipacao-uniao"
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
$ok = Publicar @($js,"--conta","TAMARACHAGAS_PREV","--images","$p/post.jpg","--caption-file","$p/legenda.md")
$global:LASTEXITCODE = $ok
"[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] post: codigo $LASTEXITCODE" | Out-File $log -Append -Encoding utf8
Start-Sleep -Seconds 15
$ok = Publicar @($js,"--conta","TAMARACHAGAS_PREV","--images","$p/story.jpg","--story")
$global:LASTEXITCODE = $ok
"[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] story: codigo $LASTEXITCODE" | Out-File $log -Append -Encoding utf8
