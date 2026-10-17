# Publica um post do calendário da TK no @tk.filmes.
# Chamado pelo Agendador de Tarefas do Windows (tarefas "TK - TK Filmes <data>"), a pedido da Talyta.
# uso: publicar-agendado.ps1 -Id "2026-10-05-frase-manifesto" [-Mes "2026-10"]
param([Parameter(Mandatory=$true)][string]$Id, [string]$Mes = $Id.Substring(0,7))
Set-Location "C:\Users\tamar\TK FILMES"
$d = "tk-filmes/posts/$Mes"
$log = "$d/$Id-publicacao.log"
"[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] publicando $Id..." | Out-File $log -Encoding utf8
# imagem (.png) vira post de feed; vídeo (.mp4) vira reels; várias imagens (-01.png, -02.png…) viram carrossel
if (Test-Path "$d/$Id.mp4") { $midia = @("--video", "$d/$Id.mp4") }
elseif (Test-Path "$d/$Id-01.png") { $lista = (Get-ChildItem "$d/$Id-0?.png" | Sort-Object Name | ForEach-Object { "$d/" + $_.Name }) -join ","; $midia = @("--images", $lista) }
else { $midia = @("--images", "$d/$Id.png") }
# Espera a internet voltar (o PC pode ter acabado de acordar): até 10 minutos, testando a cada 30 s.
for ($i = 0; $i -lt 20; $i++) {
  try { Invoke-WebRequest "https://graph.instagram.com" -Method Head -UseBasicParsing -TimeoutSec 10 | Out-Null; break }
  catch { if ($_.Exception.Response) { break }; "[$(Get-Date -Format 'HH:mm:ss')] sem internet, tentando de novo em 30 s" | Out-File $log -Append -Encoding utf8; Start-Sleep 30 }
}
# Até 3 tentativas. Só tenta de novo se nada foi publicado (nunca duplica post).
for ($t = 1; $t -le 3; $t++) {
  $saida = node --env-file=.env .claude/skills/publicar-social-ratos/scripts/publish-graph-api.js --conta TK_FILMES @midia --caption-file "$d/$Id-legenda.md" 2>&1 | Out-String
  $codigo = $LASTEXITCODE
  $saida | Out-File $log -Append -Encoding utf8
  if ($codigo -eq 0 -or $saida -match "Publicado|publicado") { break }
  if ($saida -match "Container:") { "[$(Get-Date -Format 'HH:mm:ss')] falhou depois de criar o container: não repito pra não duplicar" | Out-File $log -Append -Encoding utf8; break }
  if ($t -lt 3) { "[$(Get-Date -Format 'HH:mm:ss')] tentativa $t falhou no envio; nova tentativa em 2 min" | Out-File $log -Append -Encoding utf8; Start-Sleep 120 }
}
"[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] fim (código $codigo)" | Out-File $log -Append -Encoding utf8
