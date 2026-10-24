"""Amostras da estética de datas comemorativas da Dra. Camilla (refs: Dia do Dentista cinema, Dia do Obstetra cards,
Dia do Médico colagem), na paleta dela. HTML -> PNG 1080x1350 no Chrome headless.
Regras da Talyta: palavra nunca dividida em duas linhas; foto inteira dela (sem recorte de outra foto)."""
import os, subprocess
import numpy as np
from PIL import Image, ImageFilter

AQUI = os.path.dirname(os.path.abspath(__file__)).replace("\\", "/")
CHROME = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
RETRATO = f"{AQUI}/ig/2025-09-29_75784_1.jpg"   # retrato profissional na clínica, braços cruzados
MESA = f"{AQUI}/ig/2025-06-26_36515.jpg"        # ela na mesa do consultório

VINHO, VINHO_ESC, NOITE, NUDE, CREME, ROSE = "#8E2737", "#4A1019", "#22080D", "#EADBD3", "#F6EFEA", "#D99AA5"


def duotone(src, dst, escuro=(28, 7, 12), meio=(146, 48, 66), claro=(252, 236, 230)):
    """Mapa de gradiente: a foto vira monocromática no vinho (o 'banho de cor' das refs 1 e 3)."""
    a = np.asarray(Image.open(src).convert("L")).astype(np.float32) / 255.0
    a = np.clip((a - 0.03) / 0.90, 0, 1) ** 0.78
    e, m, c = (np.array(x, np.float32) for x in (escuro, meio, claro))
    t = a[..., None]
    out = np.where(t < 0.5, e + (m - e) * (t / 0.5), m + (c - m) * ((t - 0.5) / 0.5))
    Image.fromarray(out.clip(0, 255).astype(np.uint8)).save(dst, quality=93)


duotone(RETRATO, f"{AQUI}/fotos/retrato-vinho.jpg")
Image.open(MESA).convert("RGB").filter(ImageFilter.GaussianBlur(22)).save(f"{AQUI}/fotos/mesa-blur.jpg", quality=90)

BASE = """@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap');
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:1080px;height:1350px;overflow:hidden}
body{font-family:'Outfit',sans-serif;position:relative}
.abs{position:absolute} .nb{white-space:nowrap}
"""
ICONE_DENTE = '<svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M7 3c-2.5 0-4 2-4 4.5 0 2 .8 3.4 1.5 5 .7 1.7.9 3.6 1.3 5.6.3 1.6.8 2.9 1.9 2.9 1.4 0 1.6-2 2-3.7.3-1.3.8-2.3 2.3-2.3s2 1 2.3 2.3c.4 1.7.6 3.7 2 3.7 1.1 0 1.6-1.3 1.9-2.9.4-2 .6-3.9 1.3-5.6.7-1.6 1.5-3 1.5-5C21 5 19.5 3 17 3c-2 0-3 1-5 1S9 3 7 3z"/></svg>'
ICONE_CORACAO = '<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/></svg>'

# ---------- Amostra 1 · escura (refs 1 e 3): Natal ----------
escura = f"""<!doctype html><html><head><meta charset="utf-8"><style>{BASE}
body{{background:{NOITE};color:#fff}}
.foto{{left:0;top:0;width:1080px;height:1350px;background:url('file:///{AQUI}/fotos/retrato-vinho.jpg') no-repeat;background-size:1080px auto;background-position:0 -20px}}
.veu{{left:0;top:0;width:1080px;height:1350px;background:
  linear-gradient(to bottom,rgba(20,4,8,.30) 0%,rgba(20,4,8,0) 18%,rgba(20,4,8,0) 46%,rgba(20,4,8,.70) 66%,rgba(20,4,8,.95) 84%,{NOITE} 100%)}}
.orbita{{left:-560px;top:90px;width:1000px;height:1000px;border:1.5px solid rgba(246,239,234,.30);border-radius:50%}}
.ic{{width:66px;height:66px;border-radius:50%;background:rgba(246,239,234,.16);border:1px solid rgba(246,239,234,.45);
  color:{CREME};display:flex;align-items:center;justify-content:center}}
.pre{{left:92px;top:880px;font-size:62px;font-weight:600;letter-spacing:-1.5px}}
.big{{left:76px;top:925px;font-size:268px;font-weight:800;letter-spacing:-9px;line-height:1;
  background:linear-gradient(90deg,#fff 0%,#fff 38%,{NUDE} 55%,{ROSE} 78%,#c25a6e 100%);-webkit-background-clip:text;color:transparent}}
.data{{left:840px;top:1046px;font-size:22px;font-weight:600;letter-spacing:5px;line-height:1.5;color:{NUDE}}}
.tags{{left:640px;top:610px;display:flex;flex-direction:column;gap:9px;align-items:flex-start}}
.tags span{{background:rgba(34,8,13,.88);padding:7px 14px;font-size:24px;color:{CREME}}}
.rod{{left:92px;right:92px;bottom:56px;display:flex;justify-content:space-between;align-items:flex-end;font-size:20px;color:{NUDE}}}
.rod b{{font-weight:600;color:#fff;font-size:22px}}
.cw{{text-align:right;line-height:1.1}} .cw b{{font-size:44px;letter-spacing:2px;font-weight:300}}
</style></head><body>
<div class="abs foto"></div><div class="abs veu"></div><div class="abs orbita"></div>
<div class="abs ic" style="left:300px;top:150px">{ICONE_CORACAO}</div>
<div class="abs ic" style="left:405px;top:560px">{ICONE_DENTE}</div>
<div class="abs tags nb"><span>Que o seu Natal tenha</span><span>mesa cheia, gente querida</span><span>e muitos motivos</span><span>pra sorrir de verdade.</span></div>
<div class="abs pre nb">Feliz</div>
<div class="abs big nb">Natal</div>
<div class="abs data nb">25<br>DEZEMBRO</div>
<div class="abs rod"><div class="nb">às quintas na CIP<br><b>União dos Palmares</b></div><div class="cw nb"><b>CW</b><br>@dra.camillawanderley</div></div>
</body></html>"""

