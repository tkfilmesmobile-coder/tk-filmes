"""Efeitos sonoros da Start Fitness, v2 "adrenalina" (2026-10-28): tudo sintetizado aqui, sem direito de terceiros.
Cada som em camadas: sub grave + ataque (transiente) + corpo + saturação + cauda de reverb, normalizado alto.
Uso: python scripts/gerar_sfx.py → public/sfx/<nome>.wav (48 kHz, estéreo)
"""
import os
import wave

import numpy as np
from scipy.signal import butter, fftconvolve, sosfilt

SR = 48000
AQUI = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(AQUI, "..", "public", "sfx")
rng = np.random.default_rng(23)


# ---------- utilitários ----------
def t(d):
    return np.arange(int(d * SR)) / SR


def filtro(x, tipo, fc, ordem=2):
    return sosfilt(butter(ordem, fc, btype=tipo, fs=SR, output="sos"), x)


def ruido(d):
    return rng.standard_normal(int(d * SR))


def satura(x, drive=2.0):
    return np.tanh(x * drive) / np.tanh(drive)


def varre(x, f0, f1, q_oit=0.6, passos=24):
    """Ruído passando por um filtro de banda que anda de f0 até f1 (sweep)."""
    n = len(x); out = np.zeros(n); bloco = n // passos
    for k in range(passos):
        fc = f0 * (f1 / f0) ** (k / (passos - 1))
        lo, hi = fc / 2 ** (q_oit / 2), min(fc * 2 ** (q_oit / 2), SR / 2 - 100)
        seg = filtro(x, "band", [lo, hi])
        janela = np.zeros(n)
        a, b = max(0, (k - 1) * bloco), min(n, (k + 2) * bloco)
        janela[a:b] = np.hanning(b - a)
        out += seg * janela
    return out


def junta(*xs):
    """Soma camadas de tamanhos diferentes (todas começam no zero)."""
    n = max(len(x) for x in xs)
    return sum(np.pad(x, (0, n - len(x))) for x in xs)


def mistura(partes, d):
    out = np.zeros(int(d * SR))
    for em, v in partes:
        i = int(em * SR); k = min(len(v), len(out) - i)
        out[i:i + k] += v[:k]
    return out


def reverb(x, cauda=1.2, umido=0.3, brilho=5000):
    """Reverb sintético: resposta ao impulso de ruído com queda exponencial, L e R diferentes (abre o estéreo)."""
    ir_t = t(cauda)
    canais = []
    for semente in (1, 2):
        r = np.random.default_rng(semente).standard_normal(len(ir_t)) * np.exp(-ir_t / (cauda / 5))
        r = filtro(r, "low", brilho)
        r /= np.sqrt((r ** 2).sum())
        y = fftconvolve(x, r)
        canais.append(np.pad(y, (0, len(x) + len(ir_t) - len(y)))[: len(x) + len(ir_t)])
    seco = np.pad(x, (0, len(ir_t)))
    return seco + umido * canais[0] * 3, seco + umido * canais[1] * 3


def grava(nome, L, R=None, alvo=0.95):
    R = L if R is None else R
    n = max(len(L), len(R))
    L, R = np.pad(L, (0, n - len(L))), np.pad(R, (0, n - len(R)))
    s = np.stack([L, R], 1)
    # corta o silêncio do fim
    vivo = np.where(np.abs(s).max(1) > 1e-4 * np.abs(s).max())[0]
    s = s[: vivo[-1] + 1] if len(vivo) else s
    s = s / (np.abs(s).max() + 1e-9) * alvo
    fade = int(0.006 * SR)
    s[-fade:] *= np.linspace(1, 0, fade)[:, None]
    with wave.open(os.path.join(OUT, nome + ".wav"), "w") as f:
        f.setnchannels(2); f.setsampwidth(2); f.setframerate(SR)
        f.writeframes((s * 32767).astype(np.int16).tobytes())
    print(f"{nome:16s} {len(s) / SR:.2f}s")


def kick(f0=170, f1=46, queda=0.06, dur=0.5, dec=0.32):
    x = t(dur)
    fr = f1 + (f0 - f1) * np.exp(-x / queda)
    return np.sin(2 * np.pi * np.cumsum(fr) / SR) * np.exp(-x / dec)


def clique(dur=0.006, fc=2500):
    x = t(dur * 6)
    return filtro(ruido(dur * 6), "high", fc) * np.exp(-x / dur)


