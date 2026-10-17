"""Estética rosé da Dra. Camilla (referência "Dia do Dentista" enviada pela Talyta em 2026-10-06).

Fundo blush, foto real que se dissolve no rosa pela esquerda e termina numa onda com fio rosé-dourado,
título em serifa didone (fino + negrito com degradê rosé), subtítulo em caixa alta espaçada, texto
corrido leve, dente perolado com anel rosé no canto. Render: Chrome headless, 1080x1350.
Uso: python gera.py  -> PNGs nesta pasta.
"""
import os, subprocess

AQUI = os.path.dirname(os.path.abspath(__file__)).replace("\\", "/")
FOTOS = AQUI + "/fotos"
CHROME = r"C:\Program Files\Google\Chrome\Application\chrome.exe"

CSS = """
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400&family=Playfair+Display:wght@500;600;700&family=Montserrat:wght@300;400;500;600&display=swap');
:root{--blush:#F3E3DE;--blush2:#EAD1CB;--rose:#B5797E;--rose-esc:#8E4F57;--texto:#8A6467;--fio:#C99A93}
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:1080px;height:1350px;overflow:hidden}
.p{position:relative;width:1080px;height:1350px;overflow:hidden;font-family:Montserrat,sans-serif;
  background:radial-gradient(120% 90% at 20% 15%,#F8ECE8 0%,var(--blush) 45%,var(--blush2) 100%)}
.tag{display:flex;align-items:center;gap:22px;font-size:17px;letter-spacing:6px;font-weight:500;color:var(--rose);text-transform:uppercase}
.tag:before{content:"";width:58px;height:1.5px;background:var(--rose);opacity:.8}
.fino{font-family:'Cormorant Garamond',serif;font-weight:300;color:var(--rose-esc);line-height:1;letter-spacing:-1px}
.forte{font-family:'Playfair Display',serif;font-weight:600;line-height:1;letter-spacing:-1.5px;
  background:linear-gradient(100deg,#8C4A53 0%,#B9777C 45%,#D9A39E 62%,#A9656C 100%);
  -webkit-background-clip:text;background-clip:text;color:transparent;padding-bottom:.08em}
.caps{font-size:20px;letter-spacing:5px;line-height:1.75;font-weight:500;color:var(--rose);text-transform:uppercase}
.corpo{font-size:23px;line-height:1.55;font-weight:300;color:var(--texto);letter-spacing:.3px}
.corpo b{font-weight:500;color:var(--rose-esc)}
.traco{width:48px;height:1.5px;background:var(--rose);opacity:.7}
.assina{position:absolute;left:70px;bottom:46px;text-align:left;font-size:14px;letter-spacing:5px;color:var(--rose);font-weight:500}
.assina b{font-weight:600;color:var(--rose-esc)}
.foto{position:absolute;overflow:hidden}
.foto img{width:100%;height:100%;object-fit:cover}
.foto .tinta{position:absolute;inset:0;background:#E9B7B1;mix-blend-mode:soft-light;opacity:.75}
.foto .tinta2{position:absolute;inset:0;background:#F2D3CD;mix-blend-mode:color;opacity:.14}
.foto .some{position:absolute;inset:0}
"""

def pagina(nome, corpo):
    html = (f'<!doctype html><html><head><meta charset="utf-8"><style>{CSS}</style></head>'
            f'<body><div class="p">{corpo}</div></body></html>')
    hp = f"{AQUI}/{nome}.html"
    open(hp, "w", encoding="utf-8").write(html)
    subprocess.run([CHROME, "--headless=new", "--hide-scrollbars", "--virtual-time-budget=8000",
                    "--allow-file-access-from-files", "--window-size=1080,1350",
                    f"--screenshot={AQUI}/{nome}.png", "file:///" + hp], capture_output=True)
    print(nome)

F = lambda n: f"file:///{FOTOS}/{n}"

# faixa clara que atravessa a parede (a curva grande da referência)
CURVA = """<svg width="1080" height="1350" style="position:absolute;inset:0">
<path d="M420,0 C520,260 470,520 640,760 C760,930 940,980 1080,960 L1080,0 Z" fill="#fff" opacity=".18"/></svg>"""

# foto grande à direita, até o canto de baixo; some no rosa pela esquerda; a onda corta por baixo
# e o fio rosé acompanha a onda (composição da referência). Usa a foto tratada (grade.py -> <n>_g.jpg).
def foto_onda(arq, pos="center 25%", x=300):
    w = 1080 - x
    onda = (f"M0,0 H{w} V1350 H{w-210} C{w-330},1350 {w-400},1190 {w-540},1135 "
            f"C{w-660},1090 {w-740},1075 0,1065 Z")
    fio = (f"M-20,1130 C120,1075 {x-60},1050 {x+90},1072 C{x+200},1088 {x+300},1112 {x+400},1180 "
           f"C{x+480},1235 {x+540},1320 {x+590},1380")
    return f"""
<div class="foto" style="left:{x}px;top:0;width:{w}px;height:1350px;clip-path:path('{onda}')">
  <div style="position:absolute;inset:0;-webkit-mask-image:linear-gradient(to right,transparent 0%,rgba(0,0,0,.5) 14%,#000 34%)">
    <img src="{F(arq.replace('.jpg', '_g.jpg'))}" style="object-position:{pos}"></div>
</div>
<svg width="1080" height="1350" style="position:absolute;inset:0;pointer-events:none">
  <defs><linearGradient id="ouro" x1="0" x2="1"><stop offset="0" stop-color="#E7C3BA"/><stop offset=".45" stop-color="#C48C86"/>
  <stop offset=".7" stop-color="#F1D6CF"/><stop offset="1" stop-color="#B9807D"/></linearGradient></defs>
  <path d="{fio}" fill="none" stroke="url(#ouro)" stroke-width="2.6"/>
</svg>"""

