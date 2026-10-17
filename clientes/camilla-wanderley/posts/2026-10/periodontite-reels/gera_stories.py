"""Stories do reels "Periodontite na gestação" no formato orgânico aprovado (cara de feito no próprio app,
como os trios da Tamara Chagas): 1 · card "post novo no feed" · 2 · nota do celular · 3 · conversa
ilustrativa. Paleta da doutora (rosé) nos selos e destaques; foto real dela no avatar (sem tratamento).
Render: Chrome headless 1080x1920. Uso: python gera_stories.py
"""
import os, subprocess

AQUI = os.path.dirname(os.path.abspath(__file__)).replace("\\", "/")
CHROME = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
AVATAR = f"file:///{AQUI}/avatar.jpg"
BASE = (
    '<!doctype html><html><head><meta charset="utf-8"><link href="https://fonts.googleapis.com/css2?'
    'family=Inter:wght@300;400;500;600;700;800&family=Playfair+Display:wght@600&display=swap" rel="stylesheet">'
    "<style>*{margin:0;padding:0;box-sizing:border-box}body{width:1080px;height:1920px;overflow:hidden;font-family:'Inter',sans-serif}</style>"
    "</head><body>"
)
DATA = "7 de outubro de 2026"


def gera(nome, corpo):
    hp = f"{AQUI}/{nome}.html"
    open(hp, "w", encoding="utf-8").write(BASE + corpo + "</body></html>")
    subprocess.run([CHROME, "--headless=new", "--hide-scrollbars", "--virtual-time-budget=6000", "--allow-file-access-from-files",
                    "--window-size=1080,1920", f"--screenshot={AQUI}/{nome}.png", "file:///" + hp], capture_output=True)
    print(nome)


# 1 · card "post novo no feed"
gera("story-01", f"""<style>body{{background:#f1e9e6}}
.marca{{position:absolute;left:70px;top:236px;display:flex;align-items:center;gap:18px}}
.marca .cw{{font-family:'Playfair Display',serif;font-weight:600;font-size:44px;color:#8C4A53;border:1.5px solid #B5797E;padding:6px 12px;line-height:1}}
.marca span{{font-size:22px;letter-spacing:6px;color:#8C4A53;font-weight:600;line-height:1.35}}
.selo{{position:absolute;left:70px;top:470px;background:#8C4A53;color:#fff;font-size:34px;font-weight:600;padding:12px 26px;border-radius:999px;transform:rotate(-2deg)}}
.card{{position:absolute;left:70px;right:70px;top:580px;background:#fff;border-radius:40px;padding:60px 64px;box-shadow:0 30px 80px rgba(110,43,56,.08)}}
.h{{display:flex;align-items:center;gap:24px}}.h img{{width:110px;height:110px;border-radius:50%;object-fit:cover}}
.h b{{font-size:40px;display:block}}.h span{{font-size:32px;color:#777}}
.t{{margin-top:44px;font-size:52px;line-height:1.35;color:#141414}}.t b{{font-weight:700}}
.m{{margin-top:44px;padding-top:28px;border-top:1px solid #eee;font-size:30px;color:#888}}</style>
<div class="marca"><div class="cw">CW</div><span>CAMILLA WANDERLEY<br>DENTISTA</span></div>
<div class="selo">post novo no feed 📌</div>
<div class="card"><div class="h"><img src="{AVATAR}"><div><b>Dra. Camilla Wanderley</b><span>@dra.camillawanderley</span></div></div>
<div class="t">Grávida ou pensando em engravidar? 🤍 Gravei um vídeo sobre <b>periodontite</b>, a doença da gengiva que merece atenção especial na gestação. Explico no post 👆</div>
<div class="m">{DATA}</div></div>""")

# 2 · nota do celular
gera("story-02", f"""<style>body{{background:#f7f6f2}}
.top{{position:absolute;top:210px;left:70px;right:70px;display:flex;justify-content:space-between;color:#d9a300;font-size:40px;font-weight:500}}
.data{{position:absolute;top:320px;left:0;right:0;text-align:center;color:#999;font-size:30px}}
.txt{{position:absolute;top:400px;left:80px;right:80px;font-size:50px;line-height:1.35;color:#1b1b1b}}
.txt h1{{font-size:72px;font-weight:700;margin-bottom:38px;line-height:1.1}}
.txt p{{margin-bottom:30px}}.txt b{{font-weight:700}}
.hl{{background:linear-gradient(transparent 55%,#f7c6cf 55%)}}
.rodape{{position:absolute;bottom:260px;left:80px;right:80px;font-size:28px;color:#8a8a8a}}</style>
<div class="top"><span>‹ Notas</span><span>Concluído</span></div>
<div class="data">{DATA} às 12:02</div>
<div class="txt"><h1>periodontite na gestação 🤍</h1>
<p>O ideal é tratar <b><span class="hl">antes de engravidar</span></b></p>
<p>Na gestação, o <b>2º trimestre</b> é a fase mais indicada pros tratamentos necessários</p>
<p><b>Limpeza</b> e acompanhamento seguem importantes durante toda a gestação</p>
<p>Depois que o bebê nasce, fica <b>bem mais difícil</b> ir ao dentista</p></div>
<div class="rodape">Dra. Camilla Wanderley · Clínica Geral e Endodontia</div>""")

# 3 · conversa ilustrativa
gera("story-03", f"""<style>body{{background:#efe7dd}}
.bar{{position:absolute;top:200px;left:0;right:0;height:150px;background:#f7f3ee;display:flex;align-items:center;gap:26px;padding:0 50px;border-bottom:1px solid #ddd}}
.bar img{{width:96px;height:96px;border-radius:50%;object-fit:cover}}.bar b{{font-size:38px;display:block}}.bar span{{font-size:28px;color:#6b8e5a}}
.c{{position:absolute;top:420px;left:50px;right:50px;display:flex;flex-direction:column;gap:30px}}
.b{{max-width:820px;padding:26px 34px 40px;border-radius:30px;font-size:44px;line-height:1.35;position:relative}}
.b small{{position:absolute;right:26px;bottom:10px;font-size:22px;color:#888}}
.in{{background:#fff;align-self:flex-start;border-top-left-radius:6px}}.out{{background:#d9fdd3;align-self:flex-end;border-top-right-radius:6px}}
.rodape{{position:absolute;bottom:260px;left:60px;right:60px;font-size:28px;color:#6d6358}}</style>
<div class="bar"><img src="{AVATAR}"><div><b>Dra. Camilla Wanderley</b><span>online</span></div></div>
<div class="c">
<div class="b in">Doutora, tô grávida de 5 meses e minha gengiva sangra quando escovo. Dá pra cuidar disso agora? 😟<small>12:04</small></div>
<div class="b out">Dá sim! O 2º trimestre é a fase mais indicada pros tratamentos que forem necessários 😊<small>12:05</small></div>
<div class="b out">E a limpeza e o acompanhamento são importantes durante toda a gestação. Me chama que a gente conversa com calma 🤍<small>12:05</small></div>
<div class="b in">Que alívio! Vou te chamar 🙏<small>12:06</small></div></div>
<div class="rodape">conversa ilustrativa · Dra. Camilla Wanderley · Clínica Geral e Endodontia</div>""")
