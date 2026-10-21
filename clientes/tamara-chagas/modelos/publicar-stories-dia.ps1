# Publica todos os stories do dia no @tamarachagas_prev, em ordem (regra da Talyta, 21/10/2026: os stories saem
# todo dia útil às 8h). A pasta do dia é clientes/tamara-chagas/stories/AAAA-MM-DD-b-roll, com um ordem.txt
# (um arquivo por linha, na ordem de publicação). A pasta é produzida no dia anterior.
# uso: publicar-stories-dia.ps1 [-Data AAAA-MM-DD]   (sem -Data = hoje)
param([string]$Data = (Get-Date -Format "yyyy-MM-dd"), [string]$Conta = "TAMARACHAGAS_PREV")
Set-Location "C:\Users\tamar\TK FILMES"
$pasta = "clientes/tamara-chagas/stories/$Data-b-roll"
$log = "clientes/tamara-chagas/stories/publicacao-diaria.log"
$js = ".claude/skills/publicar-social-ratos/scripts/publish-graph-api.js"
if (-not (Test-Path "$pasta/ordem.txt")) {
  "[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] SEM STORIES: $pasta/ordem.txt não existe" | Out-File $log -Append -Encoding utf8
  exit 1
}
foreach ($arq in (Get-Content "$pasta/ordem.txt" -Encoding utf8 | Where-Object { $_.Trim() -ne "" -and -not $_.StartsWith("#") })) {
  $arq = $arq.Trim()
  $tipo = if ($arq -match "\.mp4$") { "--video" } else { "--images" }
  $ok = $false
  for ($i = 1; $i -le 3 -and -not $ok; $i++) {
    $saida = (& node --env-file=.env $js --conta $Conta $tipo "$pasta/$arq" --story 2>&1 | Out-String)
    "[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] $Data $arq (tentativa $i)`n$saida" | Out-File $log -Append -Encoding utf8
    if ($LASTEXITCODE -eq 0 -or $saida -match "publicad") { $ok = $true } else { Start-Sleep -Seconds 60 }
  }
  Start-Sleep -Seconds 20
}