# ---------- sons ----------
os.makedirs(OUT, exist_ok=True)

# HIT: pancada de headline (sub + estalo + corpo + cauda curta)
def hit(peso=1.0):
    corpo = filtro(ruido(0.3), "band", [180, 1100]) * np.exp(-t(0.3) / 0.045)
    v = junta(kick(180, 48, 0.05, 0.6, 0.28 * peso), clique() * 0.9, corpo * 0.7)
    v = satura(v, 2.6)
    return reverb(v, 0.9, 0.18)


grava("hit", *hit())
L, R = hit(0.6); grava("hit-leve", L * 1, R * 1, alvo=0.8)

# BOOM: impacto cinematográfico (sub que cai + "braam" de serras graves + chiado de prato)
def boom(dur=2.2, braam=True):
    x = t(dur)
    sub = np.sin(2 * np.pi * np.cumsum(36 + 110 * np.exp(-x / 0.09)) / SR) * np.exp(-x / 0.9)
    v = junta(sub * 1.2, clique(0.01, 1800) * 1.2)
    v += filtro(ruido(dur), "band", [120, 900]) * np.exp(-x / 0.12) * 0.8
    if braam:
        serra = sum(2 * ((x * f) % 1) - 1 for f in (55, 55.4, 82.6, 110.3))
        corte = 300 + 2600 * np.exp(-x / 0.25)
        b = np.zeros_like(x); passos = 16; bloco = len(x) // passos
        for k in range(passos):
            a, z = k * bloco, len(x) if k == passos - 1 else (k + 1) * bloco
            b[a:z] = filtro(serra, "low", float(corte[a]))[a:z]
        v += b * np.exp(-x / 0.8) * (1 - np.exp(-x / 0.01)) * 0.5
    v += filtro(ruido(dur), "high", 5000) * np.exp(-x / 0.35) * 0.25
    v = satura(v, 2.2)
    return reverb(v, 2.0, 0.3, 4000)


grava("boom", *boom())
grava("boom-leve", *boom(1.3, braam=False), alvo=0.85)

# RISER: sobe tensão por 1,6 s e corta seco no fim (entra antes do R$ 4.000)
x = t(1.6); p = x / 1.6
ar = varre(ruido(1.6), 300, 9000, 0.8) * p ** 2.2
tom = np.sin(2 * np.pi * np.cumsum(140 + 1300 * p ** 2.4) / SR) * (0.6 + 0.4 * np.sin(2 * np.pi * np.cumsum(4 + 26 * p) / SR)) * p ** 2.5
pulso = np.sin(2 * np.pi * 55 * x) * ((x * (4 + 12 * p)) % 1 < 0.35) * p ** 1.5
v = satura(ar * 1.0 + tom * 0.35 + pulso * 0.4, 1.6)
v[-int(0.012 * SR):] *= np.linspace(1, 0, int(0.012 * SR))
pan = 0.25 * np.sin(2 * np.pi * 3 * x)
grava("riser", v * (1 - pan), v * (1 + pan), alvo=0.85)

# WHOOSH forte: ar com corpo e grave, passando de um lado pro outro
def whoosh(d=0.55, f0=200, f1=5000, pico=0.62):
    x = t(d); p = x / d
    env = np.where(p < pico, (p / pico) ** 2.2, np.exp(-((p - pico) / (1 - pico)) * 4))
    ar = varre(ruido(d), f0, f1, 0.9) * env
    grave = np.sin(2 * np.pi * np.cumsum(50 + 90 * np.minimum(1, p / pico)) / SR) * env * 0.5
    v = satura(ar + grave, 1.4)
    pp = -0.8 + 1.6 * p
    return v * (1 - pp), v * (1 + pp)


grava("whoosh", *whoosh())
grava("whoosh-forte", *whoosh(0.75, 120, 7000, 0.7))
grava("whoosh-saida", *whoosh(0.32, 800, 6000, 0.25), alvo=0.8)
grava("swish", *whoosh(0.18, 1500, 9000, 0.5), alvo=0.7)

# LETRAS: rajada de swishes curtinhos (letras voando uma a uma)
L = mistura([(i * 0.045, whoosh(0.16, 1200 + 300 * i, 9000, 0.5)[0] * (0.6 + 0.05 * i)) for i in range(8)], 0.6)
R = mistura([(i * 0.045, whoosh(0.16, 1200 + 300 * i, 9000, 0.5)[1] * (0.6 + 0.05 * i)) for i in range(8)], 0.6)
grava("letras", L, R, alvo=0.8)

