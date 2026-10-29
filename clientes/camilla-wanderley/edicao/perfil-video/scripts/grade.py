"""Color grade fixo dos vídeos da Dra. Camilla (definido com a Talyta em 2026-10-23).

Duas etapas, sempre nesta ordem:
1. Correção por clipe: balanço de branco pelas áreas neutras (parede, jaleco claro, mesa) e exposição pelos
   realces, com limite pra não "corrigir" a cor de verdade da cena.
2. Look fixo da cliente (curva, cor, saturação, vinheta), igual em todos os vídeos.

Uso:
  python grade.py amostra <saida.jpg> <video:segundo> [...]     folha comparando os looks
  python grade.py clipe <look> <entrada.mp4> <saida.mp4>          aplica no vídeo inteiro
  python grade.py cube <look> <saida.cube>                         exporta o look (sem a correção por clipe)
"""
import os, subprocess, sys
import numpy as np
import cv2

cv2.setNumThreads(2)  # vários clipes rodam em paralelo, cada um num processo
AQUI = os.path.dirname(os.path.abspath(__file__))
BIN = os.path.join(AQUI, "..", "node_modules", "@remotion", "compositor-win32-x64-msvc")
FF = os.path.join(BIN, "ffmpeg.exe")

# --- looks: parâmetros simples, legíveis -------------------------------------------------------------
LOOKS = {
    # A · natural limpo: só o necessário pra parecer profissional
    "A": dict(contraste=0.14, levanta_sombra=0.01, quente=0.00, tinta_rose=0.00, sat=1.08, pele=0.0, vinheta=0.08, rolloff=1.2),
    # B · clínica premium: mais quente, contraste de cinema, sombras macias, realce da pele segurado
    "B": dict(contraste=0.30, levanta_sombra=0.035, quente=0.045, tinta_rose=0.00, sat=0.96, pele=0.06, vinheta=0.20, rolloff=2.0),
    # C · editorial rosé: a marca dela (vinho/nude) nos realces, contraste baixo, preto lavado (matte)
    "C": dict(contraste=0.10, levanta_sombra=0.07, quente=0.02, tinta_rose=0.05, sat=0.88, pele=0.04, vinheta=0.14, rolloff=1.8),
    # CAMILLA · o look fixo da cliente (escolhido em 2026-10-23, "com mais personalidade"): quente com contraste
    # de cinema, pele valorizada, rosé da marca nos realces e sombra puxando de leve pro vinho
    "CAMILLA_QUENTE": dict(contraste=0.26, levanta_sombra=0.03, quente=0.03, tinta_rose=0.03, sat=1.03, pele=0.07, vinheta=0.18,
                           rolloff=2.0, sombra_vinho=0.018),  # 1ª tentativa (recusada: a Talyta mandou referências claras)
    # CAMILLA · look fixo (2026-10-23, pelas referências da Talyta no Cosmos; a favorita é a da @mvocadental):
    # clínica clara e limpa, branco neutro, cor contida, contraste macio, realce sem estourar, pele um pouco mais
    # quente que o fundo (a saturação da pele é protegida pela máscara do rosto em cmd_clipe/amostra)
    # v2 (2026-10-23, "estourado e com pouco contraste", sobretudo na Robervânia): mais contraste, preto mais
    # firme, realce mais segurado e exposição também pelo rosto (ver correcao_clipe)
    "CAMILLA": dict(contraste=0.15, levanta_sombra=0.0, quente=-0.012, tinta_rose=0.0, sat=0.76, pele=0.0, vinheta=0.0,
                    rolloff=3.2, alvo_branco=0.94),
    "CAMILLA_PELE": dict(contraste=0.15, levanta_sombra=0.0, quente=0.010, tinta_rose=0.0, sat=0.87, pele=0.02, vinheta=0.0,
                         rolloff=3.2, alvo_branco=0.94),
}


def lum(x):
    return x[..., 0] * 0.0722 + x[..., 1] * 0.7152 + x[..., 2] * 0.2126  # BGR


