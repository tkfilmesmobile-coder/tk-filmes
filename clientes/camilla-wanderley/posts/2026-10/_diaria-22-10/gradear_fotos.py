"""Aplica o color grade fixo da Camilla (scripts/grade.py) nas fotos do banco copiadas em fotos/ → fotos/grade/."""
import glob, os, sys
import cv2

AQUI = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.normpath(os.path.join(AQUI, "..", "..", "..", "edicao", "perfil-video", "scripts")))
import grade  # noqa: E402

dest = os.path.join(AQUI, "fotos", "grade")
os.makedirs(dest, exist_ok=True)
for f in sorted(glob.glob(os.path.join(AQUI, "fotos", "*.jpg"))):
    img = cv2.imread(f)
    amostra = [cv2.resize(img, (540, int(540 * img.shape[0] / img.shape[1]))).astype("float32") / 255]
    ganho, expo = grade.correcao_clipe(amostra, grade.LOOKS["CAMILLA"]["alvo_branco"])
    out = grade.grade_quadro(img, ganho, expo, grade.rostos_q(img))
    cv2.imwrite(os.path.join(dest, os.path.basename(f)), out, [cv2.IMWRITE_JPEG_QUALITY, 93])
    print(os.path.basename(f), flush=True)
