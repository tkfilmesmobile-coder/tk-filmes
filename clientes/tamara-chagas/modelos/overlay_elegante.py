"""Texto elegante em PNG transparente (1080x1920) pra pôr por cima de vídeo de story (mesma linha do stories_elegante.py).
uso: python modelos/overlay_elegante.py <saida.png> "<KICKER>" "<texto com <b>forte</b>>" [baixo|meio|alto]
"""
import sys, pathlib
from playwright.sync_api import sync_playwright

F = '<link href="https://fonts.googleapis.com/css2?family=Inter:wght@200;600;700&display=swap" rel="stylesheet">'
CSS = """*{margin:0;padding:0;box-sizing:border-box}html,body{width:1080px;height:1920px;background:transparent;font-family:'Inter',sans-serif}
.veu{position:absolute;inset:0}
.txt{position:absolute;left:96px;right:96px}
.k{display:flex;align-items:center;gap:18px;font-size:24px;letter-spacing:.34em;font-weight:600;color:#E6D3B8}
.k i{display:block;width:56px;height:2px;background:#E6D3B8}
.t{margin-top:30px;font-size:62px;line-height:1.16;font-weight:200;letter-spacing:-.025em;color:#fff;text-shadow:0 2px 18px rgba(0,0,0,.35)}
.t b{font-weight:700}
.ass{position:absolute;left:96px;bottom:150px;font-size:20px;letter-spacing:.32em;font-weight:600;color:rgba(255,255,255,.8)}"""
VEU = {"baixo": "linear-gradient(180deg,rgba(20,20,20,0) 45%,rgba(20,20,20,.5) 72%,rgba(20,20,20,.75) 100%)",
       "meio": "linear-gradient(180deg,rgba(20,20,20,0) 25%,rgba(20,20,20,.45) 45%,rgba(20,20,20,.45) 62%,rgba(20,20,20,0) 85%)",
       "alto": "linear-gradient(180deg,rgba(20,20,20,.7) 0%,rgba(20,20,20,.35) 30%,rgba(20,20,20,0) 55%)"}
TOPO = {"baixo": "top:1300px", "meio": "top:800px", "alto": "top:300px"}

saida, kicker, texto = sys.argv[1], sys.argv[2], sys.argv[3]
pos = sys.argv[4] if len(sys.argv) > 4 else "baixo"
html = (f'<!doctype html><html><head><meta charset="utf-8">{F}<style>{CSS}</style></head><body>'
        f'<div class="veu" style="background:{VEU[pos]}"></div><div class="txt" style="{TOPO[pos]}">'
        f'<div class="k"><i></i>{kicker}</div><div class="t">{texto}</div></div>'
        f'<div class="ass">TAMARA CHAGAS ADVOCACIA</div></body></html>')
tmp = pathlib.Path(saida).with_suffix(".html"); tmp.write_text(html, encoding="utf-8")
with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page(viewport={"width": 1080, "height": 1920})
    pg.goto(tmp.resolve().as_uri()); pg.wait_for_timeout(900)
    pg.screenshot(path=saida, omit_background=True); b.close()
tmp.unlink()
print("ok", saida)