def correcao_clipe(amostras, alvo_branco=0.9):
    """Ganhos BGR e exposição a partir de quadros de amostra (float 0..1, BGR)."""
    px = np.concatenate([a.reshape(-1, 3) for a in amostras])
    L = lum(px)
    mx, mn = px.max(axis=1), px.min(axis=1)
    sat = (mx - mn) / (mx + 1e-6)
    # só o que é branco/cinza de verdade (roupa azul-clarinha, como a da Robervânia, não conta como branco)
    neutros = px[(sat < 0.06) & (L > 0.5) & (L < 0.97)]
    if len(neutros) < 2000:
        ganho = np.ones(3, np.float32)
    else:
        media = neutros.mean(axis=0)
        ganho = np.clip(media.mean() / (media + 1e-6), 0.94, 1.06)  # corrige dominante leve, não muda a cena
    p97 = np.percentile(L, 97)
    expo = float(np.clip(alvo_branco / (p97 + 1e-6), 0.85, 1.3))
    if p97 > 0.78:  # clipe que já está claro não sobe (sobe só o que veio escuro)
        expo = min(expo, 1.0)
    # exposição pelo rosto: pele clara demais (câmera "queimou" o rosto) desce até um tom natural
    lums = []
    for a in amostras:
        for cx, cy, fw in rostos_q((a * 255).astype(np.uint8)):
            x0, x1 = int(cx - fw * 0.25), int(cx + fw * 0.25)
            y0, y1 = int(cy - fw * 0.15), int(cy + fw * 0.25)
            reg = a[max(0, y0):y1, max(0, x0):x1]
            if reg.size:
                lums.append(float(np.median(lum(reg * ganho))))
    if lums:
        rosto = float(np.median(lums))
        expo = min(expo, float(np.clip(0.60 / (rosto + 1e-6), 0.72, 1.3)))
    return ganho.astype(np.float32), expo


def curva(x, contraste, levanta, rolloff):
    # S suave em torno de 0,45, sombra levantada (sem preto chapado) e realce que dobra macio (sem estourar)
    s = x + contraste * (x - 0.45) * (1 - np.abs(2 * x - 0.9).clip(0, 1)) * 1.6
    s = levanta + (1 - levanta) * s
    k = 0.82
    acima = s > k
    s[acima] = k + (1 - k) * (1 - np.exp(-(s[acima] - k) / (1 - k) * (1 + rolloff))) / (1 - np.exp(-(1 + rolloff)))
    return s.clip(0, 1)


def look(img, p, ganho=None, expo=1.0):
    x = img.astype(np.float32) / 255
    if ganho is not None:
        x = x * ganho * expo
    x = x.clip(0, 1)
    # cor: quente (azul↓ vermelho↑) e rosé nos realces
    L = lum(x)[..., None]
    x[..., 2] += p["quente"]; x[..., 0] -= p["quente"]
    x[..., 2] += p["tinta_rose"] * L[..., 0]; x[..., 0] += p["tinta_rose"] * 0.5 * L[..., 0]; x[..., 1] -= p["tinta_rose"] * 0.6 * L[..., 0]
    x = x.clip(0, 1)
    x = curva(x, p["contraste"], p["levanta_sombra"], p["rolloff"])
    if p.get("sombra_vinho"):  # split-tone: sombras levemente vinho (R+, G-), realces intocados
        sombra = (1 - lum(x)) ** 2.2
        x[..., 2] += p["sombra_vinho"] * sombra
        x[..., 1] -= p["sombra_vinho"] * 0.8 * sombra
        x[..., 0] += p["sombra_vinho"] * 0.25 * sombra
        x = x.clip(0, 1)
    # saturação, protegendo a pele (tons laranja ganham um pouco de calor)
    L = lum(x)[..., None]
    x = L + (x - L) * p["sat"]
    if p["pele"]:
        b, g, r = x[..., 0], x[..., 1], x[..., 2]
        pele = ((r > g) & (g > b) & ((r - b) > 0.08)).astype(np.float32)
        x[..., 2] += p["pele"] * 0.5 * pele * (r - b)
    # vinheta suave
    h, w = x.shape[:2]
    yy, xx = np.mgrid[0:h, 0:w]
    d = np.sqrt(((xx - w / 2) / (w / 2)) ** 2 + ((yy - h * 0.45) / (h * 0.6)) ** 2)
    x *= (1 - p["vinheta"] * np.clip(d - 0.55, 0, 1) ** 1.6)[..., None]
    return (x.clip(0, 1) * 255 + 0.5).astype(np.uint8)


# --- luz esculpida (referência da Talyta em 2026-10-23: "Light Sculpting in Post", Greyscale Labs) -----------
# O rosto (e o colo) ganham uma luz quente e direcionada; o resto da cena desce, e a pessoa descola do fundo.
ESCULPE = dict(fundo=0.86, key=0.06, quente=0.0, lado=-0.35, alcance_x=2.6, alcance_y=3.4)  # separação leve, sem escurecer a clínica
_det = None


def rostos_q(img):
    """Rostos num quadro (detecção em 270x480). Devolve [(cx, cy, largura)] em pixels do quadro."""
    global _det
    import os as _os
    h, w = img.shape[:2]
    if _det is None:
        _det = cv2.FaceDetectorYN.create(_os.path.join(_os.environ["LOCALAPPDATA"], "Programs", "modelos", "yunet.onnx"),
                                         "", (270, 480), 0.6, 0.3, 5000)
    _det.setInputSize((270, 480))
    _, f = _det.detect(cv2.resize(img, (270, 480)))
    if f is None:
        return []
    sx, sy = w / 270, h / 480
    return [((x + fw / 2) * sx, (y + fh / 2) * sy, fw * sx) for x, y, fw, fh in f[:, :4] if fw * sx > 40]


