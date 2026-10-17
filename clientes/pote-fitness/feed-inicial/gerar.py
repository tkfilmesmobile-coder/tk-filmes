# Gera os posts do feed inicial do Pote Fitness (1080x1350) nos 5 estilos do plano.md.
# Uso: python gerar.py [numeros...]   (sem argumento, gera todos)
import json, pathlib, sys, urllib.request
from playwright.sync_api import sync_playwright

BASE = pathlib.Path(__file__).resolve().parent
FOTOS, BUILD, SAIDA = BASE / "fotos", BASE / "build", BASE / "posts"
for p in (FOTOS, BUILD, SAIDA):
    p.mkdir(exist_ok=True)

# id do Unsplash -> (autor, caminho no CDN)
BANCO = {
    "zeFy-oCUhV8": ("Jo Sonn", "photo-1519996529931-28324d5a630e"),
    "2cXZQ862gws": ("Fatane Rahimi", "photo-1658431618300-a69b07fb5782"),
    "ldk7gPNNh3w": ("Adél Grőber", "photo-1613082487279-1e16f1e81505"),
    "DvrUdI-y3Dw": ("Margarida Afonso", "photo-1659821638991-c43fc142ec14"),
    "FGiTmCncTWQ": ("Hans Reniers", "photo-1531917658462-73450543c9f0"),
    "HLwc-ne0IQM": ("Yulia Khlebnikova", "photo-1568308853224-1f17b4084076"),
    "yo3kr2teY7w": ("Jenny Sherman", "photo-1727813581763-406c22e939bf"),
    "e3FJ-KVZvEw": ("Jakob Owens", "photo-1546913830-dab67cd3d3d8"),
    "scJ2u-CCb3E": ("Giancarlo Duarte", "photo-1596655094086-1224b0306852"),
    "7Hb-ZbR04Hc": ("Bruno Dias", "photo-1778092640135-af6d333c026c"),
    "xOYbXWGp-WQ": ("Bruno Dias", "photo-1781716288501-9467d44024f1"),
    "bULD0lNVXOA": ("Merve Aydın", "photo-1549007953-2f2dc0b24019"),
    "aFUHu9WNO3Q": ("Floh Keitgen", "photo-1563114773-84221bd62daa"),
    "ipmkJx06XFM": ("Pranjall Kumar", "photo-1617112848923-cc2234396a8d"),
    "8_Tlng54n8Y": ("Caroline Attwood", "photo-1492739159057-7d1896b3c63f"),
    "qvuqrj68_eI": ("Madeline Liu", "photo-1762980622899-d1dd9cdbc430"),
    "-4Ee0IbO1M4": ("Andrijana Bozic", "photo-1573850038488-ad1a0a86e853"),
    "AjwuMUdgjXI": ("Cosmin Ursea", "photo-1639389677904-4bbd9a580d32"),
    "_Zn_7FzoL1w": ("Brenda Godinez", "photo-1490474418585-ba9bad8fd0ea"),
    "sEK8OMsJJ08": ("VD Photography", "photo-1641642399576-487909d0ddbc"),
    "h4XEpzG4Y-I": ("VD Photography", "photo-1641642400143-6be68f1a0918"),
    "qIpeKKZgAfY": ("hana hana", "photo-1743956345250-4a43d73a7628"),
    "HQJ9B9YSGKc": ("Annie Spratt", "photo-1614947072338-4cde6296ead8"),
    "wK-elt11pF0": ("Jonas Leupe", "photo-1592890288564-76628a30a657"),
    "BjhUu6BpUZA": ("Priscilla Du Preez", "photo-1488509082528-cefbba5ad692"),
    "cr-Gh5A_9Nc": ("Kelli McClintock", "photo-1593733925160-6f78dc0be8b6"),
    "zRGs0d6Lntk": ("Kelvin Zyteng", "photo-1707736175510-96048f3374de"),
    "yTCDs4LBbQs": ("Waldemar Brandt", "photo-1552825896-8059df63a1fb"),
    "UFw41NOCOmw": ("Alicia Christin Gerald", "photo-1760881592698-abbf44a47872"),
    "1N7Ftmynp48": ("Emmanuel Phaeton", "photo-1657030377423-ab29e5b35f58"),
}

