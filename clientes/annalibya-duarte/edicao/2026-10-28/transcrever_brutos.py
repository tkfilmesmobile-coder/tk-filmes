"""Transcreve todos os brutos da diária (analise/brutos/*.wav) e salva palavras com tempo.
Uso: python transcrever_brutos.py
"""
import glob
import json
import os
import site
import wave

import numpy as np

for sp in site.getsitepackages():
    for sub in ("nvidia/cublas/bin", "nvidia/cudnn/bin"):
        d = os.path.join(sp, sub)
        if os.path.isdir(d):
            os.add_dll_directory(d); os.environ["PATH"] = d + os.pathsep + os.environ["PATH"]
from faster_whisper import WhisperModel

AQUI = os.path.dirname(os.path.abspath(__file__))
PASTA = os.path.join(AQUI, "analise", "brutos")
m = WhisperModel("large-v3", device="cuda", compute_type="float16")
tudo = {}
for wav in sorted(glob.glob(os.path.join(PASTA, "*.wav"))):
    with wave.open(wav) as w:
        a = np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(np.float32) / 32768
    segs, _ = m.transcribe(a, language="pt", word_timestamps=True, beam_size=5, vad_filter=True)
    pal = [{"p": x.word.strip(), "ini": round(x.start, 2), "fim": round(x.end, 2), "prob": round(x.probability, 2)}
           for s in segs for x in s.words]
    nome = os.path.splitext(os.path.basename(wav))[0]
    tudo[nome] = pal
    print(f"{nome}: " + (" ".join(f"{p['p']}@{p['ini']}" for p in pal) if pal else "(sem fala)"))
json.dump(tudo, open(os.path.join(PASTA, "transcricoes.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
