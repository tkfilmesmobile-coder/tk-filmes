"""Separa as duas vozes de uma gravação (a Dra. e quem dirige) pelo timbre.
Agrupa as palavras transcritas em frases (pausa > 0,5 s), extrai pitch e MFCC de cada frase e
divide em 2 grupos. Grava <saida.json> com as frases, o grupo e os tempos.
Uso: python scripts/vozes.py <wav16k> <palavras.json> <saida.json>
"""
import sys, json, wave
import numpy as np, librosa
from sklearn.cluster import KMeans

wav, pal, saida = sys.argv[1:4]
with wave.open(wav) as w:
    sr = w.getframerate()
    y = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32) / 32768.0
palavras = json.load(open(pal, encoding="utf-8"))

frases, atual = [], []
for p in palavras:
    if atual and p["startMs"] - atual[-1]["endMs"] > 500:
        frases.append(atual); atual = []
    atual.append(p)
if atual: frases.append(atual)

feats = []
for fr in frases:
    a, b = int(fr[0]["startMs"] / 1000 * sr), int(fr[-1]["endMs"] / 1000 * sr)
    seg = y[a:b]
    if len(seg) < sr // 4:
        seg = np.pad(seg, (0, sr // 4 - len(seg)))
    f0, vo, _ = librosa.pyin(seg, fmin=80, fmax=400, sr=sr)
    f0m = float(np.nanmedian(f0)) if np.any(~np.isnan(f0)) else 0.0
    mf = librosa.feature.mfcc(y=seg, sr=sr, n_mfcc=13).mean(axis=1)
    rms = float(librosa.feature.rms(y=seg).mean())
    feats.append(np.concatenate([[f0m / 50.0, rms * 40], mf[1:] / 20.0]))
X = np.array(feats)
lab = KMeans(n_clusters=2, n_init=10, random_state=0).fit_predict(X)
# grupo 0 = o que fala mais (a Dra.), por convenção
tempo = [sum(f[-1]["endMs"] - f[0]["startMs"] for f, l in zip(frases, lab) if l == k) for k in (0, 1)]
troca = tempo[1] > tempo[0]
out = []
for fr, l, ft in zip(frases, lab, feats):
    g = int(l) ^ int(troca)
    out.append({"de": fr[0]["startMs"] / 1000, "ate": fr[-1]["endMs"] / 1000, "grupo": g,
                "pitch": round(ft[0] * 50), "rms": round(ft[1] / 40, 4),
                "texto": " ".join(p["text"].strip() for p in fr)})
json.dump(out, open(saida, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
for o in out:
    print(f"{'DRA ' if o['grupo']==0 else 'OUTRA'} [{o['de']:6.2f}-{o['ate']:6.2f}] f0={o['pitch']:3d} rms={o['rms']:.3f}  {o['texto'][:90]}")
