# Perfil de edição · Ary Magalhães

Vale pra todo reel dela com fala pra câmera. Definido com a Talyta em 2026-10-24 (reel "Mechas antes ou depois",
diária de falas de 24/10). Projeto: `edicao/video/` (Remotion 4.0.529); montagem por `edicao/2026-10-24/montar.py`
a partir de `cortes.json` (tempos sempre em segundos do vídeo original).

## Corte
- **Corte só no silêncio** (2026-10-24): entra a palavra inteira que começa no trecho; o corte anda até a voz acabar de
  verdade (energia do áudio, `montar.py`), sem invadir a palavra seguinte. Palavra vizinha com tempo absurdo (> 1 s) não
  serve de limite. Quando a transcrição marca errado, `fimForcado` no trecho, conferido no áudio.
- Só a tomada boa de cada frase. Fora: tentativas, "tô artista?", risada, direção de quem grava, frase com palavra errada
  (ex.: "minhas dívidas" saiu e ficou "principalmente as minhas maravilhosas").
- Pausas acima de 0,32 s saem; cortes encaixados nas pausas entre palavras (nunca no meio da palavra).
- Corte seco no mesmo enquadramento é disfarçado com troca de zoom (1,0 / 1,06–1,1) ou com B-roll por cima.

## Estética (a mesma dos posts aprovados: "1 ano", "AGENDA", "União")
- **Headline = padrão dos posts:** (caixa alta pequena opcional) + **título grande em Bodoni Moda 400, creme `#F6EFE4`** +
  **uma linha em Poppins 400 com a palavra-chave em negrito** (`*palavra*` no cortes.json) + assinatura "ARY MAGALHÃES" entre
  fios dourados. Nada de itálico, nada de dourado/champanhe no título (recusados em 2026-10-24). Número de passo em Gilda creme.
- **Destaque do texto sobre o vídeo: opção C** (escolhida em 2026-10-24 entre 3): texto creme com um **sombreado bem suave só
  atrás do bloco de texto** (componente `Veu`, elipse desfocada ~30%). **Proibido:** fundo branco/bege, cartão atrás de
  animação, esmaecido da metade da tela pra baixo, e sombra/contorno escuro em volta das letras ("grotesca").
  Opções A (sombra quase invisível) e B (café → caramelo sem sombra) ficam no código (`TEMA` em `marca.ts`) só pra comparação.
- Cor do vídeo quente e editorial (`COR_VIDEO`: sépia leve, contraste firme, brilho −7%) + vinheta café nas bordas.
- **Legenda = a linha dos posts:** Poppins 400, 35 px, creme, palavra-chave em negrito (600), até ~32 letras por página, logo
  abaixo do rosto (y ~940), com o mesmo sombreado suave atrás. (Inter e Poppins 600 recusadas.)
- Capa e post fixo (imagem parada): base escura dos posts aprovados + o mesmo padrão de título.
## Curadoria obrigatória antes de entregar (Talyta, 2026-10-24; aprofundada em 2026-10-25)
Nenhum reel sai sem passar pelas 5 checagens (scripts em `edicao/2026-10-24/`, relatórios em `curadoria/`):
1. **Palavra por palavra** (`curadoria.py`): retranscreve o áudio final e compara com o que foi escolhido; palavra
   faltando/sobrando = corte errado; corte com voz no meio = corte no meio de palavra.
2. **Boca × voz** (`labios.py`): mede o movimento da boca de quem está na câmera a cada quadro. **Voz sem a boca mexer
   = outra pessoa falando** (direção da filmmaker, que às vezes fala tão alto quanto a pessoa, porque segura o celular).
   Foi assim que passou o "Hoje nós…" soprado pela filmmaker no reel de apresentação. Todo ponto marcado é conferido
   pela imagem da boca antes de virar corte (vogal sustentada dá falso positivo).
