"""Inventário das captações da 2ª Corrida Start Fitness (1º/11/2026): pra cada clipe, formato, duração,
nível de áudio, transcrição palavra a palavra (faster-whisper large-v3, GPU) e uma folha de quadros.
Saída: analise/inventario.json + analise/folhas/<clipe>.jpg + analise/transcricoes.txt (legível)
Uso: python inventariar.py
"""
import json
import os
import re
import site
import subprocess
import wave

for sp in site.getsitepackages():
    for sub in ("nvidia/cublas/bin", "nvidia/cudnn/bin"):
        d = os.path.join(sp, sub)
        if os.path.isdir(d):
            os.add_dll_directory(d)
            os.environ["PATH"] = d + os.pathsep + os.environ["PATH"]

import numpy as np
from faster_whisper import WhisperModel

AQUI = os.path.dirname(os.path.abspath(__file__))
BRUTO = os.path.join(AQUI, "bruto")
AN = os.path.join(AQUI, "analise")
FOLHAS = os.path.join(AN, "folhas")
WAVS = os.path.join(AN, "wav16k")
FF = os.path.join(os.environ["LOCALAPPDATA"], "CapCut", "Apps", "9.6.0.4097", "ffmpeg.exe")
os.makedirs(FOLHAS, exist_ok=True)
os.makedirs(WAVS, exist_ok=True)


def sonda(p):
    r = subprocess.run([FF, "-hide_banner", "-i", p], capture_output=True, text=True, encoding="utf-8", errors="ignore").stderr
    dur = re.search(r"Duration: (\d+):(\d+):([\d.]+)", r)
    v = re.search(r"Video: (\w+).*?, (\d{2,5})x(\d{2,5})", r)
    fps = re.search(r"([\d.]+) fps", r)
    rot = re.search(r"rotation of (-?[\d.]+)|rotate\s*:\s*(-?\d+)", r)
    criado = re.search(r"com.apple.quicktime.creationdate\s*:\s*(\S+)", r) or re.search(r"creation_time\s*:\s*(\S+)", r)
    return {
        "dur": (int(dur[1]) * 3600 + int(dur[2]) * 60 + float(dur[3])) if dur else 0,
        "codec": v[1] if v else None, "w": int(v[2]) if v else 0, "h": int(v[3]) if v else 0,
        "fps": float(fps[1]) if fps else None, "rot": (rot[1] or rot[2]) if rot else None,
        "hora": criado[1] if criado else None, "audio": "Audio:" in r,
    }


arquivos = sorted(f for f in os.listdir(BRUTO) if not f.startswith("."))
inv = {}
for f in arquivos:
    p = os.path.join(BRUTO, f)
    info = sonda(p)
    info["tipo"] = "foto" if f.lower().endswith((".jpg", ".jpeg", ".heic", ".png")) else "video"
    nome = os.path.splitext(f)[0]
    if info["tipo"] == "video":
        # folha: 8 quadros espalhados pelo clipe
        n = 8
        passo = max(info["dur"] / n, 0.05)
        subprocess.run([FF, "-v", "error", "-y", "-i", p, "-vf", f"fps=1/{passo:.3f},scale=200:-2,tile={n}x1", "-frames:v", "1",
                        os.path.join(FOLHAS, nome + ".jpg")])
        if info["audio"]:
            subprocess.run([FF, "-v", "error", "-y", "-i", p, "-vn", "-ac", "1", "-ar", "16000", os.path.join(WAVS, nome + ".wav")])
    else:
        subprocess.run([FF, "-v", "error", "-y", "-i", p, "-vf", "scale=300:-2", "-frames:v", "1", os.path.join(FOLHAS, nome + ".jpg")])
    inv[f] = info
    print(f, info["tipo"], f"{info['dur']:.1f}s", f"{info['w']}x{info['h']}", info["fps"], info["rot"], info["hora"])

m = WhisperModel("large-v3", device="cuda", compute_type="float16")
linhas = []
for f, info in inv.items():
    nome = os.path.splitext(f)[0]
    w = os.path.join(WAVS, nome + ".wav")
    if info["tipo"] != "video" or not os.path.exists(w):
        continue
    with wave.open(w) as wv:
        a = np.frombuffer(wv.readframes(wv.getnframes()), dtype=np.int16).astype(np.float32) / 32768.0
    info["rms_db"] = round(float(20 * np.log10(np.sqrt((a ** 2).mean()) + 1e-9)), 1)
    segs, _ = m.transcribe(a, language="pt", word_timestamps=True, beam_size=5, vad_filter=True)
    pal, txt = [], []
    for s in segs:
        txt.append(f"[{s.start:6.2f}-{s.end:6.2f}] {s.text.strip()}")
        for x in s.words:
            pal.append({"p": x.word.strip(), "ini": round(x.start, 3), "fim": round(x.end, 3), "prob": round(x.probability, 2)})
    info["palavras"] = pal
    linhas.append(f"===== {f} ({info['dur']:.1f}s, {info['w']}x{info['h']}, {info['fps']} fps, áudio {info['rms_db']} dB)")
    linhas += txt or ["(sem fala)"]
    print(linhas[-1 - max(0, len(txt) - 1)] if txt else f"{f}: sem fala")

json.dump(inv, open(os.path.join(AN, "inventario.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
open(os.path.join(AN, "transcricoes.txt"), "w", encoding="utf-8").write("\n".join(linhas))
print("ok")