def mascara_luz(h, w, faces, p=ESCULPE):
    """Máscara 0..1 (1 = luz no rosto), calculada em 1/4 da resolução e ampliada."""
    hq, wq = h // 4, w // 4
    if not faces:
        yy, xx = np.mgrid[0:hq, 0:wq].astype(np.float32)
        d = ((xx - wq / 2) / (wq * 0.75)) ** 2 + ((yy - hq * 0.42) / (hq * 0.7)) ** 2
        m = np.exp(-d)
    else:
        yy, xx = np.mgrid[0:hq, 0:wq].astype(np.float32)
        m = np.zeros((hq, wq), np.float32)
        for cx, cy, fw in faces:
            cx, cy, fw = cx / 4, cy / 4, fw / 4
            # elipse do rosto ao colo, deslocada pro lado da luz principal (lado < 0 = luz vindo da esquerda)
            ox = cx + p["lado"] * fw * 0.35
            oy = cy + fw * 0.9
            d = ((xx - ox) / (fw * p["alcance_x"])) ** 2 + ((yy - oy) / (fw * p["alcance_y"])) ** 2
            m = np.maximum(m, np.exp(-d))
    m = cv2.GaussianBlur(m, (0, 0), 6)
    return cv2.resize(m, (w, h), interpolation=cv2.INTER_LINEAR)[..., None]


def esculpe(out_u8, m, p=ESCULPE):
    """Aplica a luz: fundo cai pra 'fundo', a área da máscara ganha 'key' de brilho com calor."""
    x = out_u8.astype(np.float32)
    ganho = p["fundo"] + (1 - p["fundo"]) * m + p["key"] * m * m
    x *= ganho
    x[..., 2] *= 1 + p["quente"] * m[..., 0]
    x[..., 0] *= 1 - p["quente"] * m[..., 0]
    return np.clip(x, 0, 255).astype(np.uint8)


def grade_quadro(img, ganho, expo, faces):
    """Look completo num quadro: fundo com o look contido, pele com saturação protegida, separação leve."""
    h, w = img.shape[:2]
    m = mascara_pele(h, w, faces)
    a = look(img, LOOKS["CAMILLA"], ganho, expo).astype(np.float32)
    b = look(img, LOOKS["CAMILLA_PELE"], ganho, expo).astype(np.float32)
    mix = (a * (1 - m) + b * m).astype(np.uint8)
    return esculpe(mix, mascara_luz(h, w, faces))


def mascara_pele(h, w, faces):
    """Rosto e pescoço (mais justo que a máscara de luz)."""
    if not faces:
        return np.zeros((h, w, 1), np.float32)
    return mascara_luz(h, w, faces, dict(ESCULPE, alcance_x=1.1, alcance_y=1.6, lado=0.0)) ** 0.7


def quadro(video, seg):
    cap = cv2.VideoCapture(video)
    cap.set(cv2.CAP_PROP_POS_MSEC, seg * 1000)
    ok, img = cap.read()
    cap.release()
    return img


def amostras_clipe(video, n=8):
    cap = cv2.VideoCapture(video)
    total = cap.get(cv2.CAP_PROP_FRAME_COUNT)
    out = []
    for i in range(n):
        cap.set(cv2.CAP_PROP_POS_FRAMES, int(total * (i + 0.5) / n))
        ok, img = cap.read()
        if ok:
            out.append(cv2.resize(img, (540, 960)).astype(np.float32) / 255)
    cap.release()
    return out


