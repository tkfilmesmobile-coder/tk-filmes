# Publica um Reels no @tamarachagas_prev com colaboração do @dra.tamarachagas_, a partir do PC do escritório (sem stories:
# pausados desde 16/11/2026). Não repete: se o log já diz "Publicado", não faz nada. Tenta 3x se a conexão cair.
# uso: publicar-reels-escritorio.ps1 -Video <mp4> -Legenda <md> -Log <arquivo.log>   (caminhos a partir da raiz do TK FILMES)
param([string]$Video, [string]$Legenda, [string]$Log)
Set-Location "C:\Users\tamar\TK FILMES"
$js = ".claude/skills/publicar-social-ratos/scripts/publish-graph-api.js"
if ((Test-Path $Log) -and (Select-String -Path $Log -Pattern "Publicado" -Quiet)) { exit 0 }
for ($i = 1; $i -le 3; $i++) {
  "[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] publicando (tentativa $i)..." | Out-File $Log -Append -Encoding utf8
  $saida = (& node --env-file=.env $js --conta TAMARACHAGAS_PREV --video $Video --caption-file $Legenda --colaboradores dra.tamarachagas_ 2>&1 | Out-String)
  $saida | Out-File $Log -Append -Encoding utf8
  if ($saida -match "Publicado") { exit 0 }
  Start-Sleep -Seconds 120
}
exit 1
