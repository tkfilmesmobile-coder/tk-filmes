"""Gera as artes de stories (1080x1920) do escritório Tamara Chagas no padrão post-tamara.

uso: python modelos/stories.py <pasta-de-saida> <arquivo-de-conteudo.json>
O JSON é uma lista de stories: {"id", "kicker", "titulo", "texto", "lista", "fonte", "sticker", "foto"}.
- sticker: texto curto do que colar no app (enquete, quiz, caixinha); deixa o espaço livre na arte.
- foto: caminho relativo à pasta marca/fotos (opcional), entra embaixo à direita dissolvendo no fundo.
- foto_css: ajuste de enquadramento (ex. foto deitada: "height:900px;right:-450px").
"""
import json, sys, pathlib, html
from playwright.sync_api import sync_playwright

BASE = pathlib.Path(__file__).resolve().parent.parent  # clientes/tamara-chagas
MARCA = (BASE / "marca").as_uri()

CSS = """
*{margin:0;padding:0;box-sizing:border-box;font-variant-numeric:lining-nums}
:root{--serif:'Libre Baskerville',serif;--sans:'Inter',sans-serif;--ink:#efeeeb;--muted:#a3a19c;--rule:rgba(239,238,235,.24)}
body{width:1080px;height:1920px;overflow:hidden;background:#0b0b0c}
.s{position:relative;width:1080px;height:1920px;padding:270px 96px 0;color:var(--ink);overflow:hidden;font-family:var(--sans);font-weight:300;
  background:radial-gradient(ellipse 900px 700px at 90% 10%,rgba(255,255,255,.06),transparent 62%),#0b0b0c}
.moldura{position:absolute;inset:40px;border:1px solid rgba(239,238,235,.10)}
.fotobox{position:absolute;right:-120px;bottom:0;height:1150px;-webkit-mask-image:linear-gradient(90deg,transparent 0%,#000 38%)}
.fotobox img{height:100%;width:auto;display:block;filter:saturate(.92) contrast(1.04) brightness(.95);-webkit-mask-image:linear-gradient(180deg,transparent 0%,#000 30%,#000 82%,transparent 100%)}
.sombra{position:absolute;inset:0;background:
  linear-gradient(90deg,rgba(11,11,12,.55) 0%,rgba(11,11,12,.2) 45%,rgba(11,11,12,0) 70%)}
.z{position:relative}
.topo{display:flex;align-items:center;gap:22px}
.topo img{width:56px}.topo .fio{width:1px;height:50px;background:var(--rule)}
.topo .nome{font-family:var(--serif);font-size:21px;letter-spacing:.2em}
.topo .sub{font-size:10.5px;letter-spacing:.6em;margin-top:7px;color:var(--muted);font-weight:400}
.kicker{display:flex;align-items:center;gap:20px;margin-top:190px;font-size:16px;letter-spacing:.36em;color:var(--muted);text-transform:uppercase;font-weight:500}
.kicker i{width:48px;height:1px;background:#c9c7c2}
h1{font-family:var(--serif);font-weight:400;font-size:84px;line-height:1.16;letter-spacing:-.022em;margin-top:40px;max-width:880px}
.texto{margin-top:44px;font-size:34px;line-height:1.5;color:#d6d4cf;max-width:860px}
.texto b{font-weight:600;color:var(--ink)}
.lista{margin-top:56px;border-top:1px solid var(--rule);max-width:880px}
.item{display:grid;grid-template-columns:80px 1fr;align-items:baseline;padding:28px 0;border-bottom:1px solid var(--rule)}
.n{font-family:var(--serif);font-size:26px;color:#c9c7c2}
.item p{font-size:30px;line-height:1.45;color:#d6d4cf}.item b{font-weight:600;color:var(--ink)}
.fonte{position:absolute;left:96px;right:96px;bottom:300px;padding-top:18px;border-top:1px solid var(--rule);font-size:21px;line-height:1.6;color:#d6d4cf}
.fonte b{display:block;font-size:13px;letter-spacing:.42em;color:#c9c7c2;font-weight:500;margin-bottom:6px}
.arroba{position:absolute;left:96px;bottom:250px;font-size:15px;letter-spacing:.3em;color:var(--muted);font-weight:500}
"""

def story(s):
    e = lambda t: t  # textos já vêm com <b> controlado por nós
    partes = ['<div class="s">']
    if s.get("foto"):
        partes.append(f'<div class="fotobox" style="{s.get("foto_css","")}"><img src="{MARCA}/fotos/{s["foto"]}"></div><div class="sombra"></div>')
    partes.append('<div class="moldura"></div>')
    partes.append(f'<div class="z topo"><img src="{MARCA}/simbolo-transparente.png"><div class="fio"></div>'
                  '<div><div class="nome">TAMARA CHAGAS</div><div class="sub">ADVOCACIA</div></div></div>')
    if s.get("kicker"):
        partes.append(f'<div class="z kicker"><i></i>{html.escape(s["kicker"])}</div>')
    partes.append(f'<h1 class="z">{e(s["titulo"])}</h1>')
    if s.get("texto"):
        partes.append(f'<p class="z texto">{e(s["texto"])}</p>')
    if s.get("lista"):
        itens = "".join(f'<div class="item"><span class="n">{i+1:02d}</span><p>{e(t)}</p></div>' for i, t in enumerate(s["lista"]))
        partes.append(f'<div class="z lista">{itens}</div>')
    if s.get("fonte"):
        partes.append(f'<div class="fonte"><b>FONTE</b>{e(s["fonte"])}</div>')
    else:
        partes.append('<div class="arroba">@TAMARACHAGAS_PREV</div>')
    partes.append('</div>')
    return ('<!doctype html><html lang="pt-BR"><head><meta charset="utf-8">'
            '<link href="https://fonts.googleapis.com/css2?family=Libre+Baskerville:wght@400;700&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet">'
            f'<style>{CSS}</style></head><body>{"".join(partes)}</body></html>')

def main():
    saida = pathlib.Path(sys.argv[1]).resolve(); saida.mkdir(parents=True, exist_ok=True)
    itens = json.loads(pathlib.Path(sys.argv[2]).read_text(encoding="utf8"))
    with sync_playwright() as p:
        b = p.chromium.launch()
        for s in itens:
            h = saida / f'{s["id"]}.html'
            h.write_text(story(s), encoding="utf8")
            pg = b.new_page(viewport={"width": 1080, "height": 1920})
            pg.goto(h.as_uri()); pg.wait_for_load_state("networkidle"); pg.evaluate("document.fonts.ready")
            pg.screenshot(path=str(saida / f'{s["id"]}.png')); pg.close()
            print("ok", s["id"])
        b.close()

if __name__ == "__main__":
    main()
