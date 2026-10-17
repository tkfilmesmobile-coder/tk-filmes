## 2026-09-29 · pc-escritoriotamarachagas
- 28/09 à tarde: post "Vai votar no domingo? (prova de vida)" publicado no @tamarachagas_prev em colaboração com @dra.tamarachagas_ + story da arte. 8 stories orgânicos postados sem música (a API não faz música, sticker nem rascunho).
- Skill `post-tamara` criada na pasta da cliente. `publish-graph-api.js` ganhou `--caption-file`, `--colaboradores` e `--story`.
- 29/09: post "calendário de pagamento de outubro" publicado às 9h (https://www.instagram.com/p/Dd3t17lEYuO/). "Golpes / canais oficiais" agendado pras 15h. "Simei" agendado pra 30/09 às 9h.
- Estética do feed da Tamara: escuro → claro → "limpo" (foto da Tamara, Inter, logo no topo). 5 layouts em `modelos/variantes.py`.
- Calendário "Eleições 2026 × Previdência": 18 posts, PDF, artes e legendas em `clientes/tamara-chagas/calendarios/`. Posts 1 a 14 agendados às 9h (01/10 a 20/10) pelo Agendador do Windows. 15 a 18 dependem do 2º turno.
- 8 fotos novas do Unsplash baixadas com OK; fotos do ensaio da Tamara copiadas pra `marca/fotos/tamara/`. Registro de uso em `marca/fotos/_uso.md`.

## 12:00 · pc-escritoriotamarachagas
- Aula 6 do curso: IMG_0397 editado no Remotion (projeto novo em `projetos/curso-mestres-ai/aula-6/`). Amostra de 8s → versão completa de 29,4s. Legenda leve palavra a palavra; 7 imagens do kit de assets presas à palavra falada, ao lado da cabeça, seguindo o rosto, com brilho e som de entrada gerado em código.
- Reels publicado no @tamarachagas_prev às 11h59 → https://www.instagram.com/reel/Dd4B5zYjKVv/ (legenda com a fonte do INSS, sem colaboração: o script não faz colaboração em vídeo).

## 21:26 · pc-escritoriotamarachagas
- Entrevista de marketing da TK e diagnóstico do Instagram pela API: 451 seguidores, 101 posts, parado desde 28/04/2026; últimos 30 dias com 404 de alcance, 95 visitas e 3 toques no link; 61% do público em União dos Palmares; reels com a Talyta rendem 5 a 10x mais que arte sem rosto.
- @tkfilmesmobile virou @tk.filmes. Token `TK_FILMES` no `.env`; foi bloqueado pela Meta depois da troca de @ ("API access blocked") e renovado no mesmo dia.
- Estratégia out/2026–mar/2027 em `tk-filmes/estrategia.md` (metas, persona, voz, semiótica, crenças, funil, séries, formatos, fases, filtro de publicação); resumo em `tk-filmes/contexto.md`; pasta `tk-filmes/` ganhou `AGENTS.md` e `andamento.md`.
- Referências analisadas no navegador: @xtrategi.mkt, @olivamktig, @aldalinedesign, print da Rafaella da Mata e um carrossel panorâmico do Cosmos.
- Linha visual fechada depois de 7 rodadas (Playfair recusada; Fraunces, Instrument Serif e DM Serif testadas; versão "B" escolhida): formatos frase, tweet, conversa e bastidor, gerador `tk-filmes/modelos/pecas.py`. Do ensaio no Drive (274 fotos), 10 escolhidas e tratadas em `tk-filmes/fotos/` (regras em `_uso.md`).
- Calendário de outubro v3 (20 posts, `tk-filmes/calendarios/2026-10-calendario.md`). 11 artes estáticas em `tk-filmes/posts/2026-10/`, agendadas às 12h de 05 a 28/10 pelo Agendador do Windows (tarefas "TK - TK Filmes <data>", script `tk-filmes/modelos/publicar-agendado.ps1`). Roteiro do reels "Voltei" (06/10) enviado pra ela gravar.

## 23:55 · pc-escritoriotamarachagas
- Histórico do Passaporte do Galeguinho levantado de 4 fontes: ficha e contrato no sistema, pasta de produção `C:\Users\tamar\cliente-passaporte-do-galeguinho`, `Downloads\galeguinho` e 8 conversas antigas do Claude (16/07 produção das peças; 21/07 relatório; 04/08 e 18/08 formatos novos; 31/08 Filé Mignon; 17/09 cadastro).
- O relatório mai-jul/2026 (feito em 21/07) estava fora do sistema; o PDF sumiu do Downloads e os números foram recuperados da conversa e registrados no `andamento.md` do cliente.
- 10 vídeos editados em 03 e 04/09 em `Downloads\galeguinho\PRONTOS` e 21 brutos de 26/08 a 01/09 na mesma pasta. A conversa de WhatsApp com o cliente não está no computador.
- @passaportedogaleguinho conectado à Graph API (token `PASSAPORTEDOGALEGUINHO` no `.env`, 5.191 seguidores, vence ~28/11/2026).
- Cardápio online lido em passap10.menudino.com: só Passaportes (boi, frango e misto a R$ 16; G a R$ 21), batatas e bebidas. Hambúrguer e sobremesas não aparecem no delivery.
- Calendário de outubro: 13 posts, 3 por semana, em `clientes/passaporte-do-galeguinho/calendarios/2026-10-calendario.md`, com as legendas. 16 artes geradas em HTML (gerador em `conteudo/2026-10/_gerador` na pasta de produção), 3 rodadas: a 2ª (foto encaixada em fundo desfocado) foi reprovada; a 3ª (foto inteira, título menor no alto) aprovada. Ficaram de fora "15 anos", Alerta e "bacon com cheddar".
- 13 tarefas "TK - Galeguinho <data>" no Agendador do Windows, ao meio-dia, de 03 a 31/10, script `clientes/passaporte-do-galeguinho/modelos/publicar-agendado.ps1`; artes e legendas em `clientes/passaporte-do-galeguinho/posts/2026-10/`. Dry-run do carrossel passou.
