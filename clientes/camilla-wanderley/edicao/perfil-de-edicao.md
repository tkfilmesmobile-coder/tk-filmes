# Perfil de edição · Dra. Camilla Wanderley

Vale pra todo vídeo dela. Cada cliente tem o seu perfil; este é só dela.
**Padrão atual: definido com a Talyta em 2026-10-06** no vídeo "Periodontite na gestação" (aprovado).
Projeto de referência: `edicao/perfil-video/` (Remotion 4.0.529 + Three.js). Começar todo vídeo novo a
partir dele.

## Divisão do trabalho (a partir de 2026-09-30)

**A Talyta entrega o vídeo com as falas já cortadas** (tomadas escolhidas, sem direção de quem
grava, sem fala cortada). O agente **não mexe na montagem da fala**: só faz a finalização por cima
do corte dela. Motivo: nas tentativas de 2026-09-30 o corte automático comeu fim de frase e deixou
passar a direção da filmmaker. A duração final acompanha o vídeo gravado.

## O processo de cada diária (visão geral; a etapa 2–3 é da Talyta)

1. **Juntar** todo o material gravado na diária (`VÍDEOS/BRUTOS/AAAA-MM-DD · Diária consultório` no Drive).
2. **Decupar:** transcrever tudo e mapear o que ela fala, onde começa e termina cada assunto, e o que é só cena.
3. **Separar os conteúdos únicos:** tudo que for minimamente explicativo vira **um vídeo próprio**.
4. **Finalizar cada vídeo** neste perfil.
5. **Vlog de atendimento geral** com o resto da diária.
6. Exportados vão pro Drive dela: `VIDEOS/<MÊS AAAA>/PRODUÇÃO TK FILMES/` (o que é da clínica vai em
   `PRODUÇÃO CLÍNICA/`).

## A linguagem

**Orgânica, editorial, premium.** A captação dela raramente é fala pra câmera: é consulta (paciente e
doutora na mesa, câmera na mão, plano aberto). A edição respeita isso: pouca coisa na tela, uma ideia
visual por vez, e a estética dos posts entrando de leve (blush, serifa rosé, caixa alta espaçada).
Referências que a Talyta mandou: cosmos.so/e/1615343663 e cosmos.so/e/697844939 (fala natural,
legenda limpa, quase nada na tela).

### 1. Abertura (0–4,7 s)
- Começa na própria filmagem com **zoom de ênfase** (1 → 1,14×) que desce a imagem: o rosto fica abaixo
  da headline e **ninguém sai do quadro**.
- **Headline única no alto**, sobre um **véu blush** que dissolve a filmagem (como a foto nos posts):
  fio + caixa alta espaçada (Montserrat 500, 21 px, tracking 7) · **título em Playfair Display 600 com
  degradê rosé** (até 116 px; título longo diminui pra caber) · uma linha em **Cormorant itálico 500**.
- **O 3D faz parte da headline** (maquete logo abaixo do texto). Nada de cartão, rótulo solto ou
  informação visual diferente competindo. A única coisa que muda é a linha em itálico.
- Recusado: headline com fontes misturadas estilo "Na hora da higiene bucal" (v2), cartão 3D com
  rótulos à parte (v1).

### 2. Enquadramento na doutora
- Plano aberto reenquadrado no rosto dela (rastreio YuNet suavizado), ~2,15×, rosto no terço superior.
  No plano aberto ela fica na borda: centraliza até onde o quadro deixa sem mostrar borda.
- **Ênfases de zoom** nas frases fortes (1,05–1,11×, entrada suave), voltando a 1 quando muda de frase.
  A imagem nunca fica parada muito tempo. Sem transição chamativa.

### 3. Blocos gráficos nos momentos-chave
- O **mesmo bloco da abertura** (véu + fio + título rosé + itálico + 3D) volta quando ela diz algo que
  merece virar imagem. No bloco, o rosto dela desce pra baixo do véu e a legenda sai.
- Biblioteca já pronta (em `perfil-video/src/periodontite/`): maquete periodontal (dentes, gengiva, osso,
  tártaro; separa camadas e evolui saudável → periodontite), linha do tempo com pérolas (antes de
  engravidar · 1º · 2º · 3º trimestre), limpeza (tártaro some, gengiva volta ao rosa, luz passa).

### 4. 3D
- Geometria 3D real e local (Three.js / React Three Fiber via `@remotion/three`), sem modelo comprado.
- Realismo: luz de ambiente de estúdio (RoomEnvironment), tone mapping ACES, sombra suave, materiais
  físicos (esmalte brilhante, raiz cor de dentina, gengiva úmida com papilas, osso poroso).
- Recusado: 3D "bruto", de caixas lisas (v1).

### 5. Legenda
- **Frase inteira, no máximo duas linhas**, **centralizada na tela** a 1330 px do topo (abaixo do
  rosto, acima dos controles do Reels).
- **Nunito 700, 52 px, branca**, sem caixa, sombra macia. Palavra-chave só muda pra rosé claro
  (`#FFC9D1`), mesmo tamanho.
- Sai durante headline e blocos (o texto do bloco já diz o que ela fala).
- Recusado: legenda pequena em serifa de 1–3 palavras "presa no peito" (desproporcional, v2–v3);
  faixa com fundo (amadora, v1).

### 6. Som
- **Voz original nivelada** (`scripts/nivelar_voz.py`): mesmo timbre, ganho suave só na fala pra ela não
  "sumir" quando se vira (fica entre −18 e −24 dB do começo ao fim, pico ≤ −2,7 dB).
- **Trilha muda com a intenção da cena** (crossfade ~0,8 s): *clínica* (explicação técnica) ·
  *acolhimento* (fala humana) · *clareza* (orientação, "quando/como tratar"). Ducking −7 dB sob a voz.
  As três de hoje são provisórias, geradas aqui (`scripts/trilhas_cena.py`); trocar por licenciadas.
- **Cada animação tem o seu som**, sempre abaixo da voz: whoosh em zoom e entrada/saída de bloco, "pop"
  na maquete, sopro na separação de camadas, pulso grave na inflamação, impacto na periodontite, notas
  de vidro subindo nas pérolas, brilho no destaque e na limpeza, clique quando o texto muda.

### 7. Fecho
- Assinatura discreta no alto nos últimos ~2 s: fio + "DRA. CAMILLA WANDERLEY" + "Clínica Geral e
  Endodontia" em itálico. Sem cartela extra (a duração acompanha a gravação).

## Técnica (Remotion)
- Skill `remotion-best-practices` + doc oficial. Animação só por frame (`useCurrentFrame` + `interpolate`),
  sem CSS animation e sem `useFrame`. Vídeo como textura: `<Video headless onVideoFrame>`.
- Render com `--gl=angle`. Referência de tempo: ~50 s de vídeo em ~6 min.
- Verificar sempre no arquivo final: quadros-chave, voz presente e no nível, pico, duração.
