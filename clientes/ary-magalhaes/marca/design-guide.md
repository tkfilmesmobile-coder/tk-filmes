# Ary Magalhães · guia visual

Direção definida em 2026-10-10 a partir das referências da Talyta (`referencias/`). Substitui a
exploração de agosto (`../historico/2026-08-identidade/`), mantendo o que foi decidido lá:
preto + bege + dourado champagne, sem rosa.

## Estética
Salão premium e acolhedor, falando com a cliente de igual pra igual: foto grande e quente, muito
respiro, tipografia editorial. **Nada com cara de slide de apresentação.**

## Cada modelo tem o seu momento (nunca todos no mesmo post)
| modelo | quando usar | ref |
|---|---|---|
| Foto inteira + título serifado + frase curta | capa de carrossel, frase de impacto, data especial | 01, 02 |
| Fundo na cor da parede + foto que surge de baixo sem borda + título grande no alto (degradê café → caramelo) | slide de texto/frase, número em destaque | 03 |
| Foto clara com clareado bege embaixo, título em degradê café → caramelo | fechamento, chamada pro WhatsApp | 03 |
| Cartões sobre a foto (texto em bloco claro) | valores, preços, passo a passo de agendamento | 05 |
| Texto direto sobre a foto de cabelo, com ícone de check e etiqueta de contorno | dicas e cuidados (educativo) | 01 |
| **Stories editoriais (ref 07, 2026-10-12)**: foto/vídeo com cor dessaturada e quente + granulação (`modelos/grade.py`, modo `editorial`), título em Oswald caixa alta condensada, etiquetas minúsculas nos cantos (Ary Magalhães · tema / @ · data), marcações em círculo apontando detalhes | stories de bastidor e do dia a dia do salão (vídeo e foto do celular) | 07 (estética de skincare editorial enviada pela Talyta; não salva em arquivo) |
| Foto levemente desfocada + uma palavra grande ("AGENDA", "União") + frase | stories e capas de aviso/agenda | 04 |
| Só tipografia sobre luzes champanhe desfocadas | datas e festas (fim de ano) | — |
| Coluna de texto na lateral da foto + botão de contorno com ícone | chamada final, campanha | 02 |
| Caixinhas de pergunta empilhadas | **fala de outra pessoa**: depoimento, feedback, relato ou dúvida de cliente (ex.: capa "quanto custa?") | 06 |

**Caixinha de depoimento:** várias caixinhas, a da frente nítida e as de trás desfocadas, dando
profundidade e movimento. Toda caixinha tem foto de perfil; o nome da cliente vai borrado ou é
trocado por um nome fictício pra preservar a cliente. **O texto tem que ser um feedback real**
(print de WhatsApp ou direct que a Ary mandar); só a foto e o nome podem ser trocados.

## O que a Talyta não quer (revisão de 2026-10-10)
- Story de bastidor com faixa escura e título Bodoni em champanhe, e cor de vídeo lavada ou alaranjada (reprovado em 2026-10-12). Vídeo do iPhone é HDR: converter com `modelos/video_story.py`.
- Etiquetas no topo com data e tema ("ARY MAGALHÃES · 08·10", "SALÃO DE BELEZA · 1 ANO"): formal demais.
- Foto emoldurada (arco, moldura): pesada.
- Foto inteira escurecida: só a base da foto pode escurecer, pra o texto ler.
- Dourado em degradê alaranjado/latão no título: usar champanhe claro sobre foto e café → caramelo
  sobre fundo claro.
- Algarismo que parece letra (o "1" da Bodoni Moda vira "I"): número sempre na Gilda Display.

## Cores
| uso | cor |
|---|---|
| preto | `#141210` |
| marrom café | `#5A3E2B` |
| bege fundo | `#EDE6DC` |
| bege médio | `#D8C9B5` |
| dourado champagne | `#CBA14F` |
| título sobre foto | champanhe `#EAD9B8` |
| título sobre fundo claro | degradê `#5A3E2B → #8E6440 → #C9A475` |
| pílula dourada (nome, @) | contorno `#CBA14F` (sobre fundo claro `#A9803F`) |
| branco quente | `#FAF7F2` |

## Tipografia (Google Fonts)
- **Títulos:** Bodoni Moda (serifa de alto contraste), peso 400. Título com número: Gilda Display.
  Capa com número: Gilda Display em champanhe claro (opção C, escolhida em 2026-10-10).
- **Texto e etiquetas:** Poppins 300/400/500 (a fonte que a Ary escolheu em agosto), etiquetas em
  caixa alta com espaçamento largo.
- O nome entra como **assinatura discreta, centralizada na parte de baixo da foto**: Poppins em caixa
  alta espaçada, entre dois fiozinhos (classe `.assin` em `modelos/ary.css`). Um só por vez: "Ary
  Magalhães" ou "@cabelosmagalhaes"; os dois juntos só quando encaixar. Pílula dourada só quando o
  post pedir destaque, nunca como regra. (2026-10-10)

## Fotos
- **Sempre primeiro o material da própria Ary** (pedido da Talyta, 2026-10-12): `fotos/drive/` = cópias em JPG da pasta BRUTO do Drive (ensaio, resultados de clientes, atendimentos e quadros de vídeo com cor corrigida). O ensaio também está em `fotos/ensaio-2026-10/`.
- Foto de cliente real em post: só com autorização de imagem; nunca o rosto de cliente como autora de fala inventada (nas caixinhas, foto de perfil = recorte só de cabelo).
- Só se não houver nada adequado na pasta dela: banco gratuito com licença comercial (Unsplash, Pexels), luz quente,
  tons de bege e marrom, cabelo liso ou ondulado brilhante, mulher brasileira real, salão claro.
  Nada de foto com cara de banco genérico. Guardar em `fotos/banco/` e anotar a origem em
  `fotos/banco/_origem.md`.

## Regras
- **Cada post de feed leva de 5 a 10 stories sobre o mesmo tema, com linguagem diferente da do post** (bastidor, pergunta, dica, prova, chamada...), sempre com fotos e vídeos da pasta BRUTO do Drive dela (que é atualizada sempre: olhar `00_ENTRADA` e as pastas novas antes de produzir). **Vídeo leva música** (banco com licença livre, origem em `marca/audio/_origem.md`); o áudio original só fica quando a fala do vídeo é o próprio assunto. (2026-10-12)
- **Informação que não temos não entra** (preço, prazo, serviço não confirmado): tira a linha, nunca deixa "R$ __" nem "consulte". (2026-10-10)
- **Data com identidade visual conhecida** (Consciência Negra, Natal, Dia das Mães...): a imagem tem que conversar com a data **e com o nicho** (beleza, mulher, cabelo). Ex.: 20/11 = mulher negra bonita, com o cabelo em destaque. Nada de post só tipográfico. (2026-10-10)
- **Cada intenção de post pede um modelo diferente**, e as capas não se repetem em sequência: o feed tem que variar dentro da mesma identidade. (2026-10-10)
- Formato feed 1080×1350; stories 1080×1920 com margem segura de 250 px em cima e embaixo.
- **Todo post (e todo slide de carrossel) leva "Ary Magalhães" ou "@cabelosmagalhaes"** em alguma parte, de forma sutil (ver assinatura acima). (pedido da Talyta, 2026-10-10)
- Sem rosa. Sem emoji na arte.
