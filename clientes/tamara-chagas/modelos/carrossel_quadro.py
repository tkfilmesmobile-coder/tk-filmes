"""Carrossel de feed (1080x1350) do quadro "O povo da feira sabe de INSS?" · v2 (08/10): fotos reais da feira.
Estética do escritório: off-white #ECEBE9, grafite #141414, taupe #8C7B6B, champanhe #E6D3B8, Inter fino + negrito,
filetes finos no topo e no rodapé, numeração, selo PARTE N · TEMA, fonte em todos os slides.
uso: python modelos/carrossel_quadro.py <pasta-da-parte> [n1,n2]   (só esses slides, pra prévia)
carrossel.json: {"parte": 1, "tema": "...", "fonte": "...", "slides": [
  {"layout": "capa", "foto": "../fotos/f16.8.jpg", "pos": "50% 30%", "kicker": "...", "titulo": "fino <b>forte</b>", "fala": "..."},
  {"layout": "foto", "foto": "...", "pos": "50% 40%", "kicker": "...", "titulo": "...", "texto": "...", "faixa": "..."},
  {"layout": "lista", "kicker": "...", "titulo": "...", "lista": ["...", "..."], "foto": "...(opcional, faixa estreita no topo)"},
  {"layout": "numero", "kicker": "...", "titulo": "...", "grande": "55|anos · mulher", "texto": "..."},
  {"layout": "fim", "foto": "tamara/...jpg (marca/fotos)", "titulo": "...", "texto": "..."}]}
fotos que começam com "../" ou "fotos/" são relativas à pasta da parte; as outras vêm de marca/fotos.
"""
import json, sys, pathlib
from playwright.sync_api import sync_playwright
from PIL import Image

BASE = pathlib.Path(__file__).resolve().parent.parent
M = (BASE / "marca").as_uri()
F = '<link href="https://fonts.googleapis.com/css2?family=Inter:ital,wght@0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,200;1,800&display=swap" rel="stylesheet">'
CSS = """*{margin:0;padding:0;box-sizing:border-box}body{width:1080px;height:1350px;overflow:hidden;font-family:'Inter',sans-serif;background:#ecebe9;color:#141414;position:relative}
.fil{position:absolute;left:72px;right:72px;height:1px;background:rgba(20,20,20,.2)}
.top{position:absolute;left:72px;right:72px;top:58px;display:flex;justify-content:space-between;align-items:center}
.top img{width:104px}.top .n{font-size:19px;letter-spacing:.24em;font-weight:600;color:#8c7b6b}
.selo{display:inline-flex;border-radius:999px;overflow:hidden;font-size:19px;letter-spacing:.2em;font-weight:700;box-shadow:0 6px 18px rgba(0,0,0,.12)}
.selo span:first-child{background:#141414;color:#fff;padding:10px 18px}.selo span:last-child{background:#fff;color:#141414;padding:10px 20px;font-weight:600}
.k{font-size:21px;letter-spacing:.3em;font-weight:700;color:#8c7b6b}
h1{font-size:78px;line-height:1.03;letter-spacing:-.045em;font-weight:200}h1 b{font-weight:800}
.t{font-size:32px;line-height:1.5;color:#333}.t b{font-weight:700;color:#141414}
.fx{display:inline-block;background:#141414;color:#fff;padding:14px 24px;font-size:28px;font-weight:500}
.ph{position:absolute;overflow:hidden}.ph img{width:100%;height:100%;object-fit:cover;display:block}
.rod{position:absolute;left:72px;right:72px;bottom:44px;display:flex;justify-content:space-between;font-size:17px;color:#666}
.rod b{font-weight:600;letter-spacing:.2em;font-size:15px;margin-right:8px;color:#141414}
.arr{font-size:18px;letter-spacing:.28em;font-weight:700;color:#141414;white-space:nowrap;margin-left:30px}
.l div{display:flex;gap:26px;align-items:baseline;padding:22px 0;border-bottom:1px solid rgba(20,20,20,.16);font-size:34px;line-height:1.3}
.l div span:first-child{font-weight:300;font-size:30px;color:#8c7b6b;min-width:50px}
.l div span:last-child b{font-weight:800}
"""


def src(pasta, f):
    return (pasta / f).resolve().as_uri() if f.startswith(("../", "fotos/")) else f"{M}/fotos/{f}"


def rodape(c, n, total, escuro=False):
    cor = ' style="color:rgba(255,255,255,.75)"' if escuro else ""
    b = ' style="color:#fff"' if escuro else ""
    arr = f'<span class="arr"{b}>ARRASTE →</span>' if n < total else ""
    return f'<div class="rod"{cor}><span><b{b}>FONTE</b>{c["fonte"]}</span>{arr}</div>'


def topo(c, n, total, escuro=False):
    logo = "logo-claro-recortado.png" if escuro else "logo-escuro-recortado.png"
    cor = ' style="color:#e6d3b8"' if escuro else ""
    return f'<div class="top"><img src="{M}/{logo}"><span class="n"{cor}>{n:02d} / {total:02d}</span></div>'


def selo(c):
    return f'<div class="selo"><span>PARTE {c["parte"]}</span><span>{c["tema"]}</span></div>'


