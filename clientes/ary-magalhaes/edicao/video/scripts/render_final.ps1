# Renderiza os reels em resolução cheia e baixa o áudio 1,5 dB (voz + efeitos não estouram).
# Saída: out/final/<data> · <título>.mp4
param([string[]]$ids = @('mechas-antes-ou-depois', 'selagem-3-coisas', 'cabelo-de-salao-em-casa', 'sobrancelha', 'estetica-ou-saude'))
Set-Location (Split-Path $PSScriptRoot)
$env:PATH = "$env:LOCALAPPDATA\Programs\node;$env:PATH"
$ff = "node_modules\@remotion\compositor-win32-x64-msvc\ffmpeg.exe"
$nomes = @{
  'mechas-antes-ou-depois' = 'Mechas antes ou depois do alisamento'
  'selagem-3-coisas' = '3 coisas que acabam com a sua selagem'
  'cabelo-de-salao-em-casa' = 'Cabelo de salão em casa'
  'sobrancelha' = 'Eu também faço sobrancelha'
  'estetica-ou-saude' = 'Estética ou saúde'
  'muito-prazer' = 'Muito prazer, Ary Magalhães'
}
New-Item -ItemType Directory -Force out\final | Out-Null
foreach ($id in $ids) {
  $t0 = Get-Date
  npx remotion render $id "out/final/_$id.mp4" --concurrency=6 --crf=17 2>&1 | Select-String -Pattern ' Error ' | Select-Object -First 3
  $saida = "out\final\2026-10-24 · $($nomes[$id]).mp4"
  & $ff -v error -y -i "out\final\_$id.mp4" -c:v copy -af "volume=-1.5dB" -c:a aac -b:a 256k -movflags +faststart $saida
  if (Test-Path $saida) { Remove-Item "out\final\_$id.mp4" -Confirm:$false }
  "{0}: {1:N0}s" -f $id, ((Get-Date) - $t0).TotalSeconds
}
