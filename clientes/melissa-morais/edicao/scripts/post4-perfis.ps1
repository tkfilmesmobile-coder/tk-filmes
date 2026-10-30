# POST 4 (30-10-2026): antes e depois de perfil, frente a frente, 1080x1350, sem marcação.
# Antes à esquerda como veio (olhando pra direita); depois à direita, espelhado. Fotos já recortadas, em public/fotos (fora do git).
# Uso: powershell -File scripts\post4-perfis.ps1  ->  out\post4-perfis.png
$ed = Split-Path $PSScriptRoot
$pub = "$ed\public"
Add-Type -AssemblyName PresentationCore, WindowsBase, System.Xaml
Add-Type -Path "$PSScriptRoot\foto-antes-depois.cs" -ReferencedAssemblies PresentationCore, WindowsBase, System.Xaml
New-Item -ItemType Directory -Force "$ed\out" | Out-Null
# { olhoX, olhoY, queixoX, queixoY, narizX } em px da foto (941x1672), medidos com [Ferr]::Grade.
# Olho-queixo = 450 px no slide; pontas do nariz em x 510 e 570; olhos em y 550.
[Ferr]::Perfis("$pub\fotos\post4-antes-perfil.webp", @(481.0, 531.0, 689.0, 961.0, 670.0),
  "$pub\fotos\post4-depois-perfil.webp", @(433.0, 589.0, 633.0, 1022.0, 655.0),
  "$pub\marca\logo-branca.png", 450, 510, 570, 550, 1000, 1200, "$ed\out\post4-perfis.png")
