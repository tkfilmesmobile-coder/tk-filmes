"""Escolhe os melhores frames de pessoa em vídeos (pra carrossel e capa): olhos abertos, boca fechada ou sorriso,
rosto de frente, imagem nítida. Usa o MediaPipe Face Landmarker (blendshapes) + nitidez (Laplaciano).
Regra da Talyta (2026-10-24 e 2026-10-30): nada de olho fechado, piscando, boca torta, borrado ou expressão estranha.
uso: python escolher-frames.py <saida_pasta> <video1> [video2 ...]
saída: <saida>/melhores.jpg (folha com os 12 melhores e a nota) e <saida>/melhor-NN.jpg em tamanho cheio
"""
import sys, os, cv2, numpy as np
import mediapipe as mp
from mediapipe.tasks import python as mpp
from mediapipe.tasks.python import vision
saida, videos = sys.argv[1], sys.argv[2:]
os.makedirs(saida, exist_ok=True)
modelo = os.path.join(os.path.dirname(os.path.abspath(__file__)), "face_landmarker.task")
det = vision.FaceLandmarker.create_from_options(vision.FaceLandmarkerOptions(
    base_options=mpp.BaseOptions(model_asset_path=modelo), output_face_blendshapes=True, num_faces=1))
cands = []
for v in videos:
    cap = cv2.VideoCapture(v); fps = cap.get(5) or 30; n = int(cap.get(7))
    passo = max(1, int(fps / 4))
    for i in range(0, n, passo):
        cap.set(1, i); ok, f = cap.read()
        if not ok: continue
        h, w = f.shape[:2]
        peq = cv2.resize(f, (w // 3, h // 3))
        r = det.detect(mp.Image(image_format=mp.ImageFormat.SRGB, data=cv2.cvtColor(peq, cv2.COLOR_BGR2RGB)))
        if not r.face_blendshapes: continue
        b = {c.category_name: c.score for c in r.face_blendshapes[0]}
        pis = max(b["eyeBlinkLeft"], b["eyeBlinkRight"])           # olho fechando
        semi = max(b["eyeSquintLeft"], b["eyeSquintRight"])        # olho apertado
        boca = b["jawOpen"]                                       # boca aberta (fala no meio)
        torta = abs(b["mouthSmileLeft"] - b["mouthSmileRight"]) + b["mouthPucker"] * 0.6 + max(b["mouthLeft"], b["mouthRight"])
        testa = b["browDownLeft"] * 0.5 + b["browDownRight"] * 0.5  # testa franzida
        sorriso = (b["mouthSmileLeft"] + b["mouthSmileRight"]) / 2
        lm = r.face_landmarks[0]
        # rosto de frente: nariz no meio dos olhos
        xs = [lm[33].x, lm[263].x]; nariz = lm[1].x
        frente = 1 - min(1, abs(nariz - (xs[0] + xs[1]) / 2) / max(1e-3, abs(xs[1] - xs[0])) * 3)
        # nitidez na região do rosto
        x0 = int(min(p.x for p in lm) * w); x1 = int(max(p.x for p in lm) * w); y0 = int(min(p.y for p in lm) * h); y1 = int(max(p.y for p in lm) * h)
        rosto = cv2.cvtColor(f[max(0, y0):y1, max(0, x0):x1], cv2.COLOR_BGR2GRAY)
        nit = cv2.Laplacian(rosto, cv2.CV_64F).var() if rosto.size else 0
        BOCA = float(os.environ.get("BOCA_MAX", "0.32"))
        if pis > 0.3 or boca > BOCA or torta > 0.5: continue
        larg = (max(p.x for p in lm) - min(p.x for p in lm))   # largura do rosto (0-1): pequeno = plano aberto
        nota = (1 - pis) * (1 - semi * 0.7) * (1 - boca) * (1 - testa * 0.8) * (0.6 + 0.4 * frente) * (1 + sorriso * 0.5) * min(1.0, nit / 120)
        if os.environ.get("PLANO") == "aberto": nota *= max(0.2, 1.4 - larg * 3.5)
        cands.append((nota, v, i / fps, f))
    print(os.path.basename(v), "ok", flush=True)
cands.sort(key=lambda c: -c[0])
escolhidos = []
for c in cands:  # um frame a cada 1,5 s no mínimo, pra variar
    if all(not (c[1] == e[1] and abs(c[2] - e[2]) < 1.5) for e in escolhidos): escolhidos.append(c)
    if len(escolhidos) == 12: break
ims = []
for k, (nota, v, t, f) in enumerate(escolhidos):
    cv2.imwrite(os.path.join(saida, f"melhor-{k + 1:02d}.jpg"), f, [cv2.IMWRITE_JPEG_QUALITY, 94])
    im = cv2.resize(f, (180, 320)); cv2.putText(im, f"{k + 1} {os.path.basename(v)[:8]} {t:.1f}s {nota:.2f}", (3, 314), 0, .32, (0, 255, 255), 1); ims.append(im)
while len(ims) % 6: ims.append(np.zeros((320, 180, 3), np.uint8))
cv2.imwrite(os.path.join(saida, "melhores.jpg"), np.vstack([np.hstack(ims[i:i + 6]) for i in range(0, len(ims), 6)]))
print(len(cands), "frames aprovados ·", len(escolhidos), "escolhidos")
