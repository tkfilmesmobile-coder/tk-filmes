# Publica um post do calendário no @tamarachagas_prev, em colaboração com o @dra.tamarachagas_, e em
# seguida os stories sobre o assunto (regra da Talyta, 2026-09-30): versão pessoal (card, notas,
# conversa) no @dra.tamarachagas_ e versão editorial no @tamarachagas_prev.
# Chamado pelo Agendador de Tarefas do Windows (tarefas "TK - Tamara cal <nº>"), a pedido da Talyta.
# uso: publicar-agendado.ps1 -Id "01-2026-10-01-dia-do-idoso-70mais"
param([Parameter(Mandatory=$true)][string]$Id)
Set-Location "C:\Users\tamar\TK FILMES"
$d = "clientes/tamara-chagas/calendarios/2026-10-eleicoes/posts"
$t = "clientes/tamara-chagas/calendarios/2026-10-eleicoes/trios/$Id"
$js = ".claude/skills/publicar-social-ratos/scripts/publish-graph-api.js"
$log = "$d/$Id-publicacao.log"
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

"[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] publicando $Id..." | Out-File $log -Encoding utf8
$ok = Publicar @($js,"--conta","TAMARACHAGAS_PREV","--images","$d/$Id.jpg","--caption-file","$d/$Id-legenda.md","--colaboradores","dra.tamarachagas_")
$global:LASTEXITCODE = $ok
$ok = $LASTEXITCODE
"[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] post: codigo $ok" | Out-File $log -Append -Encoding utf8
if ($ok -ne 0) { exit 1 }
foreach ($n in "1-card", "2-notas", "3-conversa") {
  if (-not (Test-Path "$t/stories/$n.jpg")) { continue }
  Start-Sleep -Seconds 15
  $ok = Publicar @($js,"--conta","DRA_TAMARACHAGAS_","--images","$t/stories/$n.jpg","--story")
  $global:LASTEXITCODE = $ok
  "[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] pessoal ${n}: codigo $LASTEXITCODE" | Out-File $log -Append -Encoding utf8
}
foreach ($n in "01", "02", "03", "04") {
  if (-not (Test-Path "$t/editorial/$n.jpg")) { continue }
  Start-Sleep -Seconds 15
  $ok = Publicar @($js,"--conta","TAMARACHAGAS_PREV","--images","$t/editorial/$n.jpg","--story")
  $global:LASTEXITCODE = $ok
  "[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] escritorio ${n}: codigo $LASTEXITCODE" | Out-File $log -Append -Encoding utf8
}
