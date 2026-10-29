"""Calendário de postagem dos reels e posts fixos da diária de 2026-10-24 (27/10 a 30/11).
Gera o markdown editável e o HTML/PDF (Chrome headless). Uso: python gerar_calendario_reels.py
"""
import html, os, subprocess
from PIL import Image

AQUI = os.path.dirname(os.path.abspath(__file__))
POSTS = os.path.join(AQUI, "..", "posts", "2026-10")
OUT_V = os.path.join(AQUI, "..", "edicao", "video", "out")
IMG = os.path.join(AQUI, "_img-calendario-reels")
NOME = "2026-10-11-calendario-reels-e-posts"
CHROME = r"C:\Program Files\Google\Chrome\Application\chrome.exe"

# (data, dia, formato, tema, objetivo, situação, legenda (pasta em posts/2026-10), imagem)
ITENS = [
    ("27/10", "ter", "Carrossel", "Agenda de fim de ano aberta", "vender", "já agendado · 12h", None, None),
    ("28/10", "qua", "Reel", "Mechas antes ou depois do alisamento?", "autoridade", "pronto", "07-2026-10-28-mechas-antes-ou-depois", "capa-mechas-antes-ou-depois.png"),
    ("29/10", "qui", "Post fixo", "Primeiro as mechas, depois a selagem", "salvar", "pronto", "08-mechas-antes-ou-depois-post", "post-mechas-antes-ou-depois.png"),
    ("30/10", "sex", "Reel", "Eu também faço sobrancelha", "vender", "pronto", "13-sobrancelha-reel", "capa-sobrancelha.png"),
    ("31/10", "sáb", "Post fixo", "Do jeitinho do seu rosto", "vender", "pronto", "14-sobrancelha-post", "post-sobrancelha.png"),
    ("03/11", "ter", "Carrossel", "Cuidados pra sua selagem durar mais", "autoridade", "já agendado · 12h", None, None),
    ("04/11", "qua", "Reel", "Estética ou saúde?", "conexão", "pronto", "15-estetica-ou-saude-reel", "capa-estetica-ou-saude.png"),
    ("05/11", "qui", "Post fixo", "Cabelo bonito é cabelo saudável", "conexão", "pronto", "16-estetica-ou-saude-post", "post-estetica-ou-saude.png"),
    ("06/11", "sex", "Reel", "Muito prazer, Ary Magalhães", "conexão", "pronto", "17-muito-prazer-reel", "capa-muito-prazer.png"),
    ("07/11", "sáb", "Post fixo", "Muito prazer, eu sou a Ary Magalhães", "conexão", "pronto", "18-muito-prazer-post", "post-muito-prazer.png"),
    ("10/11", "ter", "Carrossel", "Depoimentos de clientes", "prova", "esperando prints reais da Ary", None, None),
    ("11/11", "qua", "Reel", "3 coisas que acabam com a sua selagem", "autoridade", "pronto", "09-selagem-3-coisas-reel", "capa-selagem-3-coisas.png"),
    ("12/11", "qui", "Post fixo", "Pra sua selagem durar, faça a sua parte em casa", "salvar", "pronto", "10-selagem-3-coisas-post", "post-selagem-3-coisas.png"),
    ("17/11", "ter", "Carrossel", "Antes e depois de outubro", "atrair", "esperando fotos autorizadas", None, None),
    ("18/11", "qua", "Reel", "Cabelo de salão em casa", "autoridade", "pronto", "11-cabelo-de-salao-em-casa-reel", "capa-cabelo-de-salao-em-casa.png"),
    ("19/11", "qui", "Post fixo", "O cuidado continua em casa", "salvar", "pronto", "12-cabelo-de-salao-em-casa-post", "post-cabelo-de-salao-em-casa.png"),
    ("20/11", "sex", "Post", "Dia Nacional de Zumbi e da Consciência Negra", "data", "já agendado · 12h", None, None),
    ("24/11", "ter", "Carrossel", "Black Friday do salão", "vender", "esperando a oferta da Ary", None, None),
    ("30/11", "seg", "Stories", "Últimas vagas de dezembro", "vender", "pronto · postar pelo celular com link", None, None),
]


def legenda(pasta):
    return open(os.path.join(POSTS, pasta, "legenda.txt"), encoding="utf-8").read().strip() if pasta else ""


def miniatura(nome):
    os.makedirs(IMG, exist_ok=True)
    dst = os.path.join(IMG, nome.replace(".png", ".jpg"))
    if not os.path.exists(dst):
        im = Image.open(os.path.join(OUT_V, nome)).convert("RGB")
        im.thumbnail((540, 960)); im.save(dst, quality=85)
    return dst