def foto(fid):
    arq = FOTOS / f"{fid}.jpg"
    if not arq.exists():
        urllib.request.urlretrieve(f"https://images.unsplash.com/{BANCO[fid][1]}?w=1800&q=85&fm=jpg", arq)
    return arq.as_uri()

def origem():
    linhas = ["# Fotos de banco · origem e licença", "",
              "Todas do Unsplash (licença Unsplash: uso comercial livre, crédito não obrigatório). Baixadas em 2026-10-11.", "",
              "| arquivo | origem | autor |", "|---|---|---|"]
    for fid, (autor, _) in BANCO.items():
        linhas.append(f"| {fid}.jpg | https://unsplash.com/photos/{fid} | {autor} |")
    (FOTOS / "_origem.md").write_text("\n".join(linhas) + "\n", encoding="utf-8")

CSS = """
@import url('https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,300;1,800&display=swap');
:root{--verde:#0C2F20;--creme:#FDF9EF;--natural:#496B30;--morango:#C72F35;--amarelo:#E7B944}
*{margin:0;padding:0;box-sizing:border-box}
body{width:1080px;height:1350px;overflow:hidden;font-family:Montserrat,sans-serif;position:relative}
.handle{position:absolute;font-size:24px;font-weight:500;letter-spacing:.04em}
/* E1 editorial escuro */
.e1{background:#111}
.e1 .bg{position:absolute;inset:0;background-size:cover;background-position:center}
.e1 .ov{position:absolute;inset:0;background:linear-gradient(180deg,rgba(6,20,13,.78) 0%,rgba(6,20,13,.45) 48%,rgba(6,20,13,.2) 70%,rgba(6,20,13,.55) 100%)}
.e1 .tit{margin:0 110px 0 120px;color:#fff;font-size:86px;line-height:1.02;font-weight:400;letter-spacing:-.025em}
.e1 .tit b{font-weight:800}
.e1 .tag{display:inline-block;margin-top:26px;margin-left:120px;background:var(--creme);color:var(--verde);font-size:33px;font-weight:500;padding:12px 22px;transform:rotate(-1.2deg)}
.e1 .handle{left:120px;bottom:64px;color:var(--creme);opacity:.9}
/* E2 ficha creme */
.e2{background:var(--creme);color:var(--verde)}
.e2 .bloco{position:absolute;left:0;top:200px;width:390px;height:960px;background:var(--verde);border-radius:0 48px 48px 0}
.e2 .foto{position:absolute;left:-250px;top:330px;width:700px;height:700px;border-radius:50%;background-size:cover;background-position:center;box-shadow:0 30px 60px rgba(0,0,0,.28);border:14px solid var(--creme)}
.e2 .col{position:absolute;left:520px;right:60px;top:290px}
.e2 .tit{font-size:84px;line-height:1.05;font-weight:500;letter-spacing:-.02em}
.e2 .tit b{font-weight:800;color:var(--natural)}
.e2 .sub{margin-top:28px;font-size:31px;line-height:1.45;color:#2d4636}
.e2 .sub b{color:var(--natural)}
.e2 .lista{margin-top:64px;display:flex;flex-direction:column;gap:24px}
.e2 .item{display:flex;align-items:center;background:#ECE7DA;border-radius:22px;min-height:116px}
.e2 .num{flex:none;width:110px;align-self:stretch;display:flex;align-items:center;justify-content:center;background:var(--natural);color:#fff;font-weight:800;font-size:42px;border-radius:22px}
.e2 .txt{padding:16px 26px;font-size:34px;line-height:1.25;font-weight:500}
.e2 .handle{left:520px;top:200px;color:var(--natural)}
/* E3 foto na mão */
.e3 .bg{position:absolute;inset:0;background-size:cover;background-position:center}
.e3 .ov{position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,0) 35%,rgba(5,18,11,.55) 60%,rgba(5,18,11,.88) 100%)}
.e3 .txtbox{position:absolute;left:120px;right:110px;bottom:150px;color:#fff}
.e3 .l1{font-size:118px;font-weight:800;line-height:.95;letter-spacing:-.03em}
.e3 .l2{font-size:62px;font-weight:300;font-style:italic;text-transform:uppercase;line-height:1.05;margin-top:10px}
.e3 .p{font-size:29px;line-height:1.45;margin-top:34px;max-width:820px;font-weight:500}
.e3 .handle{right:70px;top:60px;color:#fff;opacity:.9}
/* E4 destaque central */
.e4{background:var(--creme);color:var(--verde)}
.e4 .eco{position:absolute;top:470px;left:0;right:0;text-align:center;font-size:150px;font-weight:800;color:rgba(12,47,32,.05);line-height:.9;text-transform:uppercase;white-space:nowrap}
.e4 .t1{position:absolute;top:120px;width:100%;text-align:center;font-size:62px;font-weight:700;color:var(--natural)}
.e4 .t2{position:absolute;top:190px;width:100%;text-align:center;font-size:122px;font-weight:800;text-transform:uppercase;letter-spacing:-.03em;line-height:1}
.e4 .foto{position:absolute;left:190px;top:350px;width:700px;height:700px;border-radius:50%;background-size:cover;background-position:center;box-shadow:0 34px 70px rgba(0,0,0,.25)}
.e4 .bloco{position:absolute;left:330px;width:420px;top:960px;height:420px;background:var(--verde);border-radius:60px 60px 0 0;z-index:-0}
.e4 .fim{position:absolute;left:330px;width:420px;top:1080px;text-align:center;color:var(--creme);font-size:58px;font-weight:700;font-style:italic;line-height:1.05}
.e4 .fim b{color:var(--amarelo)}
.e4 .selo{position:absolute;left:150px;top:850px;width:190px;height:190px;border-radius:50%;background:var(--creme);border:5px solid var(--verde);display:flex;align-items:center;justify-content:center;text-align:center;font-weight:800;font-size:28px;line-height:1.1;color:var(--verde);box-shadow:0 10px 24px rgba(0,0,0,.15);padding:18px}
.e4 .handle{left:0;right:0;text-align:center;top:60px;color:var(--natural)}
/* E5 cor de fruta */
.e5{background:var(--verde);color:var(--creme)}
.e5.morango{background:var(--morango)}
.e5 .pill{position:absolute;top:150px;left:50%;transform:translateX(-50%);border:3px solid var(--creme);border-radius:22px;padding:10px 30px;font-size:34px;font-weight:700;white-space:nowrap}
.e5 .tit{position:absolute;top:250px;left:60px;right:60px;text-align:center;font-size:124px;font-weight:800;letter-spacing:-.035em;line-height:1}
.e5 .foto{position:absolute;left:60px;top:640px;width:600px;height:600px;border-radius:50%;background-size:cover;background-position:center;box-shadow:0 30px 60px rgba(0,0,0,.35);z-index:2}
.e5 .card{position:absolute;right:60px;top:700px;width:460px;min-height:430px;background:var(--creme);color:var(--verde);border-radius:40px;padding:56px 40px 56px 110px;z-index:1}
.e5 .card .dots{display:flex;gap:10px;margin-bottom:26px}
.e5 .card .dots i{width:18px;height:18px;border-radius:50%;display:block}
.e5 .card li{list-style:none;font-size:30px;font-weight:700;line-height:1.2;margin-bottom:18px}
.e5 .card li span{font-weight:500;color:var(--natural)}
.e5 .handle{left:0;right:0;text-align:center;bottom:50px;color:var(--creme);opacity:.85}
"""

