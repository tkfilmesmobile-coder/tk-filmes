"""Reel "Meu dia de princesa" (trend da Rapunzel) da Marielly Makeup. Montado em 2026-10-27.

Referência: instagram.com/reel/DV4Lc5BkfGp (36,27 s, 30 fps). A Talyta mandou o arquivo dela
(brutos/referencia/referencia-trend.mp4, baixado por ela): dele saem os 3 trechos do Pascal e o áudio da trend.
Os cortes caem no mesmo quadro da referência, então o áudio casa sem ajuste:
  0 a 24,97 s      noiva de roupão pondo colar, brincos e tiara (Pascal em 7,0–8,3 e 14,43–15,6 s)
  24,97 s          corte seco pra noiva de vestido (a revelação)
  30,7–32,33 s     Pascal reagindo
  32,33–36,1 s     entrada com o pai; 36,1–36,27 s preto, como na referência
v1 (2026-10-27, sem Pascal nem áudio, closes no rosto no lugar) ficou em out/ com o nome antigo.

O vídeo do roupão é HDR (HLG) do iPhone: aqui ele vira SDR (BT.709) e ganha pele mais quente.
Os vídeos de vestido já chegam editados e em SDR (WhatsApp): entram sem mexer na cor.

Uso:
  python montar.py amostra     quadros de teste da cor em out/amostra-*.jpg
  python montar.py render      vídeo final em out/
"""
import os, subprocess, sys
import numpy as np

AQUI = os.path.dirname(os.path.abspath(__file__))
BRUTOS = os.path.join(AQUI, "brutos")
OUT = os.path.join(AQUI, "out")
FF = os.path.expandvars(r"%LOCALAPPDATA%\CapCut\Apps\9.6.0.4097\ffmpeg.exe")  # tem h264_nvenc
W, H, FPS = 1080, 1920, 30

ROUPAO, V1, V2 = "roupao-acessorios.MOV", "vestido-1.mp4", "vestido-2.mp4"
REF, PRETO = "referencia/referencia-trend.mp4", None
AUDIO_REF = os.path.join(BRUTOS, REF)
TOTAL_QUADROS = 1088  # 36,27 s, igual à referência

# (arquivo, de, até, QUADROS na timeline, recorte x,y,w,h no quadro já em pé ou None)
# Roupão em câmera lenta bem leve (~0,92); o Pascal esconde os pulos de 6,6→7,0 s e 12,6→13,2 s do bruto.
CLOSE1 = (150, 250, 636, 1130)   # (v1) rosto + colar
CLOSE2 = (130, 290, 636, 1130)   # (v1) rosto + brinco
VERT_V1 = (84, 0, 324, 576)      # 464x576 -> 9:16, noiva no centro, pai à esquerda
# v3: o 1º Pascal entra quando ela termina de virar o rosto e olha pra baixo, de lado (bruto 4,30 s), na batida
# de 4,70 s; na volta ela continua do mesmo quadro. O roupão não pula mais nada (velocidade 0,92 a 0,99).
CORTES = [
    (ROUPAO, 0.00, 4.30, 141, None),      # 0,00  colar; vira o rosto e olha
    (REF, 7.00, 8.30, 39, None),          # 4,70  Pascal 1 (quadros 210–248 da referência)
    (ROUPAO, 4.30, 12.61, 253, None),     # 6,00  continua do olhar; brincos
    (REF, 14.4333, 15.60, 35, None),      # 14,43 Pascal 2 (quadros 433–467)
    (ROUPAO, 12.61, 21.85, 281, None),    # 15,60 acessórios e tiara (+ magia nos últimos quadros)
    (V2, 0.00, 2.85, 86, None),           # 24,97 REVELAÇÃO: sorrindo no carro (o clarão do vídeo dela começa em 2,87 s)
    (V2, 5.13, 6.97, 55, None),           # 27,83 sorriso de lado
    (V2, 7.03, 8.07, 31, None),           # 29,67 buquê sobre o vestido
    (REF, 30.70, 32.3333, 49, None),      # 30,70 Pascal 3 (quadros 921–969)
    (V1, 0.50, 4.27, 113, VERT_V1),       # 32,33 entrada com o pai
    (PRETO, 0, 0, 5, None),               # 36,10 preto até 36,27
]

