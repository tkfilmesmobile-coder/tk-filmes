---
name: preco
description: >
  Calcula o preço de um trabalho da TK Filmes comparando com os contratos já fechados:
  faz as perguntas certas (quantidade de conteúdo, dias de gravação, deslocamento, porte
  do cliente), devolve uma faixa com a conta aberta e registra o valor fechado no histórico.
  Use quando o usuário disser "quanto cobrar", "precificar", "faz um orçamento", "quanto
  vale esse trabalho", "cliente pediu preço", "montar proposta de valor".
---

# /preco — Precificação por comparação

A TK precifica caso a caso. Esta skill não inventa tabela: ela compara o trabalho novo com os
contratos que já foram fechados e mostra a conta, pra Talyta decidir o número.

## Passo 1 — Ler o histórico

Ler `propostas/precos.md` **antes de perguntar qualquer coisa**. É de lá que saem as referências
(diária avulsa, diária de cobertura, piso mensal) e os contratos de comparação.

## Passo 2 — Entender o trabalho

Perguntar, uma de cada vez, só o que não veio no pedido:

1. **Quantidade de conteúdo** por mês (ou o trabalho é avulso?).
2. **Dias de gravação** por mês, e se são concentrados num dia só ou espalhados.
3. **Deslocamento**: onde é, e quem paga (a TK ou o cliente).
4. **Porte do cliente**: negócio local pequeno, consultório/profissional liberal, empresa maior.
5. Tem algo fora do padrão? (cobertura de evento, site, app, edição pesada, entrega urgente)

## Passo 3 — Comparar e devolver a faixa

Achar no histórico os **dois contratos mais parecidos** e mostrar:

```
Comparando com:
- <cliente A>: <escopo> → R$ X/mês
- <cliente B>: <escopo> → R$ Y/mês

Este trabalho tem <mais/menos> conteúdo e <mais/menos> dias de gravação.

Faixa: mínimo R$ __ · ideal R$ __ · teto R$ __
```

Como montar a faixa:
- **Mínimo:** o valor do contrato parecido mais barato, ajustado pela diferença de escopo. Nunca
  abaixo do piso mensal do histórico sem dizer explicitamente que está abaixo.
- **Ideal:** o que o escopo pede olhando os dois contratos.
- **Teto:** o que dá pra pedir se o cliente é de porte maior ou o prazo é apertado.

Sempre dizer a conta em uma linha, não só o número. E acender alerta quando:
- o valor fica **abaixo do piso** praticado;
- o trabalho é **maior** que o de um contrato mais caro e o valor proposto é menor;
- tem **deslocamento por conta da TK** que não está embutido;
- é trabalho avulso cobrado abaixo da diária de referência.

Trabalho avulso (uma diária, uma cobertura, um vídeo) usa as referências fixas, não a conta mensal.

## Passo 4 — Registrar

Fechou o valor? Acrescentar a linha em `propostas/precos.md`: cliente, escopo, período, total,
por mês, data e **o motivo** ("fechou em R$ X porque o cliente grava sozinho e não tem deslocamento").
É esse motivo que faz o próximo orçamento sair melhor.

Não fechou ainda: não escrever nada. Preço em negociação não entra no histórico.

## Passo 5 — Oferecer o próximo passo

Perguntar em uma linha se quer transformar isso numa proposta pro cliente. Se sim, escrever a
proposta lendo o tom de voz da marca (ver mapa do `AGENTS.md`) e salvar em `propostas/`.
