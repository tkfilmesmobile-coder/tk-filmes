"""Transcreve janelas curtas do bruto, 3 vezes cada (large-v3 com e sem palavra a palavra, e medium), pra decidir uma
leitura duvidosa ou ver se um corte come som. Uso: python ouvir.py IMG_1333:126.74:128.0 ...
"""
import os
import site
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
grande = WhisperModel("large-v3", device="cuda", compute_type="float16")
medio = WhisperModel("medium", device="cuda", compute_type="float16")
for arg in sys.argv[1:]:
    nome, a, b = arg.split(":")
    a, b = float(a), float(b)
    with wave.open(os.path.join(AQUI, "analise", "wav16k", nome + ".wav")) as w:
        x = np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(np.float32) / 32768
    x = x[int(a * 16000): int(b * 16000)].copy()
    n = min(len(x), 320)  # 20 ms de fade nas pontas, como no corte de verdade
    x[:n] *= np.linspace(0, 1, n); x[-n:] *= np.linspace(1, 0, n)
    x = np.concatenate([np.zeros(8000, np.float32), x, np.zeros(8000, np.float32)])  # meio segundo de silêncio em volta
    r = []
    for m, rot in ((grande, "large"), (medio, "medium")):
        segs, _ = m.transcribe(x, language="pt", beam_size=5, condition_on_previous_text=False, word_timestamps=True)
        pal = [p for s in segs for p in s.words]
        r.append(f"{rot}: " + " ".join(f"{p.word.strip()}({p.probability:.2f})" for p in pal))
    print(f"[{arg}]\n   " + "\n   ".join(r))
