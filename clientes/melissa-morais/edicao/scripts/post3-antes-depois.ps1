# POST 3 (2026-10-24): antes e depois de frente, 1080x1350, no padrão do slide principal do carrossel.
# Roda só com o Windows (sem Python/Node): o C# de foto-antes-depois.cs é compilado na hora.
# As fotos vieram já recortadas (PNG/WebP com transparência) e ficam em public/fotos (fora do git).
# Uso: powershell -File scripts\post3-antes-depois.ps1  ->  out\post3-antes-depois-frente.png
$ed = Split-Path $PSScriptRoot
$pub = "$ed\public"
Add-Type -AssemblyName PresentationCore, WindowsBase, System.Xaml
Add-Type -Path "$PSScriptRoot\foto-antes-depois.cs" -ReferencedAssemblies PresentationCore, WindowsBase, System.Xaml
New-Item -ItemType Directory -Force "$pub\recortes", "$ed\out" | Out-Null
[Ferr]::Recorta("$pub\fotos\post3-antes-frente.webp", "$pub\recortes\post3-antes-frente.png")
[Ferr]::Recorta("$pub\fotos\post3-depois-frente.webp", "$pub\recortes\post3-depois-frente.png")
# Ombro direito do antes cortado na borda do tecido marrom (a foto termina ali numa linha reta):
# o cabelo do depois passa por trás. Polígono em px da foto do antes (941x1672).
$mantem = [double[]]@(0,0, 941,0, 941,1150, 769,1150, 773,1200, 779,1250, 783,1300, 787,1350, 791,1400, 793,1450, 797,1500, 803,1540, 803,1672, 0,1672)
# Olhos (x esquerdo, x direito, y) medidos com [Ferr]::Grade. Distância entre os olhos no slide: 232 px
# (v2: maior que no carrossel pra o antes encostar na borda esquerda como o cabelo do depois encosta na direita).
# Antes na frente: cobre a borda reta da foto do depois; os dois rostos ficam inteiros.
# Sombra leve (0.55) do antes pra direita: destaca a mandíbula sobre o cabelo do depois (pedido da Talyta, v2).
[Ferr]::Monta("$pub\recortes\post3-antes-frente.png", @(274.0, 631.0, 620.0),
  "$pub\recortes\post3-depois-frente.png", @(372.0, 614.0, 510.0),
  "$pub\marca\logo-branca.png", 232, 266, 814, 600, 985, 1190, $false,
  "$ed\out\post3-antes-depois-frente.png", "", $mantem, 0.55)
