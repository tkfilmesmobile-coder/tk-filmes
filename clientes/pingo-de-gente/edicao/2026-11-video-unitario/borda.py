"""Borda da silhueta dela por altura, quadro a quadro, nas cenas de corrida (lê a transparência dos recortes).
Pra linha de velocidade nascer colada nas costas dela, e não no meio do nada.
Saída: acrescenta "bordas" em ../video/src/corpo.json: {quadro: [[y, xmin, xmax] x 8 alturas]}
"""
import json
import os
import subprocess

import numpy as np

AQUI = os.path.dirname(os.path.abspath(__file__))
REC = os.path.join(AQUI, "..", "video", "public", "midia", "recorte")
JSON = os.path.join(AQUI, "..", "video", "src", "corpo.json")
FF = os.path.join(os.environ["LOCALAPPDATA"], "CapCut", "Apps", "9.6.0.4097", "ffmpeg.exe")
FPS, W, H = 24, 1080, 1920
# Talyta (2026-11-04): efeito de corrida só no balanço (quando ela pula e sai correndo) e na corrida do meio
CENAS = [("balanco", 0.0), ("corrida", 16.667)]
FRACOES = [0.14, 0.24, 0.34, 0.44, 0.54, 0.64, 0.74, 0.84]

corpo = json.load(open(JSON))
bordas = corpo.get("bordas", {})
for nome, de in CENAS:
    p = subprocess.run([FF, "-v", "error", "-i", os.path.join(REC, f"{nome}.mov"), "-vf", "alphaextract", "-f", "rawvideo", "-pix_fmt", "gray", "-"],
                       capture_output=True, check=True)
    quadros = np.frombuffer(p.stdout, np.uint8).reshape(-1, H, W)
    f0 = round(de * FPS)
    for k, a in enumerate(quadros):
        ys, xs = np.where(a[::4, ::4] > 128)
        if len(xs) < 100:
            continue
        y0, y1 = ys.min() * 4, ys.max() * 4
        linhas = []
        for fr in FRACOES:
            y = int(y0 + (y1 - y0) * fr)
            faixa = a[max(0, y - 12):y + 12]
            cx = np.where(faixa.max(0) > 128)[0]
            if len(cx):
                linhas.append([y, int(cx.min()), int(cx.max())])
        bordas[str(f0 + k)] = linhas
    print(nome, len(quadros), "quadros")
corpo["bordas"] = bordas
json.dump(corpo, open(JSON, "w"))