# CARIMBO: batida pesada + papel + metal
x = t(0.5)
metal = sum(w * np.sin(2 * np.pi * f * x) * np.exp(-x / d) for f, w, d in ((410, 1, 0.12), (1130, 0.5, 0.07), (2390, 0.3, 0.04)))
v = junta(kick(140, 45, 0.04, 0.5, 0.18), filtro(ruido(0.5), "band", [300, 3000]) * np.exp(-x / 0.03) * 1.1, metal * 0.35, clique() * 0.8)
grava("carimbo", *reverb(satura(v, 3.0), 1.0, 0.22))

# RELÓGIO: tique-taque de bloco de madeira, acelerando, com grave a cada dois
def tique(f):
    x = t(0.06)
    return np.sin(2 * np.pi * f * x) * np.exp(-x / 0.012) + filtro(ruido(0.06), "band", [f * 0.8, f * 1.6])[: len(x)] * np.exp(-x / 0.006)


tempos = np.cumsum([0] + [0.26 * 0.93 ** k for k in range(7)])
partes = []
for k, em in enumerate(tempos):
    partes.append((em, tique(2200 if k % 2 == 0 else 1700)))
    if k % 2 == 0:
        partes.append((em, kick(120, 50, 0.03, 0.2, 0.06) * 0.6))
grava("relogio", *reverb(mistura(partes, 1.9), 0.6, 0.12), alvo=0.8)

# DINHEIRO: caixa registradora "tchá-tching" + cascata de moedas, mais brilhante
def sino(f, d, dec, parciais=(1, 2.76, 5.40, 8.93), pesos=(1, 0.55, 0.3, 0.12)):
    x = t(d)
    return sum(w * np.sin(2 * np.pi * f * h * x) * np.exp(-x / (dec / (1 + 0.6 * i))) for i, (h, w) in enumerate(zip(parciais, pesos))) * (1 - np.exp(-x / 0.0015))


def moeda(f):
    x = t(0.15)
    return sum(w * np.sin(2 * np.pi * f * h * x + rng.uniform(0, 6)) for h, w in ((1, 1), (1.47, 0.6), (2.09, 0.35))) * np.exp(-x / rng.uniform(0.03, 0.07))


x = t(0.12)
gaveta = filtro(ruido(0.12), "band", [700, 6000]) * np.exp(-x / 0.025) + np.sin(2 * np.pi * 95 * x) * np.exp(-x / 0.03) * 0.9
tching = junta(sino(2093, 1.8, 0.7), 0.8 * sino(2637, 1.8, 0.6), 0.4 * sino(3136, 1.4, 0.4))
moedas_L, moedas_R = [], []
for _ in range(46):
    em = 0.12 + rng.uniform(0, 1.0) ** 1.3
    m = moeda(rng.uniform(3600, 7800)) * rng.uniform(0.3, 0.7)
    pan = rng.uniform(-0.7, 0.7)
    moedas_L.append((em, m * (1 - pan))); moedas_R.append((em, m * (1 + pan)))
base = [(0, gaveta), (0.07, tching)]
L, R = reverb(mistura(base + moedas_L, 2.0), 1.0, 0.15, 9000)[0], reverb(mistura(base + moedas_R, 2.0), 1.0, 0.15, 9000)[1]
grava("dinheiro", L, R)

# CONTADOR: cliques de roleta que vão desacelerando até travar (o número rolando no "4 mil")
tempos, em, passo = [], 0.0, 0.028
while em < 0.95:
    tempos.append(em); em += passo; passo *= 1.075
partes = [(e, (np.sin(2 * np.pi * 3200 * t(0.02)) * np.exp(-t(0.02) / 0.003) + filtro(ruido(0.02), "high", 4000) * np.exp(-t(0.02) / 0.002) * 0.6) * (0.55 + 0.45 * k / len(tempos))) for k, e in enumerate(tempos)]
partes.append((tempos[-1] + 0.08, junta(kick(200, 70, 0.02, 0.25, 0.06) * 0.8, clique(0.004, 3000))))
grava("contador", *reverb(mistura(partes, 1.4), 0.5, 0.1), alvo=0.75)

# ---------- v3 (2026-10-28, Talyta: "o mesmo efeito sonoro pra tudo não gosto"): cada momento com seu som ----------

# PRATO REVERSO: o ar "sugando" antes da primeira pancada (DESAFIO)
x = t(1.0)
prato = filtro(ruido(1.0), "high", 3500) * np.exp(-x / 0.35) + filtro(ruido(1.0), "band", [6000, 12000]) * np.exp(-x / 0.2) * 0.6
L, R = reverb(prato, 1.0, 0.3, 9000)
grava("prato-reverso", L[::-1][-int(0.95 * SR):], R[::-1][-int(0.95 * SR):], alvo=0.75)

# TAMBOR grave (estilo taiko): DESAFIO, DIA 1º
x = t(1.2)
tambor = junta(np.sin(2 * np.pi * np.cumsum(62 + 70 * np.exp(-x / 0.04)) / SR) * np.exp(-x / 0.45),
               filtro(ruido(1.2), "low", 900) * np.exp(-x / 0.05) * 0.9, clique(0.008, 1200) * 0.6)
grava("tambor", *reverb(satura(tambor, 2.2), 1.6, 0.3, 3500))

# PALMAS (MARCADA): 4 estalos de mão bem juntinhos
pal = mistura([(k * 0.009, filtro(ruido(0.12), "band", [900, 2600]) * np.exp(-t(0.12) / (0.012 if k < 3 else 0.04))) for k in range(4)], 0.3)
grava("palmas", *reverb(pal, 0.7, 0.25, 7000), alvo=0.8)

# PASSOS (CORRENDO): pisadas de corrida acelerando, uma de cada lado
L = np.zeros(int(1.0 * SR)); R = np.zeros_like(L); em = 0.0; k = 0
while em < 0.75:
    p = junta(kick(95, 48, 0.012, 0.12, 0.035) * 0.9, filtro(ruido(0.06), "band", [300, 1800]) * np.exp(-t(0.06) / 0.012) * 0.7)
    i = int(em * SR); n = min(len(p), len(L) - i)
    (L if k % 2 == 0 else R)[i:i + n] += p[:n]; (R if k % 2 == 0 else L)[i:i + n] += p[:n] * 0.35
    em += 0.115 * 0.9 ** k; k += 1
grava("passos", L, R, alvo=0.8)

# TIRO DE LARGADA (2ª CORRIDA): estampido + eco de rua
x = t(0.4)
tiro = junta(filtro(ruido(0.4), "high", 300) * np.exp(-x / 0.018) * 1.2, np.sin(2 * np.pi * 70 * x) * np.exp(-x / 0.06) * 0.8, clique(0.003, 2000))
grava("tiro", *reverb(satura(tiro, 3.0), 2.4, 0.45, 5000))

# METAL (START FITNESS): pancada metálica de academia (anilha batendo)
x = t(1.4)
metal = sum(w * np.sin(2 * np.pi * f * x) * np.exp(-x / d) for f, w, d in ((233, 1, 0.5), (587, 0.6, 0.35), (1213, 0.4, 0.22), (2160, 0.25, 0.12), (3480, 0.15, 0.07)))
grava("metal", *reverb(junta(metal * 0.8, clique(0.004, 2500) * 0.8, kick(120, 50, 0.02, 0.3, 0.08) * 0.5), 1.2, 0.2, 8000), alvo=0.85)

# OBTURADOR (DIA 1º, DIA 29): clique de câmera, duas lâminas
def lamina():
    return junta(filtro(ruido(0.03), "band", [1500, 7000]) * np.exp(-t(0.03) / 0.004), np.sin(2 * np.pi * 900 * t(0.03)) * np.exp(-t(0.03) / 0.006) * 0.4)
grava("obturador", *reverb(mistura([(0, lamina()), (0.075, lamina() * 0.8)], 0.2), 0.4, 0.12), alvo=0.75)

# PÁGINA (DE NOVEMBRO): folha de calendário virando
x = t(0.3)
pag = filtro(ruido(0.3), "band", [1800, 7000]) * np.sin(np.pi * np.minimum(1, x / 0.26)) ** 2 * (0.6 + 0.4 * np.sin(2 * np.pi * 38 * x))
grava("pagina", *reverb(pag, 0.4, 0.1), alvo=0.65)

