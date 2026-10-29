"""Trilha PROVISÓRIA animada pro vlog (pedido da Talyta em 2026-10-23: "música mais animada").
Pop leve, 118 BPM, sol maior (G · D · Em · C): batida macia nos quatro tempos, palma no 2 e 4, chimbal no
contratempo, baixo em colcheia, arpejo dedilhado em semicolcheia e pad claro. O primeiro compasso entra sem
bateria. Ducking pela voz (-8 dB). Gerada aqui, sem direito de terceiros; trocar por licenciada na entrega final.

Uso: python scripts/trilha_animada.py <duração_s> <voz16.wav> <saida.wav>
"""
import sys, wave
import numpy as np

SR = 48000
dur = float(sys.argv[1]); VOZ = sys.argv[2]; SAIDA = sys.argv[3]
n = int(SR * dur); t = np.arange(n) / SR
rng = np.random.default_rng(11)
BPM = 118; b = 60 / BPM; compasso = 4 * b

ACORDES = [  # (baixo, tríade do arpejo)
    (98.0, [392.0, 493.9, 587.3]),      # G
    (73.4, [293.7, 370.0, 440.0]),      # D
    (82.4, [329.6, 392.0, 493.9]),      # Em
    (65.4, [261.6, 329.6, 392.0]),      # C
]


def env(m, a, d):
    x = np.arange(m) / SR
    return np.minimum(1, x / a) * np.exp(-x / d)


def coloca(dst, i, s, g=1.0):
    if i >= n:
        return
    j = min(n, i + len(s)); dst[i:j] += g * s[: j - i]


def ruido_agudo(m, corte):
    X = np.fft.rfft(rng.normal(size=m)); fr = np.fft.rfftfreq(m, 1 / SR); X[fr < corte] = 0
    s = np.fft.irfft(X, m); return s / (np.abs(s).max() + 1e-9)


mus = np.zeros(n)
# pad claro
for c in range(int(dur / compasso) + 2):
    baixo, tri = ACORDES[c % 4]
    i = int(c * compasso * SR); m = int(compasso * SR * 1.05)
    x = np.arange(m) / SR; e = np.minimum(1, x / 0.25) * np.minimum(1, (m / SR - x) / 0.2)
    s = sum(np.sin(2 * np.pi * f / 2 * x) + 0.3 * np.sin(2 * np.pi * f * x) for f in tri) * e
    coloca(mus, i, s, 0.035)

kick_e = env(int(0.3 * SR), 0.002, 0.09); xk = np.arange(len(kick_e)) / SR
kick = np.sin(2 * np.pi * np.cumsum(50 + 90 * np.exp(-xk * 35)) / SR) * kick_e
clap = ruido_agudo(int(0.18 * SR), 900) * env(int(0.18 * SR), 0.001, 0.045)
hat = ruido_agudo(int(0.05 * SR), 7000) * env(int(0.05 * SR), 0.0005, 0.012)

passo = b / 4  # semicolcheia
ARP = [0, 1, 2, 1, 0, 2, 1, 2]
for k in range(int(dur / passo) + 1):
    i = int(k * passo * SR); tempo = k // 4; c = int(k * passo // compasso)
    baixo, tri = ACORDES[c % 4]
    bateria = c >= 1
    if k % 4 == 0 and bateria:
        coloca(mus, i, kick, 0.55)
        if tempo % 2 == 1:
            coloca(mus, i, clap, 0.18)
    if k % 4 == 2 and bateria:
        coloca(mus, i, hat, 0.10)
    if k % 2 == 0:  # baixo em colcheia, com acento no tempo
        m = int(0.22 * SR); x = np.arange(m) / SR
        s = (np.sin(2 * np.pi * baixo * x) + 0.35 * np.sin(4 * np.pi * baixo * x) + 0.12 * np.sin(6 * np.pi * baixo * x)) * env(m, 0.004, 0.11)
        coloca(mus, i, s, 0.20 if k % 4 == 0 else 0.13)
    # arpejo dedilhado
    f = tri[ARP[k % 8]] * (2 if (k // 8) % 2 else 1)
    m = int(0.2 * SR); x = np.arange(m) / SR
    s = (np.sin(2 * np.pi * f * x) + 0.4 * np.sin(4 * np.pi * f * x) + 0.15 * np.sin(6 * np.pi * f * x)) * env(m, 0.002, 0.07)
    coloca(mus, i, s, 0.045 if k % 2 else 0.06)

# ducking pela voz
with wave.open(VOZ) as w:
    v = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32) / 32768
vs = np.interp(t, np.arange(len(v)) / 16000, np.abs(v))
H = SR // 100; m = n // H
ev = 20 * np.log10(np.sqrt(np.mean(vs[: m * H].reshape(m, H) ** 2, axis=1)) + 1e-6)
fala = (ev > -40).astype(float)
g = np.zeros(m); at, rl = 1 - np.exp(-1 / 12), 1 - np.exp(-1 / 35)
for i in range(1, m):
    c = at if fala[i] > g[i - 1] else rl
    g[i] = g[i - 1] + c * (fala[i] - g[i - 1])
ganho = np.repeat(10 ** ((-8 * g) / 20), H)
mus = mus[: m * H] * ganho
mus = mus / (np.sqrt(np.mean(mus ** 2)) + 1e-9) * 10 ** (-30 / 20)
with wave.open(SAIDA, "w") as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((np.clip(mus, -1, 1) * 32767).astype(np.int16).tobytes())
print("animada", f"{len(mus) / SR:.1f} s")
