"""Carrossel contínuo (panorâmico) da palestra de Outubro Rosa pro feed do escritório.
Uma tela de 6 x 1080 x 1350 cortada em 6 slides: fotos e a linha rosa atravessam as emendas
(nunca rosto nem texto em cima da emenda). uso: python carrossel.py -> carrossel/01..06.jpg
"""
import pathlib
from playwright.sync_api import sync_playwright
from PIL import Image

AQUI = pathlib.Path(__file__).resolve().parent
FOTOS = (AQUI / "fotos").as_uri()
MARCA = (AQUI.parent.parent / "marca").as_uri()
N, W, H = 6, 1080, 1350
F = '<link href="https://fonts.googleapis.com/css2?family=Inter:wght@200;300;400;500;600;700;800&display=swap" rel="stylesheet">'
CSS = f"""*{{margin:0;padding:0;box-sizing:border-box}}
body{{width:{N * W}px;height:{H}px;overflow:hidden;font-family:'Inter',sans-serif;background:#f5e9e9;color:#2b1a20;position:relative}}
.ph{{position:absolute;overflow:hidden;border-radius:6px;box-shadow:0 30px 60px -30px rgba(90,40,55,.35);z-index:2}}
.ph img{{width:100%;height:100%;object-fit:cover;display:block}}
.tx{{position:absolute;z-index:3}}
.k{{display:flex;align-items:center;gap:16px;font-size:22px;letter-spacing:.3em;font-weight:600;color:#b05f78}}
.k:before{{content:"";width:46px;height:2px;background:#b05f78}}
h1{{font-size:100px;line-height:1;letter-spacing:-.05em;font-weight:200;margin-top:26px}}
h2{{font-size:66px;line-height:1.04;letter-spacing:-.04em;font-weight:200;margin-top:20px}}
h1 b,h2 b{{font-weight:800;color:#a24e69}}
p{{font-size:32px;line-height:1.45;color:#4a3239;margin-top:26px}}
p b{{font-weight:700;color:#2b1a20}}
.q{{font-size:84px;line-height:1.05;letter-spacing:-.045em;font-weight:200}}
.q b{{font-weight:800;color:#a24e69}}
.pg{{position:absolute;top:96px;font-size:20px;letter-spacing:.2em;font-weight:600;color:#b05f78;z-index:3}}
.fonte{{font-size:20px;color:#7a6067;margin-top:22px}}
svg.linha{{position:absolute;left:0;top:0;z-index:1}}
"""


def ph(arq, x, y, w, h, pos="50% 40%"):
    return f'<div class="ph" style="left:{x}px;top:{y}px;width:{w}px;height:{h}px"><img src="{FOTOS}/{arq}" style="object-position:{pos}"></div>'


def tx(x, y, w, html):
    return f'<div class="tx" style="left:{x}px;top:{y}px;width:{w}px">{html}</div>'


LINHA = f"""<svg class="linha" width="{N * W}" height="{H}" viewBox="0 0 {N * W} {H}"><path d="M -20 1290 C 300 1290, 500 900, 900 900 C 1300 900, 1400 1325, 1800 1325 C 2300 1325, 2700 1320, 3000 1000 C 3300 700, 3400 450, 3800 420 C 4150 400, 4250 650, 4400 950 C 4600 1300, 4900 1300, 5100 1000 C 5300 700, 5400 450, 5700 450 C 5900 450, 6000 450, 6150 500 C 6350 560, 6320 900, 6306 1200"
fill="none" stroke="#d29aab" stroke-width="3" stroke-linecap="round"/></svg>"""

LACO = """<svg viewBox="0 0 60 90" style="position:absolute;left:6282px;top:1196px;width:48px;z-index:3"><path d="M30 34 C14 14 18 2 30 2 C42 2 46 14 30 34 Z M30 34 L10 86 L20 88 L30 50 L40 88 L50 86 Z" fill="#f5e9e9" stroke="#b05f78" stroke-width="4" stroke-linejoin="round"/></svg>"""

pags = "".join(f'<div class="pg" style="left:{i * W + W - 190}px">{i + 1:02d} / {N:02d}</div>' for i in range(1, N))

