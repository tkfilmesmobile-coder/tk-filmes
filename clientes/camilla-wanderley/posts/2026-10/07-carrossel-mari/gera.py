"""Carrossel "o caso da Mari" (pedido da Talyta em 2026-10-21, pra sair em 22/10): 6 slides com as fotos que ela
mandou (as mesmas do depoimento em vídeo 1010), estética foto editorial (marca/esteticas.md). Texto tirado das falas do vídeo.
Estética das referências enviadas pela Talyta em 2026-10-10 (implante / clareamento / prótese):
foto real inteira, cor natural com leve tom de cinema, texto branco por cima alternando três linguagens:
  A · caixa alta pequena + sans grossa em minúsculas, enorme (Poppins 700) + caixa alta pequena;
  B · caixa alta fina enorme (Montserrat 300) + linha em minúsculas + nota em caixa contornada;
  C · caixa alta pequena + serifa grande (Playfair 400) + selo vinho.
Pílula contornada no topo da capa; @ da doutora embaixo. Fotos do banco da doutora (diária 2026-09-03).
Uso: python gera.py
"""
import os, subprocess, sys

AQUI = os.path.dirname(os.path.abspath(__file__)).replace("\\", "/")
CHROME = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
F = lambda n: f"file:///{AQUI}/fotos/{n}.jpg"

CSS = """
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@500;600;700&family=Montserrat:wght@300;400;500;600&family=Playfair+Display:wght@400;500&display=swap');
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:1080px;height:1350px;overflow:hidden;background:#111}
.p{position:relative;width:1080px;height:1350px;overflow:hidden;color:#fff;font-family:Montserrat,sans-serif}
.foto{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;filter:saturate(.86) contrast(1.06) brightness(.97)}
.sombra{position:absolute;inset:0}
.pilula{position:absolute;top:58px;left:50%;translate:-50% 0;border:1.6px solid rgba(255,255,255,.9);border-radius:40px;padding:12px 34px;font-size:19px;letter-spacing:5px;font-weight:500;white-space:nowrap}
.topo{position:absolute;top:56px;left:0;right:0;text-align:center;font-size:19px;letter-spacing:3px;font-weight:400;opacity:.92}
.arroba{position:absolute;bottom:46px;left:0;right:0;text-align:center;font-family:Poppins;font-weight:500;font-size:22px;opacity:.95}
.sh{text-shadow:0 2px 24px rgba(0,0,0,.35)}
/* A */
.capsP{font-family:Montserrat;font-weight:500;font-size:38px;letter-spacing:1px;text-transform:uppercase}
.grosso{font-family:Poppins;font-weight:700;letter-spacing:-4px;line-height:.92}
/* B */
.fino{font-family:Montserrat;font-weight:300;text-transform:uppercase;letter-spacing:-2px;line-height:.98}
.fino2{font-family:Montserrat;font-weight:300;font-size:50px;letter-spacing:-1px}
.nota{border:1.4px solid rgba(255,255,255,.85);padding:18px 24px;font-family:Montserrat;font-weight:300;font-size:30px;line-height:1.12;letter-spacing:-.5px}
/* C */
.serifa{font-family:'Playfair Display';font-weight:400;letter-spacing:-2px;line-height:.98}
.selo{display:inline-block;background:#8E2737;padding:14px 24px;font-family:Montserrat;font-weight:500;font-size:32px;line-height:1.2;text-transform:uppercase;text-align:center}
.selo b{font-weight:700}
.split{position:absolute;left:0;right:0;height:50%;overflow:hidden}
.split img{width:100%;height:100%;object-fit:cover;filter:saturate(.9) contrast(1.04)}
.etq{position:absolute;left:50%;translate:-50% 0;background:rgba(142,39,55,.88);padding:10px 26px;border-radius:30px;font-family:Montserrat;font-weight:600;font-size:20px;letter-spacing:6px}
"""


SO = set(sys.argv[1:])


def pagina(nome, corpo):
    if SO and nome not in SO:
        return
    html = f'<!doctype html><html><head><meta charset="utf-8"><style>{CSS}</style></head><body><div class="p">{corpo}</div></body></html>'
    hp = f"{AQUI}/{nome}.html"
    open(hp, "w", encoding="utf-8").write(html)
    subprocess.run([CHROME, "--headless=new", f"--user-data-dir={AQUI}/.chrome-render", "--hide-scrollbars", "--virtual-time-budget=6000", "--allow-file-access-from-files",
                    "--window-size=1080,1350", f"--screenshot={AQUI}/{nome}.png", "file:///" + hp], capture_output=True)
    print(nome)


ARROBA = '<div class="arroba">@dra.camillawanderley</div>'
TOPO = '<div class="topo">DRA. CAMILLA WANDERLEY | CLÍNICA GERAL E ENDODONTIA</div>'

