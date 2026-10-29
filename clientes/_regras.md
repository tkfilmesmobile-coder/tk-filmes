<!-- quem alimenta: a Talyta, nas conversas de regra geral; o agente escreve quando ela pede. Lido antes de qualquer trabalho de cliente (o AGENTS.md de cada pasta aponta pra cá). -->
# Regras de todos os clientes

Vale pra todo cliente da TK, dos antigos aos que ainda vão entrar. Regra escrita na pasta de um
cliente vence a regra geral **só naquele cliente**.

## Regra 0 · Regra nova chega em todo mundo, com o histórico de cada um (2026-10-13)

Sempre que entrar aqui uma regra, função ou padrão novo que vale pra todos os clientes:

1. **Escrever a regra geral** neste arquivo, datada.
2. **Aplicar em cada cliente que já existe** (`clientes/*/`), um por um, usando tudo o que se
   sabe dele: `contexto.md`, `andamento.md`, `marca/`, calendários e posts já feitos, e o que o
   diário (`_memoria/diario/`) e as decisões (`_memoria/decisoes.md`) dizem sobre ele. A regra
   deixa de ser genérica e vira a versão **daquele** cliente (com os dados, o tom, a marca e a
   situação dele).
3. **Gravar a versão do cliente na pasta dele**, na seção "Regras gerais aplicadas" do
   `contexto.md` (data + regra + como fica pra ele). Assim toda conversa sobre aquele cliente já
   abre sabendo.
4. **Faltou informação pra adaptar:** fica `[a definir]` na seção e vira pendência no
   `andamento.md` dele. Nunca inventar o dado.
5. **Registrar aqui embaixo da regra** em quais clientes ela já foi aplicada.
6. **Cliente novo** (`/cliente`): recebe todas as regras deste arquivo já adaptadas no cadastro.

No fim, dizer à Talyta, cliente por cliente, o que mudou e o que ficou `[a definir]`.

## Regras em vigor

- **Todo cliente tem um brand book (2026-10-13).** Cliente novo: entrevista de 15 perguntas no
  cadastro e brand book gerado com o prompt de `clientes/_brand-book-prompt.md`. Cliente antigo:
  o mesmo prompt, com o histórico da pasta (ficha, andamento, marca, posts, diário) no lugar do
  questionário. O brand book separa o que o cliente decidiu, o que é recomendação e o que está
  pendente de aprovação; nada inventado. Fica em `<cliente>/marca/brand-book.*` e a ficha aponta pra
  ele. A skill `/identidade` e a marca existente do cliente entram como base, nunca são refeitas
  do zero. Aplicada em (status em 2026-10-13): TK Filmes (Brand Book 2.0 em `_contexto/marca/brand-book-2.0.pdf`, feito das 15
  respostas dela; a v1 que montei do histórico está em `_contexto/marca/arquivo/`); Pote Fitness (tem `brand-book-v1.pdf`); Tamara,
  Galeguinho, Ary e Camilla: **pendente**; Dra. Melissa Morais (só edição de vídeo, cadastrada em 2026-10-16): **a definir** se se aplica. Dra. Annalibya (cadastrada em 2026-10-20, sem marca nem perfil): **pendente**, nasce do zero. Start Fitness (só edição de 2 vídeos, cadastrada em 2026-10-28): **a definir** se se aplica.
- **Zonas seguras do reels (2026-10-12).** Em 1080x1920: área útil x 60–920 e y 250–1500; foco na
  linha dos olhos (y 300–900); legenda logo abaixo, perto do rosto (y 900–1080); ilustrações na
  faixa de baixo (y 1080–1500), sem dominar. Referência: vídeo de @rejanetoigo, "Não cometa esse
  erro no seu Instagram". No Remotion da TK é a constante `ZONA` do `src/Voltei.tsx`.
- **Stories junto com o post (2026-09-30).** Todo post que sai leva no mínimo 3 stories ligados ao
  assunto (aviso do post, dica ou assunto, chamada), na identidade visual do cliente.
- **Entrega vai pro Drive do cliente (2026-09-30).** `G:\Meu Drive\<CLIENTE>`, com
  `IDENTIDADE VISUAL/` e `POSTS/<ano-mês>/`. No PC fica só o que uma automação precisa ler.
