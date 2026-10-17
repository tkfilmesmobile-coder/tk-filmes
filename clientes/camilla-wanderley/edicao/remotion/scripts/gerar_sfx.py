"""Biblioteca de efeitos sonoros discretos (sintetizados, 48 kHz, mono) pra finalização clínica.
Perceptíveis mais pelo subconsciente do que pelo ouvido: curtos, sem graves estourados, sem som cômico.
Grava em public/sfx/. Uso: python scripts/gerar_sfx.py
"""
import os, wave
import numpy as np

SR = 48000
os.makedirs("public/sfx", exist_ok=True)
rng = np.random.default_rng(3)


def t(d):
    return np.arange(int(SR * d)) / SR


def env(n, a, d):
    """ataque linear de a s, decaimento exponencial com constante d s"""
    x = np.arange(n) / SR
    return np.minimum(1, x / max(a, 1e-4)) * np.exp(-x / d)


def banda(x, lo, hi):
    X = np.fft.rfft(x)
    f = np.fft.rfftfreq(len(x), 1 / SR)
    X[(f < lo) | (f > hi)] = 0
    return np.fft.irfft(X, len(x))


def salva(nome, x, pico_db):
    x = x - np.mean(x)
    x = x / (np.max(np.abs(x)) + 1e-9) * 10 ** (pico_db / 20)
    fade = int(SR * 0.004)
    x[-fade:] *= np.linspace(1, 0, fade)
    with wave.open(f"public/sfx/{nome}.wav", "w") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((np.clip(x, -1, 1) * 32767).astype(np.int16).tobytes())
    print(f"{nome}.wav {len(x) / SR:.2f} s")


# soft hit: corpo grave curto + transiente abafado
x = t(0.35)
hit = np.sin(2 * np.pi * (90 * x - 40 * x ** 2)) * env(len(x), 0.002, 0.07)
hit += banda(rng.normal(size=len(x)), 200, 1800) * env(len(x), 0.001, 0.012) * 0.5
salva("soft-hit", hit, -8)

# UI click: tique curto e seco
x = t(0.06)
salva("ui-click", banda(rng.normal(size=len(x)), 2500, 6000) * env(len(x), 0.0005, 0.006), -10)

# air whoosh: ar filtrado que abre e fecha
x = t(0.5)
n = banda(rng.normal(size=len(x)), 500, 5000)
formato = np.sin(np.pi * np.clip(x / 0.5, 0, 1)) ** 2
salva("air-whoosh", n * formato, -14)

# tonal sting (dor): nota aguda limpa com leve batimento, decai rápido
x = t(0.7)
st = (np.sin(2 * np.pi * 1318 * x) + 0.4 * np.sin(2 * np.pi * 1330 * x) + 0.15 * np.sin(2 * np.pi * 2637 * x))
salva("tonal-sting", st * env(len(x), 0.004, 0.18), -12)

# low pulse (dor persistente): duas batidas graves e macias
x = t(0.9)
p = np.sin(2 * np.pi * 62 * x) * (env(len(x), 0.01, 0.12) + np.roll(env(len(x), 0.01, 0.12), int(0.42 * SR)) * 0.8)
salva("low-pulse", p, -10)

# tonal release (estímulo sai, dor para): nota que desce e some
x = t(0.45)
f = 880 - 220 * np.clip(x / 0.3, 0, 1)
salva("tonal-release", np.sin(2 * np.pi * np.cumsum(f) / SR) * env(len(x), 0.005, 0.12), -16)

# metallic soft tick (instrumental de avaliação): parciais inarmônicas curtas
x = t(0.3)
mt = sum(a * np.sin(2 * np.pi * fr * x) for fr, a in [(3150, 1), (4730, 0.6), (6210, 0.35)])
salva("metal-tick", mt * env(len(x), 0.0008, 0.05), -14)

# ping (check final): nota média-aguda, cristalina
x = t(0.6)
salva("ping", (np.sin(2 * np.pi * 1568 * x) + 0.25 * np.sin(2 * np.pi * 3136 * x)) * env(len(x), 0.003, 0.14), -14)

# low impact (diagnóstico): grave elegante com cauda curta
x = t(0.8)
li = np.sin(2 * np.pi * (70 * x - 20 * x ** 2)) * env(len(x), 0.003, 0.16)
li += banda(rng.normal(size=len(x)), 60, 400) * env(len(x), 0.002, 0.05) * 0.4
salva("low-impact", li, -8)

# micro whoosh (mudança de enquadramento): ar curtíssimo, bem baixo
x = t(0.22)
n = banda(rng.normal(size=len(x)), 900, 6000)
salva("micro-whoosh", n * np.sin(np.pi * np.clip(x / 0.22, 0, 1)) ** 3, -18)

# tonal tick (palavra-chave): nota curta, limpa
x = t(0.25)
salva("tonal-tick", (np.sin(2 * np.pi * 1760 * x) + 0.3 * np.sin(2 * np.pi * 2640 * x)) * env(len(x), 0.002, 0.045), -16)
