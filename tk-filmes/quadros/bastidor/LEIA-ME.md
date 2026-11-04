# Quadro "Bastidor TK" (criado em 2026-10-29)

Dois formatos de reels da @tk.filmes feitos com os brutos reais de um cliente:

Linha visual (v2, 2026-10-30, depois da Talyta achar a v1 "amadora"): marrom do site, creme, caramelo só em detalhe,
Instrument Serif nos títulos (subindo palavra a palavra), pouca coisa na tela, grão e vinheta leves. Nada de UI falsa.

- **Sem direção × Com direção** (`AntesDepois` no Remotion; v3 de 2026-10-30, ref. TikTok "resultado em 3, 2, 1"):
  compilado de erros e inseguranças (6 a 7 trechos de 3 a 5 s, cada um INTEIRO, com a pausa e a reação depois do erro,
  separados por uma escurecida curta; cortes em cima um do outro não passam a sensação de estar perdido; som original,
  imagem LAVADA: pouca cor e contraste baixo, não cinza) → nos últimos 3 s entra a contagem 3, 2, 1 GRANDE EM CIMA, com brilho
  (um por segundo, tique forte), e embaixo a frase em duas linhas bem juntas, caixa alta e grossa: "COM MARKETING /
  ESTRATÉGICO EM" ("marketing estratégico" em dourado), com batida e som de impacto. Recusadas: serifa itálica empilhada
  e linha única com etiqueta dourada → clarão de luz
  com sopro (sem "JÁ!", ela tirou) que revela o vídeo pronto INTEIRO, colorido. Efeitos sonoros no volume máximo. Sem cartela, legenda de take
  nem assinatura. Trecho de erro só onde a pessoa aparece (nada de take de rua ou sala vazia).
- **Antes × depois da edição** (`AntesDepoisEdicao`, na linha da referência do Pinterest que a Talyta mandou): o editado
  abre em tela cheia e assenta à direita, o bruto entra à esquerda, os dois rodam juntos com o som do editado; no meio,
  sempre a frase fixa da TK ("Cada corte, imagem e detalhe precisa dar continuidade…", `FRASE_TK`) com o logo; embaixo,
  uma tira com quadros reais do vídeo pronto e o cursor no tempo dele → "Do bruto ao post." + logo.

**Antes de postar: autorização por escrito do cliente** (o "sem direção" mostra os erros dele). Rótulo descreve a
situação, nunca ri da pessoa.

## Como fazer um episódio novo
1. Transcrever os takes: `python scripts/transcrever-takes.py <pasta Bruto do Drive> analise/<id>` (gera `_resumo.txt`).
2. Folha de quadros: `python scripts/folha-takes.py <pasta Bruto> analise/folha-<id>` (linguagem corporal).
3. Escolher 4 a 6 momentos da mesma peça (fala esquecida, tropeço, frase repetida, take interrompido, mão/corpo travado)
   e cortar: `powershell -File scripts/cortar-falhas.ps1 <id> <pasta Bruto> "IMG_0595:0.5:5.2" ...`
4. Miniaturas + bruto + pronto em H.264: `powershell -File scripts/preparar-midia.ps1 -id <id> -brutos ... -bruto ... -pronto ...`
5. Episódio em `videos/remotion/src/bastidor-<id>.json` (falhas, trecho do pronto com as mesmas falas, números reais)
   e as duas composições no `Root.tsx`.
6. Render + acabamento: `powershell -File scripts/render-bastidor.ps1 AntesDepois<Id> Timelapse<Id>` → `videos/remotion/out/bastidor/`.

## Carrossel do episódio (3 imagens 1080x1350, `Carrossel<Id>1..3` no Remotion, texto em `src/carrossel-<id>.json`)
1. **Capa (modelo v2, refs. "eu revelo" / "público certo" / "Branding?"):** foto da Talyta COM AMBIENTE (escritório, mármore),
   rosto na metade de cima e roupa escura embaixo, da pasta `H:\Meu Drive\TK FILMES\IDENTIDADE VISUAL\FOTOS - TALYTA KUMY`
   (não repetir foto em carrosséis seguidos). Copiar pra `public/carrossel/<id>/capa.jpg` e gerar o recorte
   (`python scripts/recortar.py .../capa.jpg .../recorte-capa.png`, vira o brilho em volta dela). Texto no json: `chamada`
   (etiqueta clara), `grande` (palavra gigante em serifa itálica sobre o corpo), `sub` + `subDestaque` (sublinhado).
   O modelo v1 (fundo liso estendido com `compor-capa.py`, título no canto) ela não gostou.
2. **Páginas 2 e 3:** frame do cliente com `scripts/escolher-frames.py` (`BOCA_MAX=0.12`, `PLANO=aberto`) e conferido no olho;
   na página 2, `recortar.py` → `recorte-p2.png` pra o título ficar atrás da cabeça.
3. Texto: frase de efeito, direta, nunca descrevendo o que foi feito.

Neste PC o Remotion renderiza com o Chrome instalado (`--browser-executable`), porque o navegador interno não baixa.

## Episódios
- 2026-10-29 · Start Fitness (chamada da 2ª Corrida) e Dra. Anna Líbya (apresentação). Legendas em `H:\Meu Drive\Bastidor TK - LEGENDAS.txt`.
- 2026-11-04 · Pingo de Gente (chamada da Live Black Day): **só "Pós-produção × Resultado final"** (`EdicaoPingo`; o vídeo
  chegou cortado, sem takes de erro; o "bruto" é o vídeo cortado sem efeitos) + carrossel (`CarrosselPingo1..3`, capa com a
  foto 19_38_46-2). Render com `--concurrency=2` (com o padrão o leitor de vídeo do Remotion caiu: "Request closed").
  Modelo criança, sem contrato: **não postar sem autorização por escrito dos responsáveis**.
