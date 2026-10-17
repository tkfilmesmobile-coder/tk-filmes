"""Trilha de ação sintetizada (nossa, sem licença de terceiros): eletrônica, 128 BPM, kick 4x4, baixo
serrilhado no contratempo, clap no 2 e 4, hi-hat em semicolcheia, acordes em stab (Am F C G) e riser no fim.
Uso: python scripts/trilha-acao.py <duração_s> <saida.wav>
"""
import sys, wave
import numpy as np
SR = 48000
dur = float(sys.argv[1]); SAIDA = sys.argv[2]
n = int(SR * dur); t = np.arange(n) / SR
rng = np.random.default_rng(7)
bpm = 128; beat = 60 / bpm; B = int(beat * SR)
mus = np.zeros(n)
def env(m, a, d):
    x = np.arange(m) / SR
    return np.minimum(1, x / a) * np.exp(-x / d)
def saw(f, x): return 2 * ((f * x) % 1) - 1
def lowpass(sig, fc):
    X = np.fft.rfft(sig); fr = np.fft.rfftfreq(len(sig), 1 / SR)
    X *= 1 / (1 + (fr / fc) ** 4); return np.fft.irfft(X, len(sig))
# kick 4x4 (pitch drop 150→50 Hz)
ek = env(int(0.3 * SR), 0.002, 0.11); xk = np.arange(len(ek)) / SR
kick = np.sin(2 * np.pi * (50 * xk + 100 * 0.02 * (1 - np.exp(-xk / 0.02)))) * ek
# clap no 2 e 4
ec = env(int(0.18 * SR), 0.001, 0.05); clap = lowpass(rng.normal(size=len(ec)), 4000) * ec; clap /= np.abs(clap).max()
# hat em semicolcheia
eh = env(int(0.05 * SR), 0.0005, 0.012); Xh = np.fft.rfft(rng.normal(size=len(eh))); fh = np.fft.rfftfreq(len(eh), 1 / SR); Xh[fh < 8000] = 0
hat = np.fft.irfft(Xh, len(eh)) * eh; hat /= np.abs(hat).max()
# acordes (4 tempos cada) e baixo
acordes = [[220, 261.6, 329.6], [174.6, 220, 261.6], [130.8 * 2, 164.8 * 2, 196 * 2], [196, 246.9, 293.7]]
baixos = [55, 43.65, 65.4, 49]
intro = 4 * B  # 1 compasso só com hat e pad, aí entra tudo
for i in range(0, n, B):
    k = i // B; compasso = (k // 4) % 4; cheio = i >= intro
    if cheio: mus[i:i + len(ek)] += 0.9 * kick[:max(0, min(len(ek), n - i))]
    if cheio and k % 2 == 1: mus[i:i + len(ec)] += 0.35 * clap[:max(0, min(len(ec), n - i))]
    for s in range(4):
        j = i + s * B // 4
        if j + len(eh) < n: mus[j:j + len(eh)] += (0.16 if s % 2 else 0.09) * hat
    # baixo no contratempo (colcheias 2 e 4 do tempo), serrilha filtrada
    if cheio:
        for s in (1, 3):
            j = i + s * B // 4; m = B // 4
            if j + m < n:
                x = np.arange(m) / SR; eb = env(m, 0.003, 0.08)
                mus[j:j + m] += 0.35 * lowpass(saw(baixos[compasso], x), 400) * eb
    # stab de acorde no tempo 1 e no "e" do 2
    if k % 4 == 0 or (k % 4 == 1 and cheio):
        m = int(0.5 * SR)
        if i + m < n:
            x = np.arange(m) / SR; es = env(m, 0.004, 0.14)
            st = sum(saw(f, x) + 0.6 * saw(f * 1.005, x) for f in acordes[compasso])
            mus[i:i + m] += 0.09 * lowpass(st, 2500) * es
# pad contínuo baixo por trás (acorde do compasso), pra encher
for i in range(0, n, 4 * B):
    m = min(4 * B, n - i); x = np.arange(m) / SR; compasso = (i // (4 * B)) % 4
    mus[i:i + m] += 0.05 * sum(np.sin(2 * np.pi * f * x) for f in acordes[compasso]) * np.minimum(1, x / 0.05)
# riser: ruído filtrado subindo nos últimos 2 s, corta seco no fim
r = int(2 * SR); xr = np.linspace(0, 1, r); ruido = rng.normal(size=r)
Xr = np.fft.rfft(ruido); fr = np.fft.rfftfreq(r, 1 / SR); Xr[fr < 1500] = 0
mus[n - r:] += 0.12 * np.fft.irfft(Xr, r) * xr ** 2
# master: saturação leve e nível
mus = np.tanh(mus * 1.6) / 1.6
mus *= 10 ** (-16 / 20) / (np.sqrt(np.mean(mus ** 2)) + 1e-9)  # RMS -16 dBFS
mus = np.clip(mus, -0.98, 0.98)
with wave.open(SAIDA, "wb") as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((mus * 32767).astype(np.int16).tobytes())
print("ok", SAIDA)
