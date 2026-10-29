"""Story em vídeo com fala: põe legenda elegante (com degradê pra leitura) e o título pequeno no alto.
uso: python modelos/fala_legendada.py <video.mp4> <saida.mp4> "<KICKER>" "ini|fim|texto com <b>forte</b>" ...
"""
import sys, pathlib, subprocess, tempfile
from playwright.sync_api import sync_playwright

FF = r"C:/Users/tamar/AppData/Roaming/Python/Python314/site-packages/imageio_ffmpeg/binaries/ffmpeg-win-x86_64-v7.1.exe"
F = '<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;600&display=swap" rel="stylesheet">'
CSS = """*{margin:0;padding:0}html,body{width:1080px;height:1920px;font-family:Inter,sans-serif;
background:linear-gradient(180deg,rgba(20,20,20,0) 55%,rgba(20,20,20,.6) 70%,rgba(20,20,20,.72) 84%,rgba(20,20,20,.35) 100%)}
.k{position:absolute;left:0;right:0;top:1300px;justify-content:center;display:flex;align-items:center;gap:18px;font-size:24px;letter-spacing:.34em;font-weight:600;color:#E6D3B8;text-shadow:0 1px 8px rgba(0,0,0,.4)}
.k i{display:block;width:56px;height:2px;background:#E6D3B8}
.l{position:absolute;left:90px;right:90px;top:1370px;text-align:center;font-size:54px;line-height:1.3;font-weight:300;color:#fff;text-shadow:0 2px 14px rgba(0,0,0,.75),0 0 2px rgba(0,0,0,.8)}.l b{font-weight:600}"""

def main():
    video, saida, kicker = sys.argv[1], sys.argv[2], sys.argv[3]
    legs = [a.split("|", 2) for a in sys.argv[4:]]
    tmp = pathlib.Path(tempfile.mkdtemp())
    with sync_playwright() as p:
        b = p.chromium.launch()
        for i, (_, _, t) in enumerate(legs):
            f = tmp / f"l{i}.html"
            f.write_text(f'<!doctype html><html><head><meta charset="utf-8">{F}<style>{CSS}</style></head><body><div class="k"><i></i>{kicker}</div><div class="l">{t}</div></body></html>', encoding="utf-8")
            pg = b.new_page(viewport={"width": 1080, "height": 1920}); pg.goto(f.as_uri()); pg.wait_for_timeout(700)
            pg.screenshot(path=str(tmp / f"l{i}.png"), omit_background=True); pg.close()
        b.close()
    ent = ["-i", video] + sum((["-i", str(tmp / f"l{i}.png")] for i in range(len(legs))), [])
    cad, ant = [], "0:v"
    for i, (a, z, _) in enumerate(legs):
        nome = f"v{i}"; cad.append(f"[{ant}][{i + 1}]overlay=enable='between(t,{a},{z})'[{nome}]"); ant = nome
    filtro = ";".join(cad) + f";[{ant}]fade=in:0:6[v]"
    subprocess.run([FF, "-y", "-loglevel", "error", *ent, "-filter_complex", filtro, "-map", "[v]", "-map", "0:a:0",
                    "-c:v", "libx264", "-crf", "19", "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "160k",
                    "-af", "loudnorm=I=-16:TP=-1.5", "-movflags", "+faststart", saida], check=True)
    print("ok", saida)

if __name__ == "__main__":
    main()
