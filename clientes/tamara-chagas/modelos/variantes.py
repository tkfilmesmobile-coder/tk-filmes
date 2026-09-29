"""Layouts variados do estilo limpo (2026-09-29), pra diversificar o feed da Tamara.
Todos 1080x1350, com a logo do escritório no topo à esquerda.

uso: python modelos/variantes.py <arquivo.json> <pasta-saida>
Cada item do JSON: {"id", "layout": "retrato|tipografico|foto-cheia|metades|cartao", ...campos do layout}
"""
import json, sys, pathlib
from playwright.sync_api import sync_playwright

BASE = pathlib.Path(__file__).resolve().parent.parent
M = (BASE / "marca").as_uri()
FONTES = ('<link href="https://fonts.googleapis.com/css2?family=Inter:wght@200;300;400;500;600;700;800'
          '&family=Newsreader:ital,opsz,wght@0,6..72,300;0,6..72,400;1,6..72,300;1,6..72,400&display=swap" rel="stylesheet">')
BASECSS = """*{margin:0;padding:0;box-sizing:border-box;font-variant-numeric:lining-nums}
body{width:1080px;height:1350px;overflow:hidden}
.p{position:relative;width:1080px;height:1350px;overflow:hidden;font-family:'Inter',sans-serif}
.logo{position:absolute;left:84px;top:56px;width:124px;z-index:5}
.fonte{font-size:14px;letter-spacing:.02em}.fonte b{font-weight:600;letter-spacing:.2em;font-size:12px;margin-right:10px}
"""

def logo(claro=False):
    return f'<img class="logo" src="{M}/logo-{"claro" if claro else "escuro"}-recortado.png">'

def retrato(c):  # foto da Tamara à direita, texto à esquerda (o padrão)
    lin = "".join(f'<div class="lin"><span>{a}</span><span>{b}</span></div>' for a, b in c["lista"])
    return f"""<style>.p{{background:#ecebe9;color:#141414}}
.foto{{position:absolute;left:300px;top:-60px;width:1150px;-webkit-mask-image:linear-gradient(90deg,transparent 0%,#000 30%)}}
.luz{{position:absolute;inset:0;background:linear-gradient(90deg,rgba(236,235,233,.92) 0%,rgba(236,235,233,.7) 36%,rgba(236,235,233,0) 58%)}}
.b{{position:absolute;left:84px;top:260px;width:600px}}
.k{{font-size:14px;letter-spacing:.3em;font-weight:600;color:#8c7b6b}}
h1{{margin-top:20px;font-size:74px;line-height:1.02;letter-spacing:-.035em;font-weight:200}}h1 b{{font-weight:700}}
.l{{margin-top:34px;width:430px}}.lin{{display:flex;justify-content:space-between;gap:20px;padding:12px 0;border-bottom:1px solid rgba(20,20,20,.18);font-size:22px}}
.lin span:first-child{{font-weight:600;white-space:nowrap}}.lin span:last-child{{text-align:right;font-weight:300}}
.fonte{{margin-top:22px;color:#333}}</style>
<img class="foto" src="{M}/fotos/{c['foto']}"><div class="luz"></div>{logo()}
<div class="b"><div class="k">{c['kicker']}</div><h1>{c['fino']} <b>{c['forte']}</b></h1><div class="l">{lin}</div>
<div class="fonte"><b>FONTE</b>{c['fonte']}</div></div>"""

