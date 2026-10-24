"""Estética "homenagem" das datas comemorativas da Dra. Camilla (aprovada em 2026-10-24 na arte de Natal).
Refs: Dia do Dentista (cinema) e Dia do Médico (colagem), na paleta dela. HTML -> PNG 1080x1350 no Chrome headless.
Regras da Talyta: a pessoa fica com a cor natural da foto, tratada (color grade CAMILLA); o vinho fica só no
ambiente (bordas, fundo e rodapé). Palavra nunca dividida em duas linhas (o título encolhe pra caber; palavras
diferentes podem ir em linhas diferentes). Foto inteira, nunca recorte de foto de grupo.
Uso: python gera_datas.py [slug ...]   (sem argumento gera todas)"""
import os, subprocess, sys
import cv2

AQUI = os.path.dirname(os.path.abspath(__file__)).replace("\\", "/")
POSTS = os.path.dirname(AQUI).replace("\\", "/")
sys.path.insert(0, os.path.normpath(os.path.join(AQUI, "..", "..", "edicao", "perfil-video", "scripts")))
import grade  # noqa: E402  (color grade fixo da Camilla)

CHROME = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
VINHO, VINHO_ESC, NOITE, NUDE, CREME, ROSE = "#8E2737", "#4A1019", "#22080D", "#EADBD3", "#F6EFEA", "#D99AA5"


def tratar(nome):
    """Aplica o color grade fixo da Camilla (mesmo das fotos dos carrosséis). Cache em fotos/<nome>-tratado.jpg."""
    dst = f"{AQUI}/fotos/{nome}-tratado.jpg"
    if not os.path.exists(dst):
        img = cv2.imread(f"{AQUI}/ig/{nome}.jpg")
        amostra = [cv2.resize(img, (540, int(540 * img.shape[0] / img.shape[1]))).astype("float32") / 255]
        ganho, expo = grade.correcao_clipe(amostra, grade.LOOKS["CAMILLA"]["alvo_branco"])
        cv2.imwrite(dst, grade.grade_quadro(img, ganho, expo, grade.rostos_q(img)), [cv2.IMWRITE_JPEG_QUALITY, 94])
    return dst


YUNET = os.path.expandvars(r"%LOCALAPPDATA%\Programs\modelos\yunet.onnx")


def montar(nome, W, H, tam="cover", pos="center top", tratada=True, chave=None):
    """Enquadra a foto (já tratada) num quadro WxH, como o CSS faria, e acha os rostos (YuNet) no quadro final.
    Devolve (caminho do quadro, lista de rostos (x, y, w, h))."""
    from PIL import Image
    src = tratar(nome) if tratada else f"{AQUI}/ig/{nome}.jpg"
    img = Image.open(src).convert("RGB")
    w, h = img.size
    if tam == "cover":
        s = max(W / w, H / h)
    else:
        a, b = tam.split()
        s = float(a[:-2]) / w if a != "auto" else float(b[:-2]) / h
    nw, nh = round(w * s), round(h * s)
    px, py = pos.split()

    def p(v, livre):
        if v == "center": return livre / 2
        if v in ("left", "top"): return 0
        if v in ("right", "bottom"): return livre
        return float(v.replace("px", ""))
    quadro = Image.new("RGB", (W, H), (34, 8, 13))
    x0, y0 = round(p(px, W - nw)), round(p(py, H - nh))
    foto = img.resize((nw, nh), Image.LANCZOS)
    # borda da foto que não chega na borda do quadro some suave no fundo (sem linha dura)
    from PIL import ImageDraw
    alfa = Image.new("L", (nw, nh), 255)
    dr = ImageDraw.Draw(alfa)
    f = 180
    for i in range(f):
        v = int(255 * i / f)
        if y0 > 0: dr.line([(0, i), (nw, i)], fill=v)
        if y0 + nh < H: dr.line([(0, nh - 1 - i), (nw, nh - 1 - i)], fill=v)
    quadro.paste(foto, (x0, y0), alfa)
    os.makedirs(f"{AQUI}/fotos/_quadros", exist_ok=True)
    caminho = f"{AQUI}/fotos/_quadros/{chave or nome}-{W}x{H}.jpg"
    quadro.save(caminho, quality=93)
    bgr = cv2.imread(caminho)
    det = cv2.FaceDetectorYN.create(YUNET, "", (W, H), 0.6)
    _, fs = det.detect(bgr)
    rostos = [tuple(int(v) for v in f[:4]) for f in (fs if fs is not None else [])]
    return caminho, rostos


