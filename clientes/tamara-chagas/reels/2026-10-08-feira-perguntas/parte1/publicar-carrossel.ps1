# Publica o carrossel da Parte 1 (quadro da feira) no @tamarachagas_prev com colaboração + story da capa. Uma vez só, pedido da Talyta.
Set-Location "C:\Users\tamar\TK FILMES"
$p = "clientes/tamara-chagas/reels/2026-10-08-feira-perguntas/parte1"
$c = "$p/carrossel"
$js = ".claude/skills/publicar-social-ratos/scripts/publish-graph-api.js"
$log = "$p/publicacao-carrossel.log"
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

"[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] publicando carrossel..." | Out-File $log -Encoding utf8
$ok = Publicar @($js,"--conta","TAMARACHAGAS_PREV","--images","$c/01.jpg,$c/02.jpg,$c/03.jpg,$c/04.jpg,$c/05.jpg,$c/06.jpg","--caption-file","$p/legenda-carrossel.md","--colaboradores","dra.tamarachagas_")
$global:LASTEXITCODE = $ok
"[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] carrossel: codigo $LASTEXITCODE" | Out-File $log -Append -Encoding utf8
Start-Sleep -Seconds 15
$ok = Publicar @($js,"--conta","TAMARACHAGAS_PREV","--images","$c/01.jpg","--story")
$global:LASTEXITCODE = $ok
"[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] story: codigo $LASTEXITCODE" | Out-File $log -Append -Encoding utf8