def markdown():
    l = ["# Ary Magalhães · calendário de postagem · 27/10 a 30/11/2026", "",
         "Reels e posts fixos da diária de falas de 2026-10-24, encaixados no que já estava agendado (grade aprovada pela Talyta",
         "em 2026-10-24). Tudo ao meio-dia. Cada reel sai com o post fixo do mesmo tema no dia seguinte.", "",
         "Ritmo: carrossel na terça · reel na quarta · post fixo na quinta. Os conteúdos de selagem ficam espaçados porque",
         "o carrossel de 03/11 repete as mesmas dicas (decisão: manter o carrossel).", "",
         "| data | formato | conteúdo | objetivo | situação |", "|---|---|---|---|---|"]
    for d, dia, f, t, o, s, _, _ in ITENS:
        l.append(f"| {dia} {d} | {f.lower()} | {t} | {o} | {s} |")
    l += ["", "Arquivos prontos no Drive: `CONTEÚDOS/2026-10 · OUTUBRO/Reel · <tema>` e `Post · <tema>` (vídeo ou imagem, capa e legenda).",
          "", "## Pendências", "- Arquivos da câmera que ainda não subiram: IMG_6487, 6488, 6490, 6492, 6495 a 6501 e 6503, 6504 (o 6502, apresentação, chegou em 2026-10-25).",
          "- Prints reais de depoimentos (10/11), fotos de antes e depois autorizadas (17/11), oferta de Black Friday (24/11).",
          "- Stories de cada post (regra da Ary: 5 a 10 por post): a produzir.", "", "## Legendas", ""]
    for d, dia, f, t, o, s, pasta, _ in ITENS:
        if pasta:
            l += [f"### {dia} {d} · {f} · {t}", "", "```", legenda(pasta), "```", ""]
    return "\n".join(l)


CSS = """
@import url('https://fonts.googleapis.com/css2?family=Bodoni+Moda:ital,wght@0,400;0,500;1,400&family=Poppins:wght@300;400;500;600&display=swap');
@page { size: A4; margin: 0; }
* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: 'Poppins', sans-serif; color: #2B1E15; background: #FAF7F2; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
.pagina { width: 210mm; height: 297mm; padding: 18mm 16mm; page-break-after: always; position: relative; overflow: hidden; }
.capa { padding: 0; background: #141210; }
.capa img { width: 100%; height: 100%; object-fit: cover; object-position: center 25%; filter: sepia(.16) brightness(.9); }
.capa .veu { position: absolute; inset: 0; background: linear-gradient(to bottom, rgba(20,15,11,0) 45%, rgba(20,15,11,.82) 72%, rgba(20,15,11,.92)); }
.capa .txt { position: absolute; left: 16mm; right: 16mm; bottom: 26mm; text-align: center; color: #F6EFE4; }
.caps { font-size: 9.5pt; letter-spacing: 4px; text-transform: uppercase; }
.capa h1 { font-family: 'Bodoni Moda', serif; font-weight: 400; font-size: 44pt; line-height: 1.02; margin: 4mm 0 3mm; }
.capa p { font-weight: 300; font-size: 12pt; }
.assin { display: flex; gap: 10px; align-items: center; justify-content: center; margin-top: 8mm; font-size: 8.5pt; letter-spacing: 5px; }
.assin i { display: block; width: 40px; height: 1px; background: #CBA14F; }
h2 { font-family: 'Bodoni Moda', serif; font-weight: 400; font-size: 26pt; color: #5A3E2B; margin-bottom: 2mm; }
.sub { font-size: 9.5pt; color: #6B5A4B; margin-bottom: 5mm; line-height: 1.5; }
table { width: 100%; border-collapse: collapse; font-size: 8.6pt; }
th { text-align: left; font-weight: 500; font-size: 7.5pt; letter-spacing: 2px; text-transform: uppercase; color: #A9803F; padding: 0 2mm 2.5mm; border-bottom: 1px solid #D8C9B5; }
td { padding: 1.9mm 2mm; border-bottom: 1px solid #EDE6DC; vertical-align: top; }
td.data { white-space: nowrap; font-weight: 500; color: #5A3E2B; }
tr.novo td { background: #F3EBDD; }
.tag { display: inline-block; font-size: 7pt; letter-spacing: 1.5px; text-transform: uppercase; padding: 1px 6px; border: 1px solid #CBA14F; border-radius: 10px; color: #8E6440; }
.sit { color: #6B5A4B; font-size: 8.3pt; }
.legenda-chave { margin-top: 6mm; font-size: 8pt; color: #6B5A4B; }
.bloco { display: grid; grid-template-columns: 58mm 1fr; gap: 9mm; margin-bottom: 10mm; page-break-inside: avoid; }
.bloco img { width: 58mm; border-radius: 3mm; box-shadow: 0 3mm 8mm rgba(43,30,21,.18); }
.bloco .data { font-family: 'Bodoni Moda', serif; font-size: 22pt; color: #5A3E2B; line-height: 1; }
.bloco .meta { font-size: 8pt; letter-spacing: 2px; text-transform: uppercase; color: #A9803F; margin: 2mm 0 3mm; }
.bloco h3 { font-family: 'Bodoni Moda', serif; font-weight: 400; font-size: 15pt; margin-bottom: 3mm; }
.bloco pre { white-space: pre-wrap; font-family: 'Poppins', sans-serif; font-size: 8.4pt; line-height: 1.5; color: #3A2C22; background: #F3EBDD; padding: 4mm; border-radius: 2mm; }
.rodape { position: absolute; bottom: 9mm; left: 16mm; right: 16mm; font-size: 7.5pt; letter-spacing: 3px; color: #A9803F; text-align: center; }
"""