# dente perolado com anel rosé (metade de trás do anel atrás do dente, metade da frente na frente)
def dente(arq="01_molar_realista.png", x=60, y=960, lado=280, giro=-14):
    cx, cy = x + lado / 2, y + lado * 0.62
    rx, ry = lado * 0.66, lado * 0.2
    anel = lambda clip: (f'<svg width="1080" height="1350" style="position:absolute;inset:0">'
        f'<defs><linearGradient id="anel{clip}" x1="0" x2="1"><stop offset="0" stop-color="#F4D9D2"/>'
        f'<stop offset=".5" stop-color="#C68E89"/><stop offset="1" stop-color="#EBC7BF"/></linearGradient>'
        f'<clipPath id="c{clip}"><rect x="0" y="{cy if clip == "f" else 0}" width="1080" height="{1350 if clip == "f" else cy}"'
        f' transform="rotate({giro} {cx} {cy})"/></clipPath></defs>'
        f'<ellipse cx="{cx}" cy="{cy}" rx="{rx}" ry="{ry}" fill="none" stroke="url(#anel{clip})" stroke-width="9"'
        f' clip-path="url(#c{clip})" transform="rotate({giro} {cx} {cy})" opacity=".95"'
        f' style="filter:drop-shadow(0 4px 6px rgba(140,80,80,.25))"/></svg>')
    return (anel("t") +
            f'<img src="{F(arq)}" style="position:absolute;left:{x}px;top:{y}px;width:{lado}px;height:{lado}px;'
            f'filter:drop-shadow(10px 22px 22px rgba(120,70,70,.28)) saturate(.55) sepia(.12) hue-rotate(-12deg) brightness(1.04)">' + anel("f") +
            f'<div style="position:absolute;left:{x-30}px;top:{y+lado*0.93}px;width:{lado+60}px;height:30px;'
            f'background:radial-gradient(closest-side,rgba(120,70,70,.22),transparent);"></div>')

ASSINA = '<div class="assina">DRA. CAMILLA <b>WANDERLEY</b><br><span style="font-size:12px;letter-spacing:4px;opacity:.85">CLÍNICA GERAL E ENDODONTIA</span></div>'


# 1 · post 8 · Dia do Dentista (foto única)
pagina("A-dia-do-dentista", CURVA + foto_onda("0167.jpg", "30% 30%", x=450) + f"""
<div style="position:absolute;left:70px;top:86px"><div class="tag">25 de outubro</div></div>
<div style="position:absolute;left:66px;top:178px">
  <div class="fino" style="font-size:118px">Dia do</div>
  <div class="forte" style="font-size:136px;margin-top:-6px">Dentista</div>
</div>
<div style="position:absolute;left:72px;top:500px;width:380px">
  <div class="caps">Eu escolhi cuidar da parte da odontologia que as pessoas mais temem.</div>
  <div class="corpo" style="margin-top:40px">Hoje eu agradeço a cada paciente que chegou com medo
  e saiu com o <b>dente no lugar.</b></div>
  <div class="traco" style="margin-top:44px"></div>
</div>""" + dente() + ASSINA)

# 2 · post 7 · capa do carrossel "Canal dói."
pagina("B-canal-doi-capa", CURVA + foto_onda("0033.jpg", "center 22%", x=360) + f"""
<div style="position:absolute;left:70px;top:86px"><div class="tag">O que a gente herdou</div></div>
<div style="position:absolute;left:66px;top:178px">
  <div class="fino" style="font-size:130px">“Canal</div>
  <div class="forte" style="font-size:156px;margin-top:-8px">dói.”</div>
</div>
<div style="position:absolute;left:72px;top:520px;width:360px">
  <div class="caps">Deixa eu te contar o que realmente dói.</div>
  <div class="traco" style="margin-top:44px"></div>
  <div style="margin-top:28px;font-size:14px;letter-spacing:5px;color:var(--rose);font-weight:500">ARRASTA →</div>
</div>""" + dente() + ASSINA)

# 3 · post 7 · slide interno (sem foto: o dente inflamado é o herói)
pagina("C-canal-doi-slide3", CURVA + f"""
<div style="position:absolute;left:70px;top:86px"><div class="tag">03 / 06</div></div>
<div style="position:absolute;left:70px;top:190px;width:900px">
  <div class="fino" style="font-size:84px;line-height:1.08">O que dói de verdade é</div>
  <div class="forte" style="font-size:88px;line-height:1.08;margin-top:10px">a inflamação<br>dentro do dente.</div>
  <div class="corpo" style="margin-top:46px;width:520px">Aquela dor que lateja, que acorda de madrugada,
  que <b>não passa com remédio.</b></div>
  <div class="traco" style="margin-top:44px"></div>
</div>
<svg width="1080" height="1350" style="position:absolute;inset:0">
  <defs><linearGradient id="o2" x1="0" x2="1"><stop offset="0" stop-color="#E7C3BA"/><stop offset=".5" stop-color="#C48C86"/>
  <stop offset="1" stop-color="#EFD2CA"/></linearGradient></defs>
  <path d="M-20,1150 C220,1060 380,1220 620,1130 C800,1060 930,1010 1100,1050" fill="none" stroke="url(#o2)" stroke-width="2.4"/>
</svg>""" + dente("03_molar_polpa_inflamada.png", x=600, y=760, lado=420, giro=-12) + ASSINA)
