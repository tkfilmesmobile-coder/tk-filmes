# Recorta a pessoa do fundo com o modelo IS-Net (isnet-general-use.onnx, o mesmo do rembg), rodando no PC.
# Nenhuma foto sai do computador. Uso: python scripts/recortar-modelo.py  ->  public/recortes/<nome>.png
# Modelo em ~/.u2net/isnet-general-use.onnx (baixado do GitHub do rembg em 2026-10-17).
# Nas fotos deitadas da sala de atendimento o modelo acerta o contorno do rosto, mas corta pescoço e cabelo:
# ali junta o modelo com o recorte do scripts/recortar.py (polígono + GrabCut, que tem que rodar antes),
# encolhido pra dentro, pra o contorno fino vir sempre do modelo.
# Borda limpa: tira a cor da parede que fica nos fios semitransparentes (senão aparece um halo claro no preto).
import os
import cv2
import numpy as np
import onnxruntime as ort

MODELO = os.path.expanduser("~/.u2net/isnet-general-use.onnx")
ORIGEM = "public/fotos"
DESTINO = "public/recortes"
FOTOS = [
    "antes-sobrancelha-levantada", "depois-sobrancelha-levantada",
    "antes-franzir", "depois-franzir",
    "giro-3.0", "giro-6.0", "giro-10.5",
]
def salva_limpo(img, alfa, nome):
    """Tira a cor do fundo dos pixels de borda (F = (I - (1-a)B) / a) e aperta um pouco a borda.
    B é a parede de verdade atrás de cada ponto: a foto com a pessoa apagada e o buraco preenchido
    pela parede em volta (inpaint), assim a sombra da parede não vira fio claro no cabelo."""
    H, W = alfa.shape
    esc = 360 / max(H, W)
    peq = cv2.resize(img, (int(W * esc), int(H * esc)), interpolation=cv2.INTER_AREA)
    buraco = (cv2.resize(alfa, (peq.shape[1], peq.shape[0])) > 0.03).astype(np.uint8) * 255
    buraco = cv2.dilate(buraco, np.ones((5, 5), np.uint8))
    B = cv2.inpaint(peq, buraco, 9, cv2.INPAINT_TELEA)
    B = cv2.GaussianBlur(cv2.resize(B, (W, H), interpolation=cv2.INTER_LINEAR), (0, 0), 6).astype(np.float32)
    a = np.clip((alfa - 0.25) / 0.65, 0, 1)
    I = img.astype(np.float32)
    F = (I - (1 - alfa[..., None]) * B) / np.maximum(alfa[..., None], 0.2)
    F = np.clip(np.where(alfa[..., None] > 0.97, I, F), 0, 255).astype(np.uint8)
    rgba = cv2.cvtColor(F, cv2.COLOR_BGR2BGRA)
    rgba[:, :, 3] = np.clip(a * 255, 0, 255).astype(np.uint8)
    cv2.imwrite(f"{DESTINO}/{nome}.png", rgba)


sessao = ort.InferenceSession(MODELO, providers=["CPUExecutionProvider"])
entrada = sessao.get_inputs()[0].name
os.makedirs(DESTINO, exist_ok=True)

def modelo(img):
    H, W = img.shape[:2]
    rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    x = cv2.resize(rgb, (1024, 1024), interpolation=cv2.INTER_LANCZOS4).astype(np.float32)
    x = x / max(float(x.max()), 1e-6)
    x = (x - 0.5) / 1.0
    pred = sessao.run(None, {entrada: x.transpose(2, 0, 1)[None]})[0][0, 0]
    pred = (pred - pred.min()) / max(float(pred.max() - pred.min()), 1e-6)
    return cv2.resize(pred, (W, H), interpolation=cv2.INTER_LINEAR)


def so_a_pessoa(alfa):
    duro = (alfa > 0.5).astype(np.uint8)
    n, rot, stats, _ = cv2.connectedComponentsWithStats(duro)
    if n > 1:
        maior = 1 + int(np.argmax(stats[1:, cv2.CC_STAT_AREA]))
        alfa = alfa * cv2.dilate((rot == maior).astype(np.uint8), np.ones((25, 25), np.uint8))
    return alfa


for nome in FOTOS:
    img = cv2.imread(f"{ORIGEM}/{nome}.jpg")
    alfa = so_a_pessoa(modelo(img))
    salva_limpo(img, alfa, nome)
    print(nome, "pessoa:", round(float((alfa > 0.5).mean()), 2))

for nome in ("perfil-clinica-a", "perfil-clinica-b"):
    img = cv2.imread(f"{ORIGEM}/{nome}.jpg")
    grab = cv2.imread(f"{DESTINO}/{nome}.png", cv2.IMREAD_UNCHANGED)[:, :, 3]
    dentro = cv2.erode((grab > 128).astype(np.uint8) * 255, np.ones((31, 31), np.uint8))
    dentro = cv2.GaussianBlur(dentro, (0, 0), 7).astype(np.float32) / 255
    alfa = so_a_pessoa(np.maximum(modelo(img), dentro))
    salva_limpo(img, alfa, nome)
    print(nome, "modelo + GrabCut")