def bg(fid, pos="center"):
    return f"background-image:url('{foto(fid)}');background-position:{pos}"

H = '<div class="handle">@potefitness</div>'

def e1(d):
    return f'''<body class="e1"><div class="bg" style="{bg(d['foto'], d.get('pos','center'))}"></div><div class="ov"></div>
<div style="position:absolute;top:210px;left:0;right:0"><div class="tit">{d['tit']}</div><div class="tag">{d['tag']}</div></div>{H}</body>'''

def e2(d):
    itens = "".join(f'<div class="item"><div class="num">{i+1:02d}</div><div class="txt">{t}</div></div>' for i, t in enumerate(d['itens']))
    sub = f'<div class="sub">{d["sub"]}</div>' if d.get('sub') else ''
    return f'''<body class="e2"><div class="bloco"></div><div class="foto" style="{bg(d['foto'], d.get('pos','center'))}"></div>{H}
<div class="col"><div class="tit">{d['tit']}</div>{sub}<div class="lista">{itens}</div></div></body>'''

def e3(d):
    return f'''<body class="e3"><div class="bg" style="{bg(d['foto'], d.get('pos','center'))}"></div><div class="ov"></div>{H}
<div class="txtbox"><div class="l1">{d['l1']}</div><div class="l2">{d['l2']}</div><div class="p">{d['p']}</div></div></body>'''