def cmd_amostra(saida, pares):
    linhas = []
    for par in pares:
        video, seg = par.rsplit(":", 1)
        img = quadro(video, float(seg))
        ganho, expo = correcao_clipe(amostras_clipe(video), LOOKS["CAMILLA"]["alvo_branco"])
        faces = rostos_q(img)
        sx = 360 / img.shape[1]
        img = cv2.resize(img, (360, 640))
        faces = [(cx * sx, cy * sx, fw * sx) for cx, cy, fw in faces]
        cols = [img, grade_quadro(img, ganho, expo, faces)]
        linhas.append(np.hstack([np.pad(c, ((0, 0), (0, 8), (0, 0)), constant_values=255) for c in cols]))
    g = np.vstack([np.pad(l, ((0, 8), (0, 0), (0, 0)), constant_values=255) for l in linhas])
    topo = np.full((44, g.shape[1], 3), 255, np.uint8)
    for i, t in enumerate(["ORIGINAL", "LOOK CAMILLA"]):
        cv2.putText(topo, t, (10 + i * 368, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (40, 40, 40), 2, cv2.LINE_AA)
    cv2.imwrite(saida, np.vstack([topo, g]), [cv2.IMWRITE_JPEG_QUALITY, 90])


def lut_clipe(k, ganho, expo, n=128):
    """Tabela 3D (n³) com a correção do clipe + o look, sem vinheta. Índice: (b>>s)*n*n + (g>>s)*n + (r>>s)."""
    v = (np.arange(n) * (255 / (n - 1))).astype(np.float32)
    bb, gg, rr = np.meshgrid(v, v, v, indexing="ij")
    img = np.stack([bb, gg, rr], axis=-1).reshape(1, -1, 3).astype(np.uint8)
    p = dict(LOOKS[k]); p["vinheta"] = 0
    return look(img, p, ganho, expo).reshape(-1, 3)


def cmd_clipe(k, entrada, saida, de=0.0, ate=None):
    """Aplica correção + look via LUT 3D (rápido) e a vinheta por máscara; grava AVI MJPEG temporário e
    recodifica em MP4 com o som original (o ffmpeg do Remotion não aceita vídeo cru por stdin)."""
    import tempfile
    ganho, expo = correcao_clipe(amostras_clipe(entrada), LOOKS["CAMILLA"]["alvo_branco"])
    n, s = 128, 1
    lut_a = lut_clipe("CAMILLA", ganho, expo, n).astype(np.float32)
    lut_b = lut_clipe("CAMILLA_PELE", ganho, expo, n).astype(np.float32)
    cap = cv2.VideoCapture(entrada)
    fps = cap.get(cv2.CAP_PROP_FPS)
    w, h = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH)), int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    tmp = os.path.join(tempfile.gettempdir(), os.path.basename(saida) + ".avi")
    wr = cv2.VideoWriter(tmp, cv2.VideoWriter_fourcc(*"MJPG"), fps, (w, h))
    wr.set(cv2.VIDEOWRITER_PROP_QUALITY, 97)
    faces, f = [], 0
    # só a janela pedida (os trechos que entram na montagem): começa em "de" e para em "ate"
    if de > 0:
        cap.set(cv2.CAP_PROP_POS_MSEC, de * 1000)
    total = int(round(((ate if ate is not None else 1e9) - de) * fps))
    while f < total:
        ok, img = cap.read()
        if not ok:
            break
        if f % 3 == 0:  # rosto a cada 3 quadros, suavizado contra o anterior
            novos = rostos_q(img)
            if faces and novos and len(novos) == len(faces):
                faces = [tuple(0.6 * np.array(a) + 0.4 * np.array(b)) for a, b in zip(sorted(faces), sorted(novos))]
            else:
                faces = novos
        f += 1
        i = (img[..., 0].astype(np.int32) >> s) * n * n + (img[..., 1].astype(np.int32) >> s) * n + (img[..., 2].astype(np.int32) >> s)
        m = mascara_pele(h, w, faces)
        mix = (lut_a[i] * (1 - m) + lut_b[i] * m).astype(np.uint8)
        wr.write(esculpe(mix, mascara_luz(h, w, faces)))
    wr.release(); cap.release()
    subprocess.run([FF, "-v", "error", "-y", "-i", tmp, "-c:v", "h264_nvenc", "-preset", "p5", "-cq", "18", "-b:v", "0",
                    "-pix_fmt", "yuv420p", "-movflags", "+faststart", saida], check=True)  # sem som: a voz vem do voz.wav
    os.remove(tmp)


def cmd_cube(k, saida, n=33):
    r = np.linspace(0, 1, n)
    linhas = [f"TITLE \"Camilla Wanderley look {k}\"", f"LUT_3D_SIZE {n}"]
    bb, gg, rr = np.meshgrid(r, r, r, indexing="ij")  # .cube: R varia mais rápido
    grade = np.stack([bb, gg, rr], axis=-1).reshape(1, -1, 3)
    p = dict(LOOKS[k]); p["vinheta"] = 0  # vinheta não cabe num LUT
    out = look((grade * 255).astype(np.uint8), p).reshape(-1, 3).astype(np.float32) / 255
    for b_, g_, r_ in out:
        linhas.append(f"{r_:.5f} {g_:.5f} {b_:.5f}")
    open(saida, "w").write("\n".join(linhas) + "\n")


if __name__ == "__main__":
    a = sys.argv[1:]
    if a[0] == "amostra":
        cmd_amostra(a[1], a[2:])
    elif a[0] == "clipe":
        cmd_clipe(a[1], a[2], a[3], float(a[4]) if len(a) > 4 else 0.0, float(a[5]) if len(a) > 5 else None)
    elif a[0] == "cube":
        cmd_cube(a[1], a[2])