# ---------------- cor do roupão: HLG (BT.2020) -> SDR (BT.709) + look ----------------
A, B, C = 0.17883277, 0.28466892, 0.55991073
_s = np.arange(65536, dtype=np.float64) / 65535.0
_hlg_inv = np.where(_s <= 0.5, _s * _s / 3.0, (np.exp((_s - C) / A) + B) / 12.0).astype(np.float32)
M2020_709 = np.array([[1.6605, -0.5876, -0.0728],
                      [-0.1246, 1.1329, -0.0083],
                      [-0.0182, -0.1006, 1.1187]], np.float32)

LOOK = dict(
    expo=0.50,                      # o HLG do iPhone vem forte: com 1,0 a pele e o roupão estouram
    quente=(1.03, 1.00, 0.95),      # ganho R,G,B em luz linear: tira o azul da cortina sem amarelar a pele
    sat=1.05,
    contraste=0.12,                 # curva em S suave
    rolloff=0.80,                   # a partir daqui o branco do roupão comprime em vez de estourar
)


def _curva_final(n=4096, p=LOOK):
    x = np.linspace(0, 2.0, n, dtype=np.float32)          # luz linear (1,0 = branco de referência)
    k = p["rolloff"]
    y = np.where(x <= k, x, k + (1 - k) * (1 - np.exp(-(x - k) / (1 - k))))  # ombro suave até 1,0
    v = np.clip(y, 0, 1) ** (1 / 2.4)                       # BT.1886
    v = v + p["contraste"] * (v - 0.5) * (1 - np.abs(2 * v - 1))  # S suave, pontas presas
    return np.clip(v, 0, 1).astype(np.float32)


_CURVA = _curva_final()


# v3 (2026-10-27, "color grade muito ruim"): a v1/v2 estourava o rosto (no bruto o rosto é mais claro que o
# roupão branco, sinal HLG ~0,9) e deixava pele amarela e roupão rosado, porque a curva era por canal.
# Agora: luz comprimida pela luminância (não muda a cor), ombro largo pro rosto, balanço puxado pro neutro,
# amarelo da pele contido, sombra levemente aberta (look claro como o da referência).
LOOK3 = dict(expo=1.30, ombro=0.42, branco=(0.96, 1.0, 1.08), sat=0.92, amarelo=0.75, matiz=-5.0,
             levanta=0.04, contraste=0.12, gama=2.2)  # o do meio de 3 testados (out/teste-rosto.jpg)
import cv2  # noqa: E402


def cor_hlg3(rgb16, p=None):
    p = p or LOOK3
    e = _hlg_inv[rgb16] @ M2020_709.T                     # luz de cena em BT.709
    e = np.maximum(e, 0) * np.array(p["branco"], np.float32)
    y = 0.2126 * e[..., 0] + 0.7152 * e[..., 1] + 0.0722 * e[..., 2]
    yd = y * p["expo"]
    k = p["ombro"]
    yt = np.where(yd <= k, yd, k + (1 - k) * (1 - np.exp(-(yd - k) / (1 - k))))
    d = e * (yt / np.maximum(y, 1e-6))[..., None]
    # saturação geral em volta da luminância e, se algum canal passar de 1, perde cor em vez de mudar de matiz
    d = yt[..., None] + (d - yt[..., None]) * p["sat"]
    mx = d.max(-1, keepdims=True)
    over = np.clip((mx - 1) / np.maximum(mx - yt[..., None], 1e-6), 0, 1)
    d = d + (yt[..., None] - d) * over
    v = np.clip(d, 0, 1) ** (1 / p["gama"])
    # pele: segura o amarelo (matiz 25–60°) e puxa de leve pro rosado
    hsv = cv2.cvtColor(v.astype(np.float32), cv2.COLOR_RGB2HSV)
    h = hsv[..., 0]
    peso = np.clip(1 - np.abs(h - 40) / 25, 0, 1)
    hsv[..., 1] *= 1 - (1 - p["amarelo"]) * peso
    hsv[..., 0] = (h + p["matiz"] * peso) % 360
    v = cv2.cvtColor(hsv, cv2.COLOR_HSV2RGB)
    v = v + p["contraste"] * (v - 0.5) * (1 - np.abs(2 * v - 1))
    v = p["levanta"] + (1 - p["levanta"]) * v
    return (np.clip(v, 0, 1) * 255 + 0.5).astype(np.uint8)


