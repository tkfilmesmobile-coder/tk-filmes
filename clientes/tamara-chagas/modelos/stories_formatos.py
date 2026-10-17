"""Formatos alternativos de stories (1080x1920) pra Talyta escolher. Prévia com o mesmo conteúdo.
uso: python modelos/stories_formatos.py <pasta-saida>"""
import sys, pathlib
from playwright.sync_api import sync_playwright

M = (pathlib.Path(__file__).resolve().parent.parent / "marca").as_uri()
AV = f"{M}/fotos/tamara/tamara-estudio-0164.jpg"
F = ('<link href="https://fonts.googleapis.com/css2?family=Inter:wght@200;300;400;500;600;700;800'
     '&family=Newsreader:ital,opsz,wght@0,6..72,300;1,6..72,300&display=swap" rel="stylesheet">')
BASE = "*{margin:0;padding:0;box-sizing:border-box}body{width:1080px;height:1920px;overflow:hidden;font-family:'Inter',sans-serif}"

NOTAS = f"""<style>body{{background:#f7f6f2}}
.top{{position:absolute;top:210px;left:70px;right:70px;display:flex;justify-content:space-between;color:#d9a300;font-size:40px;font-weight:500}}
.data{{position:absolute;top:320px;left:0;right:0;text-align:center;color:#999;font-size:30px}}
.txt{{position:absolute;top:400px;left:80px;right:80px;font-size:52px;line-height:1.35;color:#1b1b1b}}
.txt h1{{font-size:78px;font-weight:700;margin-bottom:34px;line-height:1.1}}
.txt p{{margin-bottom:30px}}.txt b{{font-weight:700}}
.hl{{background:linear-gradient(transparent 55%,#ffe27a 55%)}}
.fonte{{position:absolute;bottom:260px;left:80px;right:80px;font-size:28px;color:#8a8a8a}}</style>
<div class="top"><span>‹ Notas</span><span>Concluído</span></div>
<div class="data">30 de setembro de 2026 às 09:12</div>
<div class="txt"><h1>70 anos ou mais: sou obrigado a votar?</h1>
<p><span class="hl"><b>Não.</b></span> Depois dos 70, o voto é facultativo.</p>
<p>✔️ não precisa justificar<br>✔️ não tem multa</p>
<p>Mas se quiser votar, <b>conta como prova de vida no INSS</b> 💛</p></div>
<div class="fonte">fonte: TSE · Ministério da Previdência, 18/09/2026</div>"""

TWEET = f"""<style>body{{background:#ecebe9}}
.card{{position:absolute;left:70px;right:70px;top:560px;background:#fff;border-radius:40px;padding:60px 64px;box-shadow:0 30px 80px rgba(0,0,0,.08)}}
.h{{display:flex;align-items:center;gap:24px}}.h img{{width:110px;height:110px;border-radius:50%;object-fit:cover;object-position:50% 18%}}
.h b{{font-size:40px;display:block}}.h span{{font-size:32px;color:#777}}
.t{{margin-top:44px;font-size:54px;line-height:1.35;color:#141414}}.t b{{font-weight:700}}
.m{{margin-top:44px;padding-top:28px;border-top:1px solid #eee;display:flex;gap:60px;font-size:30px;color:#888}}
.logo{{position:absolute;left:70px;top:240px;width:150px}}
.fonte{{position:absolute;bottom:230px;left:70px;font-size:28px;color:#666}}</style>
<img class="logo" src="{M}/logo-escuro-recortado.png">
<div class="card"><div class="h"><img src="{AV}"><div><b>Dra. Tamara Chagas</b><span>@tamarachagas_prev</span></div></div>
<div class="t">Pergunta que aparece muito nessa época: <b>"tenho 70 anos, sou obrigada a votar?"</b><br><br>Não. Depois dos 70, o voto é facultativo: sem justificativa e sem multa. E se votar, conta como prova de vida no INSS. 💛</div>
<div class="m"><span>30 de setembro de 2026</span></div></div>
<div class="fonte">fonte: TSE · Ministério da Previdência, 18/09/2026</div>"""