CORPO = LINHA + LACO + pags + f"""
<img src="{MARCA}/logo-escuro-recortado.png" style="position:absolute;left:90px;top:80px;width:150px;z-index:3">
""" + tx(90, 330, 640, '<div class="k">OUTUBRO ROSA · 02.10</div><h1>Uma sexta para <b>cuidar da gente.</b></h1>') \
    + tx(90, 800, 520, '<p>Paramos o escritório para um momento só nosso: as mulheres que fazem a Tamara Chagas Advocacia acontecer todos os dias.</p>'
         '<div class="k" style="margin-top:60px">ARRASTE</div>') \
    + ph("evento-25.jpg", 700, 700, 760, 560, "50% 22%") \
    + ph("evento-15.jpg", 1560, 160, 500, 600, "55% 45%") \
    + tx(1560, 790, 520, '<div class="k">UMA CONVERSA QUE CUIDA</div><h2>Informação <b>também é cuidado.</b></h2>'
         '<p>Uma palestra linda sobre prevenção do câncer de mama: sinais do corpo, mamografia e autoexame.</p>') \
    + tx(2250, 200, 600, '<div class="q">“Todo guerreiro carrega <b>uma marca.</b>”</div>'
         '<p style="font-size:26px;margin-top:22px">Nossa palestrante, contando a própria história.</p>') \
    + tx(2250, 760, 560, '<p>Ela mostrou o autoexame na prática e deixou o recado: ele ajuda a conhecer o corpo, mas <b>não substitui a consulta e os exames.</b></p>'
         '<div class="fonte">Fonte: INCA, Instituto Nacional de Câncer</div>') \
    + ph("evento-16.jpg", 2980, 380, 660, 880, "50% 30%") \
    + ph("evento-21.jpg", 3700, 160, 560, 530, "55% 30%") \
    + tx(3700, 730, 540, '<div class="k">OUVIDOS ATENTOS</div><h2>Coração <b>aberto.</b></h2>'
         '<p>Cada uma cuida de tantas famílias no dia a dia. Nesse dia, o cuidado foi com elas.</p>') \
    + ph("evento-22.jpg", 4260, 700, 660, 550, "50% 42%") \
    + tx(4420, 130, 820, '<div class="k">FOI DE VERDADE</div><h2>Teve riso, <b>teve emoção.</b></h2>'
         '<p>Teve quem riu, teve quem chorou, e todo mundo saiu de lá um pouquinho diferente.</p>') \
    + ph("evento-13.jpg", 4990, 760, 300, 490, "45% 30%") \
    + ph("evento-12.jpg", 5330, 150, 440, 560, "65% 35%") \
    + ph("evento-18.jpg", 5860, 170, 520, 660, "50% 40%") \
    + tx(5500, 880, 780, '<div class="k">UM RECADO PRA VOCÊ</div><h2 style="font-size:78px">Cuide de você. <b>Faça seus exames.</b></h2>'
         '<p>Obrigada à nossa palestrante por tanto carinho 💗</p>')


def main():
    out = AQUI / "carrossel"; out.mkdir(exist_ok=True)
    h = out / "_tela.html"
    h.write_text(f'<!doctype html><html><head><meta charset="utf-8">{F}<style>{CSS}</style></head><body>{CORPO}</body></html>', encoding="utf8")
    with sync_playwright() as p:
        b = p.chromium.launch(); pg = b.new_page(viewport={"width": N * W, "height": H})
        pg.goto(h.as_uri()); pg.wait_for_load_state("networkidle"); pg.evaluate("document.fonts.ready")
        pg.screenshot(path=str(out / "_tela.png")); b.close()
    tela = Image.open(out / "_tela.png").convert("RGB")
    for i in range(N):
        tela.crop((i * W, 0, (i + 1) * W, H)).save(out / f"{i + 1:02d}.jpg", quality=93)
    tela.resize((N * W // 4, H // 4)).save(out / "_previa.jpg", quality=88)
    h.unlink()
    print("ok", out)


if __name__ == "__main__":
    main()
