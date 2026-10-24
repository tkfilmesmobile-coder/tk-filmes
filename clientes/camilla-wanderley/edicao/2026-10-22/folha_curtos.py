"""Uma folha só com vários clipes: uma linha por clipe, N quadros espaçados por igual.
Uso: python folha_curtos.py <pasta sdr> <saida.jpg> <quadros por linha> IMG_xxxx IMG_yyyy ...
"""
import os, subprocess, sys, json, tempfile
from PIL import Image, ImageDraw

AQUI = os.path.dirname(os.path.abspath(__file__))
BIN = os.path.join(AQUI, "..", "perfil-video", "node_modules", "@remotion", "compositor-win32-x64-msvc")
FF, FP = os.path.join(BIN, "ffmpeg.exe"), os.path.join(BIN, "ffprobe.exe")
W, H = 150, 266

src, out, n = sys.argv[1], sys.argv[2], int(sys.argv[3])
nomes = sys.argv[4:]
g = Image.new("RGB", (90 + n * W, len(nomes) * H), "white")
d = ImageDraw.Draw(g)
for li, nome in enumerate(nomes):
    v = os.path.join(src, nome + ".mp4")
    dur = float(json.loads(subprocess.run([FP, "-v", "error", "-print_format", "json", "-show_format", v],
                                          capture_output=True, text=True).stdout)["format"]["duration"])
    d.text((4, li * H + 6), nome[4:], fill=(0, 0, 0))
    d.text((4, li * H + 22), f"{dur:.1f}s", fill=(90, 90, 90))
    with tempfile.TemporaryDirectory() as tmp:
        for i in range(n):
            t = dur * (i + 0.5) / n
            p = os.path.join(tmp, f"{i}.jpg")
            subprocess.run([FF, "-v", "error", "-y", "-ss", f"{t:.2f}", "-i", v, "-frames:v", "1", "-vf", f"scale={W}:{H}", p])
            if os.path.exists(p):
                im = Image.open(p)
                g.paste(im, (90 + i * W, li * H))
                ImageDraw.Draw(g).text((92 + i * W, li * H + 2), f"{t:.1f}", fill=(255, 255, 0))
g.save(out, quality=80)
