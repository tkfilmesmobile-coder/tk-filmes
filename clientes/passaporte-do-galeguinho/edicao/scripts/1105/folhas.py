"""Folha de quadros de cada clipe, com o tempo escrito em cada quadro (OpenCV; o ffmpeg do CapCut não tem drawtext).
Uso: python folhas.py [passo_s] [clipe ...]   (padrão: 1 quadro a cada ~2 s, no máximo 30 por clipe; todos os clipes)
     python folhas.py 0.5 IMG_1329:12:30       (de 12 a 30 s do clipe, a cada 0,5 s)
Saída: analise/folhas/<clipe>[_<ini>-<fim>].jpg
"""
import os
import sys

import cv2
import numpy as np

AQUI = os.path.dirname(os.path.abspath(__file__))
BRUTO = os.path.join(AQUI, "bruto")
FOLHAS = os.path.join(AQUI, "analise", "folhas")
os.makedirs(FOLHAS, exist_ok=True)
COLS, LARG = 6, 200

passo_fixo = float(sys.argv[1]) if len(sys.argv) > 1 and sys.argv[1].replace(".", "").isdigit() else None
alvos = [a for a in sys.argv[1:] if a.startswith("IMG")] or sorted(os.path.splitext(f)[0] for f in os.listdir(BRUTO) if f.upper().endswith(".MOV"))

for alvo in alvos:
    nome, *faixa = alvo.split(":")
    cap = cv2.VideoCapture(os.path.join(BRUTO, nome + ".MOV"))
    fps = cap.get(cv2.CAP_PROP_FPS)
    dur = cap.get(cv2.CAP_PROP_FRAME_COUNT) / fps
    ini, fim = (float(faixa[0]), float(faixa[1])) if faixa else (0.0, dur)
    passo = passo_fixo or max(2.0, (fim - ini) / 30)
    tempos = list(np.arange(ini, fim - 0.05, passo))
    quadros = []
    for t in tempos:
        cap.set(cv2.CAP_PROP_POS_MSEC, t * 1000)
        ok, img = cap.read()
        if not ok:
            continue
        h, w = img.shape[:2]
        img = cv2.resize(img, (LARG, int(h * LARG / w)), interpolation=cv2.INTER_AREA)
        cv2.rectangle(img, (0, 0), (88, 24), (0, 0, 0), -1)
        cv2.putText(img, f"{t:6.1f}s", (2, 18), cv2.FONT_HERSHEY_SIMPLEX, 0.55, (0, 230, 255), 1, cv2.LINE_AA)
        quadros.append(img)
    if not quadros:
        print(nome, "sem quadros")
        continue
    h = quadros[0].shape[0]
    while len(quadros) % COLS:
        quadros.append(np.zeros((h, LARG, 3), np.uint8))
    linhas = [np.hstack(quadros[i:i + COLS]) for i in range(0, len(quadros), COLS)]
    sufixo = f"_{ini:g}-{fim:g}" if faixa else ""
    cv2.imwrite(os.path.join(FOLHAS, f"{nome}{sufixo}.jpg"), np.vstack(linhas), [cv2.IMWRITE_JPEG_QUALITY, 82])
    print(nome, f"{dur:.1f}s", len(tempos), "quadros", f"{w}x{h}")