- **Artes com foto (2026-09-29).** A foto não se mexe (nada de encaixar, expandir, desfocar ou
  reduzir). Quem cede é o texto. Texto nunca em cima de rosto nem do produto.
- **Informação que não temos não entra (2026-10-10).** Preço, prazo ou serviço não confirmado:
  tira a linha. Nunca "R$ __" nem "consulte".
- **Profissão regulamentada (2026-10-08).** Peça que cita o que uma profissão pode ou não divulgar
  confere a norma do conselho na fonte oficial do ano atual. Referência:
  `tk-filmes/referencias/publicidade-conselhos.md`.

- **B-roll de toda diária (2026-10-23).** Em toda diária de gravação, nesta ordem: (1) analisar todas
  as filmagens; (2) separar os **B-rolls qualificados** (cena boa sem fala, ou com fala dispensável:
  estável, bem exposta, que sirva pra cobrir outra edição no futuro) numa pasta de B-roll no Drive do
  cliente, uma subpasta por diária (`AAAA-MM-DD · <lugar>`), com o nome do arquivo dizendo a cena;
  (3) separar as fotos na pasta de fotos da diária; (4) fazer o **vlog geral** (um pouco de cada coisa);
  (5) fazer o **máximo de vídeos unitários por tema** que o material sustentar (ex.: clareamento,
  feedback de paciente). Paciente ou cliente só entra no B-roll com autorização de imagem.
  Aplicada em (2026-10-23): Camilla, Ary, Tamara, Galeguinho, Melissa, Annalibya; Pote Fitness com
  pasta **a definir**; Start Fitness (2026-10-28): não se aplica por enquanto (o vídeo chega pronto, sem diária).

- **Curadoria de toda edição antes de entregar (2026-10-24).** Nenhum vídeo editado sai sem: (1) retranscrever o
  áudio final da montagem e comparar palavra por palavra com o que foi escolhido (palavra faltando = corte errado);
  (2) conferir cada corte no áudio (corte só no silêncio, nunca no meio de palavra); (3) ler a fala inteira montada:
  início, meio e fim, faz sentido, sem tentativa, palavra errada nem direção de quem grava; (4) conferir quadros do
  vídeo final; (5) **B-roll sem repetição**: o mesmo vídeo não ilustra exemplos diferentes nem se repete na mesma leva;
  levantar todo o material do cliente (inclusive vídeos antigos) antes de escolher. **Aprofundada em 2026-10-25:**
  (6) checar **boca × voz** em cada trecho (voz sem a boca de quem está na câmera mexer = direção ou outra pessoa,
  mesmo com volume alto); (7) procurar voz baixa de fundo dentro dos trechos; (8) **credibilidade**: quando a pessoa
  fala de si (família, tempo de carreira, história), buscar no Instagram/acervo dela a foto ou vídeo que comprova e
  mostrar; ninguém aparece identificado (esposo, filho, cliente) sem confirmação. **Reforçada em 2026-10-27
  (Talyta): vale pra todo vídeo, de feed ou de stories, inclusive os curtinhos de B-roll falado.** O vídeo sobe só
  com a fala aprovada: nenhuma tentativa, nenhum erro, nenhum pedaço da tentativa anterior, nenhuma orientação de
  quem está gravando e nenhuma frase incompleta. A legenda repete exatamente o que a pessoa falou (conferir com a
  retranscrição, nunca escrever de memória). Motivo: em 27/10 o story da Rita subiu com o fim de uma tentativa
  errada e a legenda dizia "os nossos atendimentos" quando ela falou "o nosso atendimento". Aplicada em (2026-10-24):
  Ary (`clientes/ary-magalhaes/edicao/perfil-de-edicao.md`, `curadoria.py`, `broll-catalogo.md`); Tamara (2026-10-27,
  `clientes/tamara-chagas/AGENTS.md`); Start Fitness (2026-10-28, `edicao/2026-10-corrida-2a-edicao/curadoria.py`); Camilla, Galeguinho, Melissa, Annalibya, Pote Fitness: **pendente** (levar pro
  perfil de edição de cada um).

Essas seis já valiam antes da Regra 0: não passaram pela adaptação cliente a cliente.