def e4(d):
    return f'''<body class="e4"><div class="eco">{d['t2']}<br>{d['t2']}</div>{H}<div class="t1">{d['t1']}</div><div class="t2" style="font-size:{min(122, int(122*12/len(d['t2'])))}px">{d['t2']}</div>
<div class="bloco"></div><div class="foto" style="{bg(d['foto'], d.get('pos','center'))}"></div><div class="selo">{d['selo']}</div><div class="fim">{d['fim']}</div></body>'''

def e5(d):
    itens = "".join(f"<li>{t}</li>" for t in d['itens'])
    dots = '<div class="dots"><i style="background:#C72F35"></i><i style="background:#E7B944"></i><i style="background:#496B30"></i></div>'
    return f'''<body class="e5 {d.get('cor','')}"><div class="pill">{d['pill']}</div><div class="tit">{d['tit']}</div>
<div class="foto" style="{bg(d['foto'], d.get('pos','center'))}"></div><div class="card">{dots}<ul>{itens}</ul></div>{H}</body>'''

ESTILOS = {"E1": e1, "E2": e2, "E3": e3, "E4": e4, "E5": e5}

def render(posts, so=None):
    with sync_playwright() as p:
        nav = p.chromium.launch()
        pg = nav.new_page(viewport={"width": 1080, "height": 1350})
        for post in posts:
            if so and post['n'] not in so:
                continue
            slides = post.get('slides') or [post]
            for i, s in enumerate(slides, 1):
                html = f"<!doctype html><html><head><meta charset='utf-8'><style>{CSS}</style></head>{ESTILOS[post['estilo']](s)}</html>"
                nome = f"{post['n']:02d}-{post['slug']}" + (f"-{i}" if post.get('slides') else "")
                arq = BUILD / f"{nome}.html"
                arq.write_text(html, encoding="utf-8")
                pg.goto(arq.as_uri()); pg.wait_for_load_state("networkidle"); pg.evaluate("document.fonts.ready")
                pg.wait_for_timeout(300)
                pg.screenshot(path=str(SAIDA / f"{nome}.jpg"), type="jpeg", quality=92)
                print("ok", nome)
        nav.close()

if __name__ == "__main__":
    posts = json.loads((BASE / "posts.json").read_text(encoding="utf-8"))
    so = {int(a) for a in sys.argv[1:]} or None
    origem()
    render(posts, so)
