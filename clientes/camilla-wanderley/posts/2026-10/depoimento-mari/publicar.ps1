# Publica o reels "Depoimento da Mari" no @dra.camillawanderley (pedido da Talyta em 2026-10-21: postar às 12h).
# Chamado pelo Agendador de Tarefas do Windows (tarefa "TK - Camilla depoimento Mari 21-10 12h"), uma vez só.
# Se o render ainda não terminou, espera o vídeo final aparecer (até 40 min) antes de publicar.
Set-Location "C:\Users\tamar\TK FILMES"
$d = "clientes/camilla-wanderley/posts/2026-10/depoimento-mari"
$render = "clientes/camilla-wanderley/edicao/perfil-video/out/depoimento-1010-completo-v1-final.mp4"
$js = ".claude/skills/publicar-social-ratos/scripts/publish-graph-api.js"
$log = "$d/publicacao.log"
"[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] inicio" | Out-File $log -Encoding utf8
$espera = 0
while (-not (Test-Path "$d/depoimento-mari.mp4")) {
  if ((Test-Path $render) -and ((Get-Date) - (Get-Item $render).LastWriteTime).TotalSeconds -gt 60) {
    Copy-Item $render "$d/depoimento-mari.mp4"
  } else {
    if ($espera -ge 40) { "[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] video nao ficou pronto; nada publicado" | Out-File $log -Append -Encoding utf8; exit 1 }
    Start-Sleep -Seconds 60; $espera++
  }
}
node --env-file=.env $js --conta DRA_CAMILLAWANDERLEY --video "$d/depoimento-mari.mp4" --caption-file "$d/legenda.md" 2>&1 | Out-File $log -Append -Encoding utf8
"[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] fim (codigo $LASTEXITCODE)" | Out-File $log -Append -Encoding utf8