# PERGUNTA (MELHOR?): subidinha de suspense que termina num ponto
x = t(0.7); p = x / 0.7
sub = np.sin(2 * np.pi * np.cumsum(260 + 700 * p ** 2) / SR) * p ** 1.5 * 0.5 + varre(ruido(0.7), 800, 8000, 0.8) * p ** 2 * 0.6
grava("pergunta", *reverb(junta(sub, np.zeros(int(0.75 * SR))) + mistura([(0.69, sino(1568, 0.4, 0.15, (1, 2.01), (1, 0.3)) * 0.5)], 0.75), 0.8, 0.2), alvo=0.7)

# 1, 2, 3: plins subindo (dó, mi, sol) com um grave por baixo
for nome, f in (("um", 523.25), ("dois", 659.25), ("tres", 783.99)):
    x = t(0.6)
    plin = (np.sin(2 * np.pi * f * x) + 0.35 * np.sign(np.sin(2 * np.pi * f * x)) * 0.3 + 0.25 * np.sin(2 * np.pi * 2 * f * x)) * np.exp(-x / 0.18)
    grava(nome, *reverb(junta(plin, kick(130, 55, 0.02, 0.3, 0.07) * 0.7), 0.8, 0.2), alvo=0.8)

# ARRANHÃO de disco (ACABOU?): "pera aí"
x = t(0.42); p = x / 0.42
curva = np.interp(p, [0, 0.3, 0.55, 1], [200, 1100, 380, 120])
tom = (2 * ((np.cumsum(curva) / SR) % 1) - 1)
arr = junta(filtro(tom, "band", [150, 3500]) * 0.6, filtro(ruido(0.42), "band", [1500, 6000]) * 0.35) * np.sin(np.pi * p) ** 0.6
grava("arranhao", *reverb(satura(arr, 2.0), 0.3, 0.08), alvo=0.8)

# SINO (17H): "din" de horário marcado
grava("sino", *reverb(junta(sino(1046.5, 1.6, 0.8, (1, 2.0, 3.0, 4.16), (1, 0.4, 0.2, 0.15)), sino(1568, 1.2, 0.5) * 0.4), 1.4, 0.3, 9000), alvo=0.7)

# CAIXA (bateria): batida seca curta
x = t(0.3)
grava("caixa", *reverb(junta(filtro(ruido(0.3), "band", [1200, 7000]) * np.exp(-x / 0.06), np.sin(2 * np.pi * 190 * x) * np.exp(-x / 0.03) * 0.7), 0.7, 0.2), alvo=0.8)

# APITO (fim): apito de juiz, trinado
x = t(0.75)
env = np.minimum(1, x / 0.02) * np.minimum(1, (0.75 - x) / 0.08)
trinado = 0.55 + 0.45 * np.sin(2 * np.pi * 32 * x)
ap = (np.sin(2 * np.pi * np.cumsum(2950 + 70 * np.sin(2 * np.pi * 32 * x)) / SR) + 0.2 * np.sin(2 * np.pi * 5900 * x)) * trinado * env
ap += filtro(ruido(0.75), "band", [2200, 4200]) * env * 0.25
grava("apito", *reverb(ap, 1.0, 0.2, 8000), alvo=0.6)

# BRILHO final (cintilante, com cauda)
notas = [1318.5, 1568.0, 1975.5, 2637.0, 3136.0]
v = mistura([(i * 0.05, sino(f, 1.4, 0.5, (1, 2.01), (1, 0.3)) * (0.9 - i * 0.12)) for i, f in enumerate(notas)], 1.8)
grava("brilho", *reverb(v, 1.6, 0.35, 9000), alvo=0.6)

# ---------- vídeo 2 (entrevista, 2026-10-28) ----------
# PORTA: duas batidas de nó do dedo em madeira ("está batendo na porta")
def toc():
    x = t(0.16)
    madeira = sum(np.sin(2 * np.pi * f * x) * np.exp(-x / d) * p for f, d, p in ((190, 0.05, 1), (410, 0.03, 0.6), (870, 0.015, 0.35)))
    return junta(madeira, filtro(ruido(0.02), "band", [900, 3500]) * np.exp(-t(0.02) / 0.004) * 0.6)
v = mistura([(0.0, toc()), (0.17, toc() * 0.85)], 0.45)
grava("porta", *reverb(v, 0.35, 0.12, 4000), alvo=0.8)
