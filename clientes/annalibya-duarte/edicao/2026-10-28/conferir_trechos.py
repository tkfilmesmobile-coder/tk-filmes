"""Retranscreve trechos curtos em que a transcrição geral ficou insegura (prob baixa).
Uso: python conferir_trechos.py
"""
import os
import site
import subprocess
import wave

import numpy as np

for sp in site.getsitepackages():
    for sub in ("nvidia/cublas/bin", "nvidia/cudnn/bin"):
        d = os.path.join(sp, sub)
        if os.path.isdir(d):
            os.add_dll_directory(d); os.environ["PATH"] = d + os.pathsep + os.environ["PATH"]
from faster_whisper import WhisperModel

AQUI = os.path.dirname(os.path.abspath(__file__))
FF = os.path.join(os.environ["LOCALAPPDATA"], "CapCut", "Apps", "9.6.0.4097", "ffmpeg.exe")
V = {
    "v41": os.path.join(AQUI, "analise", "v41-16k.wav"),
    "v63": os.path.join(AQUI, "analise", "v63-16k.wav"),
}
TRECHOS = [("v41", 5.3, 6.9), ("v41", 28.0, 29.9), ("v63", 4.6, 6.8), ("v63", 60.7, 63.58), ("v41", 38.6, 41.5)]

m = WhisperModel("large-v3", device="cuda", compute_type="float16")
for k, a, b in TRECHOS:
    with wave.open(V[k]) as w:
        sr = w.getframerate()
        w.setpos(int(a * sr))
        x = np.frombuffer(w.readframes(int((b - a) * sr)), np.int16).astype(np.float32) / 32768
    segs, _ = m.transcribe(x, language="pt", word_timestamps=True, beam_size=5)
    pal = [f"{w.word.strip()}({w.probability:.2f})" for s in segs for w in s.words]
    print(f"{k} {a:5.1f}-{b:5.1f}: {' '.join(pal)}")