def slide(s, n, total, c, pasta):
    lay = s.get("layout", "foto")
    if lay == "capa":
        return f"""<div class="ph" style="inset:0"><img src="{src(pasta, s['foto'])}" style="object-position:{s.get('pos', '50% 35%')}"></div>
<div style="position:absolute;inset:0;background:linear-gradient(180deg,rgba(20,20,20,.55) 0%,rgba(20,20,20,0) 22%,rgba(20,20,20,0) 42%,rgba(20,20,20,.88) 72%)"></div>
{topo(c, n, total, True)}
<div style="position:absolute;left:72px;right:72px;bottom:130px;color:#fff">{selo(c)}
<div class="k" style="margin-top:28px;color:#e6d3b8">{s.get('kicker', '')}</div>
<h1 style="margin-top:16px;font-size:84px">{s['titulo']}</h1>
{f'<div style="margin-top:22px;font-size:30px;font-style:italic;font-weight:200;color:#e6d3b8">“{s["fala"]}”</div>' if s.get('fala') else ''}</div>
{rodape(c, n, total, True)}"""
    if lay == "foto":
        return f"""{topo(c, n, total)}<div class="fil" style="top:150px"></div>
<div class="ph" style="left:72px;right:72px;top:180px;height:560px"><img src="{src(pasta, s['foto'])}" style="object-position:{s.get('pos', '50% 40%')}"></div>
<div style="position:absolute;left:72px;right:72px;top:790px"><div class="k">{s.get('kicker', '')}</div>
<h1 style="margin-top:16px;font-size:68px">{s['titulo']}</h1>
{f'<p class="t" style="margin-top:22px">{s["texto"]}</p>' if s.get('texto') else ''}
{f'<div class="fx" style="margin-top:26px">{s["faixa"]}</div>' if s.get('faixa') else ''}</div>
<div class="fil" style="bottom:100px"></div>{rodape(c, n, total)}"""
    if lay == "lista":
        faixa = f'<div class="ph" style="left:72px;right:72px;top:180px;height:300px"><img src="{src(pasta, s["foto"])}" style="object-position:{s.get("pos", "50% 40%")}"></div>' if s.get("foto") else ""
        y = 530 if s.get("foto") else 230
        itens = "".join(f"<div><span>{i + 1:02d}</span><span>{x}</span></div>" for i, x in enumerate(s["lista"]))
        return f"""{topo(c, n, total)}<div class="fil" style="top:150px"></div>{faixa}
<div style="position:absolute;left:72px;right:72px;top:{y}px"><div class="k">{s.get('kicker', '')}</div>
<h1 style="margin-top:16px">{s['titulo']}</h1><div class="l" style="margin-top:26px">{itens}</div></div>
<div class="fil" style="bottom:100px"></div>{rodape(c, n, total)}"""
    if lay == "numero":
        a, b = s["grande"].split("|")
        return f"""{topo(c, n, total)}<div class="fil" style="top:150px"></div>
<div style="position:absolute;left:72px;right:72px;top:230px"><div class="k">{s.get('kicker', '')}</div><h1 style="margin-top:16px">{s['titulo']}</h1></div>
<div style="position:absolute;left:60px;top:520px;font-size:420px;font-weight:900;letter-spacing:-.07em;line-height:.8">{a.strip()}</div>
<div style="position:absolute;left:76px;top:880px;font-size:34px;font-weight:300;letter-spacing:.02em;color:#8c7b6b">{b.strip()}</div>
<div style="position:absolute;left:72px;right:72px;top:980px"><div class="fil" style="position:relative;left:0;right:0;margin-bottom:30px"></div><p class="t">{s.get('texto', '')}</p></div>
<div class="fil" style="bottom:100px"></div>{rodape(c, n, total)}"""
    # fim
    return f"""{topo(c, n, total)}<div class="fil" style="top:150px"></div>
<img src="{src(pasta, s['foto'])}" style="position:absolute;right:-60px;bottom:100px;height:900px;-webkit-mask-image:linear-gradient(90deg,transparent 0%,#000 30%)">
<div style="position:absolute;left:72px;top:300px;width:560px">{selo(c)}
<div class="k" style="margin-top:40px">CADA CASO É ÚNICO</div><h1 style="margin-top:16px">{s['titulo']}</h1>
<p class="t" style="margin-top:24px">{s.get('texto', '')}</p></div>
<div class="fil" style="bottom:100px"></div>{rodape(c, n, total)}"""


def main():
    pasta = pathlib.Path(sys.argv[1]).resolve()
    so = [int(x) for x in sys.argv[2].split(",")] if len(sys.argv) > 2 else None
    c = json.loads((pasta / "carrossel.json").read_text(encoding="utf-8-sig"))
    out = pasta / "carrossel"; out.mkdir(exist_ok=True)
    total = len(c["slides"])
    with sync_playwright() as p:
        b = p.chromium.launch()
        for i, s in enumerate(c["slides"], 1):
            if so and i not in so:
                continue
            h = out / f"{i:02d}.html"
            h.write_text(f'<!doctype html><html><head><meta charset="utf-8">{F}<style>{CSS}</style></head><body>{slide(s, i, total, c, pasta)}</body></html>', encoding="utf8")
            pg = b.new_page(viewport={"width": 1080, "height": 1350}); pg.goto(h.as_uri())
            pg.wait_for_load_state("networkidle"); pg.evaluate("document.fonts.ready")
            png = out / f"{i:02d}.png"; pg.screenshot(path=str(png)); pg.close(); h.unlink()
            Image.open(png).convert("RGB").save(out / f"{i:02d}.jpg", quality=93); png.unlink()
        b.close()
    print("ok", out)


if __name__ == "__main__":
    main()
