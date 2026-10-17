"""Stories editoriais (1080x1920) pro perfil do escritório: mesma linha limpa do feed.
uso: python modelos/stories_editorial.py <pasta>   (lê <pasta>/editorial.json, grava <pasta>/editorial/NN.png/.jpg)
editorial.json: {"fonte": "...", "telas": [
  {"kicker": "...", "titulo": "fino <b>forte</b>", "texto": "...", "faixa": "...", "foto": "tamara/...jpg", "foto_css": "...",
   "lista": [["a","b"],...], "lista_titulo": "..."} ]}
"""
import json, sys, pathlib
from playwright.sync_api import sync_playwright
from PIL import Image

M = (pathlib.Path(__file__).resolve().parent.parent / "marca").as_uri()
F = '<link href="https://fonts.googleapis.com/css2?family=Inter:wght@200;300;400;500;600;700;800&display=swap" rel="stylesheet">'
CSS = """*{margin:0;padding:0;box-sizing:border-box}body{width:1080px;height:1920px;overflow:hidden;font-family:'Inter',sans-serif;background:#ecebe9;color:#141414}
.foto{position:absolute;-webkit-mask-image:linear-gradient(90deg,transparent 0%,#000 30%),linear-gradient(180deg,transparent 0%,#000 18%);-webkit-mask-composite:source-in}
.logo{position:absolute;left:84px;top:240px;width:140px}
.pag{position:absolute;right:84px;top:270px;font-size:24px;letter-spacing:.2em;color:#8c7b6b;font-weight:600}
.b{position:absolute;left:84px;right:84px;top:470px}
.k{font-size:26px;letter-spacing:.3em;font-weight:600;color:#8c7b6b}
h1{margin-top:26px;font-size:108px;line-height:1.02;letter-spacing:-.045em;font-weight:200}h1 b{font-weight:800}
.t{margin-top:40px;font-size:40px;line-height:1.5;color:#333;max-width:860px}.t b{font-weight:700;color:#141414}
.f{display:inline-block;margin-top:40px;background:#141414;color:#fff;padding:16px 28px;font-size:34px;font-weight:500}
.l{margin-top:44px;width:760px}.l small{display:block;font-size:22px;letter-spacing:.25em;font-weight:600;color:#666;margin-bottom:10px}
.lin{display:flex;justify-content:space-between;padding:18px 0;border-bottom:1px solid rgba(20,20,20,.18);font-size:40px}
.lin span:first-child{font-weight:300}.lin span:last-child{font-weight:700}
.fonte{position:absolute;bottom:250px;left:84px;right:84px;font-size:24px;color:#555}
.fonte b{font-weight:600;letter-spacing:.2em;font-size:20px;margin-right:10px}"""

def tela(t, n, total, fonte):
    foto = f'<img class="foto" style="{t.get("foto_css", "left:330px;top:760px;width:1150px")}" src="{M}/fotos/{t["foto"]}">' if t.get("foto") else ""
    lista = ""
    if t.get("lista"):
        lista = f'<div class="l"><small>{t.get("lista_titulo", "")}</small>' + "".join(
            f'<div class="lin"><span>{a}</span><span>{b}</span></div>' for a, b in t["lista"]) + "</div>"
    largura = ' style="max-width:560px"' if t.get("foto") else ""
    return f"""{foto}<img class="logo" src="{M}/logo-escuro-recortado.png"><div class="pag">{n}/{total}</div>
<div class="b"><div class="k">{t.get('kicker', '')}</div><h1{f' style="font-size:{t["tam"]}px"' if t.get("tam") else ""}>{t['titulo']}</h1>
{f'<p class="t"{largura}>{t["texto"]}</p>' if t.get('texto') else ''}
{f'<div class="f">{t["faixa"]}</div>' if t.get('faixa') else ''}{lista}</div>
<div class="fonte"{' style="right:auto;max-width:520px"' if t.get("foto") else ""}><b>FONTE</b>{fonte}</div>"""

def main():
    pasta = pathlib.Path(sys.argv[1]).resolve()
    s = json.loads((pasta / "editorial.json").read_text(encoding="utf-8-sig"))
    out = pasta / "editorial"; out.mkdir(exist_ok=True)
    telas = s["telas"]
    with sync_playwright() as p:
        b = p.chromium.launch()
        for i, t in enumerate(telas, 1):
            h = out / f"{i:02d}.html"
            h.write_text(f'<!doctype html><html><head><meta charset="utf-8">{F}<style>{CSS}</style></head><body>{tela(t, i, len(telas), s["fonte"])}</body></html>', encoding="utf8")
            pg = b.new_page(viewport={"width": 1080, "height": 1920}); pg.goto(h.as_uri())
            pg.wait_for_load_state("networkidle"); pg.evaluate("document.fonts.ready")
            png = out / f"{i:02d}.png"; pg.screenshot(path=str(png)); pg.close()
            Image.open(png).convert("RGB").save(out / f"{i:02d}.jpg", quality=92)
        b.close()
    print("ok", out)

if __name__ == "__main__":
    main()
