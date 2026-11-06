# POST 5 (30-10-2026): mulher deitada. Antes embaixo (cabeça à esquerda), depois em cima espelhado
#   (cabeça à direita), as duas deitadas e encostadas, de lado a lado. O cabelo do depois some no preto embaixo.
# POST 6 (30-10-2026): rapaz de perfil, um atrás do outro (referência da @dra.mariialuiza mandada pela Talyta):
#   os dois olhando pra esquerda como vieram; antes atrás, à esquerda e mais baixo; depois na frente, à direita e
#   mais alto, com sombra leve sobre o antes. A mandíbula do antes fica visível atrás do queixo do depois.
#   (A versão frente a frente ficou em _ARQUIVO/POST 6 frente a frente.png.)
# Fotos já recortadas, em public/fotos (fora do git). Uso: powershell -File scripts\post5-post6.ps1 -> out\
$ed = Split-Path $PSScriptRoot
$pub = "$ed\public"
Add-Type -AssemblyName PresentationCore, WindowsBase, System.Xaml
Add-Type -Path "$PSScriptRoot\foto-antes-depois.cs" -ReferencedAssemblies PresentationCore, WindowsBase, System.Xaml
New-Item -ItemType Directory -Force "$ed\out" | Out-Null
$lg = "$pub\marca\logo-branca.png"
# Camadas { escala, x, y, espelha (0/1/2), someDe, someAte }. Mesmo tamanho: olho-queixo = 469 px (POST 5) e 420 px (POST 6).
[Ferr]::Cena(@("$pub\fotos\post5-depois-deitada.webp", "$pub\fotos\post5-antes-deitada.webp"),
  [double[]]@(0.823, 1100, -129, 1, 900, 1050,  0.95, -20, 382, 0, 0, 0), $lg, 0, 0, "$ed\out\post5-deitada.png")
# Pele suavizada de leve, mesma força nas duas fotos (pedido da Dra. Melissa, 30-10-2026; a Talyta escolheu
# "igual nos dois" depois do aviso de que retoque em antes e depois de saúde pode ser lido como propaganda enganosa).
New-Item -ItemType Directory -Force "$pub\recortes" | Out-Null
[Ferr]::SuavizaPele("$pub\fotos\post6-antes-perfil.webp", "$pub\recortes\post6-antes-perfil-suave.png", 0.9)
[Ferr]::SuavizaPele("$pub\fotos\post6-depois-perfil.webp", "$pub\recortes\post6-depois-perfil-suave.png", 0.9)
[Ferr]::CenaSombra(@("$pub\recortes\post6-antes-perfil-suave.png", "$pub\recortes\post6-depois-perfil-suave.png"),
  [double[]]@(0.685, 14.3, 194.4, 0, 0, 0,  0.783, 333.8, 80.4, 0, 0, 0), 0.5, 180, $lg, 1020, 1170, "$ed\out\post6-base.png")
# Marcas no modelo que a Dra. Melissa mandou (06-11-2026), só no nariz, verde #36FDA1 medido no desenho dela:
# pontilhado na frente do nariz do antes e 3 traços grossos acima do nariz do depois. (As linhas brancas de
# nariz e mandíbula de 30-10 foram pro _ARQUIVO/POST 6 linhas brancas.png; o traço solto na touca do modelo ficou de fora.)
$curva  = [double[]]@(177,577, 152,583.5, 136.5,592, 121.5,609.5, 103,631, 96.6,649.5, 86,670, 88.7,687, 93.5,702.6)
$tracos = [double[]]@(497,542, 518,523,  467,570, 486,559,  430,591, 448,586)
[Ferr]::Marcas("$ed\out\post6-base.png", $curva, 15.5, 2.2, $tracos, 7.5, "#36FDA1", "$ed\out\post6-rapaz.png")
# Centralizado pelos rostos (nariz do antes até a orelha do depois), não pela touca: a ponta de trás da touca do
# depois passa da borda direita (escolha da Talyta, 30-10-2026, entre isso e rostos 14% menores).