def cor_hlg(rgb16):  # v1/v2, mantida só pra comparar
    e = _hlg_inv[rgb16]                                     # luz de cena, 0..1
    ys = 0.2627 * e[..., 0] + 0.6780 * e[..., 1] + 0.0593 * e[..., 2]
    d = e * (np.power(np.maximum(ys, 1e-6), 0.2) * (1000 / 203))[..., None]  # OOTF; 203 nits = branco SDR
    d = d @ M2020_709.T
    d = np.maximum(d, 0) * LOOK["expo"] * np.array(LOOK["quente"], np.float32)
    lum = (0.2126 * d[..., 0] + 0.7152 * d[..., 1] + 0.0722 * d[..., 2])[..., None]
    d = np.maximum(lum + (d - lum) * LOOK["sat"], 0)
    idx = np.clip(d * (4095 / 2.0), 0, 4095).astype(np.int32)
    return (_CURVA[idx] * 255 + 0.5).astype(np.uint8)


# ---------------- leitura dos trechos ----------------
def frames_do_trecho(arq, de, ate, n, rec):
    if arq is PRETO:
        for _ in range(n):
            yield np.zeros((H, W, 3), np.uint8)
        return
    hdr = arq == ROUPAO
    vel = (ate - de) / (n / FPS)
    vf = []
    if rec:
        x, y, w, h = rec
        vf.append(f"crop={w}:{h}:{x}:{y}")
    mat = "bt2020" if hdr else "bt709"
    if arq == REF:  # referência: corte pelo número do quadro (pelo tempo vazava 1 quadro da outra noiva)
        vf.insert(0, f"trim=start_frame={round(de * FPS)}:end_frame={round(ate * FPS)},setpts=PTS-STARTPTS")
        busca = []
    else:
        busca = ["-ss", f"{de:.3f}", "-t", f"{ate - de:.3f}"]
    vf.append(f"scale={W}:{H}:flags=lanczos:in_color_matrix={mat}:in_range=tv:out_range=pc")
    if arq != REF:
        vf.append(f"setpts=(PTS-STARTPTS)/{vel:.6f}")
        vf.append(f"fps={FPS}")
    pix, bpp, dt = ("rgb48le", 6, np.uint16) if hdr else ("rgb24", 3, np.uint8)
    cmd = [FF, "-v", "error", *busca, "-i", os.path.join(BRUTOS, arq),
           "-vf", ",".join(vf), "-frames:v", str(n), "-f", "rawvideo", "-pix_fmt", pix, "-"]
    p = subprocess.Popen(cmd, stdout=subprocess.PIPE)
    tam = W * H * bpp
    ultimo = None
    for _ in range(n):
        buf = p.stdout.read(tam)
        if len(buf) == tam:
            q = np.frombuffer(buf, dt).reshape(H, W, 3)
            ultimo = cor_hlg3(q) if hdr else q
        yield ultimo  # se o trecho acabar antes, repete o último quadro
    p.stdout.close()
    p.wait()


# ---------------- magia na revelação (pedido da Talyta em 2026-10-27) ----------------
# Antes do corte: brilhos nascem na tiara e giram em espiral, a imagem clareia e aproxima de leve.
# No corte: clarão branco-dourado (esconde a troca). Depois: os brilhos se abrem em volta dela de noiva e caem.
CORTE_MAGIA = 749                 # 24,97 s, quadro da revelação
ANTES, DEPOIS = 36, 30            # quadros de efeito antes e depois do corte
CABECA_ROUPAO = (480, 470)        # tiara no fim do roupão (x, y no 1080x1920)
ROSTO_NOIVA = (530, 930)          # rosto dela no carro
CORES = np.array([(1.0, 0.86, 0.55), (1.0, 0.97, 0.90), (1.0, 0.80, 0.88), (0.95, 0.92, 1.0)], np.float32)


