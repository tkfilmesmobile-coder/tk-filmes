# Site da TK Filmes · tkfilme.com.br

Landing page da bio do Instagram, aprovada em 2026-10-26 (desenho: canvas "Landing page TK Filmes"), com a imersão 3D "O K em cena".
Site estático: não precisa de servidor, banco nem mensalidade. Tudo o que vai ao ar é esta pasta.

## O K em cena (como a imersão funciona)

O símbolo K é um objeto 3D (Three.js 0.160, em `assets/js/vendor/`, licença MIT) desenhado a partir dos mesmos traços da logo 2.0. A rolagem conta a história em 7 cenas, uma por seção (`data-cena` no `index.html`; as poses ficam em `POSES`, no `assets/js/cena.js`):

| cena | seção | o K |
|---|---|---|
| 0 | abertura | montado, ao lado do título, girando de leve com o mouse ou a inclinação do celular |
| 1 | quando não há direção | as peças se soltam (o problema) |
| 2 | as quatro frentes | vista explodida; a seção fica presa na tela e cada frente acende sua peça (fio = estratégia, folha de baixo = vídeos, folha de cima = marca, hastes = sites) |
| 3 | como funciona | remonta e gira ao fundo |
| 4 e 5 | quem dirige, perguntas | ao fundo, discreto |
| 6 | chamada final | montado, à frente, e o fundo escurece pro marrom da marca |

Sem WebGL, ou com "reduzir movimento" ligado no aparelho, a página mostra o K parado (`assets/img/k.svg`) e as frentes em grade normal. O texto e os botões nunca dependem do 3D.

### v2 · acabamento de cinema (2026-10-26)

- **Estúdio** (`cena.js`): reflexo de ambiente real, luz com contraste, folhas e hastes em caramelo acetinado, fio em metal escovado, sombra suave no chão, poeira de luz com profundidade de campo (fora de foco vira bokeh) e câmera que viaja entre as cenas. Na chamada final vira noite: fundo marrom, poeira brilhando e um feixe de luz.
- **Abertura de cinema** (`experiencia.js` + `#abertura-filme`): o K se desenha em traço com timecode correndo e as peças se montam em 3D. Aparece uma vez por visita e qualquer toque pula.
- **Rolagem com inércia** (Lenis, `vendor/lenis.min.js`, licença MIT), títulos que se revelam palavra a palavra, grão de filme e vinheta.
- **Trabalhos em holograma**: no computador, o trabalho flutua ao lado do cursor com varredura e reflexo; no celular, cartões de deslizar. Pra pôr vídeo num item: `data-video="/assets/video/arquivo.mp4"` no `<li>`.
- **Cursor próprio** e botões que se atraem pro mouse (só em mouse/trackpad).
- **Som** (`som.js`): ambiente, toques, sopro na troca de cena e o encaixe das peças, tudo gerado pelo navegador. Desligado por padrão, no botão "Som" do topo.
- **Composição vertical** (`html.layout-vertical`): celular e telas estreitas ou em pé usam o K em cima e o texto embaixo.
- Conferir a composição sem animação: abrir com `?quadro-fixo` no endereço (ex.: `/?quadro-fixo#trabalhos`).

**Antes de publicar:** preencher os campos entre colchetes da seção "Quem dirige" (anos de audiovisual, como começou, quem é, números).

