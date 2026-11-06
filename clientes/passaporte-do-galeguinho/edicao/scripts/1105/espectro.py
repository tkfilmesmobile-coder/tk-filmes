"""Espectrograma de um trecho, com régua de tempo a cada 0,1 s e as palavras da transcrição embaixo, pra achar a
fronteira real entre palavras quando a pessoa emenda uma frase na outra sem pausa.
Uso: python espectro.py IMG_1329 55.5 57.6 [mais trechos no mesmo formato: clipe ini fim ...]
Saída: analise/espectro/<clipe>_<ini>.png
"""
import json
import os
import sys
import wave

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np

AQUI = os.path.dirname(os.path.abspath(__file__))
INV = json.load(open(os.path.join(AQUI, "analise", "inventario.json"), encoding="utf-8"))
SAI = os.path.join(AQUI, "analise", "espectro")
os.makedirs(SAI, exist_ok=True)
args = sys.argv[1:]
for k in range(0, len(args), 3):
    nome, a, b = args[k], float(args[k + 1]), float(args[k + 2])
    with wave.open(os.path.join(AQUI, "analise", "wav16k", nome + ".wav")) as w:
        x = np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(np.float32) / 32768
    x = x[int(a * 16000): int(b * 16000)]
    fig, (ax1, ax2) = plt.subplots(2, 1, figsize=(16, 5.5), sharex=True, gridspec_kw={"height_ratios": [3, 1.3]})
    ax1.specgram(x, NFFT=512, Fs=16000, noverlap=448, cmap="magma", vmin=-110)
    ax1.set_ylim(0, 6000)
    env = np.array([np.sqrt((x[i:i + 160] ** 2).mean()) for i in range(0, len(x) - 160, 160)])
    ax2.plot(np.arange(len(env)) * 0.01, 20 * np.log10(env + 1e-6), lw=1)
    ax2.set_ylim(-75, -5)
    for p in INV[nome + ".MOV"]["palavras"]:
        if a - 0.3 < p["ini"] < b:
            ax2.axvline(p["ini"] - a, color="green", alpha=0.4, lw=0.8)
            ax2.text(p["ini"] - a, -72, p["p"], fontsize=8, rotation=0, color="darkgreen")
    for ax in (ax1, ax2):
        ax.set_xticks(np.arange(0, b - a + 1e-6, 0.1))
        ax.set_xticklabels([f"{a + t:.1f}" for t in np.arange(0, b - a + 1e-6, 0.1)], fontsize=7, rotation=90)
        ax.grid(axis="x", alpha=0.35)
    ax1.set_title(f"{nome} {a:.2f}-{b:.2f}")
    plt.tight_layout()
    plt.savefig(os.path.join(SAI, f"{nome}_{a:g}.png"), dpi=72)
    plt.close(fig)
    print(os.path.join("analise", "espectro", f"{nome}_{a:g}.png"))