def css_veu(rostos, H, rampa=0.18, topo_escuro=False):
    """Degradê que nunca cobre rosto: o escuro de baixo só começa abaixo do rosto mais baixo; o véu do alto só existe
    se não houver rosto perto do topo."""
    fb = max([y + h for x, y, w, h in rostos], default=0)
    ft = min([y for x, y, w, h in rostos], default=H)
    ini = max(0.42 * H, fb + 30)
    pc = lambda v: f"{min(100, v / H * 100):.1f}%"
    alto = f"rgba(34,8,13,.35) 0%,rgba(34,8,13,0) {pc(0.16 * H)}," if ft > 0.2 * H else "rgba(34,8,13,0) 0%,"
    if topo_escuro:  # texto no alto: escuro de cima até antes do primeiro rosto
        fim = max(0.30 * H, ft - 40)
        alto = f"#22080D 0%,rgba(34,8,13,.92) {pc(fim * 0.72)},rgba(34,8,13,0) {pc(fim)},"
    return (f"linear-gradient(to bottom,{alto}rgba(34,8,13,0) {pc(ini)},rgba(34,8,13,.74) {pc(ini + rampa * H)},"
            f"rgba(34,8,13,.95) {pc(ini + 2 * rampa * H)},#22080D 100%)")


def css_rostos(caminho, rostos, W, H):
    """Camada por cima de todos os degradês: a própria foto, só na região de cada rosto (máscara suave)."""
    if not rostos:
        return ""
    m = ",".join(f"radial-gradient(ellipse {w * 1.0:.0f}px {h * 1.2:.0f}px at {x + w / 2:.0f}px {y + h * 0.48:.0f}px,#000 62%,transparent 100%)"
                 for x, y, w, h in rostos)
    return (f".rostos{{left:0;top:0;width:{W}px;height:{H}px;background:url('file:///{caminho}') no-repeat 0 0/{W}px {H}px;"
            f"-webkit-mask-image:{m};mask-image:{m}}}")


def js_rostos(rostos):
    """Se as faixas de frase caírem em cima de um rosto, passam pro outro lado."""
    return f"""<script>window.ROSTOS={[list(r) for r in rostos]};
window.foge=(el,esq)=>{{const bate=()=>{{const r=el.getBoundingClientRect();return ROSTOS.some(([x,y,w,h])=>r.left<x+w&&r.right>x&&r.top<y+h&&r.bottom>y)}};
 if(bate()){{el.style.left=esq+'px';}} }};</script>"""


BASE = """@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap');
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:1080px;height:1350px;overflow:hidden}
body{font-family:'Outfit',sans-serif;position:relative}
.abs{position:absolute} .nb{white-space:nowrap}
"""
ICONE_DENTE = '<svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M7 3c-2.5 0-4 2-4 4.5 0 2 .8 3.4 1.5 5 .7 1.7.9 3.6 1.3 5.6.3 1.6.8 2.9 1.9 2.9 1.4 0 1.6-2 2-3.7.3-1.3.8-2.3 2.3-2.3s2 1 2.3 2.3c.4 1.7.6 3.7 2 3.7 1.1 0 1.6-1.3 1.9-2.9.4-2 .6-3.9 1.3-5.6.7-1.6 1.5-3 1.5-5C21 5 19.5 3 17 3c-2 0-3 1-5 1S9 3 7 3z"/></svg>'
ICONE_CORACAO = '<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/></svg>'

# Ajuste do título: cada linha cabe em 900 px (fonte até 268 px); a data vai ao lado da última linha se couber,
# senão sobe pra direita da linha pequena; as faixas de frase ficam sempre acima do bloco do título.
JS = """<script>
document.fonts.ready.then(()=>{
  const linhas=[...document.querySelectorAll('.big')];
  let tam=268; const max=900;
  for(const l of linhas){ l.style.fontSize=tam+'px'; }
  while(linhas.some(l=>l.scrollWidth>max) && tam>90){ tam-=4; linhas.forEach(l=>l.style.fontSize=tam+'px'); }
  linhas.forEach(l=>l.style.letterSpacing=(-tam*0.034)+'px');
  const bloco=document.querySelector('.bloco').getBoundingClientRect();
  const ult=linhas[linhas.length-1].getBoundingClientRect();
  const data=document.querySelector('.data'); const dr=data.getBoundingClientRect();
  if(ult.right+48+dr.width<=1000){ data.style.left=(ult.right+48)+'px'; data.style.top=(ult.top+ult.height*0.42)+'px'; }
  else { const pre=document.querySelector('.pre').getBoundingClientRect(); data.style.right='92px'; data.style.left='auto'; data.style.top=(pre.top+8)+'px'; data.style.textAlign='right'; }
  const tags=document.querySelector('.tags'); tags.style.top=(bloco.top-tags.getBoundingClientRect().height-46)+'px';
  if(window.foge) foge(tags,92);
});
</script>"""