CHAT = f"""<style>body{{background:#efe7dd}}
.bar{{position:absolute;top:200px;left:0;right:0;height:150px;background:#f7f3ee;display:flex;align-items:center;gap:26px;padding:0 50px;border-bottom:1px solid #ddd}}
.bar img{{width:96px;height:96px;border-radius:50%;object-fit:cover;object-position:50% 18%}}.bar b{{font-size:38px;display:block}}.bar span{{font-size:28px;color:#6b8e5a}}
.c{{position:absolute;top:420px;left:50px;right:50px;display:flex;flex-direction:column;gap:30px}}
.b{{max-width:800px;padding:26px 34px 36px;border-radius:30px;font-size:44px;line-height:1.35;position:relative}}
.b small{{position:absolute;right:26px;bottom:10px;font-size:22px;color:#888}}
.in{{background:#fff;align-self:flex-start;border-top-left-radius:6px}}.out{{background:#d9fdd3;align-self:flex-end;border-top-right-radius:6px}}
.fonte{{position:absolute;bottom:280px;left:60px;font-size:28px;color:#6d6358}}</style>
<div class="bar"><img src="{AV}"><div><b>Dra. Tamara Chagas</b><span>online</span></div></div>
<div class="c">
<div class="b in">Doutora, minha mãe tem 72 anos. Ela é obrigada a votar domingo? 🤔<small>09:10</small></div>
<div class="b out">Não! Depois dos 70 o voto é facultativo. Ela não precisa justificar e não paga multa 😊<small>09:11</small></div>
<div class="b out">Mas se ela quiser votar, o voto conta como prova de vida no INSS 💛<small>09:11</small></div>
<div class="b in">Que ótimo, vou avisar ela! 🙏<small>09:12</small></div></div>
<div class="fonte">conversa ilustrativa · fonte: TSE · Previdência, 18/09/2026</div>"""

EDITORIAL = f"""<style>body{{background:#ecebe9}}
.foto{{position:absolute;left:330px;top:760px;width:1150px;-webkit-mask-image:linear-gradient(90deg,transparent 0%,#000 30%),linear-gradient(180deg,transparent 0%,#000 20%);-webkit-mask-composite:source-in}}
.logo{{position:absolute;left:84px;top:240px;width:140px}}
.b{{position:absolute;left:84px;right:84px;top:450px}}
.k{{font-size:26px;letter-spacing:.3em;font-weight:600;color:#8c7b6b}}
h1{{margin-top:26px;font-size:104px;line-height:1.02;letter-spacing:-.04em;font-weight:200}}h1 b{{font-weight:800}}
.f{{display:inline-block;margin-top:34px;background:#141414;color:#fff;padding:14px 26px;font-size:34px;font-weight:500}}
.l{{margin-top:34px;font-size:38px;line-height:1.5;color:#333;width:520px}}
.fonte{{position:absolute;bottom:260px;left:84px;font-size:26px;color:#555}}</style>
<img class="foto" src="{M}/fotos/tamara/tamara-estudio-0081.jpg"><img class="logo" src="{M}/logo-escuro-recortado.png">
<div class="b"><div class="k">70 ANOS OU MAIS</div><h1>Obrigado a votar? <b>Não.</b></h1><div class="f">o voto é facultativo</div>
<p class="l">Sem justificativa, sem multa. E se votar, conta como prova de vida no INSS.</p></div>
<div class="fonte">fonte: TSE · Previdência, 18/09/2026</div>"""

def main():
    out = pathlib.Path(sys.argv[1]).resolve(); out.mkdir(parents=True, exist_ok=True)
    itens = {"A-notas": NOTAS, "B-post-card": TWEET, "C-conversa": CHAT, "D-editorial": EDITORIAL}
    with sync_playwright() as p:
        b = p.chromium.launch()
        for k, corpo in itens.items():
            h = out / f"{k}.html"
            h.write_text(f'<!doctype html><html><head><meta charset="utf-8">{F}<style>{BASE}</style></head><body>{corpo}</body></html>', encoding="utf8")
            pg = b.new_page(viewport={"width": 1080, "height": 1920}); pg.goto(h.as_uri())
            pg.wait_for_load_state("networkidle"); pg.evaluate("document.fonts.ready")
            pg.screenshot(path=str(out / f"{k}.png")); pg.close()
        b.close()
    print("ok")

if __name__ == "__main__":
    main()
