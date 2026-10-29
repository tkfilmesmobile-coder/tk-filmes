"""Transcreve um áudio com faster-whisper (GPU) e salva palavras com tempo em JSON.
Uso: python transcrever.py <audio.wav> <saida.json>
"""
import json
import os
import site
import sys

# DLLs da GPU vêm dos pacotes nvidia-* do pip (mesmo jeito do voz_fundo.py da Ary)
for sp in site.getsitepackages():
    for sub in ("nvidia/cublas/bin", "nvidia/cudnn/bin"):
        d = os.path.join(sp, sub)
        if os.path.isdir(d):
            os.add_dll_directory(d)
            os.environ["PATH"] = d + os.pathsep + os.environ["PATH"]

from faster_whisper import WhisperModel

audio, saida = sys.argv[1], sys.argv[2]
try:
    modelo = WhisperModel("large-v3", device="cuda", compute_type="float16")
except Exception:
    modelo = WhisperModel("medium", device="cpu", compute_type="int8")

# o av instalado não aceita o decode do faster-whisper: lê o wav (16 kHz mono) direto
import wave

import numpy as np

with wave.open(audio) as w:
    amostras = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32) / 32768.0

segmentos, _ = modelo.transcribe(amostras,language="pt", word_timestamps=True, vad_filter=False, beam_size=5)
palavras, texto = [], []
for s in segmentos:
    texto.append(s.text.strip())
    for w in s.words:
        palavras.append({"p": w.word.strip(), "ini": round(w.start, 3), "fim": round(w.end, 3), "prob": round(w.probability, 2)})

json.dump({"texto": " ".join(texto), "palavras": palavras}, open(saida, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
print(" ".join(texto))
for w in palavras:
    print(f"{w['ini']:6.2f}-{w['fim']:6.2f} {w['p']} ({w['prob']})")
