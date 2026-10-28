"""Mapa da música: energia a cada 0,5 s, batidas e tempo, pra escolher o trecho que entra no vídeo.
Uso: python analisar_musica.py <musica.wav> <saida.json>
"""
import json
import sys

import librosa
import numpy as np

y, sr = librosa.load(sys.argv[1], sr=22050, mono=True)
tempo, batidas = librosa.beat.beat_track(y=y, sr=sr)
tb = librosa.frames_to_time(batidas, sr=sr)
rms = librosa.feature.rms(y=y, hop_length=512)[0]
t = librosa.frames_to_time(np.arange(len(rms)), sr=sr, hop_length=512)
db = 20 * np.log10(np.maximum(rms, 1e-6))
on = librosa.onset.onset_strength(y=y, sr=sr)
picos = librosa.onset.onset_detect(onset_envelope=on, sr=sr, units="time")

linhas = []
for ini in np.arange(0, t[-1], 0.5):
    m = (t >= ini) & (t < ini + 0.5)
    linhas.append({"t": round(float(ini), 2), "db": round(float(db[m].mean()), 1)})
json.dump({"bpm": float(np.atleast_1d(tempo)[0]), "batidas": [round(float(x), 3) for x in tb], "energia": linhas,
           "ataques": [round(float(x), 3) for x in picos]}, open(sys.argv[2], "w"), indent=1)
print("bpm", np.atleast_1d(tempo)[0], "duração", round(len(y) / sr, 2))
print("batidas:", " ".join(f"{x:.2f}" for x in tb))
for l in linhas:
    print(f"{l['t']:5.1f} {l['db']:6.1f} " + "#" * int(max(0, l["db"] + 45)))
