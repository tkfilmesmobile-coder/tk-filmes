# Reorganiza o Drive da Ary (pedido da Talyta, 2026-10-24). Só move e renomeia; não apaga nada.
#   BRUTO/             só entrada: os arquivos sobem soltos aqui e saem quando estão prontos (ou vão pro B-ROLL)
#   CONTEÚDOS/         só o que está pronto: "<aaaa-mm> · <MÊS>" (mês em que foi feito) / "<dd-mm> · <tipo> · <tema>"
#   B-ROLL/            material pra reaproveitar: IMAGENS/<assunto> e VÍDEOS/<assunto>
#   IDENTIDADE VISUAL/ e _ARQUIVO/ (brutos de fala já editados, cópias e duplicados)
# Uso: .\reorganizar_drive.ps1            (simulação: só lista)
#      .\reorganizar_drive.ps1 -Executar  (move de verdade)
param([switch]$Executar)
$R = "H:\Meu Drive\Ary Magalhães"
$MES = @{ "01"="JANEIRO"; "02"="FEVEREIRO"; "03"="MARÇO"; "04"="ABRIL"; "05"="MAIO"; "06"="JUNHO"; "07"="JULHO"; "08"="AGOSTO"; "09"="SETEMBRO"; "10"="OUTUBRO"; "11"="NOVEMBRO"; "12"="DEZEMBRO" }
$log = New-Object System.Collections.ArrayList
function Mover($de, $para) {
  if (-not (Test-Path -LiteralPath $de)) { return }
  [void]$log.Add("$($de.Substring($R.Length))  ->  $($para.Substring($R.Length))")
  if ($Executar) {
    New-Item -ItemType Directory -Force (Split-Path $para) | Out-Null
    Move-Item -LiteralPath $de -Destination $para
  }
}
function MoverTudo($pasta, $destino) {  # move os arquivos (com subpastas) de uma pasta pra outra
  if (-not (Test-Path -LiteralPath $pasta)) { return }
  $base = (Get-Item -LiteralPath $pasta).FullName
  Get-ChildItem -LiteralPath $pasta -File -Recurse | ForEach-Object { Mover $_.FullName (Join-Path $destino $_.FullName.Substring($base.Length + 1)) }
}
function Tipo($arq) { if ($arq.Extension -match '^\.(mov|mp4)$') { "VÍDEOS" } else { "IMAGENS" } }
$C = "$R\CONTEÚDOS"
$B = "$R\B-ROLL"
$OUT = "$C\2026-10 · OUTUBRO"

# 1. B-ROLL: material bruto reaproveitável, por tipo e assunto
MoverTudo "$R\BRUTO\01_ARY_ENSAIO-FOTOS_2025-10" "$B\IMAGENS\ARY"
MoverTudo "$R\BRUTO\05_DIARIA-FALAS_2026-10-24\FOTOS-CAPAS" "$B\IMAGENS\ARY"
MoverTudo "$R\BRUTO\02_CLIENTES_RESULTADO-FOTOS" "$B\IMAGENS\RESULTADO DE CLIENTES"
MoverTudo "$R\BRUTO\03_CLIENTES_RESULTADO-VIDEOS" "$B\VÍDEOS\RESULTADO DE CLIENTES"
$at = "$R\BRUTO\04_ATENDIMENTO-01_2026-10-12_CORTE-E-ESCOVA"
foreach ($sub in 'PROCESSO', 'FINALIZACAO') { Get-ChildItem "$at\$sub" -File -ErrorAction SilentlyContinue | ForEach-Object { Mover $_.FullName "$B\$(Tipo $_)\ATENDIMENTO\$($_.Name)" } }
Get-ChildItem "$at\BASTIDOR-REACOES" -File -ErrorAction SilentlyContinue | ForEach-Object { Mover $_.FullName "$B\$(Tipo $_)\BASTIDOR E REAÇÕES\$($_.Name)" }

# 2. brutos de fala já editados saem do BRUTO (guardados no _ARQUIVO, com as tentativas)
MoverTudo "$R\BRUTO\05_DIARIA-FALAS_2026-10-24\FALAS-VIDEOS" "$R\_ARQUIVO\BRUTOS JÁ EDITADOS\2026-10-24 · diária de falas"
MoverTudo "$R\BRUTO\00_ENTRADA" "$R\BRUTO"

# 3. CONTEÚDOS: meses antigos (vídeos editados soltos) → "<aaaa-mm> · <MÊS>"
foreach ($m in '2025-10', '2025-12', '2026-05', '2026-08') { MoverTudo "$R\POSTS\$m" "$C\$m · $($MES[$m.Substring(5,2)])" }
# outubro/2026 (tudo feito em outubro, inclusive o que sai em novembro): uma pasta por conteúdo
$mapa = [ordered]@{
  "2026-10\FEED\12-10 1 ano de salao" = "12-10 · Post · 1 ano de salão"
  "2026-10\FEED\16-10 aviso sabado fechado" = "16-10 · Post · aviso sábado fechado"
  "2026-10\FEED\20-10 valores" = "20-10 · Post · valores"
  "2026-10\FEED\27-10 agenda de fim de ano" = "27-10 · Post · agenda de fim de ano"
  "2026-10\FEED\28-10 mechas antes ou depois (reel)" = "Reel · Mechas antes ou depois"
  "2026-10\FEED\mechas antes ou depois (post fixo)" = "Post · Mechas antes ou depois"
  "2026-10\STORIES" = "STORIES"
  "2026-11\FEED\03-11 cuidados com a selagem" = "03-11 · Post · cuidados com a selagem"
  "2026-11\FEED\20-11 consciencia negra" = "20-11 · Post · Consciência Negra"
  "2026-11\STORIES" = "STORIES"
}
foreach ($k in $mapa.Keys) { MoverTudo "$R\POSTS\$k" "$OUT\$($mapa[$k])" }
Get-ChildItem "$R\POSTS\2026-10" -File -ErrorAction SilentlyContinue | ForEach-Object { Mover $_.FullName "$OUT\ROTEIROS\$($_.Name)" }

"{0} movimentos{1}" -f $log.Count, $(if ($Executar) { " feitos" } else { " (simulação)" })
$log
# sobra: pastas vazias antigas (BRUTO/0x_..., POSTS/...) — listadas pra conferência
"--- pastas que ficam vazias:"
Get-ChildItem "$R\BRUTO", "$R\POSTS" -Directory -Recurse -ErrorAction SilentlyContinue | Where-Object { -not (Get-ChildItem -LiteralPath $_.FullName -File -Recurse) } | ForEach-Object { $_.FullName.Substring($R.Length) }
