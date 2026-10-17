"""Posts institucionais do escritório (aviso de funcionamento e datas da cidade), na linha dos carrosséis do quadro:
off-white #ECEBE9, grafite #141414, taupe #8C7B6B, champanhe #E6D3B8, Inter fino + negrito, filetes, logo.
uso: python modelos/post_aviso.py <pasta>   (lê <pasta>/aviso.json; gera post.jpg 1080x1350 e story.jpg 1080x1920)
aviso.json (layout "calendario"): {"layout":"calendario","kicker":"AVISO","titulo":"fino <b>forte</b>",
   "dias":[["12","SEG","Dia das Crianças"],["13","TER","Emancipação de União"]],"retorno":"Voltamos quarta, 14/10, às 8h.","rodape":"..."}
aviso.json (layout "foto"): {"layout":"foto","foto":"caminho absoluto ou relativo à pasta","pos":"50% 40%","kicker":"...","titulo":"...","texto":"...","rodape":"..."}
"""
import json, sys, pathlib
from playwright.sync_api import sync_playwright
from PIL import Image

M = (pathlib.Path(__file__).resolve().parent.parent / "marca").as_uri()
F = '<link href="https://fonts.googleapis.com/css2?family=Inter:ital,wght@0,200;0,300;0,500;0,600;0,700;0,800;0,900;1,200&display=swap" rel="stylesheet">'
BASE = """*{margin:0;padding:0;box-sizing:border-box}body{width:1080px;height:__H__px;overflow:hidden;font-family:'Inter',sans-serif;background:#ecebe9;color:#141414;position:relative}
.fil{position:absolute;left:72px;right:72px;height:1px;background:rgba(20,20,20,.2)}
.k{font-size:22px;letter-spacing:.32em;font-weight:700;color:#8c7b6b}
h1{font-size:96px;line-height:1.0;letter-spacing:-.05em;font-weight:200}h1 b{font-weight:800}
.rod{position:absolute;left:72px;right:72px;bottom:__RB__px;display:flex;justify-content:space-between;font-size:18px;letter-spacing:.24em;font-weight:600;color:#8c7b6b}
.card{flex:1;background:#fff;border-radius:28px;padding:34px 34px 30px;box-shadow:0 24px 50px rgba(0,0,0,.08);position:relative;overflow:hidden}
.card .mes{font-size:18px;letter-spacing:.28em;font-weight:700;color:#8c7b6b}
.card .num{font-size:300px;font-weight:900;letter-spacing:-.07em;line-height:.85;margin-top:14px}
.card .dia{position:absolute;right:30px;top:30px;background:#141414;color:#fff;font-size:20px;letter-spacing:.2em;font-weight:700;padding:8px 14px;border-radius:999px}
.card .ev{margin-top:26px;font-size:30px;font-weight:600;line-height:1.2}
.card .x{position:absolute;inset:0;background:repeating-linear-gradient(135deg,transparent 0 22px,rgba(20,20,20,.035) 22px 24px)}
.ret{display:flex;align-items:center;gap:22px;background:#141414;color:#fff;border-radius:22px;padding:30px 36px}
.ret .ic{font-size:44px;font-weight:200;color:#e6d3b8}.ret b{font-weight:800}
"""


def html(c, pasta, story):
    H = 1920 if story else 1350
    css = BASE.replace("__H__", str(H)).replace("__RB__", "250" if story else "56")
    topo = 230 if story else 64
    if c["layout"] == "calendario":
        y0 = 520 if story else 280
        cards = "".join(f'<div class="card"><div class="x"></div><div class="mes">OUTUBRO</div><div class="dia">{d}</div>'
                        f'<div class="num">{n}</div><div class="ev">{ev}</div></div>' for n, d, ev in c["dias"])
        corpo = f"""<div style="position:absolute;left:72px;right:72px;top:{y0}px"><div class="k">{c['kicker']}</div>
<h1 style="margin-top:20px">{c['titulo']}</h1>
<div style="display:flex;gap:24px;margin-top:50px">{cards}</div>
<div class="ret" style="margin-top:28px"><span class="ic">→</span><span style="font-size:36px;font-weight:300;letter-spacing:-.01em">{c['retorno']}</span></div></div>"""
        logo = f'<img src="{M}/logo-escuro-recortado.png" style="position:absolute;left:72px;top:{topo}px;width:116px">'
        return css, logo + f'<div class="fil" style="top:{topo + 120}px"></div>' + corpo + f'<div class="fil" style="bottom:{(250 if story else 56) + 40}px"></div><div class="rod"><span>{c.get("rodape", "")}</span><span>UNIÃO DOS PALMARES · AL</span></div>'
    foto = c["foto"] if ":" in c["foto"] else (pasta / c["foto"]).resolve().as_posix()
    corpo = f"""<img src="{pathlib.Path(foto).as_uri()}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:{c.get('pos', '50% 40%')}">
<div style="position:absolute;inset:0;background:linear-gradient(180deg,rgba(20,20,20,.55) 0%,rgba(20,20,20,0) 24%,rgba(20,20,20,0) 40%,rgba(20,20,20,.9) 74%)"></div>
<img src="{M}/logo-claro-recortado.png" style="position:absolute;left:72px;top:{topo}px;width:116px">
<div style="position:absolute;left:72px;right:72px;bottom:{(250 if story else 56) + 90}px;color:#fff">
<div class="k" style="color:#e6d3b8">{c['kicker']}</div><h1 style="margin-top:18px">{c['titulo']}</h1>
<p style="margin-top:26px;font-size:32px;line-height:1.45;font-weight:300;color:rgba(255,255,255,.9);max-width:880px">{c.get('texto', '')}</p></div>
<div class="fil" style="background:rgba(255,255,255,.3);bottom:{(250 if story else 56) + 40}px"></div><div class="rod" style="color:#e6d3b8"><span>{c.get('rodape', '')}</span><span>UNIÃO DOS PALMARES · AL</span></div>"""
    return css, corpo


def main():
    pasta = pathlib.Path(sys.argv[1]).resolve()
    c = json.loads((pasta / "aviso.json").read_text(encoding="utf-8-sig"))
    with sync_playwright() as p:
        b = p.chromium.launch()
        for nome, story in (("post", False), ("story", True)):
            css, corpo = html(c, pasta, story)
            h = pasta / f"_{nome}.html"
            h.write_text(f'<!doctype html><html><head><meta charset="utf-8">{F}<style>{css}</style></head><body>{corpo}</body></html>', encoding="utf8")
            pg = b.new_page(viewport={"width": 1080, "height": 1920 if story else 1350}); pg.goto(h.as_uri())
            pg.wait_for_load_state("networkidle"); pg.evaluate("document.fonts.ready")
            pg.screenshot(path=str(pasta / f"{nome}.png")); pg.close(); h.unlink()
            Image.open(pasta / f"{nome}.png").convert("RGB").save(pasta / f"{nome}.jpg", quality=93)
        b.close()
    print("ok", pasta)


if __name__ == "__main__":
    main()
