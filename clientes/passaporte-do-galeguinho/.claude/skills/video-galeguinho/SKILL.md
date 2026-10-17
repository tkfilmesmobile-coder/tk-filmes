---
name: video-galeguinho
description: Edita vídeo vertical (Reels) do Passaporte do Galeguinho no Remotion, no padrão de edição aprovado pela Talyta em 2026-10-05 no vídeo do Maycon de Quipapá: vídeo inteiro sem reenquadrar, color grade quente, abertura com perfil e visualizações do apresentador, selo de localização com a logo, legenda em minúsculas com headlines manuscrito + Anton dourado, cardápio em 3D, ingredientes em vista explodida, efeitos sonoros da casa e gráficos rastreados no apresentador. Use quando pedirem "edita o vídeo do Galeguinho", "edição do Passaporte", "vídeo novo do Galeguinho", "edita no padrão do Galeguinho".
---

# /video-galeguinho · padrão de edição de vídeo

Parâmetros fechados com a Talyta em 2026-10-05, depois de 3 prévias e 3 versões do vídeo de 30/09
(apresentador: Maycon de Quipapá). **Valem pra todo vídeo deste cliente.** Mudou algum parâmetro?
Atualizar este arquivo, com a data. O projeto Remotion mora em `edicao/`, nesta pasta de cliente.

## 0. Antes de editar

- Carregar a skill `remotion-best-practices` e ler as referências de criação, markup, legendas e render.
  Se ela não existir, dizer isso e consultar a documentação oficial.
- Conferir que todos os pacotes `remotion` e `@remotion/*` do `edicao/package.json` estão na mesma versão.
- Ler a ficha do cliente (`contexto.md`): nome da casa, cidade, horário, tom, regra de foto real.
- Pedir à Talyta, na pasta do vídeo: o vídeo gravado e, se houver apresentador convidado, o print do
  perfil dele e o print das visualizações de alguns vídeos.
- **Sem serviço pago** sem autorização. Tudo aqui roda local e grátis.

## 1. Regras que não se negociam

1. **Nada cobre rosto nem lanche.** Vale pra legenda, headline, card, selo e insert. O lanche de
   verdade em cena conta como lanche.
2. **O vídeo não se mexe.** Entra inteiro, 1080 × 1920, sem corte, zoom, fundo desfocado ou
   reenquadramento. Quem cede é o gráfico: menor, mais pro lado, mais pra baixo.
3. **Voz original intocada.** Efeito sonoro fica abaixo da fala.
4. **Fala real.** Transcrever a gravação; nunca completar por roteiro nem por suposição. Trecho que as
   duas passadas do Whisper não confirmam **fica sem legenda** e vai pra lista de conferência.
5. **Foto real.** Insert de lanche usa foto do ensaio do cliente. Nunca imagem de IA nem banco.
6. **Movimento só por frame** (`useCurrentFrame` + `interpolate`). Sem animação CSS, sem relógio
   próprio.
7. **Original preservado.** Trabalha-se numa cópia em `edicao/public/midia/`.

## 2. Fluxo

1. **Cópia de trabalho** do vídeo em `public/midia/<id>.mp4` (id = data da gravação, ex.: `0930`).
   HEVC de celular roda direto.
2. **Áudio e transcrição:** extrair WAV 16 kHz (`npx remotion ffmpeg`), transcrever com o Whisper.cpp
   local (modelo medium, `pt`) em **duas passadas**; a segunda recebe como contexto os termos da ficha
   (nome da casa, cidade, gírias: entendesse, visse, oxe, simbora). A instalação do Whisper já existe
   no projeto do curso; não baixar de novo.
3. **Conferir nomes de lanche no cardápio online** (link da bio). Foi assim que "burger capiana"
   virou certeza: Burguer Capiana está lá, com os ingredientes.
4. **Lista de conferência:** gravar em `scripts/<id>/REVISAR.md` os trechos sem legenda e as leituras
   a confirmar no ouvido. Repetir essa lista pra Talyta na entrega.
5. **Rastreio do rosto:** `scripts/rosto.py` no vídeo inteiro → `public/rastreio/<id>.json`
   (um ponto por frame, já suavizado).
6. **Legendas:** `scripts/<id>/legendas.py` com a lista de blocos (início, fim, texto, headline).
   Texto com `|` separa apoio e título da headline.
7. **Prévia curta primeiro** (8 a 9 s, só a abertura). Esperar a revisão. Só depois o vídeo inteiro.
8. **Antes do render completo:** `npx remotion still` nos frames de risco (cada insert, cada headline
   com lanche em cena) e olhar se algo cobre rosto ou lanche.
9. **Render:** `npx remotion render <Comp> out/<id>-edicao-vN.mp4 --concurrency=9`. Um vídeo de 55 s
   leva uns 14 minutos. Ajuste pontual: renderizar só o trecho.
10. **Entrega:** prévia e versões no chat. Aprovado, o final vai pro Drive do cliente, em
    `VIDEO EDITADO`. Dizer o que foi conferido por quadro e que a mixagem do som é pra ela ouvir.

## 3. Estética (o padrão)

