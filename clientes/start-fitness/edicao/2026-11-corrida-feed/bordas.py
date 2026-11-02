"""Mostra a energia do áudio (janelas de 20 ms) em volta de cada ponto de corte, pra emenda cair no silêncio.
Uso: python bordas.py IMG_0860:66.70 IMG_0871:0.72 ...
"""
import os
import sys
import wave

import numpy as np

AQUI = os.path.dirname(os.path.abspath(__file__))
for arg in sys.argv[1:]:
    nome, t = arg.split(":")
    t = float(t)
    with wave.open(os.path.join(AQUI, "analise", "wav16k", nome + ".wav")) as w:
        a = np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(float) / 32768
    linha = []
    for x in np.arange(t - 0.3, t + 0.32, 0.04):
        s = a[max(0, int(x * 16000)): int((x + 0.04) * 16000)]
        d = 20 * np.log10(np.sqrt((s ** 2).mean()) + 1e-9) if len(s) else -99
        marca = "|" if abs(x - t) < 0.02 else " "
        linha.append(f"{marca}{int(max(0, d + 60)) // 6}")
    print(f"{arg:16s} " + "".join(linha))
