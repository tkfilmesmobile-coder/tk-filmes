# Trilha do Galeguinho (2026-11-06): groove animado de vlog, ~104 BPM, em Sol maior (G - Em - C - D).
# Original, sintetizada aqui (sem download, sem direito autoral). Base no gerador da Dra. Annalibya, com bateria.
# Bumbo marcado, palma na 2 e na 4, chimbal em colcheia com swing leve, baixo sincopado, teclado em "stabs" e um
# riff de sintetizador a cada 4 compassos. Fica baixinha sob a fala (o volume é controlado no Remotion).
# Uso: python scripts/gerar-trilha.py [duração_s]  ->  public/audio/trilha.wav (48 kHz, estéreo, 16 bits)
import sys
import wave

import numpy as np

SR = 48000
BEAT = 60 / 104
BAR = 4 * BEAT
DUR = float(sys.argv[1]) if len(sys.argv) > 1 else 150.0
N = int(SR * DUR)
rng = np.random.default_rng(1105)


def pos(t): return int(round(t * SR))


def add(dest, sig, t, g=1.0):
    i = pos(t)
    if i >= N or i < 0: return
    j = min(N, i + len(sig))
    dest[i:j] += sig[: j - i] * g


def env(n, ataque, queda, solta=0.04, dur=None):
    t = np.arange(n) / SR
    e = np.minimum(1, t / max(ataque, 1e-4)) * np.exp(-t / queda)
    if dur is not None:
        e *= np.clip((dur - t) / solta, 0, 1)
    return e


def lp(x, k): return np.convolve(x, np.ones(k) / k, mode="same")


def stab(f, dur):  # teclado brilhante (duas ondas levemente desafinadas + oitava)
    n = int(SR * (dur + 0.05)); t = np.arange(n) / SR
    s = np.sign(np.sin(2 * np.pi * f * t)) * 0.25 + np.sin(2 * np.pi * f * 1.004 * t) + 0.35 * np.sin(4 * np.pi * f * t)
    return lp(s, 6) * env(n, 0.004, 0.28, 0.03, dur)


def baixo(f, dur):
    n = int(SR * (dur + 0.03)); t = np.arange(n) / SR
    s = np.sin(2 * np.pi * f * t) + 0.35 * np.sin(4 * np.pi * f * t) + 0.12 * np.sin(6 * np.pi * f * t)
    return s * env(n, 0.006, 0.45, 0.03, dur)


def lead(f, dur):
    n = int(SR * (dur + 0.1)); t = np.arange(n) / SR
    vib = 1 + 0.004 * np.sin(2 * np.pi * 5.5 * t) * np.minimum(1, t / 0.15)
    s = np.sin(2 * np.pi * f * vib * t) + 0.3 * np.sin(2 * np.pi * 2 * f * vib * t) + 0.12 * np.sin(2 * np.pi * 3 * f * t)
    return s * env(n, 0.01, 0.5, 0.06, dur)


def bumbo():
    n = int(SR * 0.35); t = np.arange(n) / SR
    f = 50 + 95 * np.exp(-t / 0.03)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.13)


def palma():
    n = int(SR * 0.2); t = np.arange(n) / SR
    r = np.diff(rng.standard_normal(n), prepend=0)
    e = np.zeros(n)
    for k in (0.0, 0.009, 0.018):  # três batidas rápidas = palma
        e += np.where(t >= k, np.exp(-(t - k) / 0.012), 0)
    return r * (e * 0.6 + 0.4 * np.exp(-t / 0.06))


def chimbal(forte):
    n = int(SR * 0.05)
    r = np.diff(np.diff(rng.standard_normal(n), prepend=0), prepend=0)
    return r * env(n, 0.0008, 0.012) * (0.55 if forte else 0.32)