# 1 · capa (A): a Mari no espelho
pagina("01", f"""<img class="foto" src="{F('06')}" style="object-position:center 22%">
<div class="sombra" style="background:linear-gradient(to bottom,rgba(0,0,0,.25) 0%,rgba(0,0,0,0) 18%,rgba(0,0,0,0) 48%,rgba(0,0,0,.58) 76%,rgba(0,0,0,.7) 100%)"></div>
<div class="pilula">PACIENTE DESDE 2019</div>
<div class="sh" style="position:absolute;left:0;right:0;top:820px;text-align:center">
  <div class="capsP">o caso da Mari</div>
  <div class="grosso" style="font-size:150px;margin-top:8px">7 anos de</div>
  <div class="grosso" style="font-size:150px">sorriso</div>
  <div class="capsP" style="font-size:31px;margin-top:20px">do aparelho até hoje…</div>
</div>""")

# 2 · antes: a vergonha da foto (B)
pagina("02", f"""<img class="foto" src="{F('03')}" style="object-position:62% 30%">
<div class="sombra" style="background:linear-gradient(to bottom,rgba(0,0,0,.62) 0%,rgba(0,0,0,.4) 42%,rgba(0,0,0,.05) 66%,rgba(0,0,0,.35) 100%)"></div>
{TOPO}
<div class="sh" style="position:absolute;left:110px;top:200px;width:880px">
  <div class="fino" style="font-size:92px">Ela tinha<br>vergonha de<br>tirar foto,</div>
  <div class="fino2" style="margin-top:14px">principalmente de um lado</div>
</div>
<div class="nota sh" style="position:absolute;right:70px;top:1060px;width:450px">o canino fora de posição incomodava, e ela nem sabia que dava pra mudar</div>
{ARROBA}""")

# 3 · o caminho: antes e depois (C, com as duas fotos clínicas)
pagina("03", f"""<div class="split" style="top:0"><img src="{F('02')}" style="object-position:center 55%"></div>
<div class="split" style="top:50%"><img src="{F('07')}" style="object-position:center 50%"></div>
<div class="sombra" style="background:linear-gradient(to bottom,rgba(0,0,0,.15) 0%,rgba(0,0,0,.55) 38%,rgba(0,0,0,.6) 62%,rgba(0,0,0,.15) 100%)"></div>
<div class="etq" style="top:56px">ANTES</div>
<div class="etq" style="bottom:110px">DEPOIS</div>
<div class="sh" style="position:absolute;left:0;right:0;top:470px;text-align:center">
  <div style="font-family:Montserrat;font-weight:500;font-size:34px">O <b style="font-weight:700">CAMINHO</b></div>
  <div class="serifa" style="font-size:96px;margin-top:10px">aparelho, clareamento<br>e ajustes em resina</div>
</div>
{ARROBA}""")

# 4 · ela queria lente (A)
pagina("04", f"""<img class="foto" src="{F('01')}" style="filter:blur(38px) brightness(.7);transform:scale(1.2)">
<img src="{F('01')}" style="position:absolute;left:0;top:150px;width:1080px;height:720px;object-fit:cover;filter:saturate(.86) contrast(1.06)">
<div class="sombra" style="background:linear-gradient(to bottom,rgba(0,0,0,.2) 0%,rgba(0,0,0,0) 26%,rgba(0,0,0,.5) 56%,rgba(0,0,0,.72) 100%)"></div>
<div class="sh" style="position:absolute;left:0;right:0;top:900px;text-align:center">
  <div class="capsP" style="font-size:34px">ela achava que precisava de lente.</div>
  <div class="grosso" style="font-size:140px;margin-top:12px">não<br>precisou</div>
  <div class="capsP" style="font-size:30px;margin-top:22px;line-height:1.35">só alguns ajustes,<br>e ficou bem mais natural</div>
</div>""")

# 5 · paciente exemplo (A, texto embaixo pra não cobrir os rostos)
pagina("05", f"""<img class="foto" src="{F('04')}" style="object-position:center 15%">
<div class="sombra" style="background:linear-gradient(to bottom,rgba(0,0,0,.15) 0%,rgba(0,0,0,0) 35%,rgba(0,0,0,.55) 62%,rgba(0,0,0,.72) 100%)"></div>
<div class="sh" style="position:absolute;left:0;right:0;top:860px;text-align:center">
  <div class="capsP" style="font-size:34px">paciente exemplo:</div>
  <div class="grosso" style="font-size:136px;margin-top:10px">6 em 6 meses</div>
  <div class="capsP" style="font-size:29px;margin-top:22px;line-height:1.35">até nas duas gestações,<br>com as manutenções no 2º trimestre</div>
</div>
{ARROBA}""")

# 6 · fechamento (C): a parceria
pagina("06", f"""<img class="foto" src="{F('05')}" style="object-position:center 22%">
<div class="sombra" style="background:linear-gradient(to bottom,rgba(0,0,0,.15) 0%,rgba(0,0,0,0) 30%,rgba(0,0,0,.5) 56%,rgba(0,0,0,.7) 100%)"></div>
<div class="sh" style="position:absolute;left:0;right:0;top:690px;text-align:center">
  <div style="font-family:Montserrat;font-weight:500;font-size:34px">UM SORRISO <b style="font-weight:700">SAUDÁVEL</b></div>
  <div class="serifa" style="font-size:122px;margin-top:12px">depende<br>da gente.</div>
  <div class="selo" style="margin-top:30px">eu faço a minha parte aqui,<br><b>você faz a sua em casa</b></div>
</div>
{ARROBA}""")
