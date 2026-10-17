# Trilha sofisticada original, sintetizada aqui (sem download, sem direito autoral).
# Uso: python scripts/gerar-musica.py  ->  public/audio/musica.wav (48 kHz, estéreo, 16 bits)
# Lounge de ~92 BPM em Dó maior (Cmaj9 - Am9 - Dm9 - G13): piano elétrico (FM), pad quente, baixo suave,
# bumbo discreto, aro nas batidas 2 e 4, chimbal com swing e vibrafone esparso com eco e reverb.
# O compasso dura 2,6 s, igual à abertura do vídeo: a bateria entra junto com o primeiro par antes/depois.
import wave
import numpy as np

SR = 48000
BEAT = 0.65            # 92,3 BPM
BAR = 4 * BEAT         # 2,6 s
DUR = 21.8
N = int(SR * DUR)
rng = np.random.default_rng(11)

def pos(t): return int(round(t * SR))

def add(dest, sig, t, g=1.0):
    i = pos(t)
    if i >= N or i < 0: return
    j = min(N, i + len(sig))
    dest[i:j] += sig[: j - i] * g

def env(n, ataque, queda, solta=0.06, dur=None):
    t = np.arange(n) / SR
    e = np.minimum(1, t / max(ataque, 1e-4)) * np.exp(-t / queda)
    if dur is not None:
        e *= np.clip((dur - t) / solta, 0, 1)
    return e

def lp(x, k): return np.convolve(x, np.ones(k) / k, mode="same")

# --- vozes ---------------------------------------------------------------
def piano_eletrico(f, dur):
    n = int(SR * (dur + 0.1)); t = np.arange(n) / SR
    indice = 1.7 * np.exp(-t / 0.22) + 0.25
    corpo = np.sin(2 * np.pi * f * t + indice * np.sin(2 * np.pi * f * t))
    tine = 0.16 * np.sin(2 * np.pi * f * 4 * t) * np.exp(-t / 0.045)
    trem = 1 + 0.06 * np.sin(2 * np.pi * 4.6 * t)
    return (corpo + tine) * trem * env(n, 0.004, 0.85, 0.09, dur)

def pad(f, dur):
    n = int(SR * (dur + 0.8)); t = np.arange(n) / SR
    s = sum(np.sin(2 * np.pi * f * d * t + k) for k, d in enumerate((0.997, 1.0, 1.003)))
    s += 0.4 * np.sin(2 * np.pi * f * 2 * t)
    a = np.minimum(1, t / 0.7) * np.clip((dur + 0.7 - t) / 0.7, 0, 1)
    return s / 3.4 * a

def baixo(f, dur):
    n = int(SR * (dur + 0.05)); t = np.arange(n) / SR
    s = np.sin(2 * np.pi * f * t) + 0.28 * np.sin(4 * np.pi * f * t)
    return s * env(n, 0.012, 0.6, 0.05, dur)

def vibrafone(f):
    n = int(SR * 2.2); t = np.arange(n) / SR
    s = np.sin(2 * np.pi * f * t) + 0.18 * np.sin(2 * np.pi * f * 3.97 * t) * np.exp(-t / 0.2)
    s *= 1 + 0.18 * np.sin(2 * np.pi * 5.0 * t)
    return s * env(n, 0.003, 0.7)

def bumbo():
    n = int(SR * 0.4); t = np.arange(n) / SR
    f = 46 + 70 * np.exp(-t / 0.04)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.14)

def aro():
    n = int(SR * 0.16); t = np.arange(n) / SR
    r = np.diff(rng.standard_normal(n), prepend=0)
    return (0.55 * r * np.exp(-t / 0.035) + 0.8 * np.sin(2 * np.pi * 185 * t) * np.exp(-t / 0.05))

def chimbal(forte):
    n = int(SR * 0.06)
    r = np.diff(np.diff(rng.standard_normal(n), prepend=0), prepend=0)
    return r * env(n, 0.001, 0.014) * (0.5 if forte else 0.3)

# --- reverb (Schroeder, em blocos) --------------------------------------
def comb(x, d, g):
    y = x.copy()
    for k in range(d, len(x), d):
        y[k:k + d] += g * y[k - d:k - d + len(y[k:k + d])]
    return y

def allpass(x, d, g):
    y = np.zeros_like(x)
    for k in range(0, len(x), d):
        b = x[k:k + d]
        ant = x[k - d:k - d + len(b)] if k >= d else np.zeros(len(b))
        yant = y[k - d:k - d + len(b)] if k >= d else np.zeros(len(b))
        y[k:k + len(b)] = -g * b + ant + g * yant
    return y

