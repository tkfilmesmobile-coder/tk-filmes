"""Post "Feliz Dia das Crianças" (12/10/2026): tipográfico na paleta do escritório, com brinquedos desenhados em linha
(pipa, bola, barquinho de papel e estrelas) em taupe e champanhe. Gera post.jpg (1080x1350) e story.jpg (1080x1920)."""
import pathlib
from playwright.sync_api import sync_playwright
from PIL import Image
AQUI = pathlib.Path(__file__).resolve().parent
M = (AQUI.parent.parent / "marca").as_uri()
F = '<link href="https://fonts.googleapis.com/css2?family=Inter:ital,wght@0,200;0,300;0,600;0,700;0,800;0,900;1,200&display=swap" rel="stylesheet">'
SVG = """<svg viewBox="0 0 1080 900" width="1080" height="900" style="position:absolute;left:0;top:0">
<g fill="none" stroke-linecap="round" stroke-linejoin="round">
 <!-- pipa -->
 <path d="M800 90 L900 190 L800 330 L700 190 Z" fill="#E6D3B8" stroke="#141414" stroke-width="4"/>
 <path d="M800 90 L800 330 M700 190 L900 190" stroke="#141414" stroke-width="3"/>
 <path d="M800 330 C 760 400, 860 450, 810 520 S 760 640, 830 700" stroke="#8C7B6B" stroke-width="3" stroke-dasharray="2 12"/>
 <path d="M790 420 l-24 -10 l10 24 Z M830 560 l24 -10 l-10 24 Z" fill="#141414" stroke="none"/>
 <!-- bola -->
 <circle cx="230" cy="700" r="90" fill="#FFFFFF" stroke="#141414" stroke-width="4"/>
 <path d="M140 700 C 190 650, 270 650, 320 700 M230 610 C 200 660, 200 740, 230 790" stroke="#8C7B6B" stroke-width="4"/>
 <!-- barquinho de papel -->
 <path d="M520 760 L700 760 L660 815 L560 815 Z" fill="#141414" stroke="#141414" stroke-width="4"/>
 <path d="M610 760 L610 650 L670 760" fill="#E6D3B8" stroke="#141414" stroke-width="4"/>
 <path d="M480 840 C 520 825, 560 855, 600 840 S 680 825, 720 840" stroke="#8C7B6B" stroke-width="3"/>
 <!-- estrelas -->
 <path d="M150 170 l10 26 l28 2 l-22 18 l8 27 l-24 -15 l-24 15 l8 -27 l-22 -18 l28 -2 Z" fill="#E6D3B8" stroke="#141414" stroke-width="3"/>
 <path d="M560 120 l6 16 l17 1 l-13 11 l5 16 l-15 -9 l-15 9 l5 -16 l-13 -11 l17 -1 Z" fill="#141414" stroke="none"/>
 <circle cx="420" cy="300" r="10" fill="#8C7B6B" stroke="none"/><circle cx="960" cy="560" r="8" fill="#E6D3B8" stroke="none"/>
</g></svg>"""
CSS = """*{margin:0;padding:0;box-sizing:border-box}body{width:1080px;height:__H__px;overflow:hidden;font-family:'Inter',sans-serif;background:#ecebe9;color:#141414;position:relative}
.fil{position:absolute;left:72px;right:72px;height:1px;background:rgba(20,20,20,.2)}
.k{font-size:22px;letter-spacing:.32em;font-weight:700;color:#8c7b6b}
h1{font-size:118px;line-height:.96;letter-spacing:-.055em;font-weight:200}h1 b{font-weight:900}
.t{font-size:32px;line-height:1.5;font-weight:300;color:#333;max-width:860px}.t b{font-weight:700;color:#141414}
.rod{position:absolute;left:72px;right:72px;display:flex;justify-content:space-between;font-size:18px;letter-spacing:.24em;font-weight:600;color:#8c7b6b}"""
def pagina(story):
    H = 1920 if story else 1350
    top = 230 if story else 64
    art = 330 if story else 70
    txt = 1160 if story else 720
    rb = 250 if story else 56
    return f"""<!doctype html><html><head><meta charset="utf-8">{F}<style>{CSS.replace('__H__', str(H))}</style></head><body>
<img src="{M}/logo-escuro-recortado.png" style="position:absolute;left:72px;top:{top}px;width:116px;z-index:2">
<div style="position:absolute;left:0;top:{art}px;transform:scale(.8);transform-origin:top left;width:1080px;height:900px;opacity:.95;left:{100 if not story else 60}px">{SVG}</div>
<div style="position:absolute;left:72px;right:72px;top:{txt}px"><div class="k">12 DE OUTUBRO</div>
<h1 style="margin-top:20px">Feliz Dia <br>das <b>Crianças.</b></h1>
<p class="t" style="margin-top:30px">Que nunca falte <b>cuidado, proteção e direitos</b> pra quem é o nosso futuro. 💛</p></div>
<div class="fil" style="bottom:{rb + 40}px"></div><div class="rod" style="bottom:{rb}px"><span>TAMARA CHAGAS ADVOCACIA</span><span>UNIÃO DOS PALMARES · AL</span></div>
</body></html>"""
with sync_playwright() as p:
    b = p.chromium.launch()
    for nome, story in (("post", False), ("story", True)):
        h = AQUI / f"_{nome}.html"; h.write_text(pagina(story), encoding="utf8")
        pg = b.new_page(viewport={"width": 1080, "height": 1920 if story else 1350}); pg.goto(h.as_uri())
        pg.wait_for_load_state("networkidle"); pg.evaluate("document.fonts.ready")
        pg.screenshot(path=str(AQUI / f"{nome}.png")); pg.close(); h.unlink()
        Image.open(AQUI / f"{nome}.png").convert("RGB").save(AQUI / f"{nome}.jpg", quality=93); (AQUI / f"{nome}.png").unlink()
    b.close()
print("ok")
