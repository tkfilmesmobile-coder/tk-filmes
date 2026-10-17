<!-- quem alimenta: o /setup semeia; o /atualizar acrescenta quando a identidade muda. Lido antes de qualquer peça que sai pra fora (gatilho de ação). -->
# Guia de Design · TK Filmes

> Toda skill que cria peça visual (carrossel, proposta, slide, página) lê este arquivo antes de começar.
> Tom com o cliente: `tom-de-voz.md`, nesta pasta.

---

## Cores

- **Fundo principal:** off-white quente `#FAF6F3` (alternativa creme `#FFF1CC`)
- **Cor de destaque / CTA:** caramelo `#CD9365`
- **Texto principal:** marrom escuro `#5A3A2E` (títulos) · marrom `#8D6545` (textos e logo)
- **Fundo alternativo / cards:** branco `#FFFFFF` · bege `#C4AE98` em faixas e rodapés (papel timbrado)
- **Detalhes:** dourado metálico (elementos 3D, filetes, ornamentos)
- **Cor proibida:** [a definir]

---

## Tipografia

- **Títulos e destaques:** sans-serif em caixa alta, peso bem pesado (ex.: "TRABALHO FINALIZADO"); linha de apoio em caixa alta fina acima
- **Corpo, subtítulos e botões:** sans-serif limpa (Open Sans no papel timbrado)
- **Assinatura:** "Talyta Kumy" em manuscrito/caligráfico
- **Peso do título:** 800-900

---

## Brand Book 2.0 (2026-10-13): direção visual
Estética clássica e sofisticada, com espaço, elegância e boa leitura; cores creme, caramelo e marrom (os HEX acima são a proposta inicial, a confirmar em prova de tela e impressão). Caramelo só em detalhe, divisor e destaque grande; texto pequeno em creme não, por contraste. **Evitar** brilho em excesso, ornamentos 3D e efeitos que concorram com a imagem: os foguetes dourados 3D e os cantos de papel dobrado dourado saem das peças novas. Elementos: linhas finas, grade discreta, margem generosa, moldura editorial, símbolo K aplicado com sutileza. Tipografia: serifa editorial pros títulos (Instrument Serif) e sans pro texto (Montserrat ou Lato), sujeito a teste. Logo: preservar o K; versões a criar: principal, horizontal, só K, fundo creme, fundo marrom, monocromática. Nome da empresa: **TK Filmes**; padronizar os documentos legais e comerciais (hoje "TK Movies") está pendente.

## Estilo geral

Clean, quente e elegante. Muito respiro, fundo claro, moldura branca com cantos arredondados pro conteúdo, toque premium com elementos dourados/prateados 3D (ex.: foguetes) e cantos de papel dobrado dourado. O símbolo em "K" aparece grande e bem clarinho como marca d'água.

---

## Elementos-chave

- Bordas: sem borda aparente; filete dourado fino com ornamento
- Border-radius dos cards: ~40px no formato story
- Botões: [a definir]
- Sombras: suaves

---

## O que NUNCA fazer

[a definir]

---

## Logo

- **Arquivo:** `logo.svg` (símbolo K caramelo + "TALYTA KUMY / MOVIES" em marrom)
- **Ícone:** `icone-preto.svg` (só o símbolo, preto)
- **Foto de perfil:** `foto-perfil.svg` (logo sobre fundo creme)
- **Marca d'água:** `marca-dagua.svg`
- **Referências:** `papel-timbrado.pdf`, `destaques.pdf`
- **Versão pra fundo escuro:** [não tem; usar símbolo em creme/caramelo]
- **Tamanho sugerido:** largura entre 120-200px nos HTMLs

---

## Perfil do autor

- **Nome:** TK Filmes
- **Handle:** @tk.filmes (desde 2026-09-29)
- **Foto:** `foto-perfil.svg`
- **Badge verificado:** não

---

## Feed do Instagram da TK (linha aprovada em 2026-09-29)

- **Formatos:** imagem única 1080x1350 (frase, tweet, conversa, bastidor) e reels. **Sem carrossel.**
- **Fundo:** papel claro com textura e luz de folhagem entrando pelo canto (no tweet, branco puro, fiel ao print do Twitter).
- **Tipografia:** Instrument Serif nos títulos, **sem itálico**; Montserrat no apoio (Inter no tweet). Destaque só pela cor caramelo, com elipse fina em volta; nada de caixa alta no destaque.
- **Moldura:** "Talyta Kumy · Nº xx" em cima, "Direção de conteúdo · @tk.filmes" embaixo, com fios finos; rótulo pequeno em caixa alta acima do título.
- **Fotos:** só as de `tk-filmes/fotos/` (regras em `_uso.md`): leves, claras, de ação e detalhe.
- **Gerador:** `tk-filmes/modelos/pecas.py` (frase, tweet, conversa, bastidor2).
- **Stories (linha aprovada em 2026-10-10):** 1080x1920, foto inteira com véu mínimo, letra fina e pequena em Nunito (sem itálico), rótulos "TK Filmes · @tk.filmes" em caixa alta fina nos cantos, caramelo só no destaque, círculos numerados nas listas, rodapé "salva isso". Sem cartão, sem capa bege. Gerador `tk-filmes/modelos/stories.py` (capa, sobre, leve, lista; o aprovado é o `leve`).

---

## Observações adicionais

Nome no material institucional: TK MOVIES · Produção Audiovisual e Criativa · CNPJ 62.942.423/0001-88 · tkfilmesmobile@gmail.com · (82) 9 9120-2604.