def _particulas(n=650, seed=7):
    r = np.random.default_rng(seed)
    p = dict(
        nasce=r.uniform(-ANTES / FPS, DEPOIS / FPS * 0.7, n),
        vida=r.uniform(0.35, 0.85, n),
        ang=r.uniform(0, 2 * np.pi, n),
        giro=r.choice([-1, 1], n) * r.uniform(2.5, 6.0, n),
        r0=r.uniform(20, 140, n),
        vel=r.uniform(250, 900, n),
        tam=r.uniform(7, 22, n) * np.where(r.random(n) < 0.15, 2.2, 1.0),
        pisca=r.uniform(6, 14, n), fase=r.uniform(0, 2 * np.pi, n),
        cor=r.integers(0, len(CORES), n),
        queda=r.uniform(40, 160, n),
    )
    return p


_P = _particulas()


def _estrela(img, x, y, s, cor, b):
    c = tuple(float(v * b) for v in cor)
    xi, yi = int(x), int(y)
    cv2.circle(img, (xi, yi), max(1, int(s * 0.28)), c, -1, cv2.LINE_AA)
    L = int(s * 1.6)
    e = 2 if s > 14 else 1
    cv2.line(img, (xi - L, yi), (xi + L, yi), tuple(v * 0.7 for v in c), e, cv2.LINE_AA)
    cv2.line(img, (xi, yi - L), (xi, yi + L), tuple(v * 0.7 for v in c), e, cv2.LINE_AA)
    l2 = int(L * 0.45)
    cv2.line(img, (xi - l2, yi - l2), (xi + l2, yi + l2), tuple(v * 0.35 for v in c), 1, cv2.LINE_AA)
    cv2.line(img, (xi - l2, yi + l2), (xi + l2, yi - l2), tuple(v * 0.35 for v in c), 1, cv2.LINE_AA)


def _zoom(f, centro, z):
    if abs(z - 1) < 1e-3:
        return f
    m = cv2.getRotationMatrix2D(centro, 0, z)
    return cv2.warpAffine(f, m, (W, H), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT)


def magia(f, g):
    u = (g - CORTE_MAGIA + 0.5) / FPS                 # segundos em relação ao corte (0 = entre os dois quadros)
    if u < -ANTES / FPS or u > DEPOIS / FPS:
        return f
    antes = u < 0
    centro = CABECA_ROUPAO if antes else ROSTO_NOIVA
    # aproxima no roupão, afasta na noiva
    z = 1 + 0.07 * (1 - abs(u) / (ANTES / FPS)) ** 2 if antes else 1 + 0.06 * max(0, 1 - u / (DEPOIS / FPS)) ** 2
    img = _zoom(f, centro, z).astype(np.float32) / 255
    # brilhos
    cam = np.zeros((H, W, 3), np.float32)
    P = _P
    idade = u - P["nasce"]
    vivos = np.nonzero((idade >= 0) & (idade <= P["vida"]))[0]
    for i in vivos:
        a = idade[i]
        if P["nasce"][i] < 0:   # espiral saindo da tiara (se já passou do corte, segue a partir do rosto)
            cx, cy = CABECA_ROUPAO if antes else ROSTO_NOIVA
            rr = P["r0"][i] + P["vel"][i] * a * (0.55 if antes else 1.0)
            th = P["ang"][i] + P["giro"][i] * a
            x, y = cx + rr * np.cos(th), cy + rr * np.sin(th) * 1.3 + P["queda"][i] * a
        else:                   # explosão em volta dela de noiva, caindo devagar
            cx, cy = ROSTO_NOIVA
            rr = P["r0"][i] * 1.5 + P["vel"][i] * 0.8 * a
            th = P["ang"][i] + P["giro"][i] * 0.2 * a
            x, y = cx + rr * np.cos(th), cy + rr * np.sin(th) * 1.4 + P["queda"][i] * a * 1.5
        b = np.sin(np.pi * a / P["vida"][i]) * (0.65 + 0.35 * np.sin(P["pisca"][i] * a + P["fase"][i]))
        if 0 <= x < W and 0 <= y < H and b > 0.02:
            _estrela(cam, x, y, P["tam"][i], CORES[P["cor"][i]], b)
    brilho = cam + cv2.GaussianBlur(cam, (0, 0), 7) * 2.6 + cv2.GaussianBlur(cam, (0, 0), 24) * 1.8
    # clarão: sobe nos últimos quadros do roupão, pico no corte, desce na noiva
    clarao = np.exp(-(u / 0.11) ** 2) * 0.92
    luz = 0.18 * np.exp(-(u / 0.35) ** 2)            # brilho geral (bloom) em volta do corte
    img = img + luz * cv2.GaussianBlur(img, (0, 0), 18)
    img = 1 - (1 - np.clip(img, 0, 1)) * (1 - np.clip(brilho, 0, 1))      # tela
    img = img + clarao * (np.array((1.0, 0.96, 0.88), np.float32) - img)
    return (np.clip(img, 0, 1) * 255 + 0.5).astype(np.uint8)


