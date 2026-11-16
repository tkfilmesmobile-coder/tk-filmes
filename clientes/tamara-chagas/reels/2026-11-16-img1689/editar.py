"""Reels IMG_1689 (16/11/2026, "a contribuição vence hoje"): legenda acompanhando a fala, relógio animado no topo com
o prazo, fonte no rodapé. O vídeo já veio cortado. Gera reels.mp4."""
import pathlib, subprocess
from playwright.sync_api import sync_playwright

AQUI = pathlib.Path(__file__).parent
FF = r"C:\Users\kumyt\tools\python312\Lib\site-packages\imageio_ffmpeg\binaries\ffmpeg-win-x86_64-v7.1.exe"
FONTE = '<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;500;700;800&display=swap" rel="stylesheet">'
# trechos da fala (tempos do whisper medium, texto conferido no áudio)
LEG = [(1.75, 3.05, "Não <b>esqueça</b>,"), (3.05, 4.65, "a <b>contribuição</b> caiu agora"), (4.65, 6.85, "dia <b>15</b> e foi no <b>domingo</b>,"),
       (6.85, 8.70, "mas você pode pagar <b>na segunda</b>."), (8.70, 11.30, "Ó, não esqueça não,"),
       (11.30, 13.05, "<b>garante</b> seu benefício,"), (13.05, 14.85, "vá contribuindo <b>tudo certinho</b>, viu?"),
       (14.85, 15.96, "<b>Não esqueça não.</b>")]
BASE = "*{margin:0;padding:0;box-sizing:border-box}html,body{width:1080px;height:1920px;background:transparent;font-family:Inter,sans-serif}"
TOPO = f"""<!doctype html><html><head><meta charset="utf-8">{FONTE}<style>{BASE}
.c{{position:absolute;left:250px;top:150px;width:640px;color:#fff;text-shadow:0 2px 14px rgba(0,0,0,.55)}}
.k{{font-size:26px;letter-spacing:.3em;font-weight:500;color:#E6D3B8}}
.t{{margin-top:8px;font-size:84px;line-height:1;font-weight:800;letter-spacing:-.02em;text-transform:uppercase}}
.d{{margin-top:10px;font-size:30px;font-weight:300}}
.f{{position:absolute;left:0;right:0;bottom:120px;text-align:center;font-size:21px;letter-spacing:.06em;color:rgba(255,255,255,.85);text-shadow:0 1px 8px rgba(0,0,0,.7)}}
</style></head><body><div class="c"><div class="k">CONTRIBUIÇÃO DO INSS</div><div class="t">vence hoje</div>
<div class="d">segunda, 16 de novembro</div></div>
<div class="f">Fonte: Lei nº 8.212/1991, art. 30, II · TAMARA CHAGAS ADVOCACIA</div></body></html>"""
MOSTRADOR = f"""<!doctype html><html><head><meta charset="utf-8"><style>html,body{{width:150px;height:150px;background:transparent;margin:0}}</style></head><body>
<svg width="150" height="150" viewBox="0 0 150 150"><circle cx="75" cy="75" r="66" fill="rgba(20,20,20,.35)" stroke="#fff" stroke-width="6"/>
{''.join(f'<line x1="75" y1="15" x2="75" y2="25" stroke="#E6D3B8" stroke-width="5" transform="rotate({a} 75 75)"/>' for a in range(0, 360, 30))}
<line x1="75" y1="75" x2="75" y2="42" stroke="#fff" stroke-width="7" stroke-linecap="round" transform="rotate(210 75 75)"/>
<circle cx="75" cy="75" r="7" fill="#E6D3B8"/></svg></body></html>"""
PONTEIRO = """<!doctype html><html><head><meta charset="utf-8"><style>html,body{width:150px;height:150px;background:transparent;margin:0}</style></head><body>
<svg width="150" height="150" viewBox="0 0 150 150"><line x1="75" y1="75" x2="75" y2="22" stroke="#E6D3B8" stroke-width="4" stroke-linecap="round"/></svg></body></html>"""


def leg_html(t):
    return (f'<!doctype html><html><head><meta charset="utf-8">{FONTE}<style>{BASE}'
            '.l{position:absolute;left:80px;right:80px;top:1440px;text-align:center;font-size:62px;line-height:1.2;font-weight:500;color:#fff;'
            'text-shadow:0 3px 16px rgba(0,0,0,.8),0 0 3px rgba(0,0,0,.9)}.l b{font-weight:800;color:#F3E2C4}</style></head>'
            f'<body><div class="l">{t}</div></body></html>')


tmp = AQUI / "_tmp"; tmp.mkdir(exist_ok=True)
with sync_playwright() as p:
    nav = p.chromium.launch()
    def foto(html, nome, w=1080, h=1920):
        f = tmp / f"{nome}.html"; f.write_text(html, encoding="utf-8")
        pg = nav.new_page(viewport={"width": w, "height": h}); pg.goto(f.as_uri()); pg.wait_for_load_state("networkidle")
        pg.evaluate("document.fonts.ready"); pg.wait_for_timeout(300); pg.screenshot(path=str(tmp / f"{nome}.png"), omit_background=True); pg.close()
    foto(TOPO, "topo"); foto(MOSTRADOR, "mostrador", 150, 150); foto(PONTEIRO, "ponteiro", 150, 150)
    for i, (_, _, t) in enumerate(LEG):
        foto(leg_html(t), f"leg{i}")
    nav.close()

ent = ["-i", str(AQUI / "IMG_1689.MOV"), "-loop", "1", "-i", str(tmp / "topo.png"), "-loop", "1", "-i", str(tmp / "mostrador.png"),
       "-loop", "1", "-i", str(tmp / "ponteiro.png")]
for i in range(len(LEG)):
    ent += ["-loop", "1", "-i", str(tmp / f"leg{i}.png")]
fc = ["[0:v]fps=30,format=yuv420p[b]", "[1:v]format=rgba[topo]",
      "[3:v]format=rgba,rotate=a='2*PI*t/2':c=none:ow=150:oh=150[pont]",
      "[2:v][pont]overlay=0:0:shortest=1[relog]",
      "[b][topo]overlay=0:0:shortest=1[v0]", "[v0][relog]overlay=80:150:shortest=1[w0]"]
ant = "w0"
for i, (a, z, _) in enumerate(LEG):
    fc.append(f"[{ant}][{4 + i}:v]overlay=0:0:shortest=1:enable='between(t,{a},{z})'[w{i + 1}]"); ant = f"w{i + 1}"
fc.append(f"[{ant}]fade=in:st=0:d=0.25,format=yuv420p[v]")
subprocess.run([FF, "-y", "-loglevel", "error", *ent, "-filter_complex", ";".join(fc), "-map", "[v]", "-map", "0:a",
                "-t", "15.96", "-c:v", "libx264", "-preset", "medium", "-crf", "18", "-c:a", "aac", "-b:a", "160k",
                "-color_primaries", "bt709", "-color_trc", "bt709", "-colorspace", "bt709", "-movflags", "+faststart",
                str(AQUI / "reels.mp4")], check=True)
print("ok", AQUI / "reels.mp4")
