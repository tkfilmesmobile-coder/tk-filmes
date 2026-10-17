# Publica o reels "Periodontite na gestação" no @dra.camillawanderley e, logo depois, a sequência de
# stories (story-01 a story-04). Regra da Talyta: todo post leva no mínimo 3 stories ligados ao assunto.
# Chamado pelo Agendador de Tarefas do Windows (tarefa "TK - Camilla periodontite 07-10 12h"), uma vez só.
Set-Location "C:\Users\tamar\TK FILMES"
$d = "clientes/camilla-wanderley/posts/2026-10/periodontite-reels"
$js = ".claude/skills/publicar-social-ratos/scripts/publish-graph-api.js"
$log = "$d/publicacao.log"
"[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] publicando reels..." | Out-File $log -Encoding utf8
node --env-file=.env $js --conta DRA_CAMILLAWANDERLEY --video "$d/periodontite.mp4" --caption-file "$d/legenda.md" 2>&1 | Out-File $log -Append -Encoding utf8
$ok = $LASTEXITCODE
"[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] reels: codigo $ok" | Out-File $log -Append -Encoding utf8
if ($ok -ne 0) { exit 1 }
foreach ($n in "01", "02", "03", "04") {
  if (-not (Test-Path "$d/story-$n.png")) { continue }
  Start-Sleep -Seconds 15
  node --env-file=.env $js --conta DRA_CAMILLAWANDERLEY --images "$d/story-$n.png" --story 2>&1 | Out-File $log -Append -Encoding utf8
  "[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] story ${n}: codigo $LASTEXITCODE" | Out-File $log -Append -Encoding utf8
}
