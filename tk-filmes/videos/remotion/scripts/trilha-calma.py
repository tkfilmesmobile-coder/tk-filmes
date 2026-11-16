"""Trilha de fundo + efeitos graves do estilo novo da TK (perfil de edição de 2026-11-16), sintetizados aqui
(nossos, sem licença de terceiros), já mixados num arquivo só, no tempo da edição.

Trilha: calma e quente, 72 BPM, pad em acordes abertos (C · Am · F · G), notas de piano macias e um baixo
redondo. Fica o vídeo inteiro, baixa, debaixo da fala.
Eventos (segundos da edição), lidos de um json:
  boom   · batida grave forte (sub descendo de 90 a 38 Hz + golpe surdo): abertura e viradas de bloco
  whoosh · sopro grave (ruído filtrado descendo de 500 a 110 Hz): troca de cartão de capítulo
  drop   · [a, b]: a trilha some (o "respiro" antes da frase mais importante) e volta inteira em b
  abafar · [a, b]: a trilha passa por um filtro de graves (som abafado) e volta normal em b
  sobe   · instante em que a trilha sobe pro fecho (logo), até o fim

uso: python scripts/trilha-calma.py <eventos.json> <saida.wav>
eventos.json: {"dur": 80.0, "boom": [0.0, 21.5], "whoosh": [21.4], "drop": [[48.1, 48.5]], "abafar": [[21.4, 22.6]], "sobe": 77.0}
"""
import sys, json, wave
import numpy as np

SR = 48000
ev = json.load(open(sys.argv[1], encoding="utf-8"))
SAIDA = sys.argv[2]
dur = float(ev["dur"])
n = int(SR * dur)
t = np.arange(n) / SR
rng = np.random.default_rng(16)

def nota(m):  # midi -> Hz
    return 440.0 * 2 ** ((m - 69) / 12)

bpm = 72; beat = 60 / bpm; compasso = 4 * beat
# acordes (midi) · um por compasso
ACORDES = [[48, 55, 64, 67, 71], [45, 52, 60, 64, 67], [41, 48, 57, 60, 64], [43, 50, 59, 62, 67]]
BAIXO = [36, 33, 29, 31]
mus = np.zeros(n)

def env_adsr(L, a, r):
    e = np.ones(L)
    na, nr = int(a * SR), int(r * SR)
    if na: e[:na] = np.linspace(0, 1, na)
    if nr: e[-nr:] *= np.linspace(1, 0, nr)
    return e

k = 0; ini = 0.0
while ini < dur:
    ac, bx = ACORDES[k % 4], BAIXO[k % 4]
    a0 = int(ini * SR); L = min(n - a0, int((compasso + 1.2) * SR))
    if L <= 0: break
    tt = np.arange(L) / SR
    # pad: senos levemente desafinados (coro), ataque lento
    pad = np.zeros(L)
    for m in ac:
        for d in (-0.06, 0.0, 0.07):
            pad += np.sin(2 * np.pi * nota(m + d) * tt + rng.uniform(0, 6.28))
    pad *= env_adsr(L, 1.1, 1.2) * 0.022
    # baixo redondo: seno + um pouco de 2º harmônico, nos tempos 1 e 3
    bs = np.zeros(L)
    for b0 in (0.0, 2 * beat):
        s = int(b0 * SR); Lb = min(L - s, int(1.8 * SR))
        if Lb <= 0: continue
        tb = np.arange(Lb) / SR
        bs[s:s + Lb] += (np.sin(2 * np.pi * nota(bx) * tb) + 0.25 * np.sin(4 * np.pi * nota(bx) * tb)) * np.exp(-tb * 1.6) * env_adsr(Lb, 0.02, 0.3)
    bs *= 0.11
    # piano macio: notas do acorde em colcheias pontuadas, decaimento exponencial
    pn = np.zeros(L)
    padrao = [0, 1.5, 2.5, 3.0]
    for j, b0 in enumerate(padrao):
        s = int(b0 * beat * SR); Lp = min(L - s, int(2.4 * SR))
        if Lp <= 0: continue
        tp = np.arange(Lp) / SR
        f = nota(ac[(j + k) % len(ac)] + 12)
        pn[s:s + Lp] += (np.sin(2 * np.pi * f * tp) + 0.35 * np.sin(4 * np.pi * f * tp) + 0.12 * np.sin(6 * np.pi * f * tp)) * np.exp(-tp * 2.4) * env_adsr(Lp, 0.004, 0.2)
    pn *= 0.05
    mus[a0:a0 + L] += pad + bs + pn
    ini += compasso; k += 1

