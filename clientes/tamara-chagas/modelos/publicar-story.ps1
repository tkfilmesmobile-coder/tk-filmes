# Publica UM story do b-roll diário no @tamarachagas_prev (regra da Talyta, 21/10/2026: stories diários com o material
# da pasta B-ROLL do Drive, mesclando foto e vídeo; vídeo sem fala sai com música, sem o áudio original).
# uso: publicar-story.ps1 -Pasta "clientes/tamara-chagas/stories/2026-10-21-b-roll" -Arquivo "02-ambiente.mp4"
param([string]$Pasta, [string]$Arquivo, [string]$Conta = "TAMARACHAGAS_PREV")
Set-Location "C:\Users\tamar\TK FILMES"
$js = ".claude/skills/publicar-social-ratos/scripts/publish-graph-api.js"
$log = "$Pasta/publicacao.log"
$tipo = if ($Arquivo -match "\.mp4$") { "--video" } else { "--images" }
# tenta de novo (até 3x, 60 s de intervalo) se cair a conexão antes de publicar; se já publicou, não repete
for ($i = 1; $i -le 3; $i++) {
  "[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] $Arquivo (tentativa $i)" | Out-File $log -Append -Encoding utf8
  $saida = (& node --env-file=.env $js --conta $Conta $tipo "$Pasta/$Arquivo" --story 2>&1 | Out-String)
  $saida | Out-File $log -Append -Encoding utf8
  if ($LASTEXITCODE -eq 0 -or $saida -match "publicad") { exit 0 }
  Start-Sleep -Seconds 60
}
exit 1
