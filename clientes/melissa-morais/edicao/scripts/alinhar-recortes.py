# Alinha os recortes que a Talyta fez no ChatGPT (fundo transparente) às fotos originais (pontos em comum, ORB),
# pra usar as mesmas medidas (olhos, setas). Os recortes entram como vieram, com os pixels do ChatGPT
# (decisão da Talyta, 2026-10-17, avisada de que o ChatGPT redesenha pele, linhas e cor).
# Uso: python scripts/alinhar-recortes.py  ->  public/recortes/<nome>.png
import cv2
import numpy as np

# recorte da Talyta -> fotos originais candidatas (fica a que casar melhor)
PARES = {
    "antes-sobrancelha-levantada.webp": ["antes-sobrancelha-levantada"],
    "depois-sobrancelha-levantada.webp": ["depois-sobrancelha-levantada"],
    "antes-franzir.webp": ["antes-franzir"],
    "depois-franzir.webp": ["depois-franzir"],
    "perfil-clinica-a.webp": ["perfil-clinica-a"],
    "perfil-clinica-b.webp": ["perfil-clinica-b"],
    "depois-perfil-1.webp": ["depois-perfil-1"],
    "repouso-1.png": ["antes-repouso", "depois-repouso"],
    "repouso-2.png": ["antes-repouso", "depois-repouso"],
}

orb = cv2.ORB_create(8000)
bf = cv2.BFMatcher(cv2.NORM_HAMMING, crossCheck=True)


def alinha(rec, ori):
    H, W = ori.shape[:2]
    e_o = 1400 / max(H, W)
    o_peq = cv2.resize(ori, None, fx=e_o, fy=e_o, interpolation=cv2.INTER_AREA)
    e_r = 1400 / max(rec.shape[:2])
    r_peq = cv2.resize(rec, None, fx=e_r, fy=e_r, interpolation=cv2.INTER_AREA)
    mask = (r_peq[:, :, 3] > 200).astype(np.uint8) * 255
    k1, d1 = orb.detectAndCompute(cv2.cvtColor(r_peq[:, :, :3], cv2.COLOR_BGR2GRAY), mask)
    k2, d2 = orb.detectAndCompute(cv2.cvtColor(o_peq, cv2.COLOR_BGR2GRAY), None)
    m = sorted(bf.match(d1, d2), key=lambda x: x.distance)[:1500]
    p1 = np.float32([k1[x.queryIdx].pt for x in m]) / e_r
    p2 = np.float32([k2[x.trainIdx].pt for x in m]) / e_o
    M, inl = cv2.estimateAffinePartial2D(p1, p2, method=cv2.RANSAC, ransacReprojThreshold=4.0, maxIters=5000)
    return M, int(inl.sum()) if inl is not None else 0, len(m)


for arq, candidatas in PARES.items():
    rec = cv2.imread(f"public/recortes-talyta/{arq}", cv2.IMREAD_UNCHANGED)
    melhor = None
    for nome in candidatas:
        ori = cv2.imread(f"public/fotos/{nome}.jpg")
        M, n_in, n = alinha(rec, ori)
        if melhor is None or n_in > melhor[2]:
            melhor = (nome, M, n_in, n, ori)
    nome, M, n_in, n, ori = melhor
    H, W = ori.shape[:2]
    rgba = cv2.warpAffine(rec, M, (W, H), flags=cv2.INTER_LANCZOS4, borderMode=cv2.BORDER_CONSTANT, borderValue=(0, 0, 0, 0))
    cv2.imwrite(f"public/recortes/{nome}.png", rgba)
    print(f"{arq} -> {nome}: pontos {n_in}/{n}")