Base: a identidade dos posts em dose de vídeo. Cores `#FFF6E9` creme, `#FFB01F` dourado, `#F5820A`
laranja, `#0E0A05` escuro. Cards em "vidro escuro quente" (escuro a 78%, fio dourado, sombra).
Fontes: Montserrat (interface e legenda), Anton (títulos e números), Great Vibes (apoio da headline).

**Color grade** (`Acabamento.tsx`): contraste 1.09, saturação 1.16, brilho 1.03, sépia 0.06 no vídeo;
por cima, calor nos meios-tons, sombras levemente frias, vinheta suave e grão fino por frame.

**Faixa de segurança:** gráfico vive abaixo do rosto e acima dos ~380 px de baixo (controles do Reels).

**Rastreamento:** o bloco de gráficos fica preso ao apresentador, logo abaixo do queixo, e segue o
movimento dele com média de ±7 frames (segue, não treme). A legenda corrente fica fixa. Insert lateral
desvia do rosto: o cardápio fica sempre à esquerda dele; os ingredientes, sempre abaixo do queixo.

### Abertura (primeiros ~3,4 s), fiel à referência aprovada
1. **Card de perfil primeiro:** foto com aro dourado, nome com selo de verificado, @ em dourado e os
   três números (posts, seguidores, seguindo) em Anton.
2. **Embaixo dele, os três vídeos** com o olho e a contagem de visualizações, entrando um por vez,
   com o brilho passando pelos números.
3. Os dois ficam juntos e saem juntos.

### Selo de localização
Quando a cidade é dita: a **logo da casa** cai com um quique, a pílula abre, aparece
"Passaporte do **Galeguinho**" (Galeguinho em laranja) e, embaixo, o pino com "São José da Laje · AL".
No fechamento (chamada pra visita) o selo volta, **acima da cabeça** do apresentador.

### Legenda corrente
Minúsculas, Montserrat 700, 58 px, creme, brilho suave, sem caixa. Blocos de 1 a 4 palavras, entrando
com foco e leve aproximação. Some logo depois da fala (trecho sem legenda fica limpo).

### Headlines (as falas fortes)
O par dos posts: **apoio em manuscrito** (Great Vibes, creme) entra primeiro; o **título em Anton
dourado**, caixa alta, bate grande na hora da palavra, com brilho e um **fio dourado** riscando
embaixo. Ancorada pela base (cresce pra cima). Cerca de uma a cada 4 ou 5 segundos: nome da casa,
nome do lanche, ingredientes, exclamações, chamada final.
Com lanche em cena a headline muda de zona: prato na mão à esquerda → metade direita, sobre a camisa;
prato na mesa → abaixo do prato, menor.

### Cardápio em 3D (quando ele fala do cardápio ou escolhe o lanche)
Cartão em perspectiva com o cardápio online, **só os itens que têm foto**, entrando em cascata.
Na escolha, os outros apagam e ficam cinza; o escolhido **salta pra frente** com moldura dourada,
brilho varrendo e a etiqueta "a escolha dele". É perspectiva e paralaxe, sem mapa de profundidade.

### Ingredientes (quando ele descreve o lanche)
Vista explodida com a **foto real do ensaio** recortada em camadas: entra montado, abre, cada
ingrediente acende quando é dito, fecha e sai. Etiquetas em pílula de vidro, à esquerda das camadas.
Nome e ingredientes vêm do cardápio online.

### Som
Efeitos sintetizados no projeto (`scripts/gerar-sfx.mjs`): **impacto** (batida grave), **subida**
(ar que cresce), **sopro** (entrada e saída), **estouro** (card), **brilho** (destaque), **toque**
(clique). Um som pra cada movimento. Headline = subida antes, impacto na palavra, brilho depois.
A Talyta pediu mais som duas vezes: na dúvida, o movimento ganha som. Volumes de referência:
impacto 0,6 · sopro 0,3 a 0,5 · estouro 0,3 a 0,45 · subida 0,34 · brilho 0,2 · toque 0,26.

## 4. Peças prontas em `edicao/src`

`Composition.tsx` (linha do tempo e zonas de legenda) · `Abertura.tsx` (perfil, vídeos, selo, bloco
rastreado) · `Legendas.tsx` (legenda e headline) · `Cardapio3D.tsx` · `Ingredientes.tsx` ·
`Acabamento.tsx` (grade) · `Rastreio.ts` · `Sons.tsx` · `marca.ts`. Vídeo novo = composição nova
com os mesmos componentes; os dados (legendas, rastreio, recortes) mudam por vídeo.

## 5. O que já foi recusado (não repetir)

- Mostrar as visualizações antes do perfil: a ordem é perfil primeiro.
- Selo só com a cidade: tem que ter a logo e o nome da casa.
- Pouco efeito sonoro, ou som sem peso.
- Cardápio com item sem foto.
- Em arte estática do mesmo cliente: foto encaixada em fundo desfocado. A foto (e o vídeo) não se mexe.

## Zonas seguras do reels (regra fixa da Talyta, 2026-10-12)
Vale pra todo cliente. Em 1080x1920: nada fora da área útil (x 60–920, y 250–1500); foco principal na linha dos olhos (y 300–900); legenda logo abaixo do foco, perto do rosto (y 900–1080), nunca lá embaixo; imagens e ilustrações na faixa de baixo (y 1080–1500), sem dominar. Detalhe em `_contexto/preferencias.md`.
