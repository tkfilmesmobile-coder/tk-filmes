"""Transcreve só uns trechos do original e de um áudio editado, lado a lado (pra achar efeito que engole palavra).
Uso: python conferir_trechos.py <editado16k.wav> ini-fim [ini-fim ...]
"""
import os
import site
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
m = WhisperModel("large-v3", device="cuda", compute_type="float16")


def ler(p):
    with wave.open(p) as w:
        return np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(np.float32) / 32768


orig, edit = ler(os.path.join(AQUI, "analise", "voz16k.wav")), ler(sys.argv[1])
for faixa in sys.argv[2:]:
    ini, fim = map(float, faixa.split("-"))
    for nome, a in (("original", orig), ("editado", edit)):
        seg = a[int(ini * 16000):int(fim * 16000)]
        txt = " ".join(s.text.strip() for s in m.transcribe(seg, language="pt", beam_size=5)[0])
        print(f"{ini:5.1f}-{fim:5.1f} {nome:8s} | {txt}")
