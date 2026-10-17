"""Trilha PROVISÓRIA (substituir por trilha licenciada): minimal electronic / editorial tech, 100 BPM, sem vocal.
Pad suave + pulso grave macio + hi-hat discreto + pluck esparso. Ducking constante sob a voz do corte
(envelope da fala, ataque 120 ms, soltura 350 ms). Sai já mixada no nível certo pra entrar com volume 1.
Uso: python scripts/trilha_provisoria.py <duração_s> [voz.wav] [saida.wav]
"""
import sys, wave
import numpy as np
SR = 48000
dur = float(sys.argv[1]) if len(sys.argv) > 1 else 45.0
VOZ = sys.argv[2] if len(sys.argv) > 2 else "scripts/cache/sensibilidade-x-canal.wav"
SAIDA = sys.argv[3] if len(sys.argv) > 3 else "public/trilha/provisoria.wav"
n = int(SR * dur); t = np.arange(n) / SR
rng = np.random.default_rng(11)
bpm = 100; beat = 60 / bpm
mus = np.zeros(n)

def env(m, a, d):
    x = np.arange(m) / SR
    return np.minimum(1, x / a) * np.exp(-x / d)

# pad: Am9 aberto, senoides com leve detune e movimento lento de brilho
for f, a in [(110, .5), (164.8, .35), (196, .3), (246.9, .25), (261.6, .18), (329.6, .12)]:
    mus += a * (np.sin(2 * np.pi * f * t) + np.sin(2 * np.pi * f * 1.003 * t + 1)) * 0.5 * (0.75 + 0.25 * np.sin(2 * np.pi * t / 8))
mus *= 0.18 * np.minimum(1, t / 0.4)
# pulso grave nos tempos 1 e 3 + "pumping" leve no pad
kick = np.zeros(n); k = int(2 * beat * SR); e = env(int(0.35 * SR), 0.004, 0.09)
kick_t = np.sin(2 * np.pi * (55 * np.arange(len(e)) / SR)) * e
for i in range(0, n - len(e), k):
    kick[i:i + len(e)] += kick_t
pump = np.ones(n)
for i in range(0, n, k):
    m = min(n - i, int(0.25 * SR)); pump[i:i + m] = 0.65 + 0.35 * np.linspace(0, 1, m)
mus = mus * pump + 0.55 * kick
# hi-hat discreto nos contratempos
hh = np.zeros(n); eh = env(int(0.04 * SR), 0.0005, 0.008)
X = np.fft.rfft(rng.normal(size=len(eh))); f_ = np.fft.rfftfreq(len(eh), 1 / SR); X[f_ < 7000] = 0
hat = np.fft.irfft(X, len(eh)) * eh
for i in range(int(beat / 2 * SR), n - len(eh), int(beat * SR)):
    hh[i:i + len(eh)] += hat
mus += 0.12 * hh / (np.abs(hat).max() + 1e-9)
# pluck esparso (A5, E5, G5, C6) a cada 2 tempos, muito baixo
notas = [880, 659.3, 784, 1046.5]; ep = env(int(0.6 * SR), 0.002, 0.18)
for j, i in enumerate(range(int(beat * SR), n - len(ep), int(2 * beat * SR))):
    f = notas[j % 4]; x = np.arange(len(ep)) / SR
    mus[i:i + len(ep)] += 0.07 * (np.sin(2 * np.pi * f * x) + 0.3 * np.sin(4 * np.pi * f * x)) * ep

# ducking pela voz do corte
with wave.open(VOZ) as w:
    v = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32) / 32768
vs = np.interp(np.arange(n) / SR, np.arange(len(v)) / 16000, np.abs(v))
H = SR // 100; m = n // H
ev = 20 * np.log10(np.sqrt(np.mean(vs[:m * H].reshape(m, H) ** 2, axis=1)) + 1e-6)
fala = (ev > -40).astype(float)
g = np.zeros(m); at, rl = 1 - np.exp(-1 / 12), 1 - np.exp(-1 / 35)
for i in range(m):
    c = at if fala[i] > g[i - 1 if i else 0] else rl
    g[i] = (g[i - 1] if i else 0) + c * (fala[i] - (g[i - 1] if i else 0))
ganho = 10 ** ((-7 * g) / 20)  # -7 dB sob a voz
mus = mus[:m * H] * np.repeat(ganho, H)
alvo = 10 ** (-33 / 20)  # RMS da trilha ~ -33 dBFS (voz ~ -20)
mus = mus / (np.sqrt(np.mean(mus ** 2)) + 1e-9) * alvo
fade = int(0.8 * SR); mus[-fade:] *= np.linspace(1, 0.6, fade)
with wave.open(SAIDA, "w") as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((np.clip(mus, -1, 1) * 32767).astype(np.int16).tobytes())
print(f"trilha provisória {len(mus) / SR:.1f} s, RMS -33 dBFS, ducking -7 dB sob a voz")
