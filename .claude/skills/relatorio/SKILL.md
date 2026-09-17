---
name: relatorio
description: >
  Monta o relatório de métricas de Instagram de um cliente a partir dos prints do Insights
  (geralmente um .zip que chega pelo WhatsApp) e entrega um PDF elegante e minimalista.
  Use quando o usuário disser "relatório do <cliente>", "relatório de métricas", "analisa
  as métricas", "chegaram os prints do Insights", "relatório trimestral".
---

# /relatorio — Relatório de métricas de Instagram

Entrega: um PDF A4 elegante e minimalista, do trimestre (ou do período pedido), que também
serve de base pro `/calendario` do período seguinte.

## Passo 1 — Saber de quem, de quando e com o quê

Perguntar, se não vier no pedido: **qual cliente**, **qual período** e **onde estão os prints**.

Um dono com dois perfis (ex.: academia + loja) rende um relatório comparativo dos dois, não dois
relatórios. Confirmar antes.

Ler a pasta do cliente (`clientes/<cliente>/`): `contexto.md` e o relatório anterior, se houver.
Sem pasta, oferecer `/novo-projeto`.

## Passo 2 — Extrair os números

Descompactar o .zip na pasta temporária da sessão (nunca dentro do projeto) e **ler cada imagem**
com o Read, uma por uma, anotando o que aparece: visualizações, contas alcançadas, seguidores,
interações, melhores conteúdos, horários, dados de público.

Regras:
- Número que não está no print não entra no relatório. Não estimar, não arredondar pra soar melhor.
- Print ilegível: dizer qual e seguir sem ele.
- Comparação com o período anterior só se o número anterior existir (nos prints ou no relatório
  passado, que fica na pasta do cliente).

Antes de montar o PDF, mostrar os números extraídos numa lista curta pra Talyta conferir.

## Passo 3 — Analisar

A estrutura, sempre nesta ordem:

1. **Visão geral de crescimento** · os números do período e a variação
2. **Desempenho por tipo de conteúdo** · reels, carrossel, story: o que puxou resultado
3. **Crescimento de seguidores** · ritmo e de onde vieram
4. **Performance dos conteúdos** · os melhores e os piores, com o porquê
5. **Oportunidades** · o que os números mostram que está sobrando na mesa
6. **Diagnóstico** · o resumo honesto do período
7. **Recomendações** · o que fazer no próximo trimestre, em ações concretas

A análise é direta e sem elogio vazio. Queda é dita como queda, com a leitura do motivo.

## Passo 4 — Montar o PDF

Ler o guia de design da marca (ver mapa do `AGENTS.md`). HTML A4 multipágina: serifada nos
títulos, sans nos dados, barras em CSS pra comparação, `@page{size:A4;margin:0}`, muito respiro,
destaque em caramelo.

```bash
chrome.exe --headless=new --no-pdf-header-footer --print-to-pdf="<saida>.pdf" "file:///<caminho absoluto>.html"
```

Caminho `file://` absoluto, senão o Chrome trata como endereço de site e falha.
Conferir renderizando o PDF em PNG com pymupdf (`fitz`), 96–100 dpi, antes de entregar.

## Passo 5 — Salvar e fechar

`clientes/<cliente>/relatorios/AAAA-MM-relatorio-<cliente>.pdf`, com o rascunho `.md` do lado.
Criar a pasta se não existir. É daqui que o `/calendario` vai buscar as métricas depois.

Fechar dizendo o que o relatório mostrou em duas ou três linhas, e onde o arquivo está.
