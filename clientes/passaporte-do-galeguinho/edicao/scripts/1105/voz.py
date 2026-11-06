"""Onde a fala começa e termina DE VERDADE (detector de voz Silero, o do faster-whisper), sem confiar no tempo de
palavra da transcrição, que marca o fim 0,3–0,8 s cedo (regra 13 da curadoria, 2026-11-01).
Uso: python voz.py IMG_1310:4.2:22.4 ...   -> regiões de voz em volta do início e do fim, com as palavras
     python voz.py --trechos                -> confere todos os cortes de trechos.py (alerta se o corte cai em voz)
"""
import json
import os
import sys
import wave

import numpy as np
from faster_whisper.vad import VadOptions, get_speech_timestamps

AQUI = os.path.dirname(os.path.abspath(__file__))
INV = json.load(open(os.path.join(AQUI, "analise", "inventario.json"), encoding="utf-8"))
cache = {}


def audio(nome):
    if nome not in cache:
        with wave.open(os.path.join(AQUI, "analise", "wav16k", nome + ".wav")) as w:
            a = np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(np.float32) / 32768
        ops = VadOptions(threshold=0.35, min_silence_duration_ms=100, speech_pad_ms=0, min_speech_duration_ms=60)
        cache[nome] = (a, [(r["start"] / 16000, r["end"] / 16000) for r in get_speech_timestamps(a, ops)])
    return cache[nome]


def energia(a, t):  # dB em janelas de 40 ms em volta de t (−0,3 a +0,3 s), em escala 0–9
    s = []
    for x in np.arange(t - 0.3, t + 0.31, 0.04):
        p = a[max(0, int(x * 16000)): int((x + 0.04) * 16000)]
        d = 20 * np.log10(np.sqrt((p ** 2).mean()) + 1e-9) if len(p) else -99
        s.append(("|" if abs(x - t) < 0.02 else "") + str(min(9, int(max(0, d + 60)) // 6)))
    return "".join(s)


def mostra(nome, t, rot):
    a, rs = audio(nome)
    dentro = [r for r in rs if r[0] - 0.03 < t < r[1] + 0.03]
    perto = [r for r in rs if r[1] > t - 2.0 and r[0] < t + 2.0]
    pal = [w for w in INV[nome + ".MOV"]["palavras"] if t - 2.0 < w["ini"] < t + 2.0]
    print(f"   {rot} {t:7.2f}: voz " + "  ".join(f"[{x:.2f}-{y:.2f}]" for x, y in perto) + ("  << CORTA FALA" if dentro else ""))
    print(f"   {'':6s}  energia {energia(a, t)}")
    print(f"   {'':6s}  " + " ".join(f"{w['p']}@{w['ini']:.2f}-{w['fim']:.2f}" for w in pal))


if __name__ == "__main__":
    if "--trechos" in sys.argv:
        sys.path.insert(0, AQUI)
        from trechos import TRECHOS
        alvos = [(t["id"], *t["som"]) for t in TRECHOS if "som" in t]
    else:
        alvos = []
        for arg in sys.argv[1:]:
            n, a, b = arg.split(":")
            alvos.append((arg, n, float(a), float(b)))
    for rot, nome, a, b in alvos:
        print(f"[{rot}] {nome} {a:.2f}-{b:.2f}")
        mostra(nome, a, "início")
        mostra(nome, b, "fim   ")
