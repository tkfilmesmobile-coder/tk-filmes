# Trilha "impacto" do Galeguinho (2026-11-06, pedido da Talyta: "batida mais forte, mais impactante").
# Original, sintetizada aqui (sem download, sem direito autoral). Hip-hop pesado a 96 BPM em Mi menor (Em - C - Am - B):
# bumbo grave com 808 saturado (aparece até em caixa de celular), caixa + palma no 2 e no 4, chimbal em semicolcheia com
# rufadas, acordes de metal escuros, melodia de sino a cada outro ciclo, e a cada 8 compassos uma pancada (braam grave +
# prato + queda de sub) anunciada por subida de ruído.
# Duas versões no mesmo tempo e na mesma escala: "trilha-impacto" (completa, nos respiros) e "trilha-impacto-voz"
# (por baixo da fala: bumbo, 808, caixa abafada e acordes abafados; sem chimbal, sino, subida e prato, que brigam com
# as consoantes da voz).
# Uso: python scripts/gerar-trilha-impacto.py [duração_s]  ->  public/audio/trilha-impacto[-voz].wav (48 kHz, estéreo)
import os
import sys
import wave

import numpy as np
from scipy.signal import butter, fftconvolve, sosfilt

SR = 48000
BPM = 96
BEAT = 60 / BPM
PASSO = BEAT / 4  # semicolcheia
BAR = 4 * BEAT
DUR = float(sys.argv[1]) if len(sys.argv) > 1 else 170.0
N = int(SR * DUR)
rng = np.random.default_rng(1106)


def pos(t): return int(round(t * SR))


def add(dest, sig, t, g=1.0):
    i = pos(t)
    if i >= N or i < 0: return
    j = min(N, i + len(sig))
    dest[i:j] += sig[: j - i] * g


def filtro(x, tipo, fc, ordem=4):
    return sosfilt(butter(ordem, fc, btype=tipo, fs=SR, output="sos"), x)


def tt(d): return np.arange(int(SR * d)) / SR


def bumbo():
    t = tt(0.45)
    f = 46 + 150 * np.exp(-t / 0.035)
    corpo = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.22)
    clique = filtro(rng.standard_normal(len(t)), "highpass", 1800) * np.exp(-t / 0.004) * 0.5
    return np.tanh(2.2 * (corpo + clique)) * 0.9


def oito(f0, dur, f_ant=None):  # 808: seno com deslize da nota anterior, saturado pra ganhar harmônicos
    t = tt(dur + 0.05)
    f = np.full(len(t), f0)
    if f_ant:
        f = f0 + (f_ant - f0) * np.exp(-t / 0.05)
    s = np.sin(2 * np.pi * np.cumsum(f) / SR)
    e = np.minimum(1, t / 0.005) * np.exp(-t / 1.1) * np.clip((dur + 0.05 - t) / 0.05, 0, 1)
    return np.tanh(3.0 * s) * e


def caixa():
    t = tt(0.35)
    ruido = filtro(rng.standard_normal(len(t)), "bandpass", [1200, 7000], 2) * np.exp(-t / 0.11)
    tom = np.sin(2 * np.pi * 185 * t) * np.exp(-t / 0.06) + 0.5 * np.sin(2 * np.pi * 330 * t) * np.exp(-t / 0.04)
    return np.tanh(1.6 * (ruido * 0.9 + tom * 0.8))


def palma():
    t = tt(0.25)
    r = filtro(rng.standard_normal(len(t)), "bandpass", [900, 5000], 2)
    e = sum(np.where(t >= k, np.exp(-(t - k) / 0.01), 0) for k in (0.0, 0.011, 0.022))
    return r * (e * 0.6 + 0.5 * np.exp(-t / 0.08))


def chimbal(aberto=False):
    t = tt(0.32 if aberto else 0.06)
    return filtro(rng.standard_normal(len(t)), "highpass", 7000) * np.exp(-t / (0.09 if aberto else 0.014))


