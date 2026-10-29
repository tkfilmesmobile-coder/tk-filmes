# Sobe reels, capas, posts fixos e legendas pro Drive da Ary: CONTEÚDOS/2026-10 · OUTUBRO/<Reel|Post> · <tema>/
Set-Location (Split-Path $PSScriptRoot)
$mes = "H:\Meu Drive\Ary Magalhães\CONTEÚDOS\2026-10 · OUTUBRO"
$posts = "..\..\posts\2026-10"
$itens = @(
  @{ id = 'mechas-antes-ou-depois'; tema = 'Mechas antes ou depois'; chave = 'Mechas antes ou depois'; reel = '07-2026-10-28-mechas-antes-ou-depois'; post = '08-mechas-antes-ou-depois-post' },
  @{ id = 'selagem-3-coisas'; tema = '3 coisas que acabam com a selagem'; chave = '3 coisas'; reel = '09-selagem-3-coisas-reel'; post = '10-selagem-3-coisas-post' },
  @{ id = 'cabelo-de-salao-em-casa'; tema = 'Cabelo de salão em casa'; chave = 'Cabelo de sal'; reel = '11-cabelo-de-salao-em-casa-reel'; post = '12-cabelo-de-salao-em-casa-post' },
  @{ id = 'sobrancelha'; tema = 'Sobrancelha'; chave = 'sobrancelha'; reel = '13-sobrancelha-reel'; post = '14-sobrancelha-post' },
  @{ id = 'estetica-ou-saude'; tema = 'Estética ou saúde'; chave = 'tica ou sa'; reel = '15-estetica-ou-saude-reel'; post = '16-estetica-ou-saude-post' },
  @{ id = 'muito-prazer'; tema = 'Muito prazer, Ary Magalhães'; chave = 'Muito prazer'; reel = '17-muito-prazer-reel'; post = '18-muito-prazer-post' }
)
foreach ($i in $itens) {
  $video = Get-ChildItem out\final -File | Where-Object { $_.Name -like "*$($i.chave)*" -and $_.Name -notlike '_*' } | Select-Object -First 1
  $dr = Join-Path $mes "Reel · $($i.tema)"
  $dp = Join-Path $mes "Post · $($i.tema)"
  New-Item -ItemType Directory -Force $dr, $dp | Out-Null
  if ($video) { Copy-Item $video.FullName (Join-Path $dr "reel.mp4") -Force } else { "SEM VÍDEO: $($i.id)" }
  Get-ChildItem $dr -Filter "reel-*.mp4" -ErrorAction SilentlyContinue | ForEach-Object { Move-Item $_.FullName "H:\Meu Drive\Ary Magalhães\_ARQUIVO\$($i.id)-versao-anterior.mp4" -Force }
  Copy-Item "out\capa-$($i.id).png" (Join-Path $dr "capa.png") -Force
  Copy-Item "$posts\$($i.reel)\legenda.txt" (Join-Path $dr "legenda.txt") -Force
  Add-Type -AssemblyName System.Drawing
  $img = [System.Drawing.Image]::FromFile((Resolve-Path "out\post-$($i.id).png"))
  $enc = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq 'image/jpeg' }
  $par = New-Object System.Drawing.Imaging.EncoderParameters 1
  $par.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter ([System.Drawing.Imaging.Encoder]::Quality), 95L
  $img.Save((Join-Path $dp "post.jpg"), $enc, $par); $img.Dispose()
  Copy-Item "$posts\$($i.post)\legenda.txt" (Join-Path $dp "legenda.txt") -Force
  "{0}: reel {1}" -f $i.id, $(if ($video) { "{0:N0} MB" -f ($video.Length / 1MB) } else { "-" })
}