def homenagem(d):
    tags = "".join(f"<span>{f}</span>" for f in d["frases"])
    big = "".join(f'<div class="big nb">{l}</div>' for l in d["titulo"])
    foto, rostos = montar(d["foto"], 1080, 1350, d.get("tam", "1080px auto"), d.get("pos", "0 -20px"), d.get("tratada", True),
                          d["slug"].replace("/", "_"))
    cx, cy, ew, eh = d.get("elipse", (50, 44, 46, 62))
    return f"""<!doctype html><html><head><meta charset="utf-8"><style>{BASE}
body{{background:{NOITE};color:#fff}}
.foto{{left:0;top:0;width:1080px;height:1350px;background:url('file:///{foto}') no-repeat 0 0/1080px 1350px}}
{css_rostos(foto, rostos, 1080, 1350)}
.tinge{{left:0;top:0;width:1080px;height:1350px;mix-blend-mode:color;
  background:radial-gradient(ellipse {ew}% {eh}% at {cx}% {cy}%,rgba(142,39,55,0) 0%,rgba(142,39,55,0) 62%,rgba(142,39,55,.85) 100%)}}
.vinheta{{left:0;top:0;width:1080px;height:1350px;mix-blend-mode:multiply;
  background:radial-gradient(ellipse {ew + 10}% {eh + 4}% at {cx}% {cy}%,rgba(255,255,255,0) 0%,rgba(255,255,255,0) 58%,rgba(120,40,52,.75) 100%)}}
.veu{{left:0;top:0;width:1080px;height:1350px;background:{css_veu(rostos, 1350, d.get('rampa', 0.18))}}}
.orbita{{left:-560px;top:90px;width:1000px;height:1000px;border:1.5px solid rgba(246,239,234,.30);border-radius:50%}}
.ic{{width:66px;height:66px;border-radius:50%;background:rgba(246,239,234,.16);border:1px solid rgba(246,239,234,.45);
  color:{CREME};display:flex;align-items:center;justify-content:center}}
.bloco{{left:76px;bottom:157px;display:flex;flex-direction:column}}
.pre{{font-size:{d.get('pre_tam', 62)}px;font-weight:600;letter-spacing:-1.5px;margin-left:16px;margin-bottom:-6px}}
.big{{font-size:268px;font-weight:800;line-height:1;display:inline-block;align-self:flex-start;
  background:linear-gradient(90deg,#fff 0%,#fff 38%,{NUDE} 55%,{ROSE} 78%,#c25a6e 100%);-webkit-background-clip:text;color:transparent}}
.data{{left:840px;top:1046px;font-size:22px;font-weight:600;letter-spacing:5px;line-height:1.5;color:{NUDE}}}
.tags{{left:640px;top:610px;display:flex;flex-direction:column;gap:9px;align-items:flex-start}}
.tags span{{background:rgba(34,8,13,.88);padding:7px 14px;font-size:24px;color:{CREME}}}
.rod{{left:92px;right:92px;bottom:56px;display:flex;justify-content:space-between;align-items:flex-end;font-size:20px;color:{NUDE}}}
.rod b{{font-weight:600;color:#fff;font-size:22px}}
.cw{{text-align:right;line-height:1.1}} .cw b{{font-size:44px;letter-spacing:2px;font-weight:300}}
</style></head><body>
<div class="abs foto"></div><div class="abs tinge"></div><div class="abs vinheta"></div><div class="abs veu"></div>{'<div class="abs rostos"></div>' if rostos else ''}<div class="abs orbita"></div>
{js_rostos(rostos)}
<div class="abs ic" style="left:{d.get('ic1', (300, 150))[0]}px;top:{d.get('ic1', (300, 150))[1]}px">{ICONE_CORACAO}</div>
<div class="abs ic" style="left:{d.get('ic2', (405, 560))[0]}px;top:{d.get('ic2', (405, 560))[1]}px">{ICONE_DENTE}</div>
<div class="abs tags nb" style="{d.get('tags_css', '')}">{tags}</div>
<div class="abs bloco"><div class="pre nb">{d['pre']}</div>{big}</div>
<div class="abs data nb">{d['dia']}<br>{d['mes']}</div>
<div class="abs rod"><div class="nb">às quintas na CIP<br><b>União dos Palmares</b></div><div class="cw nb"><b>CW</b><br>@dra.camillawanderley</div></div>
{JS}
</body></html>"""


