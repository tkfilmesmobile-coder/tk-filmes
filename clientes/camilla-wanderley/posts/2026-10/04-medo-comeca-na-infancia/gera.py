"""Carrossel 4 do calendário de outubro (ia em 12/10, Dia das Crianças; saiu em 13/10 sem a data): "O medo de dentista quase sempre
começa na infância." 6 slides, estética foto editorial (marca/esteticas.md), a partir do modelo
modelos/carrossel-foto-editorial.py.
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

# 1 · capa (A)
pagina("01", f"""<img class="foto" src="{F('0128')}" style="object-position:60% 25%;transform:scale(1.15);transform-origin:60% 82%">
<div class="sombra" style="background:linear-gradient(to bottom,rgba(0,0,0,.25) 0%,rgba(0,0,0,0) 18%,rgba(0,0,0,0) 52%,rgba(0,0,0,.58) 78%,rgba(0,0,0,.7) 100%)"></div>
<div class="pilula">CLÍNICA GERAL E ENDODONTIA</div>
<div class="sh" style="position:absolute;left:0;right:0;top:880px;text-align:center">
  <div class="capsP">O medo de dentista</div>
  <div class="grosso" style="font-size:146px;margin-top:10px">começa na</div>
  <div class="grosso" style="font-size:146px">infância</div>
  <div class="capsP" style="font-size:33px;margin-top:22px">e quase nunca vai embora sozinho…</div>
</div>""")

# 2 · de onde vem (B)
pagina("02", f"""<img class="foto" src="{F('0184')}" style="object-position:center 40%">
<div class="sombra" style="background:linear-gradient(to bottom,rgba(0,0,0,.6) 0%,rgba(0,0,0,.38) 45%,rgba(0,0,0,.05) 70%,rgba(0,0,0,.35) 100%)"></div>
{TOPO}
<div class="sh" style="position:absolute;left:110px;top:210px;width:880px">
  <div class="fino" style="font-size:96px">Uma consulta<br>que doeu,</div>
  <div class="fino2" style="margin-top:14px">um barulho que ficou na memória</div>
</div>
<div class="nota sh" style="position:absolute;right:70px;top:640px;width:470px">um adulto que ameaçou: “se não escovar, vai pro dentista”, como se fosse castigo</div>
{ARROBA}""")

# 3 · o medo cresce junto (C)
pagina("03", f"""<img class="foto" src="{F('0072')}" style="object-position:center 30%">
<div class="sombra" style="background:linear-gradient(to bottom,rgba(0,0,0,.25) 0%,rgba(0,0,0,.52) 30%,rgba(0,0,0,.52) 64%,rgba(0,0,0,.2) 100%)"></div>
<div class="sh" style="position:absolute;left:0;right:0;top:320px;text-align:center">
  <div style="font-family:Montserrat;font-weight:500;font-size:36px">A CRIANÇA <b style="font-weight:700">CRESCE</b>.</div>
  <div class="serifa" style="font-size:132px;margin-top:14px">o medo<br>cresce junto</div>
  <div class="selo" style="margin-top:34px">e vira o adulto que adia<br><b>até a dor ficar maior que o medo</b></div>
</div>
{ARROBA}""")

# 4 · você não está sozinho (A)
pagina("04", f"""<img class="foto" src="{F('0118')}" style="object-position:center 20%">
<div class="sombra" style="background:linear-gradient(to bottom,rgba(0,0,0,.2) 0%,rgba(0,0,0,0) 28%,rgba(0,0,0,.5) 58%,rgba(0,0,0,.7) 100%)"></div>
<div class="sh" style="position:absolute;left:0;right:0;top:700px;text-align:center">
  <div class="capsP" style="font-size:34px">se esse é o seu caso,</div>
  <div class="grosso" style="font-size:124px;margin-top:12px">você não<br>está sozinho</div>
  <div class="capsP" style="font-size:31px;margin-top:22px;line-height:1.35">é uma das coisas que<br>eu mais escuto aqui</div>
  <div style="font-family:Montserrat;font-weight:300;font-size:32px;margin-top:14px;opacity:.95">e não tem nada de bobo nisso</div>
</div>""")

# 5 · primeira consulta pode ser só conversa (B)
pagina("05", f"""<img class="foto" src="{F('0181')}" style="object-position:center 40%">
<div class="sombra" style="background:linear-gradient(to bottom,rgba(0,0,0,.6) 0%,rgba(0,0,0,.4) 45%,rgba(0,0,0,.05) 70%,rgba(0,0,0,.3) 100%)"></div>
{TOPO}
<div class="sh" style="position:absolute;left:110px;top:200px;width:880px">
  <div class="fino" style="font-size:88px">A primeira<br>consulta pode<br>ser só conversa,</div>
  <div class="fino2" style="margin-top:14px">no seu tempo</div>
</div>
<div class="nota sh" style="position:absolute;right:70px;top:720px;width:450px">a gente combina um sinal pra pausar, e eu explico cada passo antes de fazer</div>
{ARROBA}""")

# 6 · fechamento (C), retrato da doutora
pagina("06", f"""<img class="foto" src="{F('0165')}" style="object-position:12% 18%;transform:scale(2.5);transform-origin:7% 21%">
<div class="sombra" style="background:linear-gradient(to bottom,rgba(0,0,0,.15) 0%,rgba(0,0,0,0) 25%,rgba(0,0,0,.45) 55%,rgba(0,0,0,.65) 100%)"></div>
<div class="sh" style="position:absolute;left:0;right:0;top:620px;text-align:center">
  <div style="font-family:Montserrat;font-weight:500;font-size:34px">A CRIANÇA QUE <b style="font-weight:700">FICOU COM MEDO</b></div>
  <div class="serifa" style="font-size:118px;margin-top:12px">também merece<br>cuidado.</div>
  <div class="selo" style="margin-top:34px">me chama no direct,<br><b>sem compromisso</b></div>
</div>
{ARROBA}""")
