"""Efeitos sonoros da Start Fitness (sintetizados aqui, sem direito de terceiros). Base: o kit da Ary, com
mais pegada (vídeo de esporte, com trilha por baixo). Uso: python scripts/gerar_sfx.py → public/sfx/<nome>.wav
"""
import os
import wave

import numpy as np
from scipy.signal import butter, sosfilt

SR = 48000
AQUI = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(AQUI, "..", "public", "sfx")
rng = np.random.default_rng(11)


def grava(nome, L, R=None, alvo=0.85):
    R = L if R is None else R
    s = np.stack([L, R], 1)
    s = s / (np.abs(s).max() + 1e-9) * alvo
    fade = int(0.004 * SR)
    s[-fade:] *= np.linspace(1, 0, fade)[:, None]
    with wave.open(os.path.join(OUT, nome + ".wav"), "w") as f:
        f.setnchannels(2); f.setsampwidth(2); f.setframerate(SR)
        f.writeframes((s * 32767).astype(np.int16).tobytes())
    print(nome, f"{len(L) / SR:.2f}s")


def t(d):
    return np.arange(int(d * SR)) / SR


def banda(x, lo, hi, ordem=2):
    return sosfilt(butter(ordem, [lo, hi], btype="band", fs=SR, output="sos"), x)


def baixa(x, fc, ordem=2):
    return sosfilt(butter(ordem, fc, btype="low", fs=SR, output="sos"), x)


def alta(x, fc, ordem=2):
    return sosfilt(butter(ordem, fc, btype="high", fs=SR, output="sos"), x)


def mistura(partes, d):
    out = np.zeros(int(d * SR))
    for em, v in partes:
        i = int(em * SR); k = min(len(v), len(out) - i)
        out[i:i + k] += v[:k]
    return out


def whoosh(d=0.5, pico=0.6, lo=250, hi=3500, pan=True):
    """Ar passando: ruído em faixas que sobem até o pico e descem, com um grave por baixo."""
    n = int(d * SR); p = np.arange(n) / n
    env = np.where(p < pico, (p / pico) ** 2, np.exp(-((p - pico) / (1 - pico)) * 5))
    ruido = rng.standard_normal(n)
    faixas = np.geomspace(lo, hi, 7)
    v = np.zeros(n)
    for k in range(len(faixas) - 1):
        c = k / (len(faixas) - 2)  # cada faixa acende num momento: dá a sensação de varrida
        peso = np.exp(-((p - c * pico) ** 2) / 0.04) + 0.25
        v += banda(ruido, faixas[k], faixas[k + 1]) * peso
    v *= env
    v += np.sin(2 * np.pi * np.cumsum(60 + 70 * np.minimum(1, p / pico)) / SR) * env * 0.4
    if not pan:
        return v, v
    pp = -0.6 + 1.2 * p
    return v * (1 - pp), v * (1 + pp)


def sino(f, d, dec, parciais=(1, 2.76, 5.40, 8.93), pesos=(1, 0.55, 0.3, 0.12)):
    """Sino pequeno (parciais inarmônicos, como sino de caixa registradora)."""
    x = t(d)
    return sum(w * np.sin(2 * np.pi * f * h * x) * np.exp(-x / (dec / (1 + 0.6 * i)))
               for i, (h, w) in enumerate(zip(parciais, pesos))) * (1 - np.exp(-x / 0.0015))


def moeda(f):
    """Tilintar de moeda: 3 parciais agudos, curtinho."""
    x = t(0.12)
    return sum(w * np.sin(2 * np.pi * f * h * x + rng.uniform(0, 6)) for h, w in ((1, 1), (1.47, 0.6), (2.09, 0.35))) \
        * np.exp(-x / rng.uniform(0.025, 0.06))


os.makedirs(OUT, exist_ok=True)

# headline entrando
grava("whoosh", *whoosh())
grava("whoosh-curto", *whoosh(0.3, 0.55, 400, 4000))
grava("whoosh-grave", *whoosh(0.8, 0.65, 120, 1800))

# impacto de headline forte: soco grave + estalo
x = t(0.9)
soco = np.sin(2 * np.pi * np.cumsum(45 + 110 * np.exp(-x / 0.035)) / SR) * np.exp(-x / 0.22)
estalo = alta(rng.standard_normal(len(x)), 1500) * np.exp(-x / 0.012) * 0.6
cauda = baixa(rng.standard_normal(len(x)), 900) * np.exp(-x / 0.25) * 0.15
grava("impacto", soco + estalo + cauda, alvo=0.9)

# pancada curta (números 1, 2, 3)
x = t(0.35)
grava("pancada", np.sin(2 * np.pi * np.cumsum(70 + 160 * np.exp(-x / 0.02)) / SR) * np.exp(-x / 0.08)
      + alta(rng.standard_normal(len(x)), 2500) * np.exp(-x / 0.006) * 0.5, alvo=0.8)

# pop (selo, data)
x = t(0.16); fr = 600 * (1 + 1.2 * np.exp(-x / 0.012))
grava("pop", np.sin(2 * np.pi * np.cumsum(fr) / SR) * np.exp(-x / 0.035)
      + 0.25 * baixa(rng.standard_normal(len(x)), 3000) * np.exp(-x / 0.006))

# carimbo (INSCRIÇÕES ABERTAS): batida seca de madeira + papel
x = t(0.4)
grava("carimbo", np.sin(2 * np.pi * np.cumsum(120 + 200 * np.exp(-x / 0.01)) / SR) * np.exp(-x / 0.05)
      + banda(rng.standard_normal(len(x)), 300, 2500) * np.exp(-x / 0.03) * 0.9, alvo=0.8)

# tique-taque do relógio ("o tempo está correndo")
tique = lambda f: alta(rng.standard_normal(int(0.03 * SR)), f) * np.exp(-t(0.03) / 0.004)
grava("relogio", mistura([(i * 0.25, tique(3500 if i % 2 == 0 else 2600) * (0.9 if i % 2 == 0 else 0.7)) for i in range(6)], 1.6), alvo=0.6)

# DINHEIRO: caixa registradora "tchá-tching" + chuva de moedas
x = t(0.12)
gaveta = banda(rng.standard_normal(len(x)), 800, 6000) * np.exp(-x / 0.025) \
    + np.sin(2 * np.pi * 95 * x) * np.exp(-x / 0.03) * 0.8  # "tchá": mecanismo + gaveta batendo
tching = sino(2093, 1.6, 0.55) + 0.7 * sino(2637, 1.6, 0.45)  # "tching": dois sininhos (dó e mi agudos)
moedas = [(0.14 + rng.uniform(0, 0.75) ** 1.4, moeda(rng.uniform(3800, 7200)) * rng.uniform(0.25, 0.6)) for _ in range(28)]
dinheiro = mistura([(0, gaveta), (0.07, tching)] + moedas, 1.8)
L = dinheiro + mistura([(0.0, gaveta)] + [(a + 0.004, m * 0.8) for a, m in moedas], 1.8) * 0.15
grava("dinheiro", dinheiro, L, alvo=0.9)

# brilho curto (final)
grava("brilho", mistura([(i * 0.06, sino(f, 1.0, 0.4, (1, 2.01), (1, 0.3)) * (0.8 - i * 0.1)) for i, f in
                         enumerate([1318.5, 1568.0, 1975.5, 2637.0])], 1.3), alvo=0.5)