G2, E2, C2, D2 = 98.00, 82.41, 65.41, 73.42
PROG = [
    (G2, [196.00, 246.94, 293.66, 392.00]),   # G
    (E2, [164.81, 196.00, 246.94, 329.63]),   # Em
    (C2, [196.00, 261.63, 329.63, 392.00]),   # C
    (D2, [185.00, 220.00, 293.66, 369.99]),   # D
]
# riff (compasso do ciclo, tempo, nota, duração em tempos)
RIFF = [(0, 0.5, 587.33, 0.5), (0, 1.0, 659.25, 0.5), (0, 1.5, 587.33, 0.5), (0, 2.5, 493.88, 1.0),
        (1, 0.5, 493.88, 0.5), (1, 1.0, 587.33, 0.5), (1, 1.5, 493.88, 0.5), (1, 2.5, 392.00, 1.0),
        (2, 0.5, 523.25, 0.5), (2, 1.0, 587.33, 0.5), (2, 1.5, 659.25, 0.5), (2, 2.5, 783.99, 1.0),
        (3, 0.5, 739.99, 0.5), (3, 1.5, 659.25, 0.5), (3, 2.0, 587.33, 1.5)]

harm = np.zeros(N); seco = np.zeros(N); riff = np.zeros(N); bateria = np.zeros(N)
SW = 0.56
for b in range(int(DUR / BAR) + 1):
    raiz, ac = PROG[b % 4]
    t0 = b * BAR
    for tempo, dur, vol in ((0.5, 0.35, 1.0), (1.5, 0.35, 0.8), (2.5, 0.35, 1.0), (3.25, 0.25, 0.7)):
        for k, f in enumerate(ac):
            add(harm, stab(f, dur * BEAT), t0 + tempo * BEAT + k * 0.004, 0.09 * vol)
    for tempo, dur, mult in ((0.0, 0.7, 1), (0.75, 0.25, 1), (1.5, 0.45, 2), (2.0, 0.7, 1), (2.75, 0.25, 1), (3.5, 0.45, 1.5)):
        add(seco, baixo(raiz * mult, dur * BEAT), t0 + tempo * BEAT, 0.55)
    if b >= 1:
        for q in range(4):
            add(bateria, bumbo(), t0 + q * BEAT, 0.62 if q % 2 == 0 else 0.48)
        for q in (1, 3):
            add(bateria, palma(), t0 + q * BEAT, 0.3)
        for q in range(4):
            add(bateria, chimbal(False), t0 + q * BEAT, 0.45)
            add(bateria, chimbal(True), t0 + (q + SW) * BEAT, 0.6)
    if b >= 4 and (b // 4) % 2 == 1:  # riff em ciclos alternados de 4 compassos (não cansa)
        for cb, tempo, nota, d in RIFF:
            if b % 4 == cb:
                add(riff, lead(nota, d * BEAT), t0 + tempo * BEAT, 0.07)

eco = riff.copy()
d = pos(0.75 * BEAT)
eco[d:] += riff[: N - d] * 0.3

# 2026-11-06: duas versões, no mesmo tempo e na mesma escala de volume. Por baixo da fala vai a "sem bateria"
# (teclado e baixo, sem bumbo, palma nem chimbal): a batida numa pausa da fala trocava o "p" de "parceria" por "b".
import os
os.makedirs("public/audio", exist_ok=True)
escala = None
for nome, mix in (("trilha", harm + seco + bateria + eco), ("trilha-sem-bateria", harm + seco + eco)):
    mix = np.tanh(mix * 1.2)
    mix *= np.minimum(1, (N - np.arange(N)) / (SR * 2.0))
    mix *= np.minimum(1, np.arange(N) / (SR * 0.03))
    escala = escala or 0.85 / np.abs(mix).max()  # mesma escala nas duas: a troca não muda o volume do teclado
    mix = mix * escala
    pcm = (np.clip(np.stack([mix, np.roll(mix, 37)], axis=1), -1, 1) * 32767).astype("<i2")
    with wave.open(f"public/audio/{nome}.wav", "wb") as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
    print(f"public/audio/{nome}.wav", DUR, "s", round(60 / BEAT), "BPM")
