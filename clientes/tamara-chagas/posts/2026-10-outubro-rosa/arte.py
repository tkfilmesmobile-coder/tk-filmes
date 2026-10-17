"""Arte de campanha Outubro Rosa · Tamara Chagas Advocacia. Gera feed (1080x1350) e story (1080x1920)."""
import pathlib
from playwright.sync_api import sync_playwright
from PIL import Image

AQUI = pathlib.Path(__file__).resolve().parent
M = (AQUI.parent.parent / "marca").as_uri()
F = ('<link href="https://fonts.googleapis.com/css2?family=Libre+Baskerville:wght@400&family=Inter:wght@300;400;500'
     '&family=Great+Vibes&display=swap" rel="stylesheet">')

LACO = """<svg viewBox="0 0 520 900" xmlns="http://www.w3.org/2000/svg">
<defs>
 <linearGradient id="a" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#e98aaa"/><stop offset=".45" stop-color="#f7b8cc"/><stop offset=".55" stop-color="#f3a6bf"/><stop offset="1" stop-color="#d4648c"/></linearGradient>
 <linearGradient id="b" x1="1" y1="0" x2="0" y2="0"><stop offset="0" stop-color="#e27c9f"/><stop offset=".4" stop-color="#fbc7d6"/><stop offset=".6" stop-color="#f19bb7"/><stop offset="1" stop-color="#c9577f"/></linearGradient>
 <filter id="s" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="14" stdDeviation="14" flood-color="#a8466b" flood-opacity=".22"/></filter>
</defs>
<g filter="url(#s)" fill="none" stroke-linecap="butt">
 <path d="M 110 860 C 210 680, 375 480, 375 300 C 375 165, 318 92, 258 92 C 198 92, 141 165, 141 300" stroke="url(#a)" stroke-width="78"/>
 <path d="M 141 300 C 141 480, 306 680, 406 860" stroke="url(#b)" stroke-width="78"/>
 <path d="M 141 300 C 141 480, 306 680, 406 860" stroke="#fff" stroke-opacity=".18" stroke-width="10" transform="translate(-16,0)"/>
</g></svg>"""

RAMO = """<svg viewBox="0 0 300 600" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="#c97a96" stroke-width="2" stroke-linecap="round">
<path d="M150 590 C 140 450, 120 330, 160 120"/>
<path d="M146 470 C 100 450, 80 410, 78 370 C 120 385, 140 420, 146 470 Z"/>
<path d="M140 380 C 185 360, 205 320, 205 280 C 168 300, 148 335, 140 380 Z"/>
<path d="M138 300 C 95 280, 78 245, 80 205 C 118 225, 134 258, 138 300 Z"/>
<path d="M150 210 C 190 190, 205 155, 200 118 C 170 140, 155 170, 150 210 Z"/>
<path d="M160 120 C 150 90, 158 60, 175 40"/>
</svg>"""

def html(story):
    H = 1920 if story else 1350
    topo = 420 if story else 250
    return f"""<!doctype html><html><head><meta charset="utf-8">{F}<style>
*{{margin:0;padding:0;box-sizing:border-box}}
body{{width:1080px;height:{H}px;overflow:hidden;font-family:'Inter',sans-serif;color:#9a3f64;
 background:radial-gradient(ellipse 900px 700px at 20% 15%,#fff3f6 0%,transparent 60%),
 radial-gradient(ellipse 800px 900px at 90% 90%,#f6cbd8 0%,transparent 65%),linear-gradient(160deg,#fde6ec 0%,#f8d3de 100%)}}
.grao{{position:absolute;inset:0;opacity:.06;mix-blend-mode:multiply;background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='3'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>")}}
.moldura{{position:absolute;inset:40px;border:1.5px solid rgba(154,63,100,.25);border-radius:6px}}
.logo{{position:absolute;left:50%;transform:translateX(-50%);top:{110 if story else 80}px;width:150px}}
.ramo{{position:absolute;left:60px;top:{topo+40}px;width:300px;opacity:.9}}
.laco{{position:absolute;left:150px;top:{topo}px;width:{420 if story else 380}px}}
.txt{{position:absolute;right:110px;top:{topo+220 if story else topo+160}px;width:430px;text-align:center}}
.k{{font-size:34px;letter-spacing:.42em;font-weight:400;padding-left:.42em}}
h1{{font-family:'Libre Baskerville',serif;font-weight:400;font-size:{170 if story else 150}px;line-height:1;margin-top:6px;color:#b4547c;letter-spacing:-.02em}}
.linha{{display:flex;align-items:center;gap:16px;margin:28px 0 26px}}.linha i{{flex:1;height:1.5px;background:#c97a96}}.linha span{{font-size:22px}}
p{{font-size:30px;line-height:1.5;font-weight:300;color:#8a3a5b}}
.ass{{font-family:'Great Vibes',cursive;font-size:76px;margin-top:22px;color:#b4547c}}
.rod{{position:absolute;left:0;right:0;bottom:{150 if story else 86}px;text-align:center;font-size:20px;letter-spacing:.32em;color:#9a3f64;font-weight:500}}
.rod small{{display:block;margin-top:10px;font-size:18px;letter-spacing:.12em;font-weight:300}}
</style></head><body><div class="grao"></div><div class="moldura"></div>
<img class="logo" src="{M}/logo-rosa-recortado.png">
<div class="ramo">{RAMO}</div><div class="laco">{LACO}</div>
<div class="txt"><div class="k">OUTUBRO</div><h1>rosa</h1>
<div class="linha"><i></i><span>♡</span><i></i></div>
<p>Cuidar da saúde também<br>é um direito seu.</p>
<div class="ass">Cuide-se!</div></div>
<div class="rod">TAMARA CHAGAS ADVOCACIA<small>@tamarachagas_prev · @dra.tamarachagas_</small></div>
</body></html>"""

with sync_playwright() as p:
    b = p.chromium.launch()
    for nome, story in [("post", False), ("story", True)]:
        h = AQUI / f"{nome}.html"; h.write_text(html(story), encoding="utf8")
        pg = b.new_page(viewport={"width": 1080, "height": 1920 if story else 1350}); pg.goto(h.as_uri())
        pg.wait_for_load_state("networkidle"); pg.evaluate("document.fonts.ready")
        pg.screenshot(path=str(AQUI / f"{nome}.png")); pg.close()
        Image.open(AQUI / f"{nome}.png").convert("RGB").save(AQUI / f"{nome}.jpg", quality=94)
    b.close()
print("ok")