def html_doc():
    e = html.escape
    capa_foto = "file:///" + os.path.abspath(os.path.join(AQUI, "..", "edicao", "video", "public", "midia", "fotos", "IMG_6506.jpg")).replace("\\", "/")
    p = [f"<!doctype html><html lang='pt-BR'><head><meta charset='utf-8'><style>{CSS}</style></head><body>"]
    p.append(f"<section class='pagina capa'><img src='{capa_foto}'><div class='veu'></div><div class='txt'><div class='caps'>Calendário de postagem</div>"
             "<h1>27 de outubro<br>a 30 de novembro</h1><p>6 reels e 6 posts fixos da diária de falas, encaixados na agenda</p>"
             "<div class='assin'><i></i>ARY MAGALHÃES<i></i></div></div></section>")
    linhas = "".join(
        f"<tr class='{'novo' if pasta or 'reservado' in s else ''}'><td class='data'>{dia} {d}</td><td><span class='tag'>{e(f)}</span></td>"
        f"<td>{e(t)}</td><td>{e(o)}</td><td class='sit'>{e(s)}</td></tr>" for d, dia, f, t, o, s, pasta, _ in ITENS)
    p.append("<section class='pagina'><h2>Visão geral</h2><div class='sub'>Tudo ao meio-dia. Cada reel sai com o post fixo do mesmo tema no dia seguinte. "
             "Ritmo: carrossel na terça, reel na quarta, post fixo na quinta.<br>Em destaque: os conteúdos novos desta diária.</div>"
             f"<table><tr><th>data</th><th>formato</th><th>conteúdo</th><th>objetivo</th><th>situação</th></tr>{linhas}</table>"
             "<div class='legenda-chave'><b>Esperando a Ary:</b> "
             "prints de depoimentos, fotos de antes e depois autorizadas e a oferta de Black Friday.</div>"
             "<div class='rodape'>ARY MAGALHÃES · @CABELOSMAGALHAES</div></section>")
    novos = [i for i in ITENS if i[6]]
    for k in range(0, len(novos), 2):
        blocos = ""
        for d, dia, f, t, o, s, pasta, img in novos[k:k + 2]:
            src = "file:///" + os.path.abspath(miniatura(img)).replace("\\", "/")
            blocos += (f"<div class='bloco'><img src='{src}'><div><div class='data'>{dia} {d}</div><div class='meta'>{e(f)} · {e(o)} · 12h</div>"
                       f"<h3>{e(t)}</h3><pre>{e(legenda(pasta))}</pre></div></div>")
        p.append(f"<section class='pagina'>{blocos}<div class='rodape'>ARY MAGALHÃES · @CABELOSMAGALHAES</div></section>")
    p.append("</body></html>")
    return "".join(p)


def main():
    open(os.path.join(AQUI, NOME + ".md"), "w", encoding="utf-8").write(markdown())
    h = os.path.join(AQUI, NOME + ".html")
    open(h, "w", encoding="utf-8").write(html_doc())
    pdf = os.path.join(AQUI, NOME + "-ary-magalhaes.pdf")
    subprocess.run([CHROME, "--headless=new", "--no-pdf-header-footer", "--virtual-time-budget=8000", f"--print-to-pdf={pdf}",
                    "file:///" + os.path.abspath(h).replace("\\", "/")], check=True, capture_output=True)
    print("ok:", pdf, os.path.getsize(pdf) // 1024, "KB")


if __name__ == "__main__":
    main()