# ---------- Amostra 2 · clara (ref 2): 17/11 Prematuridade ----------
clara = f"""<!doctype html><html><head><meta charset="utf-8"><style>{BASE}
body{{background:{CREME};color:{VINHO_ESC}}}
.topo{{left:64px;top:96px;font-size:20px;letter-spacing:5px;font-weight:500;color:{VINHO}}}
.foto{{right:0;top:170px;width:470px;height:1180px;background:url('file:///{MESA}') no-repeat;background-size:auto 1500px;background-position:-60px -40px;border-radius:34px 0 0 0}}
.card1{{left:64px;top:200px;width:700px;height:330px;border-radius:30px;overflow:hidden;
  background:linear-gradient(100deg,rgba(74,16,25,.94) 0%,rgba(142,39,55,.82) 60%,rgba(142,39,55,.5) 100%),url('file:///{AQUI}/fotos/mesa-blur.jpg') center/cover;color:{CREME};padding:48px 52px}}
.card1 p{{font-size:27px;line-height:1.38;font-weight:300;max-width:560px}}
.card1 b{{font-weight:600}}
.pill{{display:inline-block;margin-top:28px;padding:8px 26px;border-radius:99px;background:rgba(246,239,234,.22);border:1px solid rgba(246,239,234,.55);font-size:21px;font-weight:500}}
.coracao{{left:676px;top:220px;width:68px;height:68px;border-radius:16px;background:{CREME};color:{VINHO};display:flex;align-items:center;justify-content:center}}
.card2{{left:64px;top:562px;width:720px;height:440px;border-radius:30px;background:#DEC7BD;padding:0 52px;display:flex;flex-direction:column;justify-content:center}}
.pre{{font-size:52px;font-weight:600;color:{VINHO};letter-spacing:-1.5px}}
.big{{font-size:150px;font-weight:800;line-height:1;letter-spacing:-6px;margin-top:26px}}
.big .a{{color:{VINHO}}} .big .b{{color:#fff}}
.card3{{left:64px;top:1036px;width:720px;height:170px;border-radius:30px;background:{VINHO_ESC};color:{CREME};display:flex;align-items:center;justify-content:space-between;padding:0 52px}}
.card3 .t{{font-size:21px;line-height:1.35;color:{NUDE}}} .card3 .t b{{color:#fff;font-size:24px;font-weight:600}}
.card3 .cw{{text-align:right;line-height:1.05}} .card3 .cw b{{font-size:46px;font-weight:300;letter-spacing:2px;color:#fff}}
</style></head><body>
<div class="abs topo nb">17 DE NOVEMBRO · DIA MUNDIAL DA PREMATURIDADE</div>
<div class="abs foto"></div>
<div class="abs card1"><p>Meu pai passou a vida ajudando os bebês de União a chegar ao mundo. Eu cuido do sorriso da mãe: <b>gengiva saudável também faz parte do pré-natal.</b></p><span class="pill nb">17 de novembro</span></div>
<div class="abs coracao">{ICONE_CORACAO}</div>
<div class="abs card2"><div class="pre nb">Sorriso também é</div><div class="big nb"><span class="a">pré-</span><span class="b">natal</span></div></div>
<div class="abs card3"><div class="t nb">às quintas na CIP<br><b>União dos Palmares</b></div><div class="cw nb"><b>CW</b><br><span style="font-size:19px;color:{NUDE}">@dra.camillawanderley</span></div></div>
</body></html>"""


def render(html, nome):
    hp = f"{AQUI}/{nome}.html"
    open(hp, "w", encoding="utf-8").write(html)
    subprocess.run([CHROME, "--headless=new", f"--user-data-dir={AQUI}/.chrome", "--hide-scrollbars", "--force-device-scale-factor=1",
                    "--window-size=1080,1350", "--virtual-time-budget=6000", f"--screenshot={AQUI}/{nome}.png", "file:///" + hp], capture_output=True)
    print(nome)


render(escura, "amostra-1-escura-natal")
render(clara, "amostra-2-clara-prematuridade")
