# Agenda de postagens · Tamara Chagas · novembro de 2026

Tudo agendado na **Post for Me** (pedido da Talyta, 03/11/2026), no perfil pessoal **@dra.tamarachagas_** com
colaboração do **@tamarachagas_prev**. Reels às 16h; os 3 stories do pessoal saem às 16h03, 16h04 e 16h05.
Regra da semana: 5 Reels, um por dia útil, sem repetir o formato em dias seguidos (Tamara pra câmera · equipe/humor ·
quadro da feira · vlog). Os stories diários das 8h no @tamarachagas_prev continuam pela tarefa do PC kumyt.

## Semana de 02 a 06/11

| dia | Reels (16h) | formato | situação | id na Post for Me |
|---|---|---|---|---|
| seg 02/11 | (Finados) | — | sem post | — |
| ter 03/11 | **Novembro Azul** (`reels/2026-11-03-novembro-azul/`) | Tamara pra câmera | **publicado 16h06**: https://www.instagram.com/reel/DfSl5SVj8Nm/ (+ 3 stories) | Reels `sp_g9JK0yBFJUoVBVxOzxhW` · stories `sp_9X9nof6NLH6YRmVWegpn`, `sp_0inrzRrPiE8PUlGjiQ4j`, `sp_WlZv99i2CXvuOZLDc7pGF` |
| qua 04/11 | livre | — | sem post | — |
| qui 05/11 **7h** | **Vídeo oficial da decoração de Natal, horizontal v3** (`reels/2026-11-natal-oficial/natal-oficial-horizontal-leve.mp4`) | vlog | **publicado 7h05**: https://www.instagram.com/reel/DfWxbiKgBBG/ (pedido da Talyta às 6h51, sem stories) · **+ TikTok @tamarachagas.prev** `sp_qfKScg6kWuNFEUS9yYdHw` | Reels `sp_Lz6ykD05t2nIy4timEQiI` |
| qui 05/11 | **Salário-maternidade: depende** (`reels/2026-11-05-salario-maternidade/`) | Tamara pra câmera | agendado, aprovado em 03/11 · **+ TikTok @tamarachagas.prev** `sp_HtPgocJriDXKPJamN7x2` | Reels `sp_PkF9FamZmCVuFpP6uZjAq` · stories `sp_GKuvSs4z7NQ2WjsKP45vn`, `sp_aRHqVouXNgF7ndnQ6mEr`, `sp_WeAYG6NDIztFfMhfUy3zC` |
| sex 06/11 | livre: episódio 3 da feira ou "Trabalhador rural" (só existem no PC do escritório) | quadro da feira | depende do PC do escritório | — |

O Novembro Azul substituiu o vídeo do feed de 03/11. O salário-maternidade não foi pra quarta porque seriam dois dias
seguidos de Tamara pra câmera.

## Pendências
- Conectar o @tamarachagas_prev na Post for Me pra agendar também os 4 stories do escritório de cada Reels.

## Como mudar
Ver ou cancelar no painel da Post for Me. Pelo script: `GET/DELETE /v1/social-posts/<id>` com a chave do `.env`.
Agendar: `publish-postforme.js --platform instagram --conta dra.tamarachagas_ --video <mp4> --caption-file legenda.md
--schedule AAAA-MM-DDT16:00:00-03:00 --colaboradores tamarachagas_prev` (stories: `--images <jpg> --placement stories
--caption "<texto curto>"`).