3. **Voz de fundo** (`voz_fundo.py`): procura voz baixa (−35 a −50 dB) dentro dos trechos; transcreve e confere.
4. **Leitura da fala inteira**: início, meio e fim; faz sentido; sem tentativa, frase repetida, palavra errada ou
   direção ("vamos lá", "espera aí", contagem). Quando a transcrição juntou duas vozes, refazer o pedaço e corrigir.
5. **Quadros do vídeo final** e **B-roll sem repetição** (`broll-catalogo.md`).

**Credibilidade:** quando ela fala de si (família, anos de carreira, história, conquistas), buscar a prova no acervo
do Instagram dela (`marca/acervo-instagram.md`) e mostrar: foto com os filhos, trabalhos antigos com o ano, post que
comprova. Pessoa só entra identificada (ex.: "esposo") com confirmação.
## Elementos
- **Abertura:** título na base (caixa alta pequena + Bodoni + itálico + assinatura), ~3,5 s, sem legenda junto.
- **Cartões ao lado da cabeça:** foto do material dela (borda champanhe, brilho dourado) + etiqueta escura, presos à
  palavra falada, seguindo o rosto (YuNet), um por vez (ou um de cada lado quando ela fala de duas coisas).
- **B-roll em tela cheia por cima da fala:** sempre o material da própria Ary primeiro (atendimentos, clientes, resultados
  em `B-ROLL/` do Drive); número em Gilda Display + título Bodoni quando é passo (1º mechas, 2º selagem).
- **Explicação técnica vira animação** na faixa de baixo (y 1090–1500), nunca em cima do rosto. Ex.: estrutura do fio
  (cutícula fechando com a selagem, abrindo pra cor, pigmento entrando no córtex) em `src/reels/Fio.tsx`.
- **Fecho:** foto da diária com a base escura, chamada em Bodoni + botão de contorno dourado "Me chama no WhatsApp".

## Som
- **Sem trilha.** Só a voz dela nivelada (−20 dBFS na fala) e efeitos macios sintetizados (`video/scripts/gerar_sfx.py`):
  varrida no B-roll, pop no cartão, whoosh curto no zoom, cascata ao fechar a cutícula, brilho, sopro do pigmento,
  erro/acerto, vibração do celular quando ela abre "no telefone".

## Post fixo junto com cada reel (pedido da Talyta, 2026-10-24)
- Todo reel ganha um post de imagem no feed (1080x1350) sobre o mesmo tema, com outro ângulo (o reel explica, o post
  resume a regra). Modelo "dicas e cuidados": foto de cabelo do material dela, só a base escura, etiqueta de contorno
  dourada, título Bodoni champanhe + itálico branco, 2 checks em Poppins, assinatura. Componente `src/reels/Post.tsx`.
- Legenda própria (não repete a do reel). Drive: `CONTEÚDOS/<aaaa-mm · MÊS>/Post · <tema>/` (o reel em `Reel · <tema>/`).

## Capa
- Foto da diária inteira, só a base escura, título champanhe + itálico branco + assinatura, tudo dentro do miolo
  1080x1440 (y 240–1680) que aparece na grade. Componente `src/reels/Capa.tsx`.

## Biblioteca de animações (`src/reels/Cenas.tsx` + `FioBase.tsx`)
- `fio` (Fio.tsx): cutícula fecha com a selagem, abre pra cor, pigmento entra no córtex, "qual vem primeiro".
- `protetor`: camada do protetor térmico segurando o calor; sem ele, poroso, frizz e espigado.
- `molhado`: fio seco × molhado (inchado, gotas) e o atrito do travesseiro arrancando a cutícula.
- `mito`: mito riscado × verdade (só tipografia).
- `saude`: estética por fora (brilho) × saúde por dentro (córtex aceso); "a estética é consequência".
- `lista`: cuidados numerados que vão se montando.
- `rosto`: formatos de rosto (oval, redondo, quadrado) com a sobrancelha se desenhando.
- Título de passo numerado (`passosTitulo` no cortes.json): número Gilda + título Bodoni.