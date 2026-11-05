"""Efeitos delicados pro vídeo oficial do Natal (sintetizados, sem direitos): brilho (sininho) e sopro (ar).
uso: python scripts/sfx.py public/sfx"""
import sys, wave, pathlib
import numpy as np

SR = 48000
out = pathlib.Path(sys.argv[1]); out.mkdir(parents=True, exist_ok=True)


def salvar(nome, x):
    x = x / (np.abs(x).max() + 1e-9) * 0.8
    st = np.stack([x, x], axis=1)
    with wave.open(str(out / nome), "wb") as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((st * 32767).astype(np.int16).tobytes())


# brilho: 5 notas de sino subindo (pentatônica aguda), cada uma com parciais inarmônicos e cauda longa
dur = 2.6
t = np.arange(int(SR * dur)) / SR
x = np.zeros_like(t)
for k, f0 in enumerate([1568, 1760, 2093, 2349, 2637]):
    t0 = k * 0.07
    tt = np.clip(t - t0, 0, None)
    env = (t >= t0) * np.exp(-tt * 3.2)
    for mult, amp in [(1, 1), (2.76, 0.35), (5.4, 0.15)]:
        x += amp * env * np.sin(2 * np.pi * f0 * mult * tt) / (k + 2)
x *= np.minimum(1, t / 0.004)
salvar("brilho.wav", x)

# sopro: ruído filtrado que cresce e some (ar passando), 0,9 s
dur = 0.9
n = int(SR * dur)
ruido = np.random.default_rng(7).standard_normal(n)
espec = np.fft.rfft(ruido)
freq = np.fft.rfftfreq(n, 1 / SR)
espec *= np.exp(-((freq - 2200) / 1800) ** 2)  # banda de ar, sem grave
s = np.fft.irfft(espec, n)
tt = np.arange(n) / n
env = np.sin(np.pi * tt) ** 2 * (0.4 + 0.6 * tt)
salvar("sopro.wav", s * env)
print("ok brilho.wav sopro.wav")
