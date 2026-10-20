---
name: quadro-feira
description: Quadro "O povo da feira sabe de INSS?" da Tamara Chagas Advocacia. Cada pergunta de rua vira uma PARTE com 4 peças fixas (Reels de rua com abertura padrão, Rita no escritório aprofundando, Tamara em casa depois da ligação, carrossel), mais stories. Use quando pedirem "próxima parte", "parte N", "quadro da feira", "vídeo da feira", "roteiro da Rita/Tamara", "carrossel da parte", ou trouxerem um bruto novo de entrevista de rua.
---

# Quadro "O povo da feira sabe de INSS?" (regra da Talyta, 08/10/2026)

Cada pergunta feita na rua vira uma **PARTE N · TEMA** (ex.: Parte 1 · Trabalhador rural, Parte 2 · Auxílio-doença).
Toda parte tem **as 4 peças abaixo, nesta ordem**, e todas levam o selo "PARTE N · TEMA".

## 1. Reels de rua (humor)
- **Bruto:** a Talyta entrega já recortado (ex.: `Downloads/feira.mp4`). Cada pergunta é uma parte. Nunca juntar duas perguntas num vídeo.
- **Abertura padrão** (`reels/2026-10-08-feira-perguntas/edicao/edl-abertura.json`, aprovada em 08/10):
  - tipografia cinética sincronizada à fala, com o texto atrás da Rita (recorte quadro a quadro em `public/fg`);
  - "parte" + número grande em contorno;
  - "na feira de UNIÃO" na frente, sem cobrir ninguém;
  - pílula "RITA E SALES · TAMARA CHAGAS ADVOCACIA" logo abaixo da headline;
  - cards de benefícios.
  - Só trocam o número, o tema e a headline.
- **Edição:** segue `modelos/manual-edicao-humor.md`:
  - fala inteira, com respiro na entrada, e checagem de troca de tomada;
  - figurinhas próprias, texto-meme fora do rosto, trilha própria;
  - SFX **fortes e graves** (regra de 14/10): `whoosh-grave`, `whoosh-grave-impacto`, `whoosh-grave-cards`, thumps em 0,65–0,7, além de tick, shimmer e card. Whoosh agudo ou fininho não entra (ver manual de edição, seção 7).
- **Fecho:** "Até mais!" (Rita com a uva) + cartão final no visual dos stories do escritório, com a fonte.
- **Montagem:** `edl-parteN.json` e `python scripts/montar.py edl-parteN.json`, depois o render.

## 2. Rita no escritório (cerca de 50 s)
- Rita à mesa, como quem viu os comentários do vídeo da feira.
- Retoma a fala de quem respondeu na rua e aprofunda: o que é, quem tem direito, o que precisa, quais documentos guardar.
- Termina puxando o próximo vídeo: "vou perguntar pra doutora Tamara" + ligação (corte).

## 3. Tamara em casa, depois da ligação (cerca de 45 s)
- Abre desligando: "Tá bom, Rita... Beijo!", e depois "Minha gente, a Rita acabou de me ligar perguntando...".
- Responde a dúvida e traz um **exemplo** concreto ("imagina um/uma...").
- **Nunca** apresentar caso inventado como caso real do escritório, nem divulgar caso de cliente, nem citar o escritório como propaganda (OAB, Provimento 205/2021).
- Fecha com o recado prático + "cada caso é único".

## 4. Carrossel (6 slides, 1080x1350) · modelo v2 aprovado em 08/10/2026
- Modelo: `python modelos/carrossel_quadro.py <pasta-da-parte> [slides]`, que lê `carrossel.json`.
- **Fotos reais da feira**, tiradas do próprio bruto com ffmpeg e salvas em `<pasta-do-quadro>/fotos/fT.jpg`. Nada de banco de imagem.
- Layouts e ordem:
  1. `capa`: foto da pessoa que respondeu em tela cheia, fundo escuro embaixo, selo PARTE N · TEMA, título e a fala dela em itálico;
  2. `foto`: o que é (foto em bloco no topo, texto embaixo);
  3. `foto`: a regra, com faixa preta;
  4. `lista`: documentos ou condições, com faixa de foto no topo;
  5. `numero`: idade, valor ou prazo em tipografia gigante;
  6. `fim`: Tamara recortada, "Ficou com dúvida?" e chamada da próxima parte.
- Filetes finos no topo e no rodapé, numeração, "ARRASTE →" e fonte em todos os slides.

## Regras que valem pras 4 peças
- **Linguagem:** simples, frase curta, sem juridiquês. Dizer **"contribuir com o INSS"**, nunca "pagar carnê".
- **Fonte oficial:** na peça e na legenda (Lei 8.213/1991, 8.212/1991, CF).
- **Estética do escritório:** off-white #ECEBE9, grafite #141414, taupe #8C7B6B, champanhe #E6D3B8, Inter fino + negrito. **Rosa não** (foi só no vídeo do Outubro Rosa).
- **Imagem:** autorização de quem aparece antes de publicar; nunca texto em cima de rosto.
- **Stories:** todo post sai com stories, e em colaboração nos dois perfis, com visuais diferentes (regra de 30/09).
- **Publicação:** Reels e carrossel no @tamarachagas_prev em colaboração com @dra.tamarachagas_. Agendamento pelo Agendador do Windows, registrado em `_contexto/automacoes.md`.
- **Pasta:** `reels/<data>-feira-perguntas/parteN/` com `legenda.md`, `trio.json`, `carrossel.json`, roteiros e `publicacao.log`.

## Cadência (regra da Talyta, 08/10/2026)
**Um episódio por semana**, sempre às 16h no @tamarachagas_prev, em colaboração com @dra.tamarachagas_:
- **quinta:** Reels de rua (episódio);
- **sexta (dia seguinte):** vídeo da Rita no escritório;
- **segunda seguinte:** vídeo da Tamara em casa.

Na quinta seguinte o ciclo recomeça com o próximo episódio.

| parte | episódio (qui) | Rita (sex) | Tamara (seg) |
|---|---|---|---|
| 1 | 08/10 ✅ | 09/10 | qua 14/10 (seg 12 e ter 13 são feriados) · carrossel qui 15/10 11h |
| 2 | seg 19/10 16h (qui 15 = vídeo da Tamara da Parte 1; sex 16 = vídeo avulso "Afastado pelo INSS") | a definir | a definir |
| 3 | ter 27/10 16h (rodízio de 5 Reels por semana) | a definir | a definir |
| 4 | 29/10 | 30/10 | 02/11 |

**Regra de 20/10/2026:** o episódio entra no rodízio de 5 Reels por semana, mesclando formatos (ver `AGENTS.md` do cliente); semana cheia, passa pra seguinte.

**Carrossel:** sai na quinta seguinte, às 11h, antes do novo episódio das 16h. **Feriado:** não se posta vídeo do quadro. Passa pro próximo dia útil.

A Rita e a Tamara gravam com antecedência: o vídeo bruto precisa chegar até a véspera pra dar tempo de editar e agendar.

## Partes já planejadas (bruto de 08/10)
| parte | tema | trecho do bruto | status |
|---|---|---|---|
| 1 | Trabalhador rural (precisa contribuir?) | 9,8–43,2 | Reels publicado 08/10 16h; roteiros Rita/Tamara e carrossel v2 aprovados |
| 2 | Auxílio-doença | 43,2–74,3 | Reels pronto pra aprovar; roteiros prontos; carrossel v2 aprovado |
| 3 | Salário-maternidade | 74,3–96,1 | a montar |
| 4 | Pensão por morte | 96,1–122,9 | a montar |
