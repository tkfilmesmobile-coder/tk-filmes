"""Trilhas PROVISÓRIAS por intenção de cena (substituir por trilhas licenciadas na entrega final).
Geradas aqui, sem serviço externo. Cada uma sai com o comprimento do vídeo e ducking pela voz; no Remotion
só se faz o crossfade entre elas no ponto em que a cena muda de intenção.

  clinico     · explicação técnica (anatomia, doença): ré menor, 76 BPM, pad de vidro + pulso grave
                macio de "batimento" + notas de cristal esparsas. Curiosidade, atenção, sem susto.
  acolhimento · fala humana (gestação, bebê, cuidado): fá maior, 70 BPM, pad quente + piano suave em
                arpejo lento. Calor, confiança.
  clareza     · orientação/solução (2º trimestre, planejamento, limpeza): sol maior, 92 BPM, pluck
                leve + pad claro + percussão de mão bem baixa. Leveza, resolução.

Uso: python scripts/trilhas_cena.py <duração_s> <voz.wav> <pasta_saida>
"""
import sys, wave, os
import numpy as np

SR = 48000
dur = float(sys.argv[1]); VOZ = sys.argv[2]; PASTA = sys.argv[3]
n = int(SR * dur); t = np.arange(n) / SR
rng = np.random.default_rng(7)


def env(m, a, d):
    x = np.arange(m) / SR
    return np.minimum(1, x / a) * np.exp(-x / d)


def pad(freqs, amp, brilho_s=9.0):
    out = np.zeros(n)
    for k, f in enumerate(freqs):
        for det, fase in ((1.0, 0), (1.0035, 1.3), (0.9968, 2.1)):
            out += np.sin(2 * np.pi * f * det * t + fase) / 3
            out += 0.18 * np.sin(4 * np.pi * f * det * t + fase) / 3  # 2º harmônico: corpo
    out *= amp * (0.8 + 0.2 * np.sin(2 * np.pi * t / brilho_s))
    return out * np.minimum(1, t / 1.2)


def piano(f, m):
    # aditivo com leve inarmonicidade e decaimento por parcial
    x = np.arange(m) / SR
    s = np.zeros(m)
    for h, a in ((1, 1), (2, .45), (3, .22), (4, .12), (5, .06)):
        fh = f * h * (1 + 0.0004 * h * h)
        s += a * np.sin(2 * np.pi * fh * x) * np.exp(-x * (1.4 + 0.9 * h))
    return s * np.minimum(1, x / 0.004)


def coloca(dst, i, s, g=1.0):
    if i >= n:
        return
    j = min(n, i + len(s)); dst[i:j] += g * s[: j - i]


def clinico():
    bpm = 76; b = 60 / bpm; mus = pad([73.4, 110, 146.8, 174.6, 220, 261.6], 0.16, 11)  # Dm(add9)
    # batimento grave macio (duas batidas por compasso)
    e = env(int(0.4 * SR), 0.006, 0.12); x = np.arange(len(e)) / SR
    bat = np.sin(2 * np.pi * (48 + 18 * np.exp(-x * 30)) * x) * e
    for i in range(0, n, int(2 * b * SR)):
        coloca(mus, i, bat, 0.42); coloca(mus, i + int(0.28 * SR), bat, 0.22)
    # cristal esparso (D6, A5, F6, E6)
    notas = [1174.7, 880, 1396.9, 1318.5]; ec = env(int(1.6 * SR), 0.002, 0.45)
    for j, i in enumerate(range(int(2 * b * SR), n, int(4 * b * SR))):
        f = notas[j % 4]; xx = np.arange(len(ec)) / SR
        coloca(mus, i, (np.sin(2 * np.pi * f * xx) + 0.25 * np.sin(2 * np.pi * 2.76 * f * xx)) * ec, 0.05)
    return mus


def acolhimento():
    bpm = 70; b = 60 / bpm; mus = pad([87.3, 130.8, 174.6, 220, 261.6, 329.6], 0.13, 13)  # Fmaj9
    acordes = [[174.6, 220, 261.6, 329.6], [146.8, 220, 261.6, 349.2], [196, 233.1, 293.7, 349.2], [174.6, 220, 261.6, 392]]
    m = int(2.2 * SR)
    for c in range(int(dur / (4 * b)) + 1):
        ac = acordes[c % 4]
        for k, f in enumerate(ac):
            coloca(mus, int((c * 4 + k) * b * SR), piano(f * 2, m), 0.11)
    return mus


def clareza():
    bpm = 92; b = 60 / bpm; mus = pad([98, 146.8, 196, 246.9, 293.7, 370], 0.11, 7)  # Gmaj7
    ep = env(int(0.5 * SR), 0.002, 0.14)
    seq = [392, 493.9, 587.3, 740, 587.3, 493.9]
    for j, i in enumerate(range(0, n, int(b / 2 * SR))):
        if j % 3 == 2:
            continue
        f = seq[j % len(seq)]; x = np.arange(len(ep)) / SR
        coloca(mus, i, (np.sin(2 * np.pi * f * x) + 0.35 * np.sin(4 * np.pi * f * x)) * ep, 0.06)
    # shaker de mão bem baixo
    es = env(int(0.07 * SR), 0.01, 0.025)
    X = np.fft.rfft(rng.normal(size=len(es))); fr = np.fft.rfftfreq(len(es), 1 / SR); X[fr < 5000] = 0
    sh = np.fft.irfft(X, len(es)) * es; sh /= np.abs(sh).max() + 1e-9
    for i in range(int(b / 2 * SR), n, int(b * SR)):
        coloca(mus, i, sh, 0.05)
    return mus


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
ganho = np.repeat(10 ** ((-7 * g) / 20), H)

os.makedirs(PASTA, exist_ok=True)
for nome, fn in (("clinico", clinico), ("acolhimento", acolhimento), ("clareza", clareza)):
    mus = fn()[: m * H] * ganho
    mus = mus / (np.sqrt(np.mean(mus ** 2)) + 1e-9) * 10 ** (-33 / 20)  # RMS ~ -33 dBFS (voz ~ -20)
    with wave.open(os.path.join(PASTA, f"{nome}.wav"), "w") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((np.clip(mus, -1, 1) * 32767).astype(np.int16).tobytes())
    print(nome, f"{len(mus) / SR:.1f} s")
