"""Curadoria do vídeo final da entrevista (regra de todos os clientes, 2026-10-24):
1. retranscreve o áudio final e compara palavra por palavra com as falas escolhidas no corte (a trilha e os efeitos
   não podem engolir palavra, e nenhuma emenda pode comer começo ou fim de fala);
2. volume integrado e pico.
Uso: python curadoria.py <final.mp4>
"""
import difflib
import json
import os
import re
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
wav = os.path.join(AQUI, "analise", "final16k.wav")
subprocess.run([FF, "-v", "error", "-y", "-i", final, "-vn", "-ac", "1", "-ar", "16000", wav], check=True)
with wave.open(wav) as w:
    a = np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(np.float32) / 32768

edl = json.load(open(os.path.join(AQUI, "..", "video", "src", "entrevista-edl.json"), encoding="utf-8"))
m = WhisperModel("large-v3", device="cuda", compute_type="float16")
segs, _ = m.transcribe(a, language="pt", word_timestamps=True, beam_size=5)
nova = [w for s in segs for w in s.words]
norm = lambda t: "".join(c for c in t.lower() if c.isalnum())
orig = [w for w in edl["palavras"] if norm(w["p"])]
A = [norm(w["p"]) for w in orig]
B = [norm(w.word) for w in nova if norm(w.word)]
Bt = [w for w in nova if norm(w.word)]
print("== palavra por palavra ==")
dif = 0
for op, i1, i2, j1, j2 in difflib.SequenceMatcher(None, A, B, autojunk=False).get_opcodes():
    if op != "equal":
        dif += 1
        t = orig[i1]["ini"] if i1 < len(orig) else Bt[j1].start
        print(f"  {t:6.2f}s {op}: escolhido {' '.join(A[i1:i2])!r} -> final {' '.join(B[j1:j2])!r}")
print(f"  {len(A)} palavras escolhidas, {len(B)} no final, {dif} diferença(s)")

r = subprocess.run(f'"{FF}" -hide_banner -nostats -i "{final}" -af ebur128=peak=true -f null -', shell=True, capture_output=True, text=True, encoding="utf-8", errors="ignore")
resumo = r.stderr[r.stderr.rfind("Summary"):]
I = re.search(r"I:\s+(-?[\d.]+) LUFS", resumo); P = re.search(r"Peak:\s+(-?[\d.]+) dBFS", resumo)
print("== volume ==", f"{I.group(1) if I else '?'} LUFS integrado, pico real {P.group(1) if P else '?'} dBFS")
