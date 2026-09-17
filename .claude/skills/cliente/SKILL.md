---
name: cliente
description: >
  Cadastra um cliente da TK Filmes: cria a pasta dele com a ficha completa (contato, redes,
  o que vende, público, objetivo, plano contratado, conteúdos, contrato, marca, tom e
  personalidade) e as pastas de calendários e relatórios. Também abre a ficha de um cliente
  que já existe pra atualizar. Use quando o usuário disser "cadastra o cliente", "cliente
  novo", "ficha do <cliente>", "atualiza o cadastro", "fechei com o <cliente>".
---

# /cliente — Cadastro do cliente

A ficha é o `contexto.md` da pasta do cliente: é ela que o `/calendario` e o `/relatorio` leem
antes de escrever qualquer coisa. Cadastro bem feito uma vez economiza pergunta em todo mês.

## Regra que não se negocia: senha não entra aqui

Senha, token e login de cliente **nunca** são escritos na ficha nem em qualquer arquivo do
sistema: isto vai pro GitHub e roda em computador de empresa. A ficha registra só **onde** o
acesso está ("no gerenciador de senhas", "com o cliente, ele libera na hora"). Se o usuário
colar uma senha no chat, não salvar, e dizer isso em uma linha.

## Passo 1 — Novo ou já existe

Olhar `clientes/`. A pasta já existe? Abrir a ficha, mostrar o que está preenchido e perguntar o
que mudou. Não recriar nem sobrescrever o que já foi respondido.

Cliente novo: nome da pasta em minúsculas, sem espaço nem acento (`clientes/passaporte-galeguinho/`).

## Passo 2 — A entrevista

Se o usuário colar um briefing pronto, extrair o que der de lá e perguntar só o que faltou.
Senão, perguntar em blocos, um por vez, nunca a lista inteira de uma vez:

1. **Quem é:** nome do negócio, pessoa de contato, telefone, email, cidade.
2. **Onde está:** Instagram e outras redes, site.
3. **O negócio:** o que vende, quem é o público, qual o objetivo com o conteúdo.
4. **O contrato:** plano contratado, valor, data de início, quantidade e tipos de conteúdo por
   mês, onde o contrato está guardado.
5. **A marca dele:** identidade visual (cores, fontes, arquivos e onde estão), linguagem, tom e
   personalidade. Exemplo de post que ficou bom vale mais que descrição.
6. **Acessos:** de que contas você precisa e **onde** cada acesso está guardado. Sem senha.

Campo que ele não souber fica `[a definir]`. Não inventar.

## Passo 3 — Criar

```
clientes/<cliente>/
  AGENTS.md          ← ponteiro curto: as regras da raiz valem, leia contexto.md e andamento.md
  contexto.md        ← a ficha
  andamento.md       ← o que já foi entregue e o que está em aberto
  calendarios/       (.gitkeep)
  relatorios/        (.gitkeep)
```

A ficha, nesta ordem: identificação e contato · redes · o que vende e público · objetivo ·
plano, valor, data de início, quantidade e tipos de conteúdo · onde está o contrato · acessos
(só onde estão) · marca: identidade visual, linguagem, tom e personalidade. No fim, a data do
cadastro e de onde veio a informação.

No `andamento.md`, começar com o que já foi entregue pra esse cliente, se houver histórico.

Se o cliente tem identidade visual própria em arquivo (logo, paleta), guardar em
`clientes/<cliente>/marca/` e apontar na ficha. É essa marca que vale nas peças dele, não a da TK.

## Passo 4 — Fechar

Dizer o que foi criado, o que ficou `[a definir]`, e lembrar em uma linha que a partir de agora
`/calendario` e `/relatorio` já sabem falar como esse cliente.