def metal(freqs, dur):  # acorde de metal escuro: serras desafinadas com abertura de filtro
    t = tt(dur + 0.3)
    s = np.zeros(len(t))
    for f in freqs:
        for d in (-0.006, 0.0, 0.007):
            fase = (f * (1 + d) * t) % 1.0
            s += 2 * fase - 1
    s /= len(freqs) * 3
    e = np.minimum(1, t / 0.012) * np.exp(-t / 0.35) * np.clip((dur + 0.3 - t) / 0.3, 0, 1)
    return filtro(s, "lowpass", 2600, 2) * e


def sino(f, dur):
    t = tt(dur + 0.6)
    s = np.sin(2 * np.pi * f * t) + 0.4 * np.sin(2 * np.pi * f * 2.76 * t) * np.exp(-t / 0.15) + 0.2 * np.sin(2 * np.pi * f * 5.4 * t) * np.exp(-t / 0.06)
    return s * np.minimum(1, t / 0.003) * np.exp(-t / 0.45)


def braam():  # pancada grave de cinema
    t = tt(3.0)
    s = np.zeros(len(t))
    for f in (41.2, 82.4, 123.5, 164.8):
        for d in (-0.01, 0.0, 0.012):
            s += 2 * ((f * (1 + d) * t) % 1.0) - 1
    s = filtro(s / 12, "lowpass", 900, 2)
    sub = np.sin(2 * np.pi * np.cumsum(70 * np.exp(-t / 0.6) + 28) / SR)
    e = np.minimum(1, t / 0.01) * np.exp(-t / 1.0)
    return np.tanh(2.0 * (s * 0.9 + sub * 0.8)) * e


def prato():
    t = tt(2.8)
    return filtro(rng.standard_normal(len(t)), "highpass", 4500) * np.minimum(1, t / 0.002) * np.exp(-t / 0.9)


def subida(dur):
    t = tt(dur)
    r = rng.standard_normal(len(t))
    curva = (t / dur) ** 2
    out = np.zeros(len(t))
    for k in range(8):  # filtro que abre aos poucos (8 faixas)
        a, b = int(len(t) * k / 8), int(len(t) * (k + 1) / 8)
        out[a:b] = filtro(r, "bandpass", [300 + 900 * k, 1500 + 1500 * k], 2)[a:b]
    return out * curva


# Em - C - Am - B (o Si maior dá a tensão que volta pro Mi)
E1, C2, A1, B1 = 41.20, 65.41, 55.00, 61.74
PROG = [(E1, [164.81, 196.00, 246.94, 329.63]),
        (C2, [130.81, 164.81, 196.00, 261.63]),
        (A1, [110.00, 164.81, 220.00, 261.63]),
        (B1, [123.47, 185.00, 246.94, 311.13])]
KICK = [(0, 7, 10), (0, 3, 8, 10, 14)]  # dois desenhos de bumbo alternados
MELODIA = [(0, 0, 659.25), (0, 3, 587.33), (0, 6, 493.88), (0, 10, 392.00),
           (1, 0, 523.25), (1, 6, 493.88), (1, 10, 392.00),
           (2, 0, 440.00), (2, 3, 523.25), (2, 6, 659.25), (2, 12, 587.33),
           (3, 0, 622.25), (3, 6, 493.88), (3, 10, 369.99)]

