# TikTok da Tamara · levantamento (04/11/2026)

**Regra nova (Talyta, 04/11/2026):** tudo que for pro Instagram da Tamara (Reels e posts de feed) vai também, no
mesmo horário, pro TikTok **@tamarachagas.prev** (conectado na Post for Me). Stories não vão (o TikTok não tem).
Imagem e carrossel vão como post de fotos do TikTok.

## O que está programado
| data | conteúdo | Instagram | TikTok |
|---|---|---|---|
| qui 05/11, 16h | Salário-maternidade: depende | `sp_PkF9FamZmCVuFpP6uZjAq` (@dra.tamarachagas_ + colab) | `sp_HtPgocJriDXKPJamN7x2` (@tamarachagas.prev), agendado em 04/11 |

## O que já saiu (desde 01/10/2025, início do trabalho da TK)
Planilha completa, post a post, com link e assunto: `relatorios/2026-11-tiktok-acervo.csv`.
Fonte: feed das duas contas pela Graph API (04/11/2026). Ficou de fora a vida pessoal da Tamara no @dra.tamarachagas_
(treino, viagem, memes, família: 87 posts), separada pelo assunto da legenda.

| | pode ir pro TikTok | datado (já venceu) |
|---|---|---|
| vídeos | 150 (134 do pessoal, 16 do escritório) | 10 |
| imagens | 51 (30 do pessoal, 21 do escritório) | 20 |
| carrosséis | 19 (14 do pessoal, 5 do escritório) | 2 |
| **total** | **220** | **32** |

Datado = eleições e prova de vida pelo voto, feriados e avisos de funcionamento, recesso, Natal e Carnaval de anos
anteriores, Dia das Crianças/Mulheres, emancipação de União, aniversário da sede. A separação foi automática pelo
texto: conferir na planilha antes de agendar (ex.: "Pessoa com deficiência tem direitos" caiu como datado por citar
eleição, mas pode servir).

Por mês (o que pode ir): 2025-10: 13 · 11: 19 · 12: 15 · 2026-01: 14 · 02: 4 · 03: 23 · 04: 33 · 05: 7 · 06: 10 ·
07: 8 · 08: 20 · 09: 17 · 10: 35 · 11: 2.

## Acervo agendado (04/11/2026)
A Talyta escolheu **5 por dia, começando hoje**: 9h, 11h, 13h, 18h e 20h (fora das 16h dos posts novos). Do mais
recente pro mais antigo; a saga de Natal sai em ordem de episódio (EP. 01, 02, 03, o atraso, "Finalizamos!").
- **186 do acervo agendados** no TikTok @tamarachagas.prev, de 04/11 às 20h até 13/12 às 18h (187 com o salário-maternidade).
  Lista com o id de cada um: `relatorios/2026-11-tiktok-fila.json`. Script: `modelos/tiktok_acervo.mjs` (retomável;
  remarca sozinho se os horários mudarem).
- **34 ficaram de fora** (33 vídeos, 1 carrossel): o Instagram não entrega o arquivo desses posts (em geral, Reels com
  música da biblioteca do Instagram). Lista em `relatorios/2026-11-tiktok-fora.csv`. Pra entrarem, precisam do arquivo
  original (celular da Tamara, Drive) ou baixado à mão.
- Incluído à mão: "Finalizamos!" (03/11). Fora de propósito: os 2 vídeos crus da saga de 02/11 (conversa cruzada e palavrão).

## Antes de subir o acervo
- Não dá pra ver pela Post for Me o que já existe no TikTok @tamarachagas.prev: se algo já foi postado lá à mão, tirar da lista.
- Os vídeos antigos vêm do Instagram (720p); os feitos neste sistema, das pastas `reels/` e do Drive (1080p).
- Legenda: tirar o que é só do Instagram ("link na bio", @ de colaboração) e conferir se a música do Instagram veio junto.
- Ritmo a decidir com a Talyta (ex.: 1 ou 2 por dia, fora das 16h dos posts novos).