def tipografico(c):  # sem foto: palavra gigante, fundo claro
    return f"""<style>.p{{background:#f3f1ec;color:#151515}}
.b{{position:absolute;left:84px;right:84px;top:360px}}
.pre{{font-size:40px;font-weight:300;letter-spacing:-.02em;line-height:1.2}}
.giga{{font-size:168px;font-weight:800;letter-spacing:-.06em;line-height:.9;margin-top:18px}}
.pos{{font-size:44px;font-weight:300;letter-spacing:-.02em;margin-top:16px}}.pos b{{font-weight:700}}
.faixa{{display:inline-block;margin-top:44px;background:#151515;color:#f3f1ec;padding:14px 26px;font-size:26px;font-weight:500}}
.obs{{margin-top:34px;font-size:22px;line-height:1.5;color:#444;max-width:760px}}
.fonte{{position:absolute;left:84px;bottom:80px;color:#333}}
.etq{{position:absolute;right:84px;top:92px;font-size:14px;letter-spacing:.3em;font-weight:600;color:#8c7b6b}}</style>
{logo()}<div class="etq">{c['etiqueta']}</div>
<div class="b"><div class="pre">{c['pre']}</div><div class="giga">{c['giga']}</div><div class="pos">{c['pos']}</div>
<div class="faixa">{c['faixa']}</div><p class="obs">{c['obs']}</p></div>
<div class="fonte"><b>FONTE</b>{c['fonte']}</div>"""

def foto_cheia(c):  # foto grande da pessoa de um lado, serifa com itálico no fundo livre (nunca sobre rosto)
    if c.get("escuro"):  # foto escura em tela cheia: texto branco no lado vazio da foto, rosto do outro lado
        return f"""<style>.p{{background:#111;color:#fff}}
.foto{{position:absolute;{c['foto_css']}}}
.veu{{position:absolute;inset:0;background:linear-gradient(90deg,rgba(0,0,0,.55) 0%,rgba(0,0,0,.25) 45%,rgba(0,0,0,0) 65%)}}
.b{{position:absolute;left:84px;top:{c.get('topo',300)}px;width:{c.get('largura',520)}px}}
.rot{{display:flex;gap:34px;font-size:14px;letter-spacing:.2em;font-weight:600}}.rot span:last-child{{font-weight:400;color:#d8c9b8}}
h1{{font-family:'Newsreader',serif;font-weight:300;font-size:88px;line-height:1.02;letter-spacing:-.02em;margin-top:24px}}h1 i{{font-style:italic}}
.sub{{margin-top:28px;font-size:21px;font-weight:600;letter-spacing:.04em;text-transform:uppercase;text-decoration:underline;text-underline-offset:8px;line-height:1.7}}
.fonte{{position:absolute;left:84px;bottom:80px;color:#ddd}}</style>
<img class="foto" src="{M}/fotos/{c['foto']}"><div class="veu"></div>{logo(True)}
<div class="b"><div class="rot"><span>{c['rot1']}</span><span>{c['rot2']}</span></div><h1>{c['titulo']}</h1><div class="sub">{c['sub']}</div></div>
<div class="fonte">{c['fonte']}</div>"""
    return f"""<style>.p{{background:#ecebe9;color:#161616}}
.foto{{position:absolute;-webkit-mask-image:linear-gradient(90deg,transparent 0%,#000 28%);{c.get('foto_css','left:330px;top:-40px;width:1150px')}}}
.b{{position:absolute;left:84px;top:{c.get('topo',300)}px;width:{c.get('largura',560)}px}}
.rot{{display:flex;gap:34px;font-size:14px;letter-spacing:.2em;font-weight:600}}.rot span:last-child{{font-weight:400;color:#8c7b6b}}
h1{{font-family:'Newsreader',serif;font-weight:300;font-size:88px;line-height:1.02;letter-spacing:-.02em;margin-top:24px}}h1 i{{font-style:italic}}
.sub{{margin-top:28px;font-size:21px;font-weight:600;letter-spacing:.04em;text-transform:uppercase;text-decoration:underline;text-underline-offset:8px;line-height:1.7}}
.fonte{{position:absolute;left:84px;bottom:80px;color:#333}}</style>
<img class="foto" src="{M}/fotos/{c['foto']}">{logo()}
<div class="b"><div class="rot"><span>{c['rot1']}</span><span>{c['rot2']}</span></div><h1>{c['titulo']}</h1><div class="sub">{c['sub']}</div></div>
<div class="fonte">{c['fonte']}</div>"""

