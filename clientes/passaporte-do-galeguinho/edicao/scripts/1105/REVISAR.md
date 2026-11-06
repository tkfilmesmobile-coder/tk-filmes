# 1105 · Visita ao Açougue Diniz · pontos pra conferir no ouvido

Gravação de 2026-11-05 (23 clipes, IMG_1310 a IMG_1338, no Drive do cliente). Edição de 2026-11-06.
Transcrição: faster-whisper large-v3 (GPU) no clipe inteiro e de novo em cada trecho cortado, confirmada com o
medium. Cortes pelo detector de voz e pelo espectrograma (`voz.py`, `espectro.py`, imagens em `analise/espectro/`).
Por que cada fala entrou ou ficou de fora: `trechos.py`.

## Leituras normalizadas na legenda (a fala engole a palavra)
- "o melhor Passaporte **de** São José da Laje" (parceria, ~9,9 s): os dois modelos ouvem sem o "de".
- "melhor que tem **em** São José da Laje" (~17,9 s): idem, sem o "em".
- "com o Passaporte **do** Galeguinho" (Eduardo, ~33 s): o large ouve "do" (com pouca certeza), o medium não.
- "ia faltar a carne **de eu servir**" (Eduardo, ~57 s): o medium ouve "de eu servir"; o large, "que eu servi".
- ~~"Verdade, a carne dele..."~~ (v3): o "Verdade" não existe. O espectrograma tem silêncio até 152,55 e a fala começa
  direto em "A carne"; o large inventava a palavra. Saiu da legenda.
- "eu quero entregar o melhor pra **você**" (~95 s): no singular. Nas passadas do clipe inteiro saiu "vocês", mas o
  espectrograma não tem "s" entre o "cê" e o "E" de "Eduardo", que vem colado.

## v3 (2026-11-06): falas novas e trilha nova
- Trilha trocada por uma batida pesada (`scripts/gerar-trilha-impacto.py`, 96 BPM, Mi menor): 808, caixa forte, chimbal,
  acordes de metal, sino, pancada com prato a cada 8 compassos. Nos respiros entra a completa (0,36), com pancada na troca
  de imagem. Sob a fala vai só o grave (bumbo, 808 e caixa abafados, 0,08): com os acordes por baixo, mesmo 5 a 8 dB
  abaixo da voz, a transcrição perdia palavra. No "parceria topada" (~27,5 s) a trilha some por 1,4 s.
- Falas novas: confiar no açougue (dono, ~38 s), "preza a qualidade" (Eduardo, ~81 s), padrão de higiene (Eduardo, ~96 s)
  e padrão de temperatura (dono, ~103 s). O vídeo foi de 1 min 46 s pra 2 min 35 s.
- Leituras a confirmar no ouvido: "nós seguimos normalmente **todo dia**" (~97 s; o medium ouve "todos os dias"); "nós
  estamos filmando" (o medium ouve "nós já estamos"); "eu sigo no meu **lado**" (~111 s; o medium ouve "no meu lá");
  "**Câmara** fria" (ele fala "câmera").

## Pra ouvir com atenção
- **"parceria topada" (~27,9 s):** a palavra está inteira, mas tem 0,4 s de pausa antes dela. Com qualquer trilha
  nessa pausa (testado com e sem bateria, em vários volumes), o Whisper ouve "bateria"; com a voz sozinha, sempre
  "parceria". A headline mostra PARCERIA TOPADA. Se no fone soar "bateria", a saída é zerar a trilha nesse 0,4 s.
- O Whisper também "ouve" um "Cara," no começo da chamada final (~96,2 s) e às vezes um "né" depois de "Galeguinho"
  (~3,3 s): o espectrograma do bruto mostra silêncio nesses pontos; são invenções do modelo, não fala.

## Curadoria feita (scripts/1105/curadoria.py)
- Fala escolhida × áudio final, trecho a trecho; legenda × fala (290 palavras, 0 diferenças); começo e fim de cada
  fala ouvidos no vídeo pronto; cortes no detector de voz e no espectrograma; efeito sonoro × última palavra de frase
  (medido no áudio: nenhum); B-roll sem repetição; boca × voz por quadro; nada cobre rosto nem a carne (quadros a cada 2 s).
- Corrigido na curadoria: legenda emendando duas frases e encostando no queixo (abertura), "dentro do" sozinho,
  blocos de 0,2 s, logo do Diniz coberta pela legenda, headline sobre o saco de carne, B-roll da máquina repetido 3
  vezes, efeito em cima de "Galeguinho" e de "parceria", pico de áudio acima de 0 dB.
- Volume final: −14,3 LUFS, pico real −0,8 dBFS.

## Pra confirmar com o cliente
- O nome do fornecedor no card: **Eduardo · Açougue Diniz · @acouguediniz** (o dono chama de "Eduardo" e "Dudu";
  o @ e a logo são os da placa filmada na loja). O card diz só "fornecedor da carne", sem cargo.
- O dono do Galeguinho não aparece com nome no vídeo (não está confirmado na ficha quem é o apresentador).
- Horário no fecho: "de terça a domingo · 18h às 23h" (bio do Instagram, conferida em 2026-09-30).

## Reservas (falas boas que ficaram de fora pelo tamanho)
- IMG_1330 64,3–88,8 s: "desde lá do início, mesmo quando eu era no carrinho empurrando, eu mantinha a qualidade..."
- IMG_1332 185,1–193,1 s e 206,4–220,2 s: "o correto dá trabalho, mas o resultado vem... pra um cara que pegava 4, 3, 5
  quilos de carne e hoje a gente está numa produção dessa, é motivo de agradecer..."
- IMG_1331 14,4–29,7 s: o sanduíche de filé mignon ("é uma carne que derrete na boca"), bom pra um vídeo só dele.
- IMG_1338: o dono indica o marketing da TK ("o negócio mudou, mudou de verdade"): serve pro perfil da TK, não pro dele.
