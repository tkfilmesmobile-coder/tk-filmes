---
name: post-tamara
description: Cria post de imagem (feed 1080x1350) pro Instagram do escritório Tamara Chagas Advocacia no padrão aprovado pela Talyta em 2026-09-28: fundo escuro, Libre Baskerville + Inter, foto colorida de idoso feliz à direita, lista 01/02/03, fonte oficial no post e na legenda, legenda no formato fixo, e publica pela publicar-social-ratos depois do OK. Use quando pedirem "post da Tamara", "post de imagem pro escritório", "arte informativa do INSS", "post pro @tamarachagas_prev".
---

# /post-tamara · post informativo de imagem

Regras aprovadas pela Talyta em 2026-09-28. **Valem pra todo post de imagem desta cliente.** Mudou
alguma regra? Atualizar este arquivo e o modelo, com a data.

## 1. Conteúdo (antes de desenhar)

- **Só fonte oficial:** gov.br/previdencia, gov.br/inss, DOU, Planalto, STJ, STF, CJF/TNU, TRF5
  (aba "Fontes Oficiais" da `controle-marketing.xlsx`). Abrir a fonte e conferir o texto. Portal de
  notícia só serve pra localizar o assunto.
- **Decisão judicial:** só com inteiro teor conferido e **aprovação jurídica da Dra. Tamara** antes
  de publicar. Nunca a partir de manchete.
- **OAB (Provimento 205/2021):** informativo, sem prometer resultado, sem oferecer serviço, sem
  honorários, sem caso de cliente.
- Gancho em forma de **pergunta direta ao segurado** ("Vai votar no domingo?").

## 2. Estética · PADRÃO ATUAL "LIMPO" (2026-09-29, substitui o escuro e o claro abaixo)

Referências que a Talyta mandou: foto como protagonista, texto grande sobre ela, fino + negrito,
etiquetas pequenas nas bordas, pílula com o @, "Leia a legenda ↘". Limpo, leve e profissional.
- Gerar com `python modelos/post_limpo.py posts/<pasta>` (feed) e `... posts/<pasta> story`
  (stories), a partir de `posts/<pasta>/conteudo.json` (campos documentados no topo do script).
- **Foto: a Tamara**, do ensaio de estúdio (fundo cinza claro), em `marca/fotos/tamara/`
  (originais em OneDrive\Imagens\FOTOS TAMARA). Ela fica à direita, com a borda esquerda dissolvida
  no fundo claro #ECEBE9. Escolher a pose pelo tom: braços cruzados (0003) pra alerta, olhar pro
  lado (0081) pra informativo, sorriso (0132, 0110) pra notícia boa. Não repetir a mesma foto em
  posts seguidos.
- **Tipografia: só Inter.** Título 74px: parte fina (200) + parte forte (700). Um destaque em
  faixa cinza. Lista curta com linhas finas. Fonte oficial em uma linha, dentro do bloco.
- **Logo do escritório SEMPRE** (pedido da Talyta, 2026-09-29): versão escura completa
  (`marca/logo-escuro-recortado.png`, símbolo + TAMARA CHAGAS ADVOCACIA) no **canto superior
  esquerdo**, 124px de largura, com as etiquetas ao lado. Vale pra feed e stories; o script já põe.
- **Sem** moldura, sem outros enfeites.
- **Texto NUNCA em cima de rosto** (regra da Talyta, 2026-09-29): texto só no fundo livre; conferir
  o PNG antes de mostrar. Nada de foto em tela cheia com texto por cima de pessoa.
- **Fotos de outras pessoas (banco de imagem) NUNCA se repetem** (2026-09-29): antes de escolher,
  ler `marca/fotos/_uso.md`; depois de publicar, acrescentar a linha lá. **Fotos da Tamara podem
  repetir.** Misturar: posts com a Tamara e posts com outras pessoas (idosos, trabalhadores,
  famílias), como na prévia aprovada.
- **Diversificar o feed** com os 5 layouts de `modelos/variantes.py` (retrato, tipográfico,
  foto-cheia, metades, cartão), alternando; nunca dois iguais seguidos. Prévia aprovada em
  `calendarios/2026-10-eleicoes/previa/`.

As seções abaixo (escuro e claro) ficam como histórico.

## 2-antigo. Estética escura/clara (o modelo era `modelos/post-informativo.html`)

- Formato **1080 × 1350** (feed 4:5).
- **Tema CLARO (2026-09-29, substitui o fundo escuro de 2026-09-28):** fundo off-white quente
  **#F5F1EB**, texto grafite #1F1D1A, detalhes (kicker, números, rótulos) em taupe **#8C7B6B**,
  logo escuro (`marca/simbolo-escuro.png`). A foto se dissolve no claro. As cores vivem em
  `modelos/tema-claro.css`; o modelo `post-informativo.html` já vem com ele. Post montado a partir
  de um arquivo antigo: `python modelos/clarear.py <post.html> <story.html>`.
- Moldura fina a 40px da borda. Data-chave no canto em plaquinha clara, pra não sumir sobre a foto.
- Foto deitada (paisagem) também serve: menor, ancorada embaixo à direita, com as bordas
  dissolvidas (`-webkit-mask-image`), nunca com corte duro.
