"""Estética "homenagem" das datas comemorativas da Dra. Camilla (aprovada em 2026-10-24 na amostra de Natal).
Refs: Dia do Dentista (cinema) e Dia do Médico (colagem), na paleta dela. HTML -> PNG 1080x1350 no Chrome headless.
Regras da Talyta: a doutora fica com a cor natural da foto, tratada (color grade CAMILLA); o vinho fica só no
ambiente (bordas, fundo e rodapé). Palavra nunca dividida em duas linhas. Foto dela inteira, nunca recorte de foto de grupo.
A versão clara (cards, ref do Obstetra) foi recusada."""
import os, subprocess, sys
import cv2

AQUI = os.path.dirname(os.path.abspath(__file__)).replace("\\", "/")
sys.path.insert(0, os.path.normpath(os.path.join(AQUI, "..", "..", "edicao", "perfil-video", "scripts")))
import grade  # noqa: E402  (color grade fixo da Camilla)

CHROME = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
RETRATO = f"{AQUI}/ig/2025-09-29_75784_1.jpg"   # retrato profissional na clínica, braços cruzados
VINHO, VINHO_ESC, NOITE, NUDE, CREME, ROSE = "#8E2737", "#4A1019", "#22080D", "#EADBD3", "#F6EFEA", "#D99AA5"


def tratar(src, dst):
    """Aplica o color grade fixo da Camilla (mesmo das fotos dos carrosséis)."""
    img = cv2.imread(src)
    amostra = [cv2.resize(img, (540, int(540 * img.shape[0] / img.shape[1]))).astype("float32") / 255]
    ganho, expo = grade.correcao_clipe(amostra, grade.LOOKS["CAMILLA"]["alvo_branco"])
    cv2.imwrite(dst, grade.grade_quadro(img, ganho, expo, grade.rostos_q(img)), [cv2.IMWRITE_JPEG_QUALITY, 94])


os.makedirs(f"{AQUI}/fotos", exist_ok=True)
tratar(RETRATO, f"{AQUI}/fotos/retrato-tratado.jpg")

BASE = """@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap');
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:1080px;height:1350px;overflow:hidden}
body{font-family:'Outfit',sans-serif;position:relative}
.abs{position:absolute} .nb{white-space:nowrap}
"""
ICONE_DENTE = '<svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M7 3c-2.5 0-4 2-4 4.5 0 2 .8 3.4 1.5 5 .7 1.7.9 3.6 1.3 5.6.3 1.6.8 2.9 1.9 2.9 1.4 0 1.6-2 2-3.7.3-1.3.8-2.3 2.3-2.3s2 1 2.3 2.3c.4 1.7.6 3.7 2 3.7 1.1 0 1.6-1.3 1.9-2.9.4-2 .6-3.9 1.3-5.6.7-1.6 1.5-3 1.5-5C21 5 19.5 3 17 3c-2 0-3 1-5 1S9 3 7 3z"/></svg>'
ICONE_CORACAO = '<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/></svg>'


def homenagem(pre, data_nome, dia, mes, frases, foto, pos="0 -20px"):
    tags = "".join(f"<span>{f}</span>" for f in frases)
    return f"""<!doctype html><html><head><meta charset="utf-8"><style>{BASE}
body{{background:{NOITE};color:#fff}}
.foto{{left:0;top:0;width:1080px;height:1350px;background:url('file:///{foto}') no-repeat;background-size:1080px auto;background-position:{pos}}}
/* vinho só no ambiente: tinge as bordas (modo cor) e escurece em volta; o centro, onde ela está, fica natural */
.tinge{{left:0;top:0;width:1080px;height:1350px;mix-blend-mode:color;
  background:radial-gradient(ellipse 46% 62% at 50% 44%,rgba(142,39,55,0) 0%,rgba(142,39,55,0) 62%,rgba(142,39,55,.85) 100%)}}
.vinheta{{left:0;top:0;width:1080px;height:1350px;mix-blend-mode:multiply;
  background:radial-gradient(ellipse 56% 66% at 50% 44%,rgba(255,255,255,0) 0%,rgba(255,255,255,0) 58%,rgba(120,40,52,.75) 100%)}}
.veu{{left:0;top:0;width:1080px;height:1350px;background:
  linear-gradient(to bottom,rgba(34,8,13,.35) 0%,rgba(34,8,13,0) 16%,rgba(34,8,13,0) 48%,rgba(34,8,13,.72) 67%,rgba(34,8,13,.95) 84%,{NOITE} 100%)}}
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
<div class="abs foto"></div><div class="abs tinge"></div><div class="abs vinheta"></div><div class="abs veu"></div><div class="abs orbita"></div>
<div class="abs ic" style="left:300px;top:150px">{ICONE_CORACAO}</div>
<div class="abs ic" style="left:405px;top:560px">{ICONE_DENTE}</div>
<div class="abs tags nb">{tags}</div>
<div class="abs pre nb">{pre}</div>
<div class="abs big nb">{data_nome}</div>
<div class="abs data nb">{dia}<br>{mes}</div>
<div class="abs rod"><div class="nb">às quintas na CIP<br><b>União dos Palmares</b></div><div class="cw nb"><b>CW</b><br>@dra.camillawanderley</div></div>
</body></html>"""


def render(html, nome):
    hp = f"{AQUI}/{nome}.html"
    open(hp, "w", encoding="utf-8").write(html)
    subprocess.run([CHROME, "--headless=new", f"--user-data-dir={AQUI}/.chrome", "--hide-scrollbars", "--force-device-scale-factor=1",
                    "--window-size=1080,1350", "--virtual-time-budget=6000", f"--screenshot={AQUI}/{nome}.png", "file:///" + hp], capture_output=True)
    print(nome)


if __name__ == "__main__":
    render(homenagem("Feliz", "Natal", "25", "DEZEMBRO",
                     ["Que o seu Natal tenha", "mesa cheia, gente querida", "e muitos motivos", "pra sorrir de verdade."],
                     f"{AQUI}/fotos/retrato-tratado.jpg"), "amostra-1-escura-natal")