**Tema marrom (27/10/2026):** o site inteiro está no "modo noite" (fundo #4A2F25, texto creme, botão caramelo, poeira de luz e feixe na cena 3D), que antes só aparecia na chamada final. É a classe `tema-marrom` no `<html>` das três páginas, mais as regras no fim do `site.css` e uma linha no `cena.js`. Pra voltar ao creme: tirar a classe, trocar o logo do topo pra `logo.svg` e o `theme-color` pra `#FAF6F3`.

**Abertura com a Talyta (27/10/2026):** a foto dela recortada do fundo (MediaPipe + filtro guiado no cabelo) está em `.abertura-retrato`: no computador, meio corpo grande à direita do "Estratégia antes da execução.", subindo até o topo da página; no celular, grande em cima, com o texto entrando por baixo. Arquivos: `assets/img/talyta-abertura-recorte-940.webp`, `-600.webp` e `-940.png` (reserva). O K 3D fica atrás dela, como escultura: a posição dele é calculada a partir da foto na tela (`ALVO_K` no `cena.js`), então ele acompanha a foto em qualquer tamanho de janela. No computador a foto fica presa à coluna de 1200px do texto (não à borda da janela). No celular a abertura mostra só a foto, o título e os botões, centralizados.
- Pendente: o vídeo de boas-vindas (vertical, mesmo fundo). Entra no lugar da `<picture>`: a abertura do sorriso toca uma vez e depois o trecho em que ela respira sorrindo fica em loop.

**Retrato vivo ("Quem dirige", 27/10/2026):** dois vídeos gerados por IA (Gemini) a partir de foto da Talyta.
- Computador (28/10/2026): ela olha na direção do cursor, pros lados e pra cima/baixo; parado, volta a olhar pra frente. São 56 quadros do vídeo dela olhando em todas as direções (`gemini_generated_video_ca2424c9.mp4`) em `assets/img/olhar2/00–55.webp`, com a pose de cada um em `poses.json` ([x, y] de -1 a 1; o 00 é o de frente, de olhos abertos). O `experiencia.js` desenha num canvas o quadro mais perto da direção do mouse. Capa: `assets/img/talyta-olhar-capa.jpg`.
- Vídeo de reserva (não usado): `gemini_generated_video_a40817ac.mp4`, ela de frente sorrindo e respirando, mesmo enquadramento; serviria pra quando o mouse para.
- Celular: os mesmos quadros, seguindo a rolagem (o retrato entra por baixo com ela olhando pra cima, passa pelo meio da tela de frente e sai por cima olhando pra baixo). Um toque ou clique faz ela olhar pro ponto tocado por 1,8 s, e depois ela volta a seguir a rolagem.
- Com "reduzir movimento" ligado: só a foto parada (`assets/img/talyta-retrato.jpg`).
- `assets/video/talyta-retrato.mp4` (pisca e sorri em loop) fica de reserva: só toca se o atributo `data-olhar` sair do HTML.
- As fotos antigas `talyta-notebook-*.jpg` continuam na pasta, sem uso.

| arquivo | o que é |
|---|---|
| `index.html` | a página |
| `privacidade.html` | política de privacidade (LGPD) |
| `404.html` | página de endereço errado |
| `assets/css/site.css` | o visual (cores e fontes do Brand Book 2.0) |
| `assets/js/site.js` | aviso de cookies, medidores, botão fixo do WhatsApp no celular |
| `assets/fonts/` | Instrument Serif e Montserrat, hospedadas no próprio site |
| `assets/img/` | logo 2.0, fotos da Talyta (já reduzidas) e a imagem de prévia do link |
| `favicon.svg`, `favicon-32.png`, `apple-touch-icon.png` | ícones da aba e do atalho no celular |
| `robots.txt`, `sitemap.xml` | pro Google achar e ler a página |

## Colocar no ar (uma vez só) · Cloudflare Pages, gratuito

1. Crie uma conta gratuita em dash.cloudflare.com, com o e-mail da TK.
2. Em **Workers e Pages → Criar → Pages → Enviar arquivos (Upload assets)**, dê o nome `tk-filmes` ao projeto e arraste **o conteúdo desta pasta** (`index.html`, `assets`, etc., não a pasta de fora). Clique em **Implantar**. O site já abre num endereço provisório `tk-filmes.pages.dev`: confira no celular.
3. Ainda na Cloudflare, **Adicionar site → tkfilme.com.br → plano Free**. Ela mostra dois "servidores de nome" (nameservers).
4. No **Registro.br**, entre no domínio tkfilme.com.br → **Alterar servidores DNS** → cole os dois da Cloudflare. A troca leva de algumas horas a um dia.
5. De volta ao projeto `tk-filmes` no Pages → **Domínios personalizados → Configurar** → `tkfilme.com.br`. Repita com `www.tkfilme.com.br`. O cadeado (HTTPS) é ativado sozinho.
6. Teste: abra tkfilme.com.br no celular, toque em cada botão de WhatsApp e mande o link pra você mesma no WhatsApp pra ver a prévia.

Atualizar depois: no projeto do Pages, **Criar nova implantação** e arraste a pasta de novo.

## Link da bio do Instagram

`https://tkfilme.com.br/?utm_source=instagram&utm_medium=bio`
A etiqueta no fim separa, nos relatórios, quem veio da bio de quem veio de outro lugar. Em stories, troque `bio` por `stories`.

## Ligar a medição (quando quiser)

Abra `assets/js/site.js` e preencha os IDs no topo (`ga4`, `metaPixel`, `clarity`). Enquanto estiverem vazios, nada de fora é carregado e o aviso de cookies nem aparece. Preenchido qualquer um, o aviso aparece e os medidores só ligam depois do "Aceitar". Cada clique em WhatsApp vira o evento `clique_whatsapp`, com o serviço (abertura, estrategia, videos, marca, sites, chamada, fixo, topo, rodape).

## Trabalhos e depoimentos (quando os clientes autorizarem)

Ficaram **fora** da página publicada: nome de cliente, imagem e depoimento só entram com autorização (regra do Brand Book). Quando autorizar, cole no `index.html`, no lugar do comentário `TRABALHOS e DEPOIMENTOS`, e troque o link "Como funciona" da abertura por `<a class="link-sublinhado" href="#trabalhos">Ver trabalhos</a>`:

```html
<section class="secao" id="trabalhos" aria-labelledby="t-trabalhos">
  <div class="wrap">
    <div class="cabeca-secao">
      <p class="rotulo">Trabalhos</p>
      <h2 class="titulo-secao" id="t-trabalhos">Cada projeto começa entendendo o negócio.</h2>
    </div>
    <div class="grade-2">
      <article class="caso">
        <img src="/assets/img/caso-NOME.jpg" width="900" height="675" alt="DESCRIÇÃO DA IMAGEM" loading="lazy">
        <p class="rotulo">SEGMENTO · CIDADE/UF</p>
        <h3>NOME DO CLIENTE</h3>
        <p>O que a TK fez.</p>
        <p class="nota">Resultado: DADO AUTORIZADO.</p>
      </article>
      <!-- repita o <article> pra cada case -->
    </div>
  </div>
</section>

<section class="secao secao--branca" aria-labelledby="t-depoimentos">
  <div class="wrap">
    <h2 class="rotulo" id="t-depoimentos">Quem já trabalha com a TK</h2>
    <div class="grade-2" style="margin-top: 40px">
      <figure class="depoimento">
        <blockquote>PALAVRAS DO CLIENTE, COMO ELE ESCREVEU.</blockquote>
        <figcaption>NOME · NEGÓCIO</figcaption>
      </figure>
    </div>
  </div>
</section>
```

Cases de saúde e de advocacia: só o trabalho de comunicação (perfil, vídeos de autoridade). Nunca paciente, antes e depois, nem cliente ou processo do escritório.

## Pendências

- Autorização dos 4 clientes (Galeguinho, Tamara Chagas, Ary Magalhães, Dra. Camilla) e 2 depoimentos.
- A política de privacidade é um texto-base: vale uma revisão jurídica antes de ligar os medidores.
- Fotos novas da Talyta, quando houver ensaio: trocar os 6 arquivos `talyta-*.jpg` mantendo os nomes (900 e 480 px de largura).