def render(de_q=0, ate_q=None, nome="2026-10-27-marielly-dia-de-princesa-v3.mp4"):
    os.makedirs(OUT, exist_ok=True)
    assert sum(c[3] for c in CORTES) == TOTAL_QUADROS
    ate_q = TOTAL_QUADROS if ate_q is None else ate_q
    saida = os.path.join(OUT, nome)
    enc = subprocess.Popen([FF, "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}",
                            "-r", str(FPS), "-i", "-", "-ss", f"{de_q / FPS:.4f}", "-i", AUDIO_REF,
                            "-map", "0:v", "-map", "1:a", "-c:a", "aac", "-b:a", "192k",
                            "-t", f"{(ate_q - de_q) / FPS:.4f}",
                            "-vf", "scale=out_color_matrix=bt709:out_range=tv,format=yuv420p",
                            "-c:v", "h264_nvenc", "-preset", "p7", "-rc", "vbr", "-cq", "17", "-b:v", "0",
                            "-maxrate", "25M", "-bufsize", "50M",
                            "-colorspace", "bt709", "-color_primaries", "bt709", "-color_trc", "bt709",
                            "-movflags", "+faststart", saida], stdin=subprocess.PIPE)
    g = 0
    for c in CORTES:
        if g + c[3] <= de_q or g >= ate_q:   # trecho fora do intervalo pedido
            g += c[3]
            continue
        print(f"{g / FPS:6.2f}s  {c[0]} {c[1]:.2f}-{c[2]:.2f}", flush=True)
        for f in frames_do_trecho(*c):
            if de_q <= g < ate_q:
                enc.stdin.write(magia(f, g).tobytes())
            g += 1
    t = (ate_q - de_q) / FPS
    enc.stdin.close()
    enc.wait()
    print(f"fim em {t:.2f}s -> {saida}")


def amostra():
    os.makedirs(OUT, exist_ok=True)
    import cv2
    for i, (de, rec) in enumerate([(0.4, None), (6.6, CLOSE1), (13.0, CLOSE2), (21.4, None)]):
        f = next(frames_do_trecho(ROUPAO, de, de + 0.2, 6, rec))
        cv2.imwrite(os.path.join(OUT, f"amostra-{i}.jpg"), cv2.cvtColor(f, cv2.COLOR_RGB2BGR)[::2, ::2])


if __name__ == "__main__":
    if sys.argv[1] == "magia":   # só o trecho da revelação, pra conferir o efeito
        render(CORTE_MAGIA - 45, CORTE_MAGIA + 40, "teste-magia.mp4")
    else:
        {"amostra": amostra, "render": render}[sys.argv[1]]()
