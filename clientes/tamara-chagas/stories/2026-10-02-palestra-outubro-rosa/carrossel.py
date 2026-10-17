"""Carrossel contínuo (panorâmico) da palestra de Outubro Rosa pro feed do escritório. Versão editorial.
Uma tela de 6 x 1080 x 1350 cortada em 6 slides. Grade fixa, filetes contínuos no topo e no rodapé,
fotos retas alinhadas à grade; três fotos atravessam emendas (1-2, 3-4, 5-6), nunca com rosto nem texto
em cima da emenda. uso: python carrossel.py -> carrossel/01..06.jpg  (versão anterior em carrossel/_v1/)
"""
import pathlib
from playwright.sync_api import sync_playwright
from PIL import Image

AQUI = pathlib.Path(__file__).resolve().parent
FOTOS = (AQUI / "fotos").as_uri()
MARCA = (AQUI.parent.parent / "marca").as_uri()
N, W, H = 6, 1080, 1350
TOP, BOT = 210, 1190          # área útil das fotos
F = '<link href="https://fonts.googleapis.com/css2?family=Inter:wght@200;300;400;500;600;700&display=swap" rel="stylesheet">'
CSS = f"""*{{margin:0;padding:0;box-sizing:border-box}}
body{{width:{N * W}px;height:{H}px;overflow:hidden;font-family:'Inter',sans-serif;background:#f4efed;color:#1e1418;position:relative}}
.ph{{position:absolute;overflow:hidden}}
.ph img{{width:100%;height:100%;object-fit:cover;display:block;filter:saturate(.92)}}
.tx{{position:absolute}}
.k{{font-size:20px;letter-spacing:.32em;font-weight:600;color:#a85d74}}
.n{{font-size:20px;letter-spacing:.2em;font-weight:500;color:#1e1418;opacity:.55;margin-bottom:22px}}
h1{{font-size:92px;line-height:1.02;letter-spacing:-.045em;font-weight:200;margin-top:28px}}
h2{{font-size:62px;line-height:1.06;letter-spacing:-.035em;font-weight:200;margin-top:22px}}
h1 b,h2 b{{font-weight:600}}
p{{font-size:29px;line-height:1.5;color:#4d3e43;margin-top:28px}}
p b{{font-weight:600;color:#1e1418}}
.q{{font-size:70px;line-height:1.1;letter-spacing:-.035em;font-weight:200}}
.q b{{font-weight:600}}
.fonte{{font-size:19px;color:#7d6c71;margin-top:26px;letter-spacing:.02em}}
.fil{{position:absolute;left:0;width:{N * W}px;height:1px;background:rgba(30,20,24,.22)}}
.rod{{position:absolute;top:1262px;font-size:18px;letter-spacing:.28em;font-weight:600;color:#1e1418;opacity:.6}}
.cab{{position:absolute;top:104px;font-size:18px;letter-spacing:.28em;font-weight:600;color:#a85d74}}
"""


def ph(arq, x, y, w, h, pos="50% 40%"):
    return f'<div class="ph" style="left:{x}px;top:{y}px;width:{w}px;height:{h}px"><img src="{FOTOS}/{arq}" style="object-position:{pos}"></div>'


def tx(x, y, w, html):
    return f'<div class="tx" style="left:{x}px;top:{y}px;width:{w}px">{html}</div>'


# moldura contínua: filete no topo e no rodapé atravessando os 6 slides, cabeçalho e número em cada um
MOLDURA = '<div class="fil" style="top:170px"></div><div class="fil" style="top:1230px"></div>'
for i in range(N):
    x0 = i * W
    if i:
        MOLDURA += f'<div class="cab" style="left:{x0 + 90}px">OUTUBRO ROSA · 2026</div>'
    MOLDURA += f'<div class="rod" style="left:{x0 + W - 190}px">{i + 1:02d} / {N:02d}</div>'
MOLDURA += f'<img src="{MARCA}/logo-escuro-recortado.png" style="position:absolute;left:90px;top:44px;width:118px">'
MOLDURA += '<div class="rod" style="left:90px">TAMARA CHAGAS ADVOCACIA</div>'
MOLDURA += '<div class="rod" style="left:5490px">TAMARA CHAGAS ADVOCACIA</div>'
MOLDURA += '<div class="rod" style="left:640px;color:#a85d74;opacity:1">ARRASTE →</div>'

CORPO = MOLDURA \
    + tx(90, TOP + 10, 480, '<div class="k">OUTUBRO ROSA · 02.10</div><h1>Uma sexta para <b>cuidar da gente.</b></h1>') \
    + tx(90, 860, 520, '<p>Paramos o escritório para um momento só nosso, com as mulheres que fazem a Tamara Chagas Advocacia acontecer todos os dias.</p>') \
    + ph("evento-25.jpg", 700, TOP, 880, BOT - TOP, "50% 28%") \
    + tx(1640, TOP + 10, 440, '<div class="n">01</div><div class="k">A PALESTRA</div><h2>Informação <b>também é cuidado.</b></h2>'
         '<p>Uma conversa sobre a prevenção do câncer de mama: os sinais do corpo, a mamografia e o autoexame, com quem conhece o assunto na própria pele.</p>') \
    + tx(2250, TOP + 10, 540, '<div class="n">02</div><div class="k">A HISTÓRIA DELA</div>'
         '<div class="q" style="margin-top:30px">“Todo guerreiro carrega <b>uma marca.</b>”</div>') \
    + tx(2250, 840, 540, '<p>Ela mostrou o autoexame na prática e deixou o recado: ele ajuda a conhecer o corpo, mas <b>não substitui a consulta e os exames.</b></p>'
         '<div class="fonte">Fonte: INCA, Instituto Nacional de Câncer</div>') \
    + ph("evento-16.jpg", 2940, TOP, 760, BOT - TOP, "50% 26%") \
    + tx(3760, TOP + 10, 470, '<div class="n">03</div><div class="k">A EQUIPE</div><h2>Ouvidos atentos, <b>coração aberto.</b></h2>'
         '<p>Cada uma cuida de tantas famílias no dia a dia. Nesse dia, o cuidado foi com elas.</p>') \
    + ph("evento-21.jpg", 3760, 760, 470, BOT - 760, "55% 32%") \
    + ph("evento-22.jpg", 4410, TOP, 600, 470, "50% 40%") \
    + tx(4410, 740, 600, '<div class="n">04</div><div class="k">FOI DE VERDADE</div><h2>Teve riso, <b>teve emoção.</b></h2>'
         '<p>E todo mundo saiu de lá um pouquinho diferente.</p>') \
    + ph("evento-12.jpg", 5130, TOP, 660, BOT - TOP, "62% 30%") \
    + ph("evento-18.jpg", 5850, TOP, 540, 560, "50% 40%") \
    + tx(5850, 830, 540, '<div class="k">UM RECADO PRA VOCÊ</div><h2>Cuide de você. <b>Faça seus exames.</b></h2>'
         '<p style="font-size:26px">Obrigada à nossa palestrante por tanto carinho.</p>')


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
    tela.resize((N * W // 2, H // 2)).save(out / "_previa.jpg", quality=88)
    h.unlink()
    print("ok", out)


if __name__ == "__main__":
    main()
