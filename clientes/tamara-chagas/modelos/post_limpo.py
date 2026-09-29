"""Post de feed "limpo" (padrão de 2026-09-29): foto cheia da Tamara em fundo claro, título grande
em Inter fino + negrito, etiquetas pequenas nas bordas, @ em pílula, quase nenhum enfeite.

uso: python modelos/post_limpo.py <pasta-do-post> [story]
Lê <pasta>/conteudo.json e gera post.html/post.png (1080x1350) ou story.html/story.png (1080x1920).
conteudo.json: {"foto": "tamara/tamara-estudio-0081.jpg", "foto_css": "left:260px;width:1150px;top:-40px",
  "etiquetas": ["PREVIDENCIÁRIO", "INSS", "OUTUBRO"], "fino": "Ganha acima do", "forte": "mínimo?",
  "destaque": "O pagamento começa quinta, 01/10.", "lista_titulo": "...", "lista": [["1 e 6","qui, 01/10"], ...],
  "nota": "...", "fonte": "INSS · gov.br/inss · 22/09/2026"}
"""
import json, sys, pathlib
from playwright.sync_api import sync_playwright

BASE = pathlib.Path(__file__).resolve().parent.parent
MARCA = (BASE / "marca").as_uri()

CSS = """
*{margin:0;padding:0;box-sizing:border-box;font-variant-numeric:lining-nums}
body{width:1080px;height:__H__px;overflow:hidden;background:#ecebe9}
.p{position:relative;width:1080px;height:__H__px;overflow:hidden;font-family:'Inter',sans-serif;color:#141414;background:#ecebe9}
.foto{position:absolute;height:auto;-webkit-mask-image:linear-gradient(90deg,transparent 0%,#000 30%)}
.luz{position:absolute;inset:0;background:linear-gradient(90deg,rgba(236,235,233,.92) 0%,rgba(236,235,233,.75) 36%,rgba(236,235,233,0) 58%)}
.etq{position:absolute;left:300px;right:96px;display:flex;justify-content:space-between;font-size:15px;letter-spacing:.18em;font-weight:500;color:#2a2a2a}
.etq.cima{top:__ET__px;padding-top:30px}.etq.baixo{bottom:__EB__px}
.bloco{position:absolute;left:84px;top:__BT__px;width:600px}
.pilula{display:inline-flex;align-items:center;gap:12px;border:1.5px solid #1a1a1a;border-radius:999px;padding:6px 18px 6px 6px;font-size:19px;font-weight:500;background:rgba(255,255,255,.55)}
.pilula img{width:40px;height:40px;border-radius:50%;object-fit:cover;object-position:50% 18%}
h1{margin-top:24px;font-size:74px;line-height:1.02;letter-spacing:-.035em;font-weight:200}
h1 b{font-weight:700;letter-spacing:-.04em}
.destaque{display:inline-block;margin-top:22px;background:rgba(20,20,20,.08);padding:10px 20px;font-size:26px;font-weight:500;letter-spacing:-.01em}
.lista{margin-top:28px;width:420px}
.lista small{display:block;font-size:13px;letter-spacing:.22em;font-weight:600;color:#555;margin-bottom:8px}
.lin{display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid rgba(20,20,20,.18);font-size:23px}
.lin span:first-child{font-weight:300}.lin span:last-child{font-weight:600}
.nota{margin-top:24px;font-size:19px;line-height:1.5;color:#333;width:470px}
.leia{margin-top:26px;font-size:17px;letter-spacing:.28em;color:#111}.leia b{font-weight:700}.leia i{font-style:normal;color:#8c7b6b}
.fonte{margin-top:18px;font-size:14px;color:#3a3a3a;letter-spacing:.02em}
.logo{position:absolute;left:84px;top:__LT__px;width:124px}
.assina{position:absolute;left:96px;bottom:__FB__px;font-size:14px;letter-spacing:.3em;font-weight:600;color:#1a1a1a}.assina span{font-weight:400;margin-left:10px;color:#555}
.fonte b{font-weight:600;letter-spacing:.2em;font-size:12px;margin-right:10px}
"""

def pagina(c, story=False):
    H = 1920 if story else 1350
    css = (CSS.replace("__H__", str(H)).replace("__ET__", "250" if story else "70")
           .replace("__EB__", "250" if story else "70").replace("__BT__", "560" if story else "250")
           .replace("__FB__", "310" if story else "118").replace("__LT__", "220" if story else "50"))
    et = lambda xs: "".join(f"<span>{x}</span>" for x in xs)
    lista = ""
    if c.get("lista"):
        lista = (f'<div class="lista"><small>{c.get("lista_titulo","")}</small>' +
                 "".join(f'<div class="lin"><span>{a}</span><span>{b}</span></div>' for a, b in c["lista"]) + "</div>")
    foto_css = c.get("story_foto_css" if story else "foto_css", c.get("foto_css", ""))
    return f"""<!doctype html><html lang="pt-BR"><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@200;300;400;500;600;700&display=swap" rel="stylesheet">
<style>{css}</style></head><body><div class="p">
<img class="foto" style="{foto_css}" src="{MARCA}/fotos/{c['foto']}">
<div class="luz"></div>
<div class="etq cima">{et(c.get('etiquetas', []))}</div>
<div class="bloco">
  <div class="pilula"><img src="{MARCA}/fotos/tamara/tamara-estudio-0164.jpg">@tamarachagas_prev</div>
  <h1>{c['fino']} <b>{c['forte']}</b></h1>
  {f'<div class="destaque">{c["destaque"]}</div>' if c.get('destaque') else ''}
  {lista}
  {f'<p class="nota">{c["nota"]}</p>' if c.get('nota') else ''}
  <div class="fonte"><b>FONTE</b>{c['fonte']}</div>
  <div class="leia"><b>Leia</b> a legenda <i>↘</i></div>
</div>
<img class="logo" src="{MARCA}/logo-escuro-recortado.png">
</div></body></html>"""

def main():
    pasta = pathlib.Path(sys.argv[1]).resolve()
    story = len(sys.argv) > 2 and sys.argv[2] == "story"
    c = json.loads((pasta / "conteudo.json").read_text(encoding="utf-8-sig"))
    nome = "story" if story else "post"
    (pasta / f"{nome}.html").write_text(pagina(c, story), encoding="utf8")
    with sync_playwright() as p:
        b = p.chromium.launch()
        pg = b.new_page(viewport={"width": 1080, "height": 1920 if story else 1350})
        pg.goto((pasta / f"{nome}.html").as_uri()); pg.wait_for_load_state("networkidle"); pg.evaluate("document.fonts.ready")
        pg.screenshot(path=str(pasta / f"{nome}.png")); b.close()
    print("ok", pasta / f"{nome}.png")

if __name__ == "__main__":
    main()
