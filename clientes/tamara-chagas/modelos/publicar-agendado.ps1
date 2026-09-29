# Publica um post do calendário no @tamarachagas_prev, em colaboração com o @dra.tamarachagas_.
# Chamado pelo Agendador de Tarefas do Windows (tarefas "TK - Tamara cal <nº>"), a pedido da Talyta.
# uso: publicar-agendado.ps1 -Id "01-2026-10-01-dia-do-idoso-70mais"
param([Parameter(Mandatory=$true)][string]$Id)
Set-Location "C:\Users\tamar\TK FILMES"
$d = "clientes/tamara-chagas/calendarios/2026-10-eleicoes/posts"
$log = "$d/$Id-publicacao.log"
"[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] publicando $Id..." | Out-File $log -Encoding utf8
node --env-file=.env .claude/skills/publicar-social-ratos/scripts/publish-graph-api.js --conta TAMARACHAGAS_PREV --images "$d/$Id.png" --caption-file "$d/$Id-legenda.md" --colaboradores "dra.tamarachagas_" 2>&1 | Out-File $log -Append -Encoding utf8
"[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] fim (código $LASTEXITCODE)" | Out-File $log -Append -Encoding utf8
