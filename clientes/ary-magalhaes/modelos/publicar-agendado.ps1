# Publica um post do calendário no @cabelosmagalhaes (feed: foto única ou carrossel).
# Chamado pelo Agendador de Tarefas do Windows (tarefas "TK - Ary <data>"), a pedido da Talyta.
# A pasta do post tem s1.jpg, s2.jpg... (na ordem) e legenda.txt.
# uso: publicar-agendado.ps1 -Id "01-2026-10-12-1-ano"
param([Parameter(Mandatory=$true)][string]$Id)
Set-Location "C:\Users\tamar\TK FILMES"
$mes = ([regex]::Match($Id, "\d{4}-\d{2}")).Value   # "01-2026-11-03-..." -> "2026-11"
$d = "clientes/ary-magalhaes/posts/$mes/$Id"
$js = ".claude/skills/publicar-social-ratos/scripts/publish-graph-api.js"
$log = "$d/publicacao.log"
$imgs = (Get-ChildItem "$d/s*.jpg" | Where-Object { $_.Name -match '^s\d+\.jpg$' } | Sort-Object { [int]($_.BaseName -replace '\D','') } | ForEach-Object { "$d/$($_.Name)" }) -join ","
"[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] publicando $Id ($imgs)..." | Out-File $log -Encoding utf8
# tenta de novo (até 3x, 60 s de intervalo) se cair a conexão ANTES de publicar; se já publicou, não repete
for ($i = 1; $i -le 3; $i++) {
  $saida = (& node --env-file=.env $js --conta CABELOSMAGALHAES --images $imgs --caption-file "$d/legenda.txt" 2>&1 | Out-String)
  $saida | Out-File $log -Append -Encoding utf8
  if ($LASTEXITCODE -eq 0 -or $saida -match "publicad") { "[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] ok" | Out-File $log -Append -Encoding utf8; exit 0 }
  "[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] falhou (tentativa $i), tentando de novo em 60 s" | Out-File $log -Append -Encoding utf8
  Start-Sleep -Seconds 60
}
exit 1
