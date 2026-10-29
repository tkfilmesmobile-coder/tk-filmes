"""A música (48 s) é mais curta que a entrevista (74 s): emenda uma segunda passada no tempo da batida.
Corta na batida 63 (~39,9 s) e volta pra batida 15 (~9,9 s): 48 batidas = 12 compassos, a frase musical bate.
Emenda com crossfade curto. Saída: ../video/public/midia/musica-longa.wav
"""
import json
import os
import wave

import numpy as np

AQUI = os.path.dirname(os.path.abspath(__file__))
MID = os.path.join(AQUI, "..", "video", "public", "midia")
bat = json.load(open(os.path.join(AQUI, "..", "video", "src", "musica.json")))["batidas"]
with wave.open(os.path.join(MID, "musica.wav")) as w:
    sr, ch, sw = w.getframerate(), w.getnchannels(), w.getsampwidth()
    a = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).reshape(-1, ch).astype(np.float32)
# par de batidas (A perto do fim, B no começo) cuja distância é mais perto de um número inteiro de compassos
P = 60 / json.load(open(os.path.join(AQUI, "..", "video", "src", "musica.json")))["bpm"]
pares = [(abs((x - y) / (4 * P) - round((x - y) / (4 * P))), x, y) for x in bat if 38 < x < 44 for y in bat if 6 < y < 14]
erro, A, B = min(pares)
print(f"erro de fase {erro * 4:.3f} batida")
# ajuste fino: o rastreio de batida tem jitter; acha o B que mais parece com o que vem depois de A (envelope, 4 s)
mono = np.abs(a.mean(1))
env = np.convolve(mono, np.ones(256) / 256, "same")[::128]
esr = sr / 128
melhor = (-2, A, B)
for x in [b for b in bat if 34 < b < 45]:
    jan = env[int(x * esr): int((x + 4) * esr)]
    for i in range(int(5 * esr), int(22 * esr)):
        c = np.corrcoef(jan, env[i: i + len(jan)])[0, 1]
        if c > melhor[0]:
            melhor = (c, x, i / esr)
_, A, B = melhor
print(f"melhor emenda {A:.3f} -> {B:.3f} (correlação {melhor[0]:.2f}, {(A - B) / P:.2f} batidas)")
X = int(0.12 * sr)  # crossfade
ia, ib = int(A * sr), int(B * sr)
cauda, cabeca = a[ia - X // 2: ia + X // 2], a[ib - X // 2: ib + X // 2]
r = np.linspace(0, 1, len(cauda))[:, None]
eq = np.sqrt(r)  # potência constante
mix = cauda * np.sqrt(1 - r) + cabeca * eq
# a mesma emenda duas vezes (uma só não chega aos 74 s da entrevista)
out = np.concatenate([a[: ia - X // 2], mix, a[ib + X // 2: ia - X // 2], mix, a[ib + X // 2:]])
with wave.open(os.path.join(MID, "musica-longa.wav"), "wb") as w:
    w.setnchannels(ch); w.setsampwidth(sw); w.setframerate(sr)
    w.writeframes(np.clip(out, -32768, 32767).astype(np.int16).tobytes())
print(f"emenda em {A:.3f} s -> {B:.3f} s, nova duração {len(out) / sr:.2f} s")
# batidas no tempo novo (pro pulso da câmera)
L = A - B
novas = [b for b in bat if b < A] + [b - B + A for b in bat if B <= b < A] + [b - B + A + L for b in bat if b >= B]
json.dump({"bpm": json.load(open(os.path.join(AQUI, "..", "video", "src", "musica.json")))["bpm"], "batidas": novas},
          open(os.path.join(AQUI, "..", "video", "src", "musica-longa.json"), "w"))
