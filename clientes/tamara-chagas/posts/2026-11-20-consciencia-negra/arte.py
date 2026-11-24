"""Post de 20/11/2026: Dia Nacional de Zumbi e da Consciência Negra. Foto em tela cheia da Serra da Barriga (União dos
Palmares), tirada em 20/11/2015 nas comemorações do dia (Lia de Paula/MinC, CC BY 2.0, Wikimedia Commons).
Gera post.png (1080x1350) e story.png (1080x1920)."""
import pathlib
from playwright.sync_api import sync_playwright

AQUI = pathlib.Path(__file__).parent
MARCA = (AQUI.parent.parent / "marca").as_uri()
FOTO = f"{MARCA}/fotos/stock/serra-da-barriga-20nov-lia-de-paula-minc-ccby2.jpg"


def html(h, topo_txt):
    return f"""<!doctype html><html><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;1,300;1,400&family=Inter:wght@300;500;600&display=swap" rel="stylesheet">
<style>*{{margin:0;padding:0;box-sizing:border-box}}body{{width:1080px;height:{h}px;overflow:hidden;background:#141414;font-family:Inter,sans-serif;color:#fff}}
.f{{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:28% 50%;filter:saturate(.95) contrast(1.02)}}
.v{{position:absolute;inset:0;background:linear-gradient(180deg,rgba(15,15,15,.35) 0%,rgba(15,15,15,0) 18%,rgba(15,15,15,0) 42%,rgba(15,15,15,.55) 62%,rgba(15,15,15,.88) 100%)}}
.logo{{position:absolute;left:84px;top:{topo_txt}px;width:120px;filter:invert(1) brightness(1.15) drop-shadow(0 2px 8px rgba(0,0,0,.55))}}
.b{{position:absolute;left:84px;right:84px;bottom:{170 if h == 1350 else 330}px}}
.k{{display:flex;align-items:center;gap:18px;font-size:22px;letter-spacing:.34em;font-weight:600;color:#E6D3B8}}.k i{{width:56px;height:2px;background:#E6D3B8}}
.t{{margin-top:26px;font-family:'Cormorant Garamond',serif;font-weight:400;font-size:92px;line-height:.98;letter-spacing:-.01em}}
.t em{{font-style:italic;font-weight:300}}
.l{{margin-top:28px;font-size:30px;line-height:1.45;font-weight:300;max-width:840px;color:rgba(255,255,255,.92)}}.l b{{font-weight:600}}
.c{{position:absolute;left:84px;right:84px;bottom:{70 if h == 1350 else 210}px;display:flex;justify-content:space-between;font-size:15px;letter-spacing:.06em;color:rgba(255,255,255,.7)}}
</style></head><body><img class="f" src="{FOTO}"><div class="v"></div><img class="logo" src="{MARCA}/logo-escuro-recortado.png">
<div class="b"><div class="k"><i></i>20 DE NOVEMBRO</div>
<div class="t">Dia Nacional de Zumbi<br><em>e da Consciência Negra</em></div>
<div class="l">Da <b>Serra da Barriga</b>, em União dos Palmares, coração do Quilombo dos Palmares, a memória de Zumbi segue viva no Brasil inteiro.</div></div>
<div class="c"><span>TAMARA CHAGAS ADVOCACIA</span><span>Foto: Lia de Paula/MinC · CC BY 2.0</span></div></body></html>"""


with sync_playwright() as p:
    b = p.chromium.launch()
    for nome, h, topo in (("post", 1350, 60), ("story", 1920, 220)):
        f = AQUI / f"{nome}.html"; f.write_text(html(h, topo), encoding="utf-8")
        pg = b.new_page(viewport={"width": 1080, "height": h}); pg.goto(f.as_uri()); pg.wait_for_load_state("networkidle")
        pg.evaluate("document.fonts.ready"); pg.wait_for_timeout(400); pg.screenshot(path=str(AQUI / f"{nome}.png")); pg.close()
    b.close()
print("ok")