DATAS = [
    dict(slug="2026-11/02-semana-cancer-bucal", foto="2025-09-29_75784_2", pre="Novembro", titulo=["Azul"],
         dia="01 A 07", mes="NOVEMBRO", frases=["O câncer de boca é mais comum", "em homens depois dos 40.", "Ferida que não cicatriza",
                                               "em 15 dias merece um olhar."]),
    dict(slug="2026-11/14-dia-mundial-do-diabetes", foto="2025-06-26_36515", tam="1180px auto", pos="-50px -170px",
         pre="Dia Mundial do", titulo=["Diabetes"], dia="14", mes="NOVEMBRO",
         frases=["Diabetes e gengiva", "conversam mais do que", "a gente imagina.", "Cuidar de uma ajuda a outra."]),
    dict(slug="2026-11/17-prematuridade", foto="2026-08-09_83710_5", pos="0 -30px", elipse=(56, 40, 54, 66),
         pre="Dia Mundial da", titulo=["Prematuridade"], dia="17", mes="NOVEMBRO", ic1=(130, 200), ic2=(70, 520),
         frases=["Meu pai passou a vida", "cuidando de quem chega ao mundo.", "Eu cuido do sorriso da mãe:",
                 "gengiva também é pré-natal."]),
    # foto: Ministério da Cultura, CC BY 2.0 (Wikimedia Commons), estátua no Parque Memorial Quilombo dos Palmares
    dict(slug="2026-11/20-consciencia-negra", foto="commons-zumbi-estatua", tratada=False, tam="1080px auto", pos="0 -60px",
         elipse=(42, 26, 56, 50), pre="Dia Nacional de Zumbi e da", pre_tam=50, titulo=["Consciência", "Negra"], dia="20", mes="NOVEMBRO",
         ic1=(860, 120), ic2=(960, 420),
         frases=["Toda quinta eu chego", "à terra de Zumbi dos Palmares.", "Uma cidade que ensina", "o Brasil a resistir."]),
    dict(slug="2026-12/08-dia-da-familia", foto="2020-12-25_07558", tam="1080px auto", pos="0 0", elipse=(48, 34, 64, 66),
         pre="Dia Nacional da", titulo=["Família"], dia="08", mes="DEZEMBRO", ic1=(860, 120), ic2=(960, 420),
         tags_css="left:92px",
         frases=["Na minha casa, cuidar de gente", "sempre foi assunto de mesa.", "Que a sua família tenha", "sempre quem cuide dela."]),
    dict(slug="2026-12/25-natal", foto="2025-09-29_75784_1", pre="Feliz", titulo=["Natal"], dia="25", mes="DEZEMBRO",
         frases=["Que o seu Natal tenha", "mesa cheia, gente querida", "e muitos motivos", "pra sorrir de verdade."]),
]


def render(html, pasta, nome="01", altura=1350):
    os.makedirs(pasta, exist_ok=True)
    hp = f"{pasta}/{nome}.html"
    open(hp, "w", encoding="utf-8").write(html)
    if os.path.exists(f"{pasta}/{nome}.png"):  # o Chrome às vezes não sobrescreve: apaga antes
        os.remove(f"{pasta}/{nome}.png")
    subprocess.run([CHROME, "--headless=new", f"--user-data-dir={AQUI}/.chrome", "--hide-scrollbars", "--force-device-scale-factor=1",
                    f"--window-size=1080,{altura}", "--virtual-time-budget=8000", f"--screenshot={pasta}/{nome}.png", "file:///" + hp], capture_output=True)
    os.remove(hp)
    print(pasta, nome)


if __name__ == "__main__":
    os.makedirs(f"{AQUI}/fotos", exist_ok=True)
    so = set(sys.argv[1:])
    for d in DATAS:
        if not so or d["slug"] in so:
            render(homenagem(d), f"{POSTS}/{d['slug']}")
