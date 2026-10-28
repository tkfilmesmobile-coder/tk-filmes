"""Ponta de cada dedo no "não é 1, 2, 3" (pedidos da Talyta, 2026-10-28: cada número em cima do SEU dedo,
acompanhando; no "2" aparecem o 1 e o 2 juntos, no "3" os três).
Pontos marcados à mão quadro a quadro (resolução cheia 1080x1920) em analise/dedos-a.jpg, dedos-b.jpg,
dedos-2.jpg e dedos-3.jpg. Pela continuidade: o dedo do "1" (indicador) é o da direita no "2" e o do meio
no "3"; o do "2" é o da esquerda; o do "3" é o que sobe à direita (a partir do quadro 472).
Interpola os quadros que faltam, suaviza leve e grava em ../video/src/rastreio.json ("dedo-1", "dedo-2", "dedo-3").
Uso: python dedos.py
"""
import json
import os

import numpy as np

AQUI = os.path.dirname(os.path.abspath(__file__))
ARQ = os.path.join(AQUI, "..", "video", "src", "rastreio.json")

PONTOS = {
    # indicador: sozinho no "1" (441–455), dedo da direita no "2" (456–468), dedo do meio no "3" (469–479)
    "dedo-1": {
        441: (300, 680), 444: (293, 619), 445: (293, 600), 446: (293, 547), 447: (280, 467), 448: (368, 299),
        449: (400, 261), 450: (413, 400), 451: (427, 533), 452: (427, 560), 453: (467, 560), 454: (467, 560), 455: (453, 573),
        456: (400, 387), 457: (387, 347), 458: (320, 347), 459: (240, 387), 461: (288, 296), 462: (320, 392),
        463: (360, 456), 465: (352, 520), 467: (352, 504), 468: (336, 488),
        469: (288, 496), 470: (232, 480), 471: (184, 420), 472: (160, 540), 474: (208, 576), 476: (248, 648),
        477: (264, 680), 479: (288, 600),
    },
    # 2º dedo: o da esquerda no "2" e no "3"
    "dedo-2": {
        460: (64, 336), 461: (72, 376), 462: (56, 384), 463: (40, 440), 465: (60, 505), 467: (88, 504), 468: (128, 424),
        469: (96, 432), 470: (64, 480), 471: (64, 424), 472: (64, 544), 474: (72, 584), 476: (136, 664),
        477: (144, 696), 479: (160, 616),
    },
    # 3º dedo: sobe à direita no "3"
    "dedo-3": {472: (376, 616), 474: (392, 632), 476: (420, 700), 477: (440, 744), 479: (400, 664)},
}


def suaviza(v, a=0.55):
    v = np.array(v, float); f = v.copy()
    for k in range(1, len(v)):
        f[k] = a * v[k] + (1 - a) * f[k - 1]
    b = f.copy()
    for k in range(len(v) - 2, -1, -1):
        b[k] = a * f[k] + (1 - a) * b[k + 1]
    return b


dados = json.load(open(ARQ))
for nome, pts in PONTOS.items():
    qs = sorted(pts)
    todos = np.arange(qs[0], qs[-1] + 1)
    xs = suaviza(np.interp(todos, qs, [pts[q][0] for q in qs]))
    ys = suaviza(np.interp(todos, qs, [pts[q][1] for q in qs]))
    dados["trechos"][nome] = {"de": int(qs[0]), "ate": int(qs[-1]), "x": [round(v, 1) for v in xs], "y": [round(v, 1) for v in ys]}
    print(nome, qs[0], "–", qs[-1], f"x {xs.min():.0f}–{xs.max():.0f}  y {ys.min():.0f}–{ys.max():.0f}")
json.dump(dados, open(ARQ, "w"), indent=1)
