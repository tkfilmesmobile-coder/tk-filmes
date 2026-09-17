---
name: calendario
description: >
  Monta o calendário editorial mensal de um cliente, com data, formato, tema, roteiro
  e legenda de cada conteúdo, e gera o PDF de entrega no padrão visual da TK Filmes.
  Use quando o usuário disser "calendário do mês", "calendário editorial", "programação
  de conteúdo", "monta o calendário do <cliente>", "planejamento de conteúdo".
---

# /calendario — Calendário editorial mensal

Entrega: um markdown editável e um PDF elegante, com no mínimo 2 conteúdos por semana
(o número final varia por cliente).

## Passo 1 — Saber de quem e de quando

Perguntar, se não vier no pedido: **qual cliente** e **qual mês**.

Ler, nesta ordem:
1. A pasta do cliente (`clientes/<cliente>/`): `contexto.md` e `andamento.md`, se existirem.
   Não existe pasta? Oferecer criar com `/novo-projeto` antes de seguir.
2. O tom daquele cliente (na pasta dele). Sem tom definido lá, ler o tom de voz da marca (ver
   mapa do `AGENTS.md`) e avisar que está usando o padrão da TK.
3. O último relatório de métricas do cliente (em `clientes/<cliente>/relatorios/`): o que rendeu
   e o que não rendeu no trimestre passado.

## Passo 2 — Juntar as quatro entradas

O calendário nasce de quatro coisas. Confirmar cada uma com a Talyta em uma pergunta só,
listando o que já foi encontrado nos arquivos:

1. **Métricas do trimestre anterior** (do relatório): formatos e temas que performaram.
2. **Briefing do cliente**: o que ele vende, o que quer vender agora, o que não pode aparecer.
3. **Datas comemorativas do mês**: buscar as do mês/ano em questão e filtrar as que fazem
   sentido pro nicho daquele cliente. Não encher o calendário de data por encher.
4. **Pedidos específicos do cliente** pra este mês.

Falta alguma? Perguntar. Nunca inventar dado de métrica nem de briefing.

## Passo 3 — Montar a grade

Definir a quantidade (mínimo 2 por semana) e distribuir ao longo do mês. Para cada conteúdo:

| campo | o que vai |
|---|---|
| data | dia e dia da semana |
| formato | reels, carrossel, story, foto única, vídeo institucional |
| tema | a ideia em uma linha, com o objetivo (atrair, engajar, vender) |
| roteiro | o passo a passo de gravação ou os slides do carrossel: cena a cena, com a fala |
| legenda | a legenda pronta pra copiar, com CTA e hashtags |

Regras da grade:
- Equilibrar os objetivos: nem só venda, nem só entretenimento.
- Repetir o que as métricas mostraram que funciona, sem repetir o mesmo tema.
- Roteiro escrito pra quem vai gravar: objetivo, sem literatura.
- Legenda no tom daquele cliente, nunca no tom da TK.

Mostrar a grade resumida (data · formato · tema) antes de escrever roteiro e legenda de tudo.
Aprovada a grade, escrever o resto.

## Passo 4 — Salvar o rascunho

`clientes/<cliente>/calendarios/AAAA-MM-calendario.md`. Criar a pasta se não existir.
É o arquivo que a Talyta edita antes do PDF.

## Passo 5 — Gerar o PDF

Só depois do "pode gerar". Ler o guia de design da marca (ver mapa do `AGENTS.md`) e montar um
HTML A4 multipágina: capa com o logo e o mês, uma página de visão geral com a grade, e um bloco
por conteúdo. Fundo claro, muito respiro, destaque em caramelo, títulos em marrom escuro.

```bash
chrome.exe --headless=new --no-pdf-header-footer --print-to-pdf="<saida>.pdf" "file:///<caminho absoluto>.html"
```

O caminho tem que ser `file://` absoluto, senão o Chrome trata como endereço de site e falha.
Conferir o resultado renderizando uma página em PNG antes de entregar.

Salvar em `clientes/<cliente>/calendarios/AAAA-MM-calendario-<cliente>.pdf`.

## Passo 6 — Fechar

Dizer o que foi gerado, onde está, e quantos conteúdos ficaram. Se algo do briefing ficou em
aberto, repetir o que falta.
