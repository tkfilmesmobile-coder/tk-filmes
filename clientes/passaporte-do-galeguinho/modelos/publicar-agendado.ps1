# Publica um post do calendário do Passaporte do Galeguinho no @passaportedogaleguinho,
# e em seguida a sequência de stories dele (<Id>-story-01.png, -02, -03...). Regra da Talyta
# (2026-09-30): todo post que sai leva no mínimo 3 stories ligados ao assunto.
# Chamado pelo Agendador de Tarefas do Windows (tarefas "TK - Galeguinho <data>").
# uso: publicar-agendado.ps1 -Id "2026-10-03-outubro-chegou" [-Mes "2026-10"]
# Carrossel: se existir <Id>-slide-01.png, publica todos os <Id>-slide-*.png em ordem.
param([Parameter(Mandatory=$true)][string]$Id, [string]$Mes = $Id.Substring(0,7))
Set-Location "C:\Users\tamar\TK FILMES"
$d = "clientes/passaporte-do-galeguinho/posts/$Mes"
$log = "$d/$Id-publicacao.log"
$script = ".claude/skills/publicar-social-ratos/scripts/publish-graph-api.js"
# Colaboração (convite pro outro perfil): um @ por linha em <Id>-colaboradores.txt
$colab = @()
if (Test-Path "$d/$Id-colaboradores.txt") { $colab = @("--colaboradores", ((Get-Content "$d/$Id-colaboradores.txt") -join ",")) }
if (Test-Path "$d/$Id.mp4") {
  # Vídeo (reels)
  "[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] publicando $Id (vídeo)..." | Out-File $log -Encoding utf8
  node --env-file=.env $script --conta PASSAPORTEDOGALEGUINHO --video "$d/$Id.mp4" --caption-file "$d/$Id-legenda.md" @colab 2>&1 | Out-File $log -Append -Encoding utf8
} else {
  if (Test-Path "$d/$Id-slide-01.png") {
    $imagens = (Get-ChildItem "$d/$Id-slide-*.png" | Sort-Object Name | ForEach-Object { "$d/" + $_.Name }) -join ","
  } else {
    $imagens = "$d/$Id.png"
  }
  "[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] publicando $Id ($imagens)..." | Out-File $log -Encoding utf8
  node --env-file=.env $script --conta PASSAPORTEDOGALEGUINHO --images "$imagens" --caption-file "$d/$Id-legenda.md" @colab 2>&1 | Out-File $log -Append -Encoding utf8
}
"[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] post: fim (código $LASTEXITCODE)" | Out-File $log -Append -Encoding utf8

# stories, na ordem, com pausa entre eles pro Instagram liberar
$stories = Get-ChildItem "$d/$Id-story-*.png" -ErrorAction SilentlyContinue | Sort-Object Name
foreach ($s in $stories) {
  Start-Sleep -Seconds 20
  "[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] story $($s.Name)..." | Out-File $log -Append -Encoding utf8
  node --env-file=.env $script --conta PASSAPORTEDOGALEGUINHO --images ("$d/" + $s.Name) --story 2>&1 | Out-File $log -Append -Encoding utf8
  "[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] story: fim (código $LASTEXITCODE)" | Out-File $log -Append -Encoding utf8
}
"[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] tudo publicado: 1 post + $($stories.Count) stories" | Out-File $log -Append -Encoding utf8