def metades(c):  # duas faixas: foto de um lado, texto do outro, alternando (texto nunca sobre rosto)
    return f"""<style>.p{{background:#ecebe9;color:#161616}}
.f{{position:absolute;left:0;width:1080px;height:675px;overflow:hidden}}.f1{{top:0;background:#e3e2e0}}.f2{{top:675px;background:#ecebe9}}
.f img{{position:absolute}}
.f1 img{{{c['img1_css']};-webkit-mask-image:linear-gradient(90deg,transparent 0%,#000 30%)}}
.f2 img{{{c['img2_css']};-webkit-mask-image:linear-gradient(270deg,transparent 0%,#000 30%)}}
.t{{position:absolute;font-size:62px;line-height:1.1;font-weight:300;letter-spacing:-.02em;text-transform:uppercase}}.t b{{font-weight:700}}
.t1{{left:84px;top:270px}}.t2{{right:84px;top:940px;text-align:right}}
.rod{{position:absolute;left:84px;right:84px;bottom:56px;display:flex;justify-content:space-between;font-size:14px;letter-spacing:.14em}}
.rod i{{font-family:'Newsreader',serif;font-style:italic;letter-spacing:0;font-size:19px;color:#8c7b6b}}</style>
<div class="f f1"><img src="{M}/fotos/{c['foto1']}"></div><div class="f f2"><img src="{M}/fotos/{c['foto2']}"></div>{logo()}
<div class="t t1">{c['t1']}</div><div class="t t2">{c['t2']}</div>
<div class="rod">{c['rodape']}</div>"""

def cartao(c):  # cartão imitando um post/mensagem, pra boato e "viu isso no WhatsApp?"
    return f"""<style>.p{{background:#ecebe9;color:#141414}}
.card{{position:absolute;left:120px;right:120px;top:260px;bottom:230px;background:#fff;box-shadow:0 30px 80px rgba(0,0,0,.08);border:1px solid rgba(0,0,0,.06);border-radius:44px;padding:56px 64px}}
.top{{display:flex;align-items:center;gap:18px;font-size:22px;font-weight:600}}.top img{{width:58px;height:58px;border-radius:50%;object-fit:cover;object-position:50% 18%}}
.top small{{display:block;font-size:17px;font-weight:400;color:#888}}
.msg{{margin-top:70px;font-size:34px;font-weight:300;line-height:1.3;color:#444}}
.giga{{font-size:92px;font-weight:700;letter-spacing:-.04em;line-height:.98;margin-top:18px}}
.selo{{display:inline-block;margin-top:40px;border:1.5px solid #141414;border-radius:999px;padding:10px 26px;font-size:22px;letter-spacing:.12em;font-weight:600}}
.fonte{{position:absolute;left:120px;bottom:130px;color:#555}}</style>
{logo()}<div class="card"><div class="top"><img src="{M}/fotos/tamara/tamara-estudio-0164.jpg"><div>tamarachagas_prev<small>Direito Previdenciário</small></div></div>
<div class="msg">{c['msg']}</div><div class="giga">{c['giga']}</div><div class="selo">{c['selo']}</div></div>
<div class="fonte"><b>FONTE</b>{c['fonte']}</div>"""

LAYOUTS = {"retrato": retrato, "tipografico": tipografico, "foto-cheia": foto_cheia, "metades": metades, "cartao": cartao}

def main():
    itens = json.loads(pathlib.Path(sys.argv[1]).read_text(encoding="utf-8-sig"))
    saida = pathlib.Path(sys.argv[2]).resolve(); saida.mkdir(parents=True, exist_ok=True)
    with sync_playwright() as p:
        b = p.chromium.launch()
        for c in itens:
            html = f'<!doctype html><html lang="pt-BR"><head><meta charset="utf-8">{FONTES}<style>{BASECSS}</style></head><body><div class="p">{LAYOUTS[c["layout"]](c)}</div></body></html>'
            h = saida / f'{c["id"]}.html'; h.write_text(html, encoding="utf8")
            pg = b.new_page(viewport={"width": 1080, "height": 1350}); pg.goto(h.as_uri())
            pg.wait_for_load_state("networkidle"); pg.evaluate("document.fonts.ready")
            pg.screenshot(path=str(saida / f'{c["id"]}.png')); pg.close(); print("ok", c["id"])
        b.close()

if __name__ == "__main__":
    main()
