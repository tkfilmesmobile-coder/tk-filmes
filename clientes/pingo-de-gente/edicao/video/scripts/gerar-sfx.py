"""Efeitos sonoros infantis sintetizados (sem banco de som de terceiros): pop, boing, plim, brilho, risco de giz.
Saída: ../public/sfx/*.wav (44,1 kHz, mono, 16 bits)
"""
import os
import wave

import numpy as np

SR = 44100
AQUI = os.path.dirname(os.path.abspath(__file__))
SAIDA = os.path.join(AQUI, "..", "public", "sfx")
os.makedirs(SAIDA, exist_ok=True)
rng = np.random.default_rng(7)


def t(d):
    return np.arange(int(SR * d)) / SR


def salva(nome, x, pico=0.8):
    x = x / (np.abs(x).max() + 1e-9) * pico
    fade = np.minimum(1, np.arange(len(x))[::-1] / (SR * 0.01))
    x = (x * fade * 32767).astype(np.int16)
    with wave.open(os.path.join(SAIDA, nome), "w") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes(x.tobytes())


def varre(f0, f1, d, curva=1.0):
    tt = t(d)
    f = f0 + (f1 - f0) * (tt / d) ** curva
    return np.sin(2 * np.pi * np.cumsum(f) / SR), tt


# pop: bolha estourando (varredura curta pra cima + clique)
x, tt = varre(380, 1400, 0.07, 0.6)
pop = x * np.exp(-tt / 0.022)
pop[:60] += rng.normal(0, 0.6, 60) * np.linspace(1, 0, 60)
salva("pop.wav", np.concatenate([pop, np.zeros(int(SR * 0.05))]), 0.7)

# pop agudo (variação, pra não repetir igual)
x, tt = varre(700, 2100, 0.05, 0.5)
salva("pop2.wav", np.concatenate([x * np.exp(-tt / 0.016), np.zeros(int(SR * 0.05))]), 0.6)

# boing: mola de desenho animado
tt = t(0.55)
f = 170 + 90 * np.exp(-tt / 0.25) * np.sin(2 * np.pi * 11 * tt) + 120 * np.exp(-tt / 0.08)
boing = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt / 0.22)
boing += 0.3 * np.sin(2 * 2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt / 0.12)
salva("boing.wav", boing, 0.7)

# plim: sininho (dois parciais, cauda curta)
tt = t(0.7)
plim = sum(a * np.sin(2 * np.pi * fr * tt) * np.exp(-tt / dc) for fr, a, dc in [(1568, 1, 0.22), (2349, 0.55, 0.16), (3136, 0.3, 0.1), (4699, 0.15, 0.06)])
salva("plim.wav", plim, 0.55)

# brilho: arpejo de sininhos subindo (pra headline)
partes = np.zeros(int(SR * 0.9))
for k, fr in enumerate([1319, 1568, 1976, 2637, 3136]):
    tt = t(0.5)
    nota = (np.sin(2 * np.pi * fr * tt) + 0.4 * np.sin(2 * np.pi * fr * 2.01 * tt)) * np.exp(-tt / 0.13)
    i = int(SR * 0.055 * k)
    partes[i:i + len(nota)] += nota * (0.75 + 0.06 * k)
salva("brilho.wav", partes, 0.5)

# giz: risco rápido de giz de cera (ruído filtrado com "dentes")
tt = t(0.32)
ruido = rng.normal(0, 1, len(tt))
k = np.ones(12) / 12
ruido = ruido - np.convolve(ruido, k, "same")  # tira o grave
dentes = 0.55 + 0.45 * np.sign(np.sin(2 * np.pi * 38 * tt))
env = np.sin(np.pi * np.minimum(1, tt / 0.32)) ** 0.6
salva("giz.wav", ruido * dentes * env, 0.35)

# whoosh suave (vento curto), pra troca de headline
tt = t(0.4)
ruido = rng.normal(0, 1, len(tt))
for _ in range(3):
    ruido = np.convolve(ruido, np.ones(6) / 6, "same")
salva("whoosh.wav", ruido * np.sin(np.pi * tt / 0.4) ** 2, 0.45)
# ---------- kit fofo (pedido da Talyta, 2026-11-04: "efeitos sonoros bem fofos, bem kids") ----------
def nota_xilo(fr, d=0.45):
    tt = t(d)
    x = np.sin(2 * np.pi * fr * tt) * np.exp(-tt / 0.16) + 0.35 * np.sin(2 * np.pi * fr * 3.93 * tt) * np.exp(-tt / 0.035)
    x[:30] *= np.linspace(0, 1, 30)
    return x


