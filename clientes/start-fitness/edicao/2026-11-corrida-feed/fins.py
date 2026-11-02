"""Confere no vídeo FINAL (com trilha e efeitos) o fim e o começo de cada fala: transcreve só a janela em volta de
cada emenda e mostra as palavras ouvidas ao lado das esperadas. Complementa a curadoria.py, que compara o texto
inteiro mas não pega sílaba final comida (a transcrição completa a palavra pelo sentido).
Uso: python fins.py <final.mp4>
"""
import json
import os
import site
import subprocess
import sys
import wave

for sp in site.getsitepackages():
    for sub in ("nvidia/cublas/bin", "nvidia/cudnn/bin"):
        d = os.path.join(sp, sub)
        if os.path.isdir(d):
            os.add_dll_directory(d); os.environ["PATH"] = d + os.pathsep + os.environ["PATH"]
import numpy as np
from faster_whisper import WhisperModel

AQUI = os.path.dirname(os.path.abspath(__file__))
FF = os.path.join(os.environ["LOCALAPPDATA"], "CapCut", "Apps", "9.6.0.4097", "ffmpeg.exe")
ATRASO = float(os.environ.get("ATRASO", "0.042"))  # o mp4 final chega 42 ms atrasado (preenchimento do AAC)
wav = os.path.join(AQUI, "analise", "final16k.wav")
subprocess.run([FF, "-v", "error", "-y", "-i", sys.argv[1], "-vn", "-ac", "1", "-ar", "16000", wav], check=True)
with wave.open(wav) as w:
    a = np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(np.float32) / 32768
edl = json.load(open(os.path.join(AQUI, "..", "video", "src", "feed-edl.json"), encoding="utf-8"))
m = WhisperModel("large-v3", device="cuda", compute_type="float16")


def ouve(t0, t1):
    x = a[int((t0 + ATRASO) * 16000): int((t1 + ATRASO) * 16000)]
    segs, _ = m.transcribe(x, language="pt", beam_size=5, condition_on_previous_text=False)
    return " ".join(s.text.strip() for s in segs)


for t in edl["trechos"]:
    if not t["som"] or t["id"] == "contagem":
        continue
    pal = t["txt"].split()
    print(f"[{t['id']}]")
    print(f"   começo esperado: {' '.join(pal[:5])}")
    print(f"   começo ouvido:   {ouve(t['de'], min(t['ate'], t['de'] + 2.2))}")
    print(f"   fim esperado:    ...{' '.join(pal[-5:])}")
    print(f"   fim ouvido:      ...{ouve(max(t['de'], t['ate'] - 2.4), t['ate'])}")
