"""Onde a fala começa e termina DE VERDADE (detector de voz Silero, o mesmo do faster-whisper), sem depender do
tempo de palavra da transcrição, que marca o fim cedo demais (Talyta, 2026-11-01: "você corta antes de terminar a frase").
Pra cada trecho do montar.py: as regiões de voz em volta do início e do fim, e se o corte cai dentro de uma região
(= corta fala) ou num silêncio de verdade.
Uso: python voz.py
"""
import importlib.util
import os
import wave

import numpy as np
from faster_whisper.vad import VadOptions, get_speech_timestamps

AQUI = os.path.dirname(os.path.abspath(__file__))
spec = importlib.util.spec_from_file_location("montar", os.path.join(AQUI, "montar.py"))
montar = importlib.util.module_from_spec(spec)
spec.loader.exec_module(montar)

cache = {}


def regioes(nome):
    if nome not in cache:
        with wave.open(os.path.join(AQUI, "analise", "wav16k", nome + ".wav")) as w:
            a = np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(np.float32) / 32768
        ops = VadOptions(threshold=0.35, min_silence_duration_ms=120, speech_pad_ms=0, min_speech_duration_ms=60)
        cache[nome] = [(r["start"] / 16000, r["end"] / 16000) for r in get_speech_timestamps(a, ops)]
    return cache[nome]


def mostra(nome, t, rot):
    rs = regioes(nome)
    dentro = [r for r in rs if r[0] - 0.02 < t < r[1] + 0.02]
    perto = [r for r in rs if r[1] > t - 2.0 and r[0] < t + 2.0]
    txt = "  ".join(f"[{a:.2f}-{b:.2f}]" for a, b in perto)
    alerta = "  << CORTA FALA" if dentro else ""
    print(f"   {rot} {t:6.2f}: {txt}{alerta}")


for t in montar.TRECHOS:
    if "som" not in t:
        continue
    nome, a, b = t["som"]
    print(f"[{t['id']}] {nome} {a:.2f}-{b:.2f}")
    mostra(nome, a, "início")
    mostra(nome, b, "fim   ")
