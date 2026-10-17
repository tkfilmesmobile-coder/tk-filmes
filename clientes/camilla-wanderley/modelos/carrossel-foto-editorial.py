"""MODELO · estética "foto editorial" da Dra. Camilla (aprovada em 2026-10-10; ver marca/esteticas.md).
Pra usar: copiar pra pasta do post, pôr as fotos em fotos/ e trocar os textos dos slides.
Origem: carrossel "Na minha família, dente doía e arrancava." (6 slides, 1080x1350).
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
pagina("01", f"""<img class="foto" src="{F('0176')}" style="object-position:30% 20%">
<div class="sombra" style="background:linear-gradient(to bottom,rgba(0,0,0,.25) 0%,rgba(0,0,0,0) 18%,rgba(0,0,0,0) 45%,rgba(0,0,0,.55) 78%,rgba(0,0,0,.65) 100%)"></div>
<div class="pilula">CLÍNICA GERAL E ENDODONTIA</div>
<div class="sh" style="position:absolute;left:0;right:0;top:770px;text-align:center">
  <div class="capsP">Na minha família,</div>
  <div class="grosso" style="font-size:150px;margin-top:10px">dente doía</div>
  <div class="grosso" style="font-size:150px">e arrancava</div>
  <div class="capsP" style="font-size:34px;margin-top:22px">e muita gente ainda acha que é assim…</div>
</div>""")

# 2 · muita gente cresceu vendo isso (B)
pagina("02", f"""<img class="foto" src="{F('0183')}" style="object-position:center 40%">
<div class="sombra" style="background:linear-gradient(to bottom,rgba(0,0,0,.55) 0%,rgba(0,0,0,.35) 45%,rgba(0,0,0,.05) 70%,rgba(0,0,0,.35) 100%)"></div>
{TOPO}
<div class="sh" style="position:absolute;left:110px;top:210px;width:880px">
  <div class="fino" style="font-size:92px">Muita gente<br>cresceu<br>vendo isso,</div>
  <div class="fino2" style="margin-top:14px">e aprendeu que é assim mesmo</div>
</div>
<div class="nota sh" style="position:absolute;right:70px;top:700px;width:470px">o avô de dentadura, a mãe sem os dentes de trás, o tio que arrancou tudo de uma vez</div>
{ARROBA}""")

# 3 · não era descuido (C)
pagina("03", f"""<img class="foto" src="{F('0072')}" style="object-position:center 30%">
<div class="sombra" style="background:linear-gradient(to bottom,rgba(0,0,0,.25) 0%,rgba(0,0,0,.5) 30%,rgba(0,0,0,.5) 62%,rgba(0,0,0,.2) 100%)"></div>
<div class="sh" style="position:absolute;left:0;right:0;top:330px;text-align:center">
  <div style="font-family:Montserrat;font-weight:500;font-size:36px">“NÃO ERA <b style="font-weight:700">DESCUIDO</b>.</div>
  <div class="serifa" style="font-size:132px;margin-top:14px">arrancar era<br>a única saída</div>
  <div class="selo" style="margin-top:34px">que chegava<br><b>até o interior</b>”</div>
</div>
{ARROBA}""")

# 4 · o que pouca gente sabe (A)
pagina("04", f"""<img class="foto" src="{F('0174')}" style="object-position:40% 25%">
<div class="sombra" style="background:linear-gradient(to bottom,rgba(0,0,0,.2) 0%,rgba(0,0,0,0) 30%,rgba(0,0,0,.5) 60%,rgba(0,0,0,.7) 100%)"></div>
<div class="sh" style="position:absolute;left:0;right:0;top:720px;text-align:center">
  <div class="capsP" style="font-size:34px">o que pouca gente sabe:</div>
  <div class="grosso" style="font-size:120px;margin-top:12px">quando um<br>dente sai,</div>
  <div class="capsP" style="font-size:31px;margin-top:22px;line-height:1.35">os vizinhos se mexem<br>pra ocupar o espaço</div>
  <div style="font-family:Montserrat;font-weight:300;font-size:30px;margin-top:16px;opacity:.95">a mordida muda, o osso ali diminui<br>e mastigar do outro lado vira hábito</div>
</div>""")

# 5 · hoje dá pra salvar o dente (B)
pagina("05", f"""<img class="foto" src="{F('0167')}" style="object-position:center 30%">
<div class="sombra" style="background:linear-gradient(to bottom,rgba(0,0,0,.6) 0%,rgba(0,0,0,.4) 42%,rgba(0,0,0,.05) 70%,rgba(0,0,0,.3) 100%)"></div>
{TOPO}
<div class="sh" style="position:absolute;left:110px;top:200px;width:880px">
  <div class="fino" style="font-size:100px">Hoje, dá<br>pra salvar<br>o dente,</div>
  <div class="fino2" style="margin-top:14px">na maioria das vezes</div>
</div>
<div class="nota sh" style="position:absolute;right:70px;top:690px;width:450px">é disso que a endodontia cuida: tratar a parte de dentro e manter o dente no lugar</div>
{ARROBA}""")

# 6 · fechamento (C), retrato da doutora
pagina("06", f"""<img class="foto" src="{F('0164')}" style="object-position:12% 18%;transform:scale(2.5);transform-origin:7% 21%">
<div class="sombra" style="background:linear-gradient(to bottom,rgba(0,0,0,.15) 0%,rgba(0,0,0,0) 25%,rgba(0,0,0,.45) 55%,rgba(0,0,0,.65) 100%)"></div>
<div class="sh" style="position:absolute;left:0;right:0;top:640px;text-align:center">
  <div style="font-family:Montserrat;font-weight:500;font-size:36px">A HISTÓRIA DA <b style="font-weight:700">SUA FAMÍLIA</b></div>
  <div class="serifa" style="font-size:128px;margin-top:12px">não precisa<br>ser a sua.</div>
  <div class="selo" style="margin-top:34px">dente doendo e já pensou em arrancar?<br><b>conversa comigo antes</b></div>
</div>
{ARROBA}""")