# xilofone: uma nota por rabisco (escala pentatônica, cada um num tom), e a escadinha pros títulos
PENTA = [1047, 1175, 1319, 1568, 1760, 2093]
for i, fr in enumerate(PENTA):
    salva(f"xilo{i}.wav", nota_xilo(fr), 0.6)
glis = np.zeros(int(SR * 0.9))
for k, fr in enumerate([1047, 1175, 1319, 1568, 1760, 2093, 2349]):
    n = nota_xilo(fr, 0.4)
    i = int(SR * 0.05 * k)
    glis[i:i + len(n)] += n * (0.7 + 0.05 * k)
salva("xilo-escada.wav", glis, 0.6)

# boop: gotinha fofa (sobe e desce)
tt = t(0.16)
f = 520 + 700 * np.sin(np.pi * tt / 0.16) ** 2
salva("boop.wav", np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt / 0.07), 0.6)

# bolha: bloop de bolhinha subindo
tt = t(0.11)
f = 300 + 1500 * (tt / 0.11) ** 1.6
salva("bolha.wav", np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * tt / 0.11), 0.55)

# patinho de borracha (squeak), pra interrogação
tt = t(0.24)
f = 1150 + 520 * np.sin(np.pi * tt / 0.24) + 40 * np.sin(2 * np.pi * 34 * tt)
fase = 2 * np.pi * np.cumsum(f) / SR
sq = np.sin(fase) + 0.5 * np.sin(2 * fase) + 0.25 * np.sin(3 * fase)
salva("squeak.wav", sq * np.sin(np.pi * tt / 0.24) ** 0.7, 0.45)

# apito que sobe (slide whistle), pra balão e coisas subindo
tt = t(0.6)
f = 650 + 1100 * (tt / 0.6) ** 1.3 + 18 * np.sin(2 * np.pi * 6 * tt)
salva("apito.wav", np.sin(2 * np.pi * np.cumsum(f) / SR) * np.minimum(1, tt / 0.05) * np.exp(-np.maximum(0, tt - 0.45) / 0.06), 0.4)

# bzzz da abelhinha
tt = t(0.7)
f = 230 + 12 * np.sin(2 * np.pi * 7 * tt)
fase = 2 * np.pi * np.cumsum(f) / SR
serra = 2 * ((fase / (2 * np.pi)) % 1) - 1
serra = np.convolve(serra, np.ones(8) / 8, "same")
salva("bzz.wav", serra * (0.6 + 0.4 * np.sin(2 * np.pi * 22 * tt)) * np.sin(np.pi * tt / 0.7), 0.3)

# tic-tac do relógio (dois toquinhos de madeira)
tt = t(0.05)
toc = lambda fr: np.sin(2 * np.pi * fr * tt) * np.exp(-tt / 0.008)
salva("tictac.wav", np.concatenate([toc(2400), np.zeros(int(SR * 0.17)), toc(1800), np.zeros(int(SR * 0.1))]), 0.5)

# zuuum de desenho animado: a passada rápida (assobio subindo + vento que passa)
tt = t(0.55)
f = 500 + 2200 * (tt / 0.55) ** 0.8
assobio = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * tt / 0.55) ** 1.5
ruido = rng.normal(0, 1, len(tt))
for _ in range(2):
    ruido = np.convolve(ruido, np.ones(4) / 4, "same")
vento = ruido * np.sin(np.pi * tt / 0.55) ** 2
salva("zum.wav", 0.55 * assobio + 0.8 * vento, 0.5)

# pulinho de mola (entrada dos bichos grandes)
tt = t(0.5)
f = 260 + 340 * (tt / 0.5) + 60 * np.sin(2 * np.pi * 9 * tt) * np.exp(-tt / 0.3)
salva("mola.wav", np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt / 0.25), 0.55)

# macaquinho: três "uh" rapidinhos subindo (entrada dos macacos da ponte)
partes = []
for fr in (430, 540, 680):
    tt = t(0.1)
    f = fr * (1 + 0.18 * np.sin(np.pi * tt / 0.1)) + 14 * np.sin(2 * np.pi * 30 * tt)
    fase = 2 * np.pi * np.cumsum(f) / SR
    partes += [(np.sin(fase) + 0.45 * np.sin(2 * fase) + 0.15 * np.sin(3 * fase)) * np.sin(np.pi * tt / 0.1) ** 0.8, np.zeros(int(SR * 0.035))]
salva("macaco.wav", np.concatenate(partes), 0.45)

print("sfx em", os.path.abspath(SAIDA), sorted(os.listdir(SAIDA)))
