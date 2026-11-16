# Perfil de edição · Reels da TK Filmes

Estilo novo definido pela Talyta em 2026-11-16, a partir da referência https://www.cosmos.so/e/517536559
(Reels de 45 s, salvo na pasta "EDIÇÕES" dela no Cosmos). **Vale só pros vídeos da TK**, não pros clientes.
Adaptado à marca da TK (Brand Book 2.0: sério, direto, sem exagero). Onde este perfil não fala nada, valem as
regras que já existiam (abaixo, em "Continua valendo").

## 1. O que a referência faz (analisado quadro a quadro e pelo som, 16/11)

- **Ritmo:** um corte a cada 1,5 a 2,5 s (cerca de 25 em 45 s), sempre corte seco. A fala é enxuta, sem respiro entre
  as frases. O plano falando pra câmera alterna com inserts curtos: b-roll de outra cena, plano de cima da mesa,
  gravação de tela, close de detalhe. Ela muda de roupa e de lugar entre as tomadas, e isso faz parte do charme.
- **Abertura:** palavras gigantes, uma por vez, por cima dela ("your / boring / content / more"), alternando branco e
  uma cor de destaque. Logo depois, o título do tema no alto, entrando palavra por palavra.
- **Cartões de capítulo:** fundo claro liso, o nome do assunto digitado letra a letra ("Sound fx"), ou um rótulo
  grande em cima e o trecho do vídeo como um quadro recortado embaixo ("Intro text", "BROLL"). Servem de recapitulação.
- **Plano horizontal em faixa:** cena em 16:9 no meio da tela vertical, com fundo liso em volta.
- **Legenda:** uma palavra por vez, sans fina, branca e pequena, na altura do peito.
- **Som (medido, não ouvido):** trilha contínua debaixo da fala do começo ao fim, grave constante; batida grave forte
  no primeiro décimo de segundo (o pico do vídeo); batidas graves nas viradas de bloco; um "drop" (a trilha some por
  meio segundo) logo antes de uma sequência de batidas; agudos cortados por um instante (som abafado) em dois pontos de
  passagem; subida de agudo nas trocas de cartão (whoosh). Trilha e efeitos gerados no Suno.

## 2. Como fica na TK

### Ritmo e montagem
- Corte seco a cada 1,5 a 2,5 s. Tirar as pausas entre frases, **sem cortar dentro da frase** (corte só no silêncio).
- A cada bloco do roteiro (pergunta → explicação com exemplo → aprendizado → convite), pelo menos um insert:
  b-roll do banco da TK (`04 BANCO DE B-ROLL`, catálogo em `tk-filmes/b-roll/catalogo.md`), plano de cima, gravação
  de tela, close de detalhe. Insert de 0,8 a 2 s, com a voz dela continuando por baixo.
- Mudar de tomada (roupa, lugar) entre blocos é permitido e desejado.
- Plano horizontal em faixa: b-roll 16:9 centralizado no fundo off-white `#FAF6F3` ou marrom `#5A3A2E`.
- Continua proibido reenquadrar ou dar zoom que tire a imagem do quadro. Punch-in só leve (até 1,07), na palavra forte.

### Texto e assets
- **Abertura (primeiros 2 s):** 2 a 4 palavras gigantes, uma por vez, por cima dela, na fonte arredondada dos reels de
  novembro (Nunito 900, caixa alta), creme com a palavra-chave em **etiqueta caramelo** (no lugar do amarelo da
  referência). É o tipo `headline` (`forte=True`) do `src/Voltei.tsx`.
- **Título do tema** no alto, dentro da zona segura (y ≥ 250), entrando palavra por palavra.
- **Cartão de capítulo** (novo tipo a criar no Remotion): fundo off-white `#FAF6F3`, nome do bloco em Instrument Serif
  marrom `#5A3A2E` digitado letra a letra, filete caramelo. Variante de recapitulação: rótulo em cima e o trecho do
  vídeo em quadro recortado embaixo. Um cartão por bloco, no máximo; dura de 0,8 a 1,5 s.
- **Assets** (ícones, prints, comentário, calendário, porta etc.) continuam, com a mesma regra de não dominar o quadro
  e de ficar na faixa de baixo (y 1080–1500).
- **Legenda:** continua a aprovada em outubro (Lora seminegrito, branca, sombra leve, 2 a 3 palavras, fixa logo
  acima da cabeça). A legenda de uma palavra só da referência fica **[a decidir pela Talyta]**.
- Sem emoji nas figuras. Fecho com a animação simples do logo, sem efeito sonoro.

### Som
- **Trilha de fundo o vídeo inteiro**, do primeiro ao último quadro de fala, baixa: cerca de 20 dB abaixo da voz, sem
  disputar com ela. Mesma trilha do começo ao fim, cortada no tempo da edição. Sobe só no logo final.
- **Batida grave forte no quadro 0** (abertura). É o efeito mais alto do vídeo.
- **Batida grave em cada virada de bloco** e na entrada de cada cartão de capítulo. Whoosh **grave** (nunca agudo ou
  fininho) na troca de cartão.
- **Drop:** antes da frase mais importante (o aprendizado), a trilha some de 0,3 a 0,5 s e volta com uma batida.
  Um drop por vídeo.
- **Som abafado:** no cartão de capítulo ou no insert de tela, a trilha passa por um filtro de graves (agudos cortados)
  e volta normal no corte seguinte.
- Efeito nunca em cima da última palavra de uma frase, e no máximo um efeito a cada 2 s (Brand Book: sem exagero).
- **Fonte do som:** efeitos sintetizados por `scripts/gerar-sfx.mjs` (`public/sfx/`: impacto, sopro, tique etc.),
  trilha por `scripts/trilha-acao.py` ou Pixabay Music (licença anotada). A referência usa o Suno: **ainda não está
  ligado** (precisa de conta, criada pela Talyta); quando ligar, registrar em `_contexto/ferramentas.md`.

## 3. Continua valendo
- Zonas seguras do Reels (`ZONA` no `src/Voltei.tsx`): área útil x 60–920, y 250–1500.
- Efeito sonoro sempre forte e grave.
- Curadoria da fala antes de entregar (`clientes/_regras.md`, regra de 2026-10-24, aplicada também aqui).
- Conteúdo ensina, não vende; roteiro na estrutura do Brand Book 2.0 e no DNA da linguagem da Talyta.

## 4. Peças no Remotion (`src/EstiloNovo.tsx`, ligadas no `Voltei.tsx`)
- Figura `capitulo` (cartão off-white digitado, rótulo "parte N"). Falta a variante de recapitulação com quadro recortado.
- `inserts` no `edicao.json`: b-roll por cima da fala, `modo` "cheio" ou "faixa" (16:9 no meio).
- Figura `planta` (planta desenhada: folhas, fase parada, raízes com nomes) · feita pro reels das raízes.
- `trilha` no `edicao.json`: um wav só com trilha + batidas + whooshes, gerado por `scripts/trilha-calma.py` a partir
  dos eventos (`boom`, `whoosh`, `drop`, `abafar`, `sobe`) que o `montar-<id>.py` escreve.
- Tempo das palavras: `scripts/palavras-fw.py` (faster-whisper turbo, ~5 min pra 4 min de bruto).
- Primeiro vídeo no estilo: "O marketing é como uma planta" (IMG_1713, 16/11), `scripts/montar-raizes.py`.
