# Publica os stories do dia no @tamarachagas_prev, na ordem do ordem.txt, a partir do PC kumyt
# (o PC do escritório parou em 23/10/2026; pedido da Talyta em 27/10). Regra: todo dia útil às 8h; a pasta
# clientes/tamara-chagas/stories/AAAA-MM-DD-b-roll é produzida no dia anterior.
# Proteções: não repete (marca .publicado na pasta) e não publica depois das 11h (o lote abre com "bom dia").
# uso: publicar-stories-dia-pc-kumyt.ps1 [-Data AAAA-MM-DD]   (sem -Data = hoje)
param([string]$Data = (Get-Date -Format "yyyy-MM-dd"), [switch]$Forcar)
Set-Location "C:\Users\kumyt\Documents\Projeto TK FILMES\TK FILMES"
$node = "C:\Users\kumyt\AppData\Local\Programs\node\node.exe"
$pasta = "clientes/tamara-chagas/stories/$Data-b-roll"
$log = "clientes/tamara-chagas/stories/publicacao-diaria.log"
$js = ".claude/skills/publicar-social-ratos/scripts/publish-graph-api.js"
function Linha([string]$t) { "[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] (PC kumyt) $t" | Out-File $log -Append -Encoding utf8 }

if (-not (Test-Path "$pasta/ordem.txt")) { Linha "SEM STORIES: $pasta/ordem.txt não existe"; exit 1 }
if (Test-Path "$pasta/.publicado") { Linha "$Data já publicado antes; nada a fazer"; exit 0 }
if (-not $Forcar -and (Get-Date).Hour -ge 11) { Linha "${Data}: PC ligou depois das 11h; lote não publicado (abre com bom dia)"; exit 1 }

# o PC às vezes acorda sem internet: espera a conexão com o Instagram (até 15 min)
for ($w = 0; $w -lt 30; $w++) {
  try { Invoke-WebRequest -Uri "https://graph.instagram.com/" -Method Head -TimeoutSec 10 -UseBasicParsing | Out-Null; break }
  catch { if ($_.Exception.Response) { break }; Start-Sleep -Seconds 30 }
}
$falhas = 0
foreach ($arq in (Get-Content "$pasta/ordem.txt" -Encoding utf8 | Where-Object { $_.Trim() -ne "" -and -not $_.StartsWith("#") })) {
  $arq = $arq.Trim()
  $tipo = if ($arq -match "\.mp4$") { "--video" } else { "--images" }
  $ok = $false
  for ($i = 1; $i -le 3 -and -not $ok; $i++) {
    $saida = (& $node --env-file=.env $js --conta TAMARACHAGAS_PREV $tipo "$pasta/$arq" --story 2>&1 | Out-String)
    Linha "$Data $arq (tentativa $i)`n$saida"
    if ($LASTEXITCODE -eq 0 -or $saida -match "publicad") { $ok = $true } else { Start-Sleep -Seconds 60 }
  }
  if (-not $ok) { $falhas++ }
  Start-Sleep -Seconds 20
}
"publicado em $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') · falhas: $falhas" | Out-File "$pasta/.publicado" -Encoding utf8