def reverb(x, mistura=0.28):
    atrasos = [1627, 1699, 1559, 1493]
    s = sum(comb(x, d, 0.80) for d in atrasos) / len(atrasos)
    s = allpass(allpass(s, 556, 0.5), 441, 0.5)
    return x * (1 - mistura * 0.5) + s * mistura * 1.6

# --- arranjo --------------------------------------------------------------
E3, G3, B3, D4 = 164.81, 196.00, 246.94, 293.66
PROG = [  # raiz do baixo, acorde do piano
    (65.41, [E3, G3, B3, D4]),                       # Cmaj9
    (55.00, [E3, G3, B3, 261.63]),                   # Am9
    (73.42, [174.61, 220.00, 261.63, 329.63]),       # Dm9
    (98.00 / 1, [174.61, 246.94, 329.63, 220.00]),   # G13
]
MELODIA = [  # (compasso do ciclo, tempo, nota Hz, ) ; ciclo de 4 compassos
    (0, 1.5, 783.99), (0, 2.5, 659.25),
    (1, 0.5, 1046.50), (1, 2.0, 880.00), (1, 3.0, 783.99),
    (2, 1.0, 698.46), (2, 2.5, 880.00),
    (3, 0.5, 987.77), (3, 2.0, 783.99), (3, 3.5, 587.33),
]

bus_harm = np.zeros(N)   # piano, pad, vibrafone (vão pra reverb)
bus_vib = np.zeros(N)
bus_seco = np.zeros(N)   # baixo, bateria
swing = 0.58

barras = int(DUR / BAR) + 1
for b in range(barras):
    raiz, ac = PROG[b % 4]
    t0 = b * BAR
    # pad sustentado o compasso todo
    for f in ac:
        add(bus_harm, pad(f / 2 if f > 250 else f, BAR - 0.1), t0, 0.07)
    # piano: batida 1 longa, e dois toques sincopados
    for tempo, dur, vol in ((0.0, 1.8, 1.0), (1.5, 0.8, 0.6), (2.5, 1.0, 0.75)):
        for k, f in enumerate(ac):
            add(bus_harm, piano_eletrico(f, dur * BEAT), t0 + tempo * BEAT + k * 0.013, 0.13 * vol)
    # baixo
    add(bus_seco, baixo(raiz, 1.4 * BEAT), t0, 0.62)
    add(bus_seco, baixo(raiz, 0.7 * BEAT), t0 + 2.5 * BEAT, 0.5)
    # bateria entra no 2º compasso, junto com o 1º par antes/depois
    if b >= 1:
        add(bus_seco, bumbo(), t0, 0.55)
        add(bus_seco, bumbo(), t0 + 2 * BEAT, 0.42)
        if b % 2 == 1: add(bus_seco, bumbo(), t0 + 3.5 * BEAT, 0.3)
        for q in (1, 3):
            add(bus_seco, aro(), t0 + q * BEAT, 0.24)
        for q in range(4):
            add(bus_seco, chimbal(False), t0 + q * BEAT, 0.5)
            add(bus_seco, chimbal(True), t0 + (q + swing) * BEAT, 0.7)
    # vibrafone a partir do 3º compasso
    if b >= 2:
        for cb, tempo, nota in MELODIA:
            if (b - 2) % 4 == cb:
                add(bus_vib, vibrafone(nota), t0 + tempo * BEAT, 0.07)

# eco do vibrafone: 3/4 de tempo, duas repetições
eco = bus_vib.copy()
for k, g in enumerate((0.42, 0.18), start=1):
    d = pos(0.75 * BEAT * k)
    eco[d:] += bus_vib[: N - d] * g
bus_harm += eco

harm = reverb(bus_harm)
mix = harm + bus_seco
mix = lp(mix, 3)                    # tira o brilho áspero
mix = np.tanh(mix * 1.15)
mix *= np.minimum(1, (N - np.arange(N)) / (SR * 1.6))   # fade final
mix *= np.minimum(1, np.arange(N) / (SR * 0.04))
mix = mix / np.abs(mix).max() * 0.85
esq = mix
dir_ = np.roll(mix, 31)             # abertura estéreo leve
pcm = (np.stack([esq, dir_], axis=1) * 32767).astype("<i2")
with wave.open("public/audio/musica.wav", "wb") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
print("public/audio/musica.wav", DUR, "s", round(60 / BEAT, 1), "BPM")
