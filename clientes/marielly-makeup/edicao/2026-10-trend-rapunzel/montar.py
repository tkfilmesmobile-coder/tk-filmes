"""Reel "Meu dia de princesa" (trend da Rapunzel) da Marielly Makeup. Montado em 2026-10-27.

Referência: instagram.com/reel/DV4Lc5BkfGp (36,3 s). Os cortes seguem os tempos dela pra casar com o áudio
da trend, que entra pelo app do Instagram na hora de postar (o vídeo sai sem som):
  0,0 a 25,0 s  noiva de roupão pondo colar, brincos e tiara (no lugar do Pascal, close no rosto em 7,1 e 14,5 s)
  25,0 s        corte seco pra noiva de vestido (a revelação)
  até ~36 s     vestido no carro, buquê, entrada com o pai

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

# (arquivo, de, até, duração na timeline, recorte x,y,w,h no quadro já em pé ou None)
# Roupão: 21,85 s esticados pra 25 s (velocidade ~0,87, câmera lenta leve) pra revelação cair em 25,0 s.
CLOSE1 = (150, 250, 636, 1130)   # rosto + colar (rosto em ~x 470, y 620)
CLOSE2 = (130, 290, 636, 1130)   # rosto + brinco (rosto em ~x 440, y 680)
VERT_V1 = (84, 0, 324, 576)      # 464x576 -> 9:16, noiva no centro, pai à esquerda
CORTES = [
    (ROUPAO, 0.00, 6.20, 7.10, None),     # colar, virada de rosto
    (ROUPAO, 6.20, 7.30, 1.30, CLOSE1),   # close: maquiagem + colar  (Pascal 1 na referência)
    (ROUPAO, 7.30, 12.60, 6.10, None),    # brincos
    (ROUPAO, 12.60, 13.65, 1.20, CLOSE2), # close: brinco             (Pascal 2 na referência)
    (ROUPAO, 13.65, 21.85, 9.30, None),   # acessórios e tiara -> 25,0 s
    (V2, 0.00, 2.85, 2.85, None),         # REVELAÇÃO: sorrindo no carro (o clarão do vídeo dela começa em 2,87 s)
    (V2, 5.13, 6.97, 1.84, None),         # sorriso de lado
    (V2, 7.03, 8.83, 1.80, None),         # buquê sobre o vestido
    (V1, 0.50, 4.99, 4.49, VERT_V1),      # entrada com o pai (fecho de corpo inteiro)
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


def cor_hlg(rgb16):
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
def frames_do_trecho(arq, de, ate, dur, rec):
    hdr = arq == ROUPAO
    n = round(dur * FPS)
    vel = (ate - de) / dur
    vf = []
    if rec:
        x, y, w, h = rec
        vf.append(f"crop={w}:{h}:{x}:{y}")
    mat = "bt2020" if hdr else "bt709"
    vf.append(f"scale={W}:{H}:flags=lanczos:in_color_matrix={mat}:in_range=tv:out_range=pc")
    vf.append(f"setpts=(PTS-STARTPTS)/{vel:.6f}")
    vf.append(f"fps={FPS}")
    pix, bpp, dt = ("rgb48le", 6, np.uint16) if hdr else ("rgb24", 3, np.uint8)
    cmd = [FF, "-v", "error", "-ss", f"{de:.3f}", "-t", f"{ate - de:.3f}", "-i", os.path.join(BRUTOS, arq),
           "-vf", ",".join(vf), "-frames:v", str(n), "-f", "rawvideo", "-pix_fmt", pix, "-"]
    p = subprocess.Popen(cmd, stdout=subprocess.PIPE)
    tam = W * H * bpp
    ultimo = None
    for _ in range(n):
        buf = p.stdout.read(tam)
        if len(buf) == tam:
            q = np.frombuffer(buf, dt).reshape(H, W, 3)
            ultimo = cor_hlg(q) if hdr else q
        yield ultimo  # se o trecho acabar antes, repete o último quadro
    p.stdout.close()
    p.wait()


def render():
    os.makedirs(OUT, exist_ok=True)
    saida = os.path.join(OUT, "2026-10-27-marielly-dia-de-princesa.mp4")
    enc = subprocess.Popen([FF, "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}",
                            "-r", str(FPS), "-i", "-",
                            "-vf", "scale=out_color_matrix=bt709:out_range=tv,format=yuv420p",
                            "-c:v", "h264_nvenc", "-preset", "p7", "-rc", "vbr", "-cq", "17", "-b:v", "0",
                            "-maxrate", "25M", "-bufsize", "50M",
                            "-colorspace", "bt709", "-color_primaries", "bt709", "-color_trc", "bt709",
                            "-movflags", "+faststart", saida], stdin=subprocess.PIPE)
    t = 0.0
    for c in CORTES:
        print(f"{t:6.2f}s  {c[0]} {c[1]:.2f}-{c[2]:.2f}", flush=True)
        for f in frames_do_trecho(*c):
            enc.stdin.write(f.tobytes())
        t += round(c[3] * FPS) / FPS
    enc.stdin.close()
    enc.wait()
    print(f"fim em {t:.2f}s -> {saida}")


def amostra():
    os.makedirs(OUT, exist_ok=True)
    import cv2
    for i, (de, rec) in enumerate([(0.4, None), (6.6, CLOSE1), (13.0, CLOSE2), (21.4, None)]):
        f = next(frames_do_trecho(ROUPAO, de, de + 0.2, 0.2, rec))
        cv2.imwrite(os.path.join(OUT, f"amostra-{i}.jpg"), cv2.cvtColor(f, cv2.COLOR_RGB2BGR)[::2, ::2])


if __name__ == "__main__":
    {"amostra": amostra, "render": render}[sys.argv[1]]()