# música escolhida pela Talyta (no lugar da sintetizada): "musica" (wav 48 kHz), "musica_ini" (s) e "musica_db" (ganho)
if ev.get("musica"):
    with wave.open(ev["musica"]) as w:
        assert w.getframerate() == SR, "a música tem que estar em 48 kHz"
        ini = int(ev.get("musica_ini", 0) * SR)
        w.setpos(ini); raw = np.frombuffer(w.readframes(n), np.int16).astype(np.float64) / 32768
        raw = raw.reshape(-1, w.getnchannels()).mean(1)
    mus = np.zeros(n); mus[:len(raw)] = raw
    mus *= 10 ** (ev.get("musica_db", 0) / 20) / 0.55  # o 0,55 da mixagem lá embaixo é desfeito aqui
# entrada e saída suaves
mus *= np.clip(t / 1.2, 0, 1) * np.clip((dur - t) / 1.5, 0, 1)

def lowpass(x, fc):
    a = np.exp(-2 * np.pi * fc / SR); y = np.zeros_like(x); z = 0.0
    for i in range(len(x)):
        z = (1 - a) * x[i] + a * z; y[i] = z
    return y

def rampa(a, b, borda=0.04):
    """máscara 0→1 dentro de [a, b], com bordas suaves"""
    m = np.clip((t - a) / borda, 0, 1) * np.clip((b - t) / borda, 0, 1)
    return m

# abafar: mistura a versão filtrada no trecho
for a, b in ev.get("abafar", []):
    s, e = max(0, int((a - 0.2) * SR)), min(n, int((b + 0.2) * SR))
    seg = mus[s:e]
    filt = lowpass(lowpass(seg, 420), 420) * 1.6
    m = rampa(a, b, 0.08)[s:e]
    mus[s:e] = seg * (1 - m) + filt * m
# drop: a trilha some
for a, b in ev.get("drop", []):
    mus *= 1 - rampa(a, b, 0.03)
# sobe no fecho
if ev.get("sobe") is not None:
    mus *= 10 ** (ev.get("sobe_db", 8) * np.clip((t - ev["sobe"]) / 0.6, 0, 1) / 20)

fx = np.zeros(n)
def boom(t0, forca=1.0):
    s = int(t0 * SR); L = min(n - s, int(1.6 * SR))
    if L <= 0: return
    tb = np.arange(L) / SR
    f = 38 + 52 * np.exp(-tb * 9)                      # sub descendo de 90 a 38 Hz
    fase = 2 * np.pi * np.cumsum(f) / SR
    sub = np.sin(fase) * np.exp(-tb * 2.2)
    golpe = lowpass(rng.standard_normal(L) * np.exp(-tb * 55), 260) * 3.5  # golpe surdo no ataque
    x = (sub + golpe) * env_adsr(L, 0.002, 0.25)
    fx[s:s + L] += np.tanh(x * 1.6) * 0.55 * forca
def whoosh(t0):
    L = int(0.55 * SR); s = max(0, int(t0 * SR) - int(0.4 * SR)); L = min(L, n - s)
    if L <= 0: return
    tw = np.arange(L) / SR
    ru = rng.standard_normal(L)
    # filtro descendo: varre de 500 a 110 Hz (grave, nunca agudo)
    y = np.zeros(L); z1 = z2 = 0.0
    for i in range(L):
        fc = 500 * (110 / 500) ** (tw[i] / tw[-1]); a = np.exp(-2 * np.pi * fc / SR)
        z1 = (1 - a) * ru[i] + a * z1; z2 = (1 - a) * z1 + a * z2; y[i] = z2
    forma = np.sin(np.pi * np.clip(tw / tw[-1], 0, 1)) ** 1.5
    fx[s:s + L] += y * forma * 2.4

for t0 in ev.get("boom", []): boom(t0)
for t0 in ev.get("whoosh", []): whoosh(t0)

saida = mus * 0.55 + fx * ev.get("fx_ganho", 1.0)
pico = np.max(np.abs(saida))
if pico > 0.97: saida *= 0.97 / pico
st = np.repeat((saida * 32767).astype(np.int16)[:, None], 2, axis=1)
with wave.open(SAIDA, "wb") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(st.tobytes())
rms = lambda x: 20 * np.log10(np.sqrt(np.mean(x ** 2)) + 1e-9)
print(f"ok {SAIDA} · {dur:.1f}s · trilha {rms(mus * 0.55):.1f} dBFS rms · pico {20 * np.log10(np.max(np.abs(saida)) + 1e-9):.1f} dBFS")
