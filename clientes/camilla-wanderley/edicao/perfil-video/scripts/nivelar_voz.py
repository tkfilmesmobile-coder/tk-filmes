"""Nivela a voz original (sem trocar timbre): ganho suave por trecho pra fala ficar no mesmo nível em todo
o vídeo (a doutora fala mais baixo quando se vira), com limitador de pico. Pausas não sobem (não puxa ruído).
Uso: python scripts/nivelar_voz.py <entrada.wav 48k> <saida.wav> [alvo_dB=-21]"""
import sys, wave
import numpy as np
ent, sai = sys.argv[1], sys.argv[2]
alvo = float(sys.argv[3]) if len(sys.argv) > 3 else -21.0
with wave.open(ent) as w:
    sr, ch = w.getframerate(), w.getnchannels()
    x = np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(np.float32).reshape(-1, ch) / 32768
mono = x.mean(axis=1)
H = sr // 20  # 50 ms
m = len(mono) // H
e = 20 * np.log10(np.sqrt(np.mean(mono[: m * H].reshape(m, H) ** 2, axis=1)) + 1e-9)
fala = e > -40
# nível da fala numa janela longa (2 s), só nos blocos com fala
nivel = np.full(m, np.nan)
J = 20
for i in range(m):
    a, b = max(0, i - J), min(m, i + J)
    v = e[a:b][fala[a:b]]
    if len(v) > 3:
        nivel[i] = np.percentile(v, 70)
idx = np.arange(m)
ok = ~np.isnan(nivel)
nivel = np.interp(idx, idx[ok], nivel[ok])
ganho_db = np.clip(alvo - nivel, -3, 7)
# suavização lenta (1 s) pra não "bombear"
k = np.exp(-0.5 * (np.arange(-30, 31) / 10) ** 2); k /= k.sum()
ganho_db = np.convolve(np.pad(ganho_db, 30, mode="edge"), k, mode="valid")
g = np.interp(np.arange(len(mono)), idx * H + H / 2, 10 ** (ganho_db / 20))
y = x * g[:, None]
# limitador suave em -1 dBFS
teto = 10 ** (-1 / 20)
y = np.where(np.abs(y) > teto * 0.8, np.sign(y) * (teto * 0.8 + (teto * 0.2) * np.tanh((np.abs(y) - teto * 0.8) / (teto * 0.2))), y)
with wave.open(sai, "w") as w:
    w.setnchannels(ch); w.setsampwidth(2); w.setframerate(sr)
    w.writeframes((np.clip(y, -1, 1) * 32767).astype(np.int16).tobytes())
for a, b in [(0, 11.5), (11.5, 27), (27, 50.3)]:
    s = y[int(a * sr): int(b * sr)].mean(axis=1)
    ee = np.array([20 * np.log10(np.sqrt(np.mean(s[i:i + sr // 10] ** 2)) + 1e-9) for i in range(0, len(s) - sr // 10, sr // 10)])
    print(f"{a}-{b} s: fala mediana {np.median(ee[ee > -40]):.1f} dB, pico {20 * np.log10(np.abs(s).max()):.1f} dB")