pista = {k: np.zeros(N) for k in ("bumbo", "oito", "caixa", "chimbal", "metal", "sino", "braam", "prato", "subida")}
nb = int(DUR / BAR) + 1
f_ant = None
for b in range(nb):
    raiz, acorde = PROG[b % 4]
    t0 = b * BAR
    ultimo_do_bloco = b % 8 == 7
    corte = ultimo_do_bloco  # o último tempo antes da pancada fica vazio (respira e volta com tudo)
    for passo in KICK[b % 2]:
        if corte and passo >= 12:
            continue
        add(pista["bumbo"], bumbo(), t0 + passo * PASSO)
    passos = [p for p in KICK[b % 2] if not (corte and p >= 12)]
    for i, p in enumerate(passos):
        fim = passos[i + 1] if i + 1 < len(passos) else (12 if corte else 16)
        add(pista["oito"], oito(raiz, (fim - p) * PASSO, f_ant), t0 + p * PASSO)
        f_ant = raiz
    for p in (4, 12):
        if corte and p == 12:
            continue
        add(pista["caixa"], caixa(), t0 + p * PASSO)
        add(pista["caixa"], palma(), t0 + p * PASSO + 0.006, 0.55)
    for p in range(16):
        if corte and p >= 12:
            continue
        add(pista["chimbal"], chimbal(), t0 + p * PASSO, 0.9 if p % 2 == 0 else 0.5)
    if b % 4 == 3 and not corte:  # rufada de chimbal em fusa no fim do ciclo
        for k in range(8):
            add(pista["chimbal"], chimbal(), t0 + 3 * BEAT + k * PASSO / 2, 0.35 + 0.08 * k)
    if b % 2 == 1:
        add(pista["chimbal"], chimbal(True), t0 + 14 * PASSO, 0.6)
    for p, d in ((0, 3), (6, 2), (10, 4)):
        if corte and p >= 10:
            continue
        add(pista["metal"], metal(acorde, d * PASSO), t0 + p * PASSO)
    if (b // 4) % 2 == 1:
        for cb, p, nota in MELODIA:
            if b % 4 == cb and not (corte and p >= 12):
                add(pista["sino"], sino(nota, BEAT), t0 + p * PASSO)
    if b % 8 == 0:  # pancada no começo de cada bloco de 8 compassos (inclusive no início do vídeo)
        add(pista["braam"], braam(), t0)
        add(pista["prato"], prato(), t0)
    if ultimo_do_bloco:
        add(pista["subida"], subida(BAR), t0)

eco = fftconvolve(rng.standard_normal(int(SR * 1.2)) * np.exp(-tt(1.2) / 0.35), np.ones(1), mode="full")
eco /= np.sqrt((eco ** 2).sum())


def sala(x, molhado):
    return x + molhado * fftconvolve(x, eco, mode="full")[:N]


GANHO = dict(bumbo=1.0, oito=0.62, caixa=0.55, chimbal=0.16, metal=0.30, sino=0.10, braam=0.65, prato=0.20, subida=0.16)
p = {k: v * GANHO[k] for k, v in pista.items()}
p["caixa"] = sala(p["caixa"], 0.25)
p["metal"] = sala(p["metal"], 0.3)
p["sino"] = sala(p["sino"], 0.5)
completa = sum(p.values())
# Sob a fala só o grave (a voz mora entre 300 e 4000 Hz): na 1ª versão os acordes e a caixa clara, mesmo 5–8 dB abaixo
# da voz, engoliam palavra baixa ("Verdade", "vai tal carne"). O peso da batida continua no bumbo e no 808.
voz = (filtro(p["bumbo"], "lowpass", 900, 2) + filtro(p["oito"], "lowpass", 320, 2) * 1.2
       + filtro(p["caixa"], "lowpass", 700, 2) * 0.8 + filtro(p["braam"], "lowpass", 300, 2))

os.makedirs("public/audio", exist_ok=True)
escala = None
for nome, mix in (("trilha-impacto", completa), ("trilha-impacto-voz", voz)):
    mix = np.tanh(mix * 1.1)
    mix *= np.minimum(1, (N - np.arange(N)) / (SR * 2.0)) * np.minimum(1, np.arange(N) / (SR * 0.01))
    escala = escala or 0.89 / np.abs(mix).max()  # mesma escala nas duas
    mix = mix * escala
    pcm = (np.clip(np.stack([mix, np.roll(mix, 29)], axis=1), -1, 1) * 32767).astype("<i2")
    with wave.open(f"public/audio/{nome}.wav", "wb") as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
    print(f"public/audio/{nome}.wav", DUR, "s", BPM, "BPM", "pico", round(float(np.abs(mix).max()), 2))
