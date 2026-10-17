"""Post 5 do calendário (ter 13/10/2026, Emancipação Política de União dos Palmares, 195 anos):
"Toda quinta eu pego a estrada de Maceió até aqui." Foto única, estética foto editorial (marca/esteticas.md).
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

pagina("01", f"""<img class="foto" src="{F('0164')}" style="object-position:center 30%">
<div class="sombra" style="background:linear-gradient(to bottom,rgba(0,0,0,.3) 0%,rgba(0,0,0,0) 16%,rgba(0,0,0,0) 46%,rgba(0,0,0,.55) 70%,rgba(0,0,0,.72) 100%)"></div>
<div class="pilula">UNIÃO DOS PALMARES · 195 ANOS</div>
<div class="sh" style="position:absolute;left:0;right:0;top:820px;text-align:center">
  <div class="capsP" style="font-size:34px;line-height:1.35">Toda quinta eu pego a<br>estrada de Maceió</div>
  <div class="grosso" style="font-size:168px;margin-top:8px">até aqui.</div>
  <div class="capsP" style="font-size:28px;margin-top:20px;letter-spacing:2px">parabéns, união, pelos 195 anos 🤍</div>
</div>
{ARROBA}""")
