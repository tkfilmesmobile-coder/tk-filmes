"""Curadoria do vídeo final (regra de todos os clientes, 2026-10-24):
1. retranscreve o áudio final e compara palavra por palavra com a fala original (a trilha não pode engolir palavra);
2. mede a trilha: quanto ela fica abaixo da voz na fala e quanto sobe nos respiros;
3. pico (nada pode estourar).
Uso: python curadoria.py <final.mp4>
"""
import difflib
import json
import os
import site
import subprocess
import sys
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
final = sys.argv[1]
wav_final = os.path.join(AQUI, "analise", "final16k.wav")
subprocess.run([FF, "-v", "error", "-y", "-i", final, "-vn", "-ac", "1", "-ar", "16000", wav_final], check=True)
wav48 = os.path.join(AQUI, "analise", "final48k.wav")
subprocess.run([FF, "-v", "error", "-y", "-i", final, "-vn", "-ar", "48000", wav48], check=True)


def ler(p):
    with wave.open(p) as w:
        a = np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(np.float32) / 32768
        return a.reshape(-1, w.getnchannels()), w.getframerate()


# 1. palavra por palavra
orig = json.load(open(os.path.join(AQUI, "analise", "transcricao.json"), encoding="utf-8"))["palavras"]
a, _ = ler(wav_final)
m = WhisperModel("large-v3", device="cuda", compute_type="float16")
segs, _ = m.transcribe(a[:, 0], language="pt", word_timestamps=True, beam_size=5)
nova = [w for s in segs for w in s.words]
norm = lambda t: "".join(c for c in t.lower() if c.isalnum())
A = [norm(w["p"]) for w in orig if norm(w["p"])]
B = [norm(w.word) for w in nova if norm(w.word)]
print("== palavra por palavra ==")
dif = 0
for op, i1, i2, j1, j2 in difflib.SequenceMatcher(None, A, B, autojunk=False).get_opcodes():
    if op != "equal":
        dif += 1
        print(f"  {op}: original {' '.join(A[i1:i2])!r} → final {' '.join(B[j1:j2])!r}")
print(f"  {len(A)} palavras no original, {len(B)} no final, {dif} diferença(s)")

# 2. trilha: final - voz original = trilha + efeitos
v, _ = ler(os.path.join(AQUI, "analise", "voz16k.wav"))
n = min(len(v), len(a))
resto = a[:n, 0] - v[:n, 0]
fala = np.zeros(n, bool)
for w in orig:
    fala[int(w["ini"] * 16000):int(w["fim"] * 16000)] = True
db = lambda x: 20 * np.log10(np.sqrt((x ** 2).mean()) + 1e-9)
print("== trilha ==")
print(f"  voz na fala {db(v[:n, 0][fala]):.1f} dB | trilha+efeitos na fala {db(resto[fala]):.1f} dB | fora da fala {db(resto[~fala]):.1f} dB")
for ini, fim, nome in ((23.1, 23.9, "respiro 23,1–23,9"), (25.3, 26.6, "preto e branco 25,3–26,6"), (37.1, 37.5, "fim")):
    i, j = int(ini * 16000), int(fim * 16000)
    print(f"  {nome}: trilha {db(resto[i:j]):.1f} dB")

# 3. pico
s48, _ = ler(wav48)
print("== pico ==", f"{20 * np.log10(np.abs(s48).max()):.1f} dBFS")
