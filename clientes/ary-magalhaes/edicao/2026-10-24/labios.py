"""Curadoria por imagem: quem está falando? (regra de 2026-10-25, depois da direção da filmmaker passar no reel de
apresentação com volume igual ao da Ary).

Pra cada trecho da montagem, mede o movimento da boca de quem está na câmera (YuNet: rosto + cantos da boca) a cada
quadro e cruza com a voz no áudio. VOZ SEM BOCA MEXENDO = outra pessoa falando (direção, conversa). Os intervalos
suspeitos (≥ 0,4 s) são transcritos sozinhos e listados com o tempo da montagem, pra conferir e cortar.
Uso: python labios.py <id> [...]   → imprime e grava curadoria/<id>-labios.txt
"""
import json, os, site, sys, wave
import cv2
import numpy as np

AQUI = os.path.dirname(os.path.abspath(__file__))
PV = os.path.normpath(os.path.join(AQUI, "..", "video"))
YUNET = os.path.join(os.environ["LOCALAPPDATA"], "Programs", "modelos", "yunet.onnx")
for sp in site.getsitepackages():
    for sub in ("nvidia/cublas/bin", "nvidia/cudnn/bin"):
        d = os.path.join(sp, sub)
        if os.path.isdir(d):
            os.add_dll_directory(d); os.environ["PATH"] = d + os.pathsep + os.environ["PATH"]


def movimento_boca(video, de, ate):
    """[(t, mov)] por quadro: diferença na região da boca menos a diferença da testa (desconta o balanço da cabeça)."""
    cap = cv2.VideoCapture(video)
    fps = cap.get(cv2.CAP_PROP_FPS) or 30
    cap.set(cv2.CAP_PROP_POS_MSEC, de * 1000)
    det = cv2.FaceDetectorYN.create(YUNET, "", (540, 960), 0.6, 0.3, 5000)
    ant_b = ant_t = None
    out, t = [], de
    while t < ate:
        ok, img = cap.read()
        if not ok:
            break
        t = cap.get(cv2.CAP_PROP_POS_MSEC) / 1000 - 1 / fps  # tempo real do quadro (o pulo pode cair antes do pedido)
        if t < de - 0.02:
            continue
        p = cv2.resize(img, (540, 960))
        _, f = det.detect(p)
        if f is not None and len(f):
            x, y, w, h = f[0][:4]
            nx, ny = f[0][8:10]
            rmx, rmy, lmx, lmy = f[0][10:14]
            g = cv2.cvtColor(p, cv2.COLOR_BGR2GRAY).astype(np.float32)
            bx0, bx1 = int(min(rmx, lmx) - 0.08 * w), int(max(rmx, lmx) + 0.08 * w)
            by0, by1 = int(ny + 0.05 * h), int(max(rmy, lmy) + 0.22 * h)
            tx0, tx1, ty0, ty1 = int(x + 0.3 * w), int(x + 0.7 * w), int(y + 0.05 * h), int(y + 0.25 * h)
            boca = cv2.resize(g[max(0, by0):by1, max(0, bx0):bx1], (48, 32)) if by1 > by0 and bx1 > bx0 else None
            testa = cv2.resize(g[max(0, ty0):ty1, max(0, tx0):tx1], (32, 16)) if ty1 > ty0 and tx1 > tx0 else None
            if boca is not None and testa is not None and ant_b is not None:
                out.append((t, float(np.abs(boca - ant_b).mean() - 0.6 * np.abs(testa - ant_t).mean())))
            ant_b, ant_t = boca, testa
    cap.release()
    return out


def main():
    planos = json.load(open(os.path.join(PV, "src", "reels", "planos.json"), encoding="utf-8"))
    from faster_whisper import WhisperModel
    m = WhisperModel("large-v3-turbo", device="cuda", compute_type="float16")
    audios = {}
    os.makedirs(os.path.join(AQUI, "curadoria"), exist_ok=True)
    for rid in sys.argv[1:]:
        linhas = [f"=== {rid} · voz sem boca mexendo (outra pessoa falando)"]
        trechos = planos[rid]["trechos"]
        dados = []
        for n, t in enumerate(trechos, 1):
            arq, de = t["arq"], t["srcDe"]
            ate = de + t["dur"]
            if arq not in audios:
                with wave.open(os.path.join(AQUI, "midia", "wav", arq + ".wav")) as f:
                    audios[arq] = np.frombuffer(f.readframes(f.getnframes()), np.int16).astype(np.float32) / 32768
            mov = movimento_boca(os.path.join(PV, "public", t["src"]), de, ate)
            dados.append((n, t, arq, de, ate, mov))
        todos = [v for *_, mov in dados for _, v in mov]
        ref = np.percentile(todos, 70) if todos else 1.0  # boca mexendo "de verdade" neste reel
        for n, t, arq, de, ate, mov in dados:
            a = audios[arq]
            # janelas de 100 ms: voz no áudio e boca parada
            sus = []
            for k in range(int((ate - de) / 0.1)):
                t0 = de + k * 0.1
                s = a[int(t0 * 16000):int((t0 + 0.1) * 16000)]
                voz = 20 * np.log10(np.sqrt((s ** 2).mean()) + 1e-9) > -42
                mv = [v for tt, v in mov if t0 - 0.1 <= tt < t0 + 0.2]
                parada = bool(mv) and float(np.mean(mv)) < 0.4 * ref  # calibrado em 2026-10-25: boca falando ~4-5, direção ~1,3
                sus.append(bool(voz and parada))
            i = 0
            while i < len(sus):
                if sus[i]:
                    j = i
                    while j + 1 < len(sus) and (sus[j + 1] or (j + 2 < len(sus) and sus[j + 2])):
                        j += 1
                    if (j - i + 1) * 0.1 >= 0.3:
                        t0, t1 = de + i * 0.1, de + (j + 1) * 0.1
                        txt = " ".join(w.word.strip() for s in m.transcribe(a[int(t0 * 16000):int(t1 * 16000)], language="pt", vad_filter=False, word_timestamps=True)[0] for w in (s.words or []))
                        linhas.append(f"  trecho {n:02d} ({arq} {t0:.2f}-{t1:.2f}, montagem {t['inicio'] + i * 0.1:.2f}s): «{txt}»")
                    i = j + 1
                else:
                    i += 1
        if len(linhas) == 1:
            linhas.append("  nada encontrado")
        open(os.path.join(AQUI, "curadoria", rid + "-labios.txt"), "w", encoding="utf-8").write("\n".join(linhas))
        print("\n".join(linhas), flush=True)


if __name__ == "__main__":
    main()
