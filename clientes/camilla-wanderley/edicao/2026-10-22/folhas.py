"""Folha de contato por clipe: um quadro a cada N segundos, com o tempo escrito, numa grade.
Uso: python folhas.py <pasta sdr> <pasta saída> [segundos entre quadros]
"""
import os, subprocess, sys, glob, tempfile, json
from PIL import Image, ImageDraw, ImageFont

AQUI = os.path.dirname(os.path.abspath(__file__))
BIN = os.path.join(AQUI, "..", "perfil-video", "node_modules", "@remotion", "compositor-win32-x64-msvc")
FF, FP = os.path.join(BIN, "ffmpeg.exe"), os.path.join(BIN, "ffprobe.exe")


def duracao(v):
    j = json.loads(subprocess.run([FP, "-v", "error", "-print_format", "json", "-show_format", v],
                                  capture_output=True, text=True).stdout)
    return float(j["format"]["duration"])


def folha(v, saida, passo):
    d = duracao(v)
    tempos = [t for t in [i * passo for i in range(int(d // passo) + 1)] if t < d - 0.05] or [0]
    tempos = tempos[:40]
    thumbs = []
    with tempfile.TemporaryDirectory() as tmp:
        for i, t in enumerate(tempos):
            p = os.path.join(tmp, f"{i}.jpg")
            subprocess.run([FF, "-v", "error", "-y", "-ss", f"{t:.2f}", "-i", v, "-frames:v", "1",
                            "-vf", "scale=216:384", p], check=False)
            if os.path.exists(p):
                im = Image.open(p).convert("RGB")
                dr = ImageDraw.Draw(im)
                dr.rectangle([0, 0, 70, 22], fill=(0, 0, 0))
                dr.text((4, 4), f"{int(t // 60)}:{t % 60:04.1f}", fill=(255, 255, 0))
                thumbs.append(im)
    col = 8
    lin = (len(thumbs) + col - 1) // col
    g = Image.new("RGB", (col * 216, lin * 384 + 30), "white")
    ImageDraw.Draw(g).text((6, 8), f"{os.path.basename(v)}  ({d:.1f}s, 1 quadro a cada {passo}s)", fill=(0, 0, 0))
    for i, im in enumerate(thumbs):
        g.paste(im, ((i % col) * 216, 30 + (i // col) * 384))
    g.save(saida, quality=80)


if __name__ == "__main__":
    src, out = sys.argv[1], sys.argv[2]
    os.makedirs(out, exist_ok=True)
    for v in sorted(glob.glob(os.path.join(src, "*.mp4"))):
        d = duracao(v)
        passo = float(sys.argv[3]) if len(sys.argv) > 3 else max(1.0, round(d / 32, 1))
        folha(v, os.path.join(out, os.path.splitext(os.path.basename(v))[0] + ".jpg"), passo)
        print(os.path.basename(v), flush=True)
