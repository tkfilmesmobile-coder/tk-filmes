"""Trio de stories que acompanha cada post novo do feed (regra da Talyta, 2026-09-30).
1 · post-card (anuncia o post, "fala" da Dra. Tamara)   2 · bloco de notas (resumo + fonte)
3 · conversa de WhatsApp ilustrativa (dúvida comum respondida). 1080x1920, sai em PNG e JPG.

uso: python modelos/stories_trio.py <pasta-do-post>   (lê <pasta>/trio.json, grava <pasta>/stories/)
trio.json: {"data": "30 de setembro de 2026",
  "card": "texto (aceita <b>)",
  "notas": {"hora": "09:12", "titulo": "...", "linhas": ["...", "..."], "marca": "trecho com marca-texto"},
  "conversa": [["in", "texto", "09:10"], ["out", "texto", "09:11"]],
  "fonte": "TSE · 29/09/2026"}
"""
import json, sys, pathlib, html as H
from playwright.sync_api import sync_playwright
from PIL import Image

M = (pathlib.Path(__file__).resolve().parent.parent / "marca").as_uri()
AV = f"{M}/fotos/tamara/tamara-estudio-0164.jpg"
F = '<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">'
BASE = "*{margin:0;padding:0;box-sizing:border-box}body{width:1080px;height:1920px;overflow:hidden;font-family:'Inter',sans-serif}"

def card(c):
    return f"""<style>body{{background:#ecebe9}}
.logo{{position:absolute;left:70px;top:240px;width:150px}}
.selo{{position:absolute;left:70px;top:470px;background:#141414;color:#fff;font-size:34px;font-weight:600;padding:12px 26px;border-radius:999px;transform:rotate(-2deg)}}
.card{{position:absolute;left:70px;right:70px;top:580px;background:#fff;border-radius:40px;padding:60px 64px;box-shadow:0 30px 80px rgba(0,0,0,.08)}}
.h{{display:flex;align-items:center;gap:24px}}.h img{{width:110px;height:110px;border-radius:50%;object-fit:cover;object-position:50% 18%}}
.h b{{font-size:40px;display:block}}.h span{{font-size:32px;color:#777}}
.t{{margin-top:44px;font-size:52px;line-height:1.35;color:#141414}}.t b{{font-weight:700}}
.m{{margin-top:44px;padding-top:28px;border-top:1px solid #eee;font-size:30px;color:#888}}
.fonte{{position:absolute;bottom:230px;left:70px;font-size:28px;color:#666}}</style>
<img class="logo" src="{M}/logo-escuro-recortado.png"><div class="selo">{c.get('selo', 'post novo no feed 📌')}</div>
<div class="card"><div class="h"><img src="{AV}"><div><b>Dra. Tamara Chagas</b><span>@tamarachagas_prev</span></div></div>
<div class="t">{c['card']}</div><div class="m">{c['data']}</div></div>
<div class="fonte">fonte: {H.escape(c['fonte'])}</div>"""

def notas(c):
    n = c["notas"]; marca = n.get("marca", "")
    def lin(t):
        return t.replace(marca, f'<span class="hl">{marca}</span>', 1) if marca and marca in t else t
    ps = "".join(f"<p>{lin(t)}</p>" for t in n["linhas"])
    return f"""<style>body{{background:#f7f6f2}}
.top{{position:absolute;top:210px;left:70px;right:70px;display:flex;justify-content:space-between;color:#d9a300;font-size:40px;font-weight:500}}
.data{{position:absolute;top:320px;left:0;right:0;text-align:center;color:#999;font-size:30px}}
.txt{{position:absolute;top:400px;left:80px;right:80px;font-size:50px;line-height:1.35;color:#1b1b1b}}
.txt h1{{font-size:76px;font-weight:700;margin-bottom:34px;line-height:1.1}}
.txt p{{margin-bottom:28px}}.txt b{{font-weight:700}}
.hl{{background:linear-gradient(transparent 55%,#ffe27a 55%)}}
.fonte{{position:absolute;bottom:260px;left:80px;right:80px;font-size:28px;color:#8a8a8a}}</style>
<div class="top"><span>‹ Notas</span><span>Concluído</span></div>
<div class="data">{c['data']} às {n['hora']}</div>
<div class="txt"><h1>{n['titulo']}</h1>{ps}</div>
<div class="fonte">fonte: {H.escape(c['fonte'])}</div>"""

def conversa(c):
    bolhas = "".join(f'<div class="b {lado}">{t}<small>{h}</small></div>' for lado, t, h in c["conversa"])
    return f"""<style>body{{background:#efe7dd}}
.bar{{position:absolute;top:200px;left:0;right:0;height:150px;background:#f7f3ee;display:flex;align-items:center;gap:26px;padding:0 50px;border-bottom:1px solid #ddd}}
.bar img{{width:96px;height:96px;border-radius:50%;object-fit:cover;object-position:50% 18%}}.bar b{{font-size:38px;display:block}}.bar span{{font-size:28px;color:#6b8e5a}}
.c{{position:absolute;top:420px;left:50px;right:50px;display:flex;flex-direction:column;gap:30px}}
.b{{max-width:820px;padding:26px 34px 40px;border-radius:30px;font-size:44px;line-height:1.35;position:relative}}
.b small{{position:absolute;right:26px;bottom:10px;font-size:22px;color:#888}}
.in{{background:#fff;align-self:flex-start;border-top-left-radius:6px}}.out{{background:#d9fdd3;align-self:flex-end;border-top-right-radius:6px}}
.fonte{{position:absolute;bottom:260px;left:60px;right:60px;font-size:28px;color:#6d6358}}</style>
<div class="bar"><img src="{AV}"><div><b>Dra. Tamara Chagas</b><span>online</span></div></div>
<div class="c">{bolhas}</div>
<div class="fonte">conversa ilustrativa · fonte: {H.escape(c['fonte'])}</div>"""

def main():
    pasta = pathlib.Path(sys.argv[1]).resolve()
    c = json.loads((pasta / "trio.json").read_text(encoding="utf-8-sig"))
    out = pasta / "stories"; out.mkdir(exist_ok=True)
    with sync_playwright() as p:
        b = p.chromium.launch()
        for nome, fn in [("1-card", card), ("2-notas", notas), ("3-conversa", conversa)]:
            h = out / f"{nome}.html"
            h.write_text(f'<!doctype html><html><head><meta charset="utf-8">{F}<style>{BASE}</style></head><body>{fn(c)}</body></html>', encoding="utf8")
            pg = b.new_page(viewport={"width": 1080, "height": 1920}); pg.goto(h.as_uri())
            pg.wait_for_load_state("networkidle"); pg.evaluate("document.fonts.ready")
            png = out / f"{nome}.png"; pg.screenshot(path=str(png)); pg.close()
            Image.open(png).convert("RGB").save(out / f"{nome}.jpg", quality=92)
        b.close()
    print("ok", out)

if __name__ == "__main__":
    main()
