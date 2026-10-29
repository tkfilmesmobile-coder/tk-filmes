"""Confere um vídeo final: duração, nível da voz (RMS só onde há som, pico) e uma folha com 10 quadros.
Uso: python conferir.py <video.mp4> <folha.jpg>
"""
import json, os, subprocess, sys, tempfile, wave
import numpy as np
from PIL import Image, ImageDraw

AQUI = os.path.dirname(os.path.abspath(__file__))
BIN = os.path.join(AQUI, "..", "perfil-video", "node_modules", "@remotion", "compositor-win32-x64-msvc")
FF, FP = os.path.join(BIN, "ffmpeg.exe"), os.path.join(BIN, "ffprobe.exe")

v, folha = sys.argv[1], sys.argv[2]
j = json.loads(subprocess.run([FP, "-v", "error", "-print_format", "json", "-show_format", "-show_streams", v], capture_output=True, text=True).stdout)
dur = float(j["format"]["duration"])
vs = [s for s in j["streams"] if s["codec_type"] == "video"][0]
with tempfile.TemporaryDirectory() as tmp:
    w = os.path.join(tmp, "a.wav")
    subprocess.run([FF, "-v", "error", "-y", "-i", v, "-vn", "-ac", "1", "-ar", "16000", w], check=True)
    with wave.open(w) as f:
        a = np.frombuffer(f.readframes(f.getnframes()), np.int16).astype(np.float32) / 32768
    H = 1600
    k = len(a) // H
    rms = np.sqrt((a[: k * H].reshape(k, H) ** 2).mean(axis=1))
    db = 20 * np.log10(rms + 1e-9)
    ativo = db[db > -45]
    print(f"{os.path.basename(v)}: {dur:.2f}s {vs['width']}x{vs['height']} {vs.get('pix_fmt')} | RMS ativo {20*np.log10(np.sqrt((10**(ativo/10)).mean())):.1f} dB"
          f" | pico {20*np.log10(np.abs(a).max()+1e-9):.1f} dB | trechos mudos (>1 s abaixo de -45 dB): "
          f"{sum(1 for i in range(len(db)-10) if (db[i:i+10] < -45).all() and (i == 0 or db[i-1] >= -45))}")
    ims = []
    for i in range(10):
        t = dur * (i + 0.5) / 10
        p = os.path.join(tmp, f"{i}.jpg")
        subprocess.run([FF, "-v", "error", "-y", "-ss", f"{t:.2f}", "-i", v, "-frames:v", "1", "-vf", "scale=216:384", p])
        im = Image.open(p).convert("RGB")
        ImageDraw.Draw(im).text((4, 4), f"{t:.1f}s", fill=(255, 255, 0))
        ims.append(im)
g = Image.new("RGB", (216 * 5, 384 * 2), "white")
for i, im in enumerate(ims):
    g.paste(im, ((i % 5) * 216, (i // 5) * 384))
g.save(folha, quality=85)
