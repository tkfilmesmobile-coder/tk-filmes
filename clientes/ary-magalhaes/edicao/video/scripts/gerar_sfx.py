"""Kit de efeitos sonoros da Ary (sintetizados aqui, sem direito de terceiros). Leves e macios: o vídeo não tem
trilha, então o efeito não pode ser estridente. Uso: python scripts/gerar_sfx.py → public/sfx/<nome>.wav (48 kHz).
"""
import os, wave
import numpy as np

SR = 48000
AQUI = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(AQUI, "..", "public", "sfx")
rng = np.random.default_rng(7)


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


def passa_banda(x, fc, q):
    """Biquad passa-banda com frequência central variável (fc: array por amostra)."""
    y = np.zeros_like(x); x1 = x2 = y1 = y2 = 0.0
    for i in range(len(x)):
        w = 2 * np.pi * fc[i] / SR; al = np.sin(w) / (2 * q); a0 = 1 + al
        yi = (al * x[i] - al * x2 + 2 * np.cos(w) * y1 - (1 - al) * y2) / a0
        x2, x1, y2, y1 = x1, x[i], y1, yi
        y[i] = yi
    return y


def passa_baixa(x, fc):
    a = np.exp(-2 * np.pi * fc / SR); y = np.zeros_like(x); v = 0.0
    for i in range(len(x)):
        v = (1 - a) * x[i] + a * v; y[i] = v
    return y


def whoosh(d=0.55, pico=0.6, de=300, topo=2400, fim=500, pan=True):
    n = int(d * SR); p = np.arange(n) / n
    fc = np.where(p < pico, de + (topo - de) * (p / pico) ** 1.5, topo + (fim - topo) * ((p - pico) / (1 - pico)))
    ar = passa_banda(rng.standard_normal(n), fc, 1.1)
    env = np.where(p < pico, (p / pico) ** 2, np.exp(-((p - pico) / (1 - pico)) * 5))
    grave = np.sin(2 * np.pi * np.cumsum(70 + 80 * np.minimum(1, p / pico)) / SR) * env * 0.35
    v = ar * env + grave
    if not pan:
        return v, v
    pp = -0.6 + 1.2 * p
    return v * (1 - pp), v * (1 + pp)


def pop(f0=520, d=0.16):
    x = t(d); fr = f0 * (1 + 1.2 * np.exp(-x / 0.012))
    v = np.sin(2 * np.pi * np.cumsum(fr) / SR) * np.exp(-x / 0.035)
    v += 0.25 * passa_baixa(rng.standard_normal(len(x)), 3000) * np.exp(-x / 0.006)
    return v


def sino(f, d, dec=0.35, harm=(1, 2.01, 3.02), pesos=(1, 0.35, 0.12)):
    x = t(d)
    return sum(w * np.sin(2 * np.pi * f * h * x) * np.exp(-x / (dec / h)) for h, w in zip(harm, pesos)) * (1 - np.exp(-x / 0.003))


def mistura(partes, d):
    out = np.zeros(int(d * SR))
    for em, v in partes:
        i = int(em * SR); k = min(len(v), len(out) - i)
        out[i:i + k] += v[:k]
    return out


os.makedirs(OUT, exist_ok=True)

# transições
grava("whoosh", *whoosh())
grava("whoosh-curto", *whoosh(0.32, 0.55, 400, 2000, 600))
grava("whoosh-grave", *whoosh(0.7, 0.62, 160, 1300, 300))
# B-roll entrando: varrida de ar curta e macia
grava("varrida", *whoosh(0.38, 0.35, 900, 3200, 1200))
# cartão com foto ao lado do rosto
grava("pop", pop())
grava("pop-agudo", pop(760, 0.14))
# texto aparecendo
x = t(0.05); grava("clique", np.sin(2 * np.pi * 1800 * x) * np.exp(-x / 0.006) + 0.4 * rng.standard_normal(len(x)) * np.exp(-x / 0.002), alvo=0.6)
# brilho (selagem fechando a cutícula): notas de vidro subindo
notas = [1318.5, 1568.0, 1975.5, 2637.0]
grava("brilho", mistura([(i * 0.07, sino(f, 1.2, 0.5) * (0.8 - i * 0.12)) for i, f in enumerate(notas)], 1.5), alvo=0.55)
# cutícula fechando: cascata de toquinhos descendo
grava("fecha", mistura([(i * 0.045, sino(900 - i * 55, 0.25, 0.05, (1, 2.4), (1, 0.2))) for i in range(9)], 0.7), alvo=0.6)
# cutícula abrindo: toquinhos subindo, mais espaçados
grava("abre", mistura([(i * 0.06, sino(450 + i * 70, 0.25, 0.05, (1, 2.4), (1, 0.2))) for i in range(8)], 0.8), alvo=0.6)
# pigmento entrando: sopro suave
grava("sopro", *whoosh(0.9, 0.45, 200, 900, 250, pan=False), alvo=0.5)
# certo e errado
grava("check", mistura([(0, sino(880, 0.8, 0.3)), (0.09, sino(1318.5, 1.0, 0.4))], 1.2), alvo=0.6)
grava("erro", mistura([(0, sino(196, 0.35, 0.08, (1, 2), (1, 0.3))), (0.13, sino(174.6, 0.45, 0.1, (1, 2), (1, 0.3)))], 0.7), alvo=0.6)
# celular vibrando (abertura com a Ary "no telefone")
x = t(0.62)
buzz = np.sign(np.sin(2 * np.pi * 180 * x)) * (0.6 + 0.4 * np.sin(2 * np.pi * 21 * x))
gate = ((x % 0.31) < 0.22).astype(float)
grava("vibra", passa_baixa(buzz * gate, 900), alvo=0.45)
# impacto suave pro título
x = t(0.6)
grava("impacto", np.sin(2 * np.pi * np.cumsum(55 + 90 * np.exp(-x / 0.04)) / SR) * np.exp(-x / 0.18)
      + 0.3 * passa_baixa(rng.standard_normal(len(x)), 1500) * np.exp(-x / 0.03), alvo=0.7)
