---
name: contratos
description: >
  Acompanha a entrega de cada contrato da TK Filmes: registra o que foi entregue na semana,
  compara com o combinado no mês, avisa quem está devendo conteúdo e quantos dias faltam pro
  contrato vencer, e gera o contrato de renovação em PDF no papel timbrado da TK.
  Use quando o usuário disser "o que eu entreguei essa semana", "registrar entregas",
  "estou em dia com os clientes?", "quanto falta entregar", "vencimento do contrato",
  "renovar o contrato do <cliente>", "conferir contratos".
---

# /contratos — Entregas e vencimentos

Duas coisas, no mesmo lugar: o que foi entregue e o que ainda deve. A fonte é a Talyta, uma vez
por semana; o sistema só guarda e faz a conta.

## Regras da contagem

- O ciclo é o **mês do calendário**, do dia 1 ao último dia.
- O que não foi entregue **passa pro mês seguinte** como saldo devedor, e continua acumulando até
  ser quitado. O saldo aparece sempre separado da meta do mês.
- **Só conta o que o contrato pede.** No padrão da TK, o combinado é em **vídeos**: post, carrossel,
  arte e story são **entregas extras**, e vão registrados numa lista separada, sem abater a meta.
  Contrato que fala em "posts fixos" (caso da Dra. Camilla) conta post, e aí é o vídeo que é extra.
  A ficha do cliente manda; na dúvida, perguntar.
- Story não entra na contagem, a não ser que o contrato daquele cliente diga o contrário.
- Entrega a mais num mês não abate o saldo devedor de outro automaticamente: perguntar antes.

## Modo 1 — Registrar (o preenchimento semanal)

Ler `clientes/*/contexto.md` (contrato, quantidade e tipos de conteúdo) e `andamento.md` de cada
cliente ativo. Mostrar, por cliente, uma linha curta:

```
<cliente> · combinado: <N>/mês · entregue no mês: <X> · falta: <N-X> (+<saldo> do mês passado)
```

Perguntar cliente por cliente o que saiu desde o último registro: quantos, de que tipo, e as datas
se ela lembrar. Resposta vaga ("uns três") vira o número, sem insistir.

Escrever no `andamento.md` do cliente, acrescentando embaixo, nunca reescrevendo:

```
## Entregas <mês>/<ano>
### Contratado (<tipo que conta>)
- AAAA-MM-DD · <o que foi> (registrado em AAAA-MM-DD)
### Extras (não abatem a meta)
- AAAA-MM-DD · <tipo> · <o que foi>
```

Fechando o mês, deixar a linha de saldo: `saldo para <mês seguinte>: <N> conteúdos`.

## Modo 2 — Conferir

Sem perguntar nada, montar o quadro de todos os clientes ativos:

| cliente | combinado | entregue | falta | saldo anterior | contrato vence em |
|---|---|---|---|---|---|

E depois, em texto, só o que precisa de ação:
- quem está **devendo**, quanto, e quantos dias restam do mês pra quitar;
- quem está **em dia**;
- contrato a **menos de 30 dias** do fim.

Devendo conteúdo ou contrato vencendo vira linha nas pendências do `agora.md`.

## Modo 3 — Renovar

Dispara quando faltarem **30 dias** pro fim do contrato. É o prazo que os contratos da TK pedem:
eles renovam automaticamente por 90 dias, salvo aviso de qualquer parte com 30 dias de antecedência.

Antes de gerar, confirmar com a Talyta: mantém o mesmo valor e o mesmo escopo, ou muda? Mudou o
valor, passar pela `/preco` antes.

Gerar o contrato novo a partir do contrato anterior daquele cliente (em `clientes/<cliente>/`),
mantendo as mesmas cláusulas e trocando só datas, período e valor. O cabeçalho e o rodapé são os do
papel timbrado da TK (ver o guia de design da marca no mapa do `AGENTS.md`): logo, "TK MOVIES ·
Produção Audiovisual e Criativa", CNPJ 62.942.423/0001-88, tkfilmesmobile@gmail.com,
(82) 9 9120-2604, e a marca d'água clara no corpo da página.

```bash
chrome.exe --headless=new --no-pdf-header-footer --print-to-pdf="<saida>.pdf" "file:///<caminho absoluto>.html"
```

Salvar em `clientes/<cliente>/contratos/AAAA-MM-contrato-<cliente>.pdf` e entregar o arquivo pra
Talyta. **Quem assina e quem manda pro cliente é ela**: a skill nunca envia nada por email, WhatsApp
ou qualquer outro canal.

Dado que falta no contrato anterior (o caso do valor em branco da Dra. Camilla) se pergunta antes
de gerar, nunca se completa por dedução.

## Fechar

Dizer o que foi registrado, quem está devendo o quê, e o que vence quando. Sem repetir o quadro
inteiro se nada mudou.