- **Fontes:** título em **Libre Baskerville** 400, reto, **sem itálico e sem efeito prateado**;
  todo o resto em **Inter** (300 no texto, 500/600 nos destaques). Números sempre alinhados
  (lining). Nada de fonte decorativa: a Talyta pediu sóbrio.
- **Topo:** símbolo (`marca/simbolo-transparente.png`) | TAMARA CHAGAS / ADVOCACIA à esquerda;
  "DIREITO PREVIDENCIÁRIO E ASSISTENCIAL" à direita. Um logo só por post.
- **Kicker** acima do título: fio curto + assunto em caixa-alta espaçada ("ELEIÇÕES 2026 · INSS").
- **Título** 2 linhas, ~92px. **Subtítulo** de uma frase com a palavra-chave em negrito.
- **Lista numerada 01 / 02 / 03** separada por fios finos, largura máxima 560px (coluna esquerda).
- **Foto:** **colorida**, de **idoso(a) feliz**, com luz natural, ocupando o lado direito e
  se dissolvendo no fundo escuro (degradê da esquerda e do topo). O texto fica todo na área escura.
  Foto em pé (retrato) ancorada embaixo à direita, rosto visível inteiro, sem corte duro na lateral:
  o degradê cobre a borda da foto. Referência aprovada: `marca/fotos/idosa-camisa-rosa-junior-reis-unsplash.jpg`.
  Foto guardada em `marca/fotos/` com autor e origem no nome do arquivo. Banco gratuito
  (Unsplash) ou foto real do escritório; pedir OK antes de baixar.
- **Rodapé:** nota curta ("Não vai votar? ...") + bloco **FONTE** separado por fio, com órgão,
  site, data e a norma; à direita, a data-chave do assunto quando houver.

## 2b. Stories do dia (regra de 2026-09-28)

Story **não** usa a estética do feed. Tem que parecer feito por uma pessoa no próprio Instagram:
- fundo de **foto cheia** ou **cor lisa** (bege #EDE4D8, rosa queimado #C9A3A0, azul-marinho #1F2A3A, grafite #1C1C1C);
- texto no estilo do app: **caixinha branca com letra preta** (ou caixinha escura), alguns levemente
  tortos, letra minúscula, **emoji**, linguagem de conversa ("rapidinho 👀", "pois é!", "me conta 👇");
- **sem logo, sem moldura, sem layout de agência**;
- fonte oficial continua obrigatória nos informativos, em letra de máquina de escrever pequena embaixo;
- enquete, quiz e caixinha: deixar o espaço vazio pro sticker, que se cola no app.

Gerar com `python modelos/stories_organico.py stories/<data> stories/<data>/organico.json` e
registrar a ordem em `stories/<data>/roteiro.md`. O que tem sticker se posta pelo app; o resto
pode sair pelo `--story` da publicar-social-ratos, com OK.

## 3. Legenda (formato fixo)

```
<pergunta-gancho com a data>. <promessa da informação>. <emoji discreto>

<parágrafo 1: a regra, em linguagem simples>

<parágrafo 2: a exceção ou o "e se">

📌 Fonte: <órgão>, notícia "<título exato>", de <dd/mm/aaaa> (<site>). Base normativa: <norma>.

Cada caso é único. <quando procurar orientação profissional>.

Compartilhe com quem precisa saber disso. 💬

#INSS #<tema> #<benefício> #DireitoPrevidenciario #<gancho> #UniaoDosPalmares
```

Máximo 2.200 caracteres. Sem chamada de venda.

## 4. Gerar

1. Pasta do post: `posts/AAAA-MM-DD-<assunto>/` com `post.html`, `post.png` e `legenda.md`.
2. Copiar `modelos/post-informativo.html` pra lá, trocar os textos e a foto (caminhos relativos
   `../../marca/...`).
3. Renderizar: `python modelos/render.py posts/<pasta>/post.html posts/<pasta>/post.png`
   (Python + Playwright).
4. Abrir o PNG e conferir: texto não encosta na foto, nada cortado, fonte presente.
5. Mostrar a imagem e a legenda pra Talyta.

## 5. Publicar

Só com OK explícito. Pela skill `publicar-social-ratos`, conta `TAMARACHAGAS_PREV` (escritório) ou
`DRA_TAMARACHAGAS_` (pessoal): mostrar antes o @, a legenda e a imagem.

Padrão (2026-09-28): feed no escritório **em colaboração com o perfil pessoal** + a mesma arte nos
**stories** (versão `story.html` 1080x1920: mesma arte com o topo descido pra fugir da barra do
Instagram; renderizar com `python modelos/render.py story.html story.png 1920`).

```
node --env-file=.env .claude/skills/publicar-social-ratos/scripts/publish-graph-api.js --conta TAMARACHAGAS_PREV --images <pasta>/post.png --caption-file <pasta>/legenda.md --colaboradores dra.tamarachagas_
node --env-file=.env .claude/skills/publicar-social-ratos/scripts/publish-graph-api.js --conta TAMARACHAGAS_PREV --images <pasta>/story.png --story
```

A colaboração vira **convite**: alguém precisa aceitar no app, logado no @dra.tamarachagas_. Avisar
a Talyta. Registrar o link no `andamento.md`.
