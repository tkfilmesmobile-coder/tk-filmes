# Estéticas da Dra. Camilla Wanderley · opções

Opções de estética já testadas pra ela, com o status que a Talyta deu. Antes de criar uma peça, escolher
uma daqui (ou perguntar qual). Referências e amostras em `marca/referencias/`.

## 1 · Foto editorial ✅ aprovada (2026-10-10, posts do feed)

Primeiro uso: carrossel "Na minha família, dente doía e arrancava", publicado em 2026-10-10.
Referências que a Talyta mandou: `referencias/foto-editorial/ref-*.webp` (implante, clareamento, prótese).
Amostra aprovada: `referencias/foto-editorial/aprovado-2026-10-10-dente-doia.jpg`.
Modelo pronto: `modelos/carrossel-foto-editorial.py` (HTML → PNG no Chrome headless, 1080×1350).

- **Foto real da doutora inteira**, sangrando o quadro, cor natural com leve tom de cinema
  (saturação 0,86, contraste 1,06). Nada de recorte nem fundo trocado. Sombra em degradê só onde o
  texto entra.
- **Texto branco por cima**, centralizado ou alinhado à esquerda, alternando três linguagens entre os
  slides (nunca todos iguais):
  - **A** · caixa alta pequena (Montserrat 500) + **frase enorme em minúsculas, sans grossa**
    (Poppins 700, tracking negativo) + caixa alta pequena;
  - **B** · **caixa alta fina enorme** (Montserrat 300) + linha em minúsculas + **nota numa caixa
    contornada** fina;
  - **C** · caixa alta pequena com uma palavra em negrito + **serifa grande** (Playfair Display 400)
    + **selo vinho** (`#8E2737`) com a frase de fecho.
- Capa com **pílula contornada** no topo ("CLÍNICA GERAL E ENDODONTIA"); slides internos com a linha
  "DRA. CAMILLA WANDERLEY | CLÍNICA GERAL E ENDODONTIA" no alto e o **@dra.camillawanderley** embaixo.
- Fotos: o banco da diária (Drive: `EDIÇÃO/FOTOS/AAAA-MM-DD · Diária consultório`). Preferir ela
  trabalhando, mãos e instrumentos, planos fechados e desfocados (clima de cinema); retrato dela
  sorrindo no slide de fechamento/chamada.

- **Atualização (2026-10-24):** sem procedimento em andamento nem instrumental nas fotos (CFO 196/2019, escolha da Talyta em
  2026-10-23). Fonte de foto: quadros dos vídeos da diária já com o color grade + fotos sem procedimento. Stories dos posts
  na mesma linguagem, 1080×1920, texto no terço de baixo. Gerador com os 6 posts de 22/10: `posts/2026-10/_diaria-22-10/gera.py`.

- **Regra (2026-10-24, Talyta):** data comemorativa **não** usa a foto editorial: ganha uma estética própria, diferente
  do resto do feed. Em outubro as 5 datas saíram no mesmo visual dos posts comuns. Proposta em aberto: partir do rosé
  editorial (claro, data grande em serifa, sem itálico). Levantamento visual: https://claude.ai/artifact/F26YfmQyXgm9UW1TZ3CuV3

## 2 · Rosé editorial 🟡 parcial (2026-10-06)

A capa "Canal dói" foi a que mais chegou perto; as outras duas amostras não. Referência:
`referencias/rose/ref-dia-do-dentista.webp`. Amostras e gerador em
`posts/2026-10/_estetica-rose/` (fundo blush, foto dissolvendo no rosa, título Playfair com degradê
rosé, linha em Cormorant itálico, dente perolado). É a base do **perfil de vídeo** dela
(headline e blocos 3D) e dos **stories do reels** (aprovados em 2026-10-07, "primeiro modelo").

## 3 · Degradê bordô · substituída

Foto inteira com degradê bordô no rodapé, Montserrat fino + negrito, moldura fina e monograma CW. Foi
a do calendário v3 (2026-09-29); trocada pela foto editorial. Artes antigas em `posts/2026-10/*/`
(`_versao-bordo/`).

## 4 · Stories clínico claro (dente 3D) ⭐ referência que a Talyta gostou (2026-10-24, pra stories)

Referência mandada no chat em 2026-10-24: uma sequência de 4 stories de facetas, de outro perfil, em russo. A imagem ficou
só no chat; salvar o arquivo em `referencias/stories-clinico-claro/` quando chegar. Ainda não foi testada pra ela.
- **Fundo branco/gelo** com ondas de linhas finas cinza (malha translúcida, tipo guilhoché) atravessando o quadro, e um
  véu rosado bem leve ao fundo.
- **Render 3D realista** de dente, faceta, coroa ou arcada com gengiva rosa, sangrando pela borda (canto de baixo ou de
  cima). O texto fica na outra metade. Nada de foto de paciente nem de procedimento, o que facilita com o CFO. O dente
  pode vir do FLUX (decisão de 2026-10-23: imagem realista gerada, nada de 3D feito à mão).
- **Tipografia sans geométrica** (família Montserrat): título preto em caixa alta grossa na capa e título em negrito
  nos internos ("1. Durabilidade"), corpo pequeno em cinza escuro, muito respiro.
- **Destaque com marca-texto rosa claro** atrás das palavras-chave, e uma palavra sublinhada em negrito na capa.
  Seta num círculo preto chamando o próximo story. Numeração simples, um ponto por story.
- Uso: stories educativos (motivos, mitos, etapas). Atenção à regra de não usar tópicos numerados no feed: aqui a
  numeração é a sequência dos stories, não uma lista dentro da arte.

## Recusadas (não repetir)

- Itálico enfeitado, card creme arredondado, etiqueta em pílula colorida, ícones em bolinha, tópicos
  numerados, moldura e brilhos ("cara de claude"), recorte de pessoa com fundo falso (2026-09).
- Stories com foto tratada em rosé (fundo clareado) e stories "de app" (card/nota/conversa) pra ela
  (2026-10-07).
