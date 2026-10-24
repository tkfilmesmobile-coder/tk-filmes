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
  do resto do feed. Em outubro as 5 datas saíram no mesmo visual dos posts comuns. Definida no mesmo dia: a **homenagem**
  (seção 5). Levantamento visual: https://claude.ai/artifact/F26YfmQyXgm9UW1TZ3CuV3

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

## 5 · Homenagem ✅ aprovada na amostra de Natal (2026-10-24, só datas comemorativas)

**Aprovada:** só a versão escura, com uma correção: a doutora fica com a **cor natural da foto, tratada** (color grade
CAMILLA, `grade.py`); o vinho fica só no ambiente (bordas tingidas em modo cor, vinheta e véu no rodapé). Nada de foto
monocromática. **Versão clara (cards) recusada.** Gerador: `posts/_estetica-datas/gera_datas.py`, função `homenagem()`
(lista `DATAS`: foto, título por linhas, data, frases; o título encolhe sozinho pra caber; frases sobem pra cima do título;
nada de texto em cima de rosto, ajustar `tags_css`/`pos` por foto). Primeiro uso: 6 datas de nov/dez (2026-10-24).
Stories: `stories_datas.py` (1080×1920, zona segura; story 1 com foto diferente da do post, 2 e 3 tipográficos).
**Degradê nunca cobre rosto (2026-10-24):** `montar()` enquadra a foto e acha os rostos (YuNet); o escuro de baixo começa
abaixo do último rosto, o véu de cima some se há rosto no alto, e uma camada devolve a foto natural na região de cada rosto.
O histórico do teste segue abaixo.

Referências que a Talyta amou ("só adaptar as cores"): `referencias/datas-comemorativas/ref-1-dia-do-dentista-cinema.webp`,
`ref-2-dia-do-obstetra-cards.webp`, `ref-3-dia-do-medico-colagem.webp`. Amostras e gerador: `posts/_estetica-datas/`
(`gera_datas.py`, HTML → PNG 1080×1350).
- **Versão escura** (refs 1 e 3): foto inteira dela com mapa de cor no vinho (monocromática), véu escuro embaixo; "Feliz" pequeno
  + **nome da data enorme numa linha só** (Outfit 800) com degradê branco → nude → rosé; data pequena empilhada ao lado
  ("25 / DEZEMBRO"); frase em faixas escuras, uma linha por faixa; arco fino e dois ícones em círculo translúcido (dente, coração);
  rodapé "às quintas na CIP / União dos Palmares" e CW + @.
- **Versão clara** (ref 2): fundo creme, card vinho com a frase e pílula da data, card nude com o título grande (vinho + branco),
  card vinho escuro no rodapé; foto inteira dela na coluna da direita, sem recorte e sem card em cima do rosto.
- Cores: vinho `#8E2737`, vinho escuro `#4A1019`, noite `#22080D`, nude `#EADBD3`, creme `#F6EFEA`, rosé `#D99AA5`.
- **Regras da Talyta (2026-10-24):** palavra nunca dividida em duas linhas (nem a data); foto dela **inteira**, trabalhando,
  com a assistente ou retrato na clínica, nunca um pedaço recortado de foto de grupo. Boas fontes: retratos profissionais do
  Instagram (2025-09-29) e ela na mesa do consultório (2025-06-26), em `posts/_estetica-datas/ig/`. As refs usam ícone em
  círculo e cards arredondados, recusados em 2026-09 no feed: aqui valem só pras datas, porque ela pediu esse conceito.

## Recusadas (não repetir)

- Itálico enfeitado, card creme arredondado, etiqueta em pílula colorida, ícones em bolinha, tópicos
  numerados, moldura e brilhos ("cara de claude"), recorte de pessoa com fundo falso (2026-09).
- Stories com foto tratada em rosé (fundo clareado) e stories "de app" (card/nota/conversa) pra ela
  (2026-10-07).
