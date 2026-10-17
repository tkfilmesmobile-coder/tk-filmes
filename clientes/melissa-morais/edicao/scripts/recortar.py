# Recorta a pessoa do fundo e salva PNG com transparência, tudo local (GrabCut do OpenCV, sem enviar foto pra fora).
# Uso: python scripts/recortar.py   ->  public/recortes/<nome>.png
# Parede lisa: a cor da parede é medida linha a linha nas bordas da foto (ela escurece de cima pra baixo).
# Sala de atendimento (cafeteira, cuba, maca): o fundo vem de um polígono traçado pelo perfil do rosto.
import os
import cv2
import numpy as np

ORIGEM = "public/fotos"
DESTINO = "public/recortes"
PAREDE_LISA = [
    "antes-sobrancelha-levantada", "depois-sobrancelha-levantada",
    "antes-franzir", "depois-franzir",
    "depois-perfil-1", "depois-perfil-2",
    "giro-3.0", "giro-6.0", "giro-10.5",
]
# sombra de parede colada no cabelo que o GrabCut confunde: fundo certo (x0, y0, x1, y1 em fração da foto)
FUNDO_EXTRA = {
    "giro-6.0": [(0.0, 0.46, 0.17, 0.62)],
    "giro-3.0": [(0.0, 0.45, 0.09, 0.62)],
}
# polígono do fundo (px da foto original, 1200x1600): do topo, descendo pelo perfil (testa, nariz,
# boca, queixo, pescoço) até a linha do ombro
FUNDO_POLIGONO = {
    "perfil-clinica-a": [(0, 0), (1200, 0), (1200, 1240), (1000, 1215), (800, 1180), (675, 1175), (723, 1127),
                         (783, 1078), (807, 1006), (760, 915), (728, 866), (660, 830), (660, 780), (540, 735),
                         (480, 700), (400, 650), (250, 600), (100, 570), (0, 575)],
    "perfil-clinica-b": [(0, 0), (1200, 0), (1200, 1271), (950, 1230), (705, 1187), (717, 1139), (765, 1066),
                         (777, 994), (723, 930), (723, 886), (693, 843), (645, 819), (633, 783), (512, 759),
                         (482, 753), (404, 711), (187, 669), (100, 640), (0, 610)],
}


def finaliza(img, m_peq, nome):
    H, W = img.shape[:2]
    h, w = m_peq.shape
    m = m_peq
    # fica só o maior pedaço (a pessoa) e fecha buracos internos
    n, rot, stats, _ = cv2.connectedComponentsWithStats(m)
    if n > 1:
        maior = 1 + int(np.argmax(stats[1:, cv2.CC_STAT_AREA]))
        m = np.where(rot == maior, 255, 0).astype(np.uint8)
    m = cv2.morphologyEx(m, cv2.MORPH_CLOSE, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (7, 7)))
    n, rot, stats, _ = cv2.connectedComponentsWithStats(cv2.bitwise_not(m))
    for i in range(1, n):
        x, y, ww, hh, _a = stats[i]
        if x > 0 and y > 0 and x + ww < w and y + hh < h:
            m[rot == i] = 255
    alfa = cv2.resize(m, (W, H), interpolation=cv2.INTER_LINEAR)
    alfa = cv2.GaussianBlur(alfa, (0, 0), sigmaX=max(1.8, W / 700))
    rgba = cv2.cvtColor(img, cv2.COLOR_BGR2BGRA)
    rgba[:, :, 3] = alfa
    cv2.imwrite(f"{DESTINO}/{nome}.png", rgba)
    print(nome, f"{W}x{H}", "pessoa:", round(float((m > 0).mean()), 2))


def reduz(img):
    H, W = img.shape[:2]
    esc = 900 / max(H, W)
    return cv2.resize(img, (int(W * esc), int(H * esc)), interpolation=cv2.INTER_AREA), esc


os.makedirs(DESTINO, exist_ok=True)

for nome in PAREDE_LISA:
    img = cv2.imread(f"{ORIGEM}/{nome}.jpg")
    peq, _ = reduz(img)
    h, w = peq.shape[:2]
    lab = cv2.cvtColor(peq, cv2.COLOR_BGR2LAB).astype(np.float32)
    geral = np.median(lab[: int(h * 0.08)].reshape(-1, 3), axis=0)
    # cor da parede por linha, separada à esquerda e à direita (a luz bate diferente dos dois lados)
    def parede_por_linha(faixa):
        linhas = np.zeros((h, 3), np.float32)
        ult = geral
        for y in range(h):
            px = faixa[y]
            ok = px[np.linalg.norm(px - geral, axis=1) < 40]
            if len(ok) >= 3:
                ult = np.median(ok, axis=0)
            linhas[y] = ult
        return cv2.GaussianBlur(linhas.reshape(h, 1, 3), (1, 31), 0).reshape(h, 3)

    larg = max(3, int(w * 0.05))
    esq = parede_por_linha(lab[:, :larg])
    dir_ = parede_por_linha(lab[:, -larg:])
    dist = np.minimum(np.linalg.norm(lab - esq[:, None, :], axis=2), np.linalg.norm(lab - dir_[:, None, :], axis=2))

    mask = np.full((h, w), cv2.GC_PR_FGD, np.uint8)
    mask[dist < 16] = cv2.GC_PR_BGD
    mask[dist < 7] = cv2.GC_BGD
    mask[: int(h * 0.03)] = cv2.GC_BGD
    for (x0, y0, x1, y1) in FUNDO_EXTRA.get(nome, []):
        mask[int(y0 * h): int(y1 * h), int(x0 * w): int(x1 * w)] = cv2.GC_BGD
    mask[(dist > 45) & (mask != cv2.GC_BGD)] = cv2.GC_FGD
    bgd = np.zeros((1, 65), np.float64)
    fgd = np.zeros((1, 65), np.float64)
    cv2.grabCut(peq, mask, None, bgd, fgd, 6, cv2.GC_INIT_WITH_MASK)
    m = np.where((mask == cv2.GC_FGD) | (mask == cv2.GC_PR_FGD), 255, 0).astype(np.uint8)
    finaliza(img, m, nome)

for nome, poli in FUNDO_POLIGONO.items():
    img = cv2.imread(f"{ORIGEM}/{nome}.jpg")
    peq, esc = reduz(img)
    h, w = peq.shape[:2]
    fundo = np.zeros((h, w), np.uint8)
    cv2.fillPoly(fundo, [np.array([(int(x * esc), int(y * esc)) for x, y in poli], np.int32)], 255)
    # perto da linha traçada fica "provável", pro GrabCut acertar o contorno fino
    faixa = cv2.dilate(fundo, np.ones((15, 15), np.uint8)) - cv2.erode(fundo, np.ones((15, 15), np.uint8))
    mask = np.where(fundo > 0, cv2.GC_BGD, cv2.GC_FGD).astype(np.uint8)
    mask[(faixa > 0) & (fundo > 0)] = cv2.GC_PR_BGD
    mask[(faixa > 0) & (fundo == 0)] = cv2.GC_PR_FGD
    bgd = np.zeros((1, 65), np.float64)
    fgd = np.zeros((1, 65), np.float64)
    cv2.grabCut(peq, mask, None, bgd, fgd, 5, cv2.GC_INIT_WITH_MASK)
    m = np.where((mask == cv2.GC_FGD) | (mask == cv2.GC_PR_FGD), 255, 0).astype(np.uint8)
    finaliza(img, m, nome)
