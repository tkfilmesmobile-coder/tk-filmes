"""Monta os planos de edição da diária de 2026-10-22 a partir de cortes.json.

Pra cada vídeo:
- encaixa cada trecho de fala nas pausas entre palavras (não corta palavra no meio);
- junta o som dos trechos (voz nivelada, som ambiente baixo, silêncio nos trechos só de música) com fade curto
  em cada corte → public/cortes/<id>/voz.wav (48 kHz) e voz16.wav (16 kHz, pro ducking da trilha);
- legenda palavra a palavra no tempo da montagem → public/cortes/<id>/legendas.json;
- segue o rosto (YuNet) nos trechos com "foco" → keyframes de enquadramento;
- gera as trilhas provisórias (scripts/trilhas_cena.py);
- grava src/cortes/planos.json pro Remotion.
Uso: python montar.py [id ...]   (sem id: todos)
"""
import json, os, subprocess, sys, glob
import numpy as np
import cv2

AQUI = os.path.dirname(os.path.abspath(__file__))
PV = os.path.normpath(os.path.join(AQUI, "..", "perfil-video"))
FF = os.path.join(PV, "node_modules", "@remotion", "compositor-win32-x64-msvc", "ffmpeg.exe")
SDR = os.path.join(PV, "public", "midia", "2026-10-23", "sdr")
YUNET = os.path.join(os.environ["LOCALAPPDATA"], "Programs", "modelos", "yunet.onnx")
PY = sys.executable
FPS = 30
ALVO = (540, 620)  # onde o rosto fica na tela

CFG = json.load(open(os.path.join(AQUI, "cortes.json"), encoding="utf-8"))
_jan = os.path.join(SDR, "..", "grade", "janelas.json")
JANELAS = json.load(open(_jan, encoding="utf-8")) if os.path.exists(_jan) else {}
COR = CFG["correcoes"]


def palavras(arq):
    j = json.load(open(os.path.join(AQUI, "transcricoes", arq + ".json"), encoding="utf-8"))
    return [w for s in j["segmentos"] for w in s["palavras"]]


def encaixa(arq, de, ate):
    """Ajusta [de, ate] pras pausas: começa pouco antes da 1ª palavra e termina pouco depois da última."""
    ws = palavras(arq)
    dentro = [w for w in ws if w["ini"] >= de - 0.25 and w["ini"] < ate and w["fim"] <= ate + 0.6]
    if not dentro:
        return de, ate, []
    i0 = ws.index(dentro[0]); i1 = ws.index(dentro[-1])
    ini = dentro[0]["ini"] - 0.14
    if i0 > 0:
        ini = max(ini, ws[i0 - 1]["fim"] + 0.03)
    fim = dentro[-1]["fim"] + 0.24
    if i1 + 1 < len(ws):
        fim = min(fim, ws[i1 + 1]["ini"] - 0.04)
    return max(0.0, ini), fim, dentro


def rosto(arq, de, ate, foco):
    """Centro do rosto mais perto do foco, a cada 5 quadros, suavizado. Devolve [[t_local, cx, cy], ...]."""
    cap = cv2.VideoCapture(os.path.join(SDR, arq + ".mp4"))
    det = cv2.FaceDetectorYN.create(YUNET, "", (540, 960), 0.6, 0.3, 5000)
    pts, ult = [], np.array(foco, float)
    f0, f1 = int(de * FPS), int(ate * FPS)
    cap.set(cv2.CAP_PROP_POS_FRAMES, f0)
    f = f0
    while f <= f1:
        ok, img = cap.read()
        if not ok:
            break
        if (f - f0) % 5 == 0:
            p = cv2.resize(img, (540, 960))
            _, faces = det.detect(p)
            c = None
            if faces is not None and len(faces):
                cs = [np.array([(x + w / 2) * 2, (y + h * 0.45) * 2]) for x, y, w, h in faces[:, :4]]
                d = [np.linalg.norm(cc - ult) for cc in cs]
                k = int(np.argmin(d))
                if d[k] < 260 or not pts:
                    c = cs[k]
            if c is None:
                c = ult
            ult = c
            pts.append([(f - f0) / FPS, float(c[0]), float(c[1])])
        f += 1
    cap.release()
    if not pts:
        return [[0, foco[0], foco[1]]]
    a = np.array(pts)
    for col in (1, 2):  # média móvel de 9 amostras (~1,5 s): câmera calma
        k = 9
        pad = np.pad(a[:, col], (k // 2, k // 2), mode="edge")
        a[:, col] = np.convolve(pad, np.ones(k) / k, mode="valid")
    return [[round(t, 3), round(x, 1), round(y, 1)] for t, x, y in a]


SR = 48000
_cache = {}


def audio48(arq):
    """Som do vídeo em 48 kHz estéreo float (extraído uma vez pra cache em public/midia/.../wav48)."""
    if arq not in _cache:
        pasta = os.path.join(os.path.dirname(SDR), "wav48")
        os.makedirs(pasta, exist_ok=True)
        w = os.path.join(pasta, arq + ".wav")
        if not os.path.exists(w):
            subprocess.run([FF, "-v", "error", "-y", "-i", os.path.join(SDR, arq + ".mp4"), "-vn", "-ac", "2", "-ar", str(SR),
                            "-c:a", "pcm_s16le", w], check=True)
        import wave
        with wave.open(w) as f:
            _cache[arq] = np.frombuffer(f.readframes(f.getnframes()), np.int16).astype(np.float32).reshape(-1, 2) / 32768
    return _cache[arq]


def ganho_voz(som, alvo_db=-20.0):
    m = np.abs(som).mean(axis=1)
    H = SR // 50
    k = len(m) // H
    if k == 0:
        return 1.0
    rms = np.sqrt((m[: k * H].reshape(k, H) ** 2).mean(axis=1))
    db = 20 * np.log10(rms + 1e-9)
    fala = rms[db > db.max() - 22]  # janelas com voz (até 22 dB abaixo do pico)
    atual = 20 * np.log10(np.sqrt((fala ** 2).mean()) + 1e-9)
    return float(np.clip(10 ** ((alvo_db - atual) / 20), 0.2, 8.0))


MUSICAS = {"vlog": "vlog-stylish-funk-miromaxmusic.mp3", "feedback": "feedback-chill-rnb-danyvin.mp3",
           "explicativo": "explicativo-fresh-bransboynd.mp3"}
# RMS da música nos trechos SEM fala (dBFS). A voz fica em -20; sob a fala a música desce mais 16 dB.
ALVO_MUSICA = {"vlog": -24.0, "feedback": -29.0, "explicativo": -30.0}


def ganho_musica(arq, alvo_db):
    import wave, tempfile
    w = os.path.join(tempfile.gettempdir(), arq + ".16k.wav")
    if not os.path.exists(w):
        subprocess.run([FF, "-v", "error", "-y", "-i", os.path.join(PV, "public", "midia", "musica", arq), "-ac", "1",
                        "-ar", "16000", w], check=True)
    with wave.open(w) as f:
        a = np.frombuffer(f.readframes(f.getnframes()), np.int16).astype(np.float32) / 32768
    rms = 20 * np.log10(np.sqrt(np.mean(a[: 16000 * 60] ** 2)) + 1e-9)  # primeiro minuto
    return float(10 ** ((alvo_db - rms) / 20))


def envelope_fala(s):
    """1 onde há fala (ou som ambiente), 0 no silêncio, a cada 0,1 s, com ataque rápido e soltura lenta."""
    m = np.abs(s).mean(axis=1)
    H = SR // 10
    k = len(m) // H
    db = 20 * np.log10(np.sqrt((m[: k * H].reshape(k, H) ** 2).mean(axis=1)) + 1e-9)
    on = (db > -42).astype(float)
    out, g = [], 0.0
    for x in on:
        g = g + (0.7 if x > g else 0.12) * (x - g)
        out.append(round(g, 2))
    return out


def grava(caminho, s, sr):
    import wave
    with wave.open(caminho, "w") as f:
        f.setnchannels(s.shape[1]); f.setsampwidth(2); f.setframerate(sr)
        f.writeframes((np.clip(s, -1, 1) * 32767).astype(np.int16).tobytes())


def corrige(txt):
    t = txt.strip()
    return COR.get(t, t)


def monta(v):
    out = os.path.join(PV, "public", "cortes", v["id"])
    os.makedirs(out, exist_ok=True)
    trechos, legenda, t = [], [], 0.0
    partes = []
    for n, tr in enumerate(v["trechos"]):
        de, ate, ws = tr["de"], tr["ate"], []
        if tr["tipo"] == "voz":
            de, ate, ws = encaixa(tr["arq"], de, ate)
        dur = round(ate - de, 3)
        destaques = [d.lower() for d in v.get("destaques", [])]
        for k, w in enumerate(ws):
            texto = corrige(w["p"])
            if texto.startswith("-") and k > 0 and legenda:  # "pós" + "-operatório": uma palavra só
                legenda[-1]["text"] += texto
                legenda[-1]["endMs"] = int((t + w["fim"] - de) * 1000)
                continue
            if k == 0:  # trecho novo começa com maiúscula (a legenda quebra aqui)
                texto = texto[:1].upper() + texto[1:]
            limpo = texto.lower().strip(".,!?;:")
            legenda.append({"text": " " + texto, "startMs": int((t + w["ini"] - de) * 1000),
                            "endMs": int((t + w["fim"] - de) * 1000), "timestampMs": int((t + (w["ini"] + w["fim"]) / 2 - de) * 1000),
                            "confidence": w["conf"], **({"destaque": True} if limpo in destaques else {}),
                            **({"quebra": True} if k == 0 else {})})
        track = rosto(tr["arq"], de, ate, tr["foco"]) if tr.get("foco") else None
        # vídeo com o color grade da cliente (janela do gradear.py que contém o trecho); sem ela, o SDR
        src, src_de = f"midia/2026-10-23/sdr/{tr['arq']}.mp4", de
        for ja, jb, nome in JANELAS.get(tr["arq"], []):
            if ja <= de and ate <= jb and os.path.exists(os.path.join(os.path.dirname(SDR), "grade", nome)):
                src, src_de = f"midia/2026-10-23/grade/{nome}", de - ja
                break
        trechos.append({"src": src, "arq": tr["arq"], "inicio": round(t, 3), "dur": dur,
                        "srcDe": round(src_de, 3), "tipo": tr["tipo"], "zoom": tr.get("zoom", 1.0), "track": track})
        som = audio48(tr["arq"])[int(round(de * SR)):int(round(de * SR)) + int(round(dur * SR))].copy()
        som = som * {"voz": 1.0, "natural": 1.0, "musica": 0.0}[tr["tipo"]]
        if tr["tipo"] == "voz":  # nivela cada trecho de fala no mesmo RMS (-20 dBFS) medido só onde há voz
            som *= ganho_voz(som)
        elif tr["tipo"] == "natural":  # som ambiente bem abaixo da voz
            som *= ganho_voz(som) * 10 ** (-10 / 20)
        fi, fo = int(0.04 * SR), int(0.07 * SR)
        som[:fi] *= np.linspace(0, 1, fi)[:, None]
        som[-fo:] *= np.linspace(1, 0, fo)[:, None]
        partes.append(som)
        t += dur
    total = t + (v["fotoFinal"]["dur"] if v.get("fotoFinal") else 0.0)
    s = np.concatenate(partes)
    s = np.concatenate([s, np.zeros((int(total * SR) - len(s) + SR // 2, 2), np.float32)])
    s = np.tanh(s * 1.15) / np.tanh(1.15) * 0.89  # limitador suave: pico abaixo de -1 dBFS
    voz = os.path.join(out, "voz.wav")
    grava(voz, s, SR)
    voz16 = os.path.join(out, "voz16.wav")
    m = s.mean(axis=1)
    grava(voz16, np.interp(np.arange(0, len(m), SR / 16000), np.arange(len(m)), m)[:, None], 16000)
    json.dump(legenda, open(os.path.join(out, "legendas.json"), "w", encoding="utf-8"), ensure_ascii=False)
    # música licenciada do kit da cliente (marca/audio/_origem.md) + envelope de fala pro ducking no Remotion
    arq_mus = MUSICAS[v["musica"]]
    ganho_mus = ganho_musica(arq_mus, ALVO_MUSICA[v["musica"]])
    plano = {"id": v["id"], "nome": v["nome"], "total": round(total, 3), "musica": f"midia/musica/{arq_mus}",
             "ganhoMusica": round(ganho_mus, 4), "fala": envelope_fala(s), "headline": v["headline"],
             "trechos": trechos, "fotoFinal": v.get("fotoFinal"), "assinatura": v.get("assinatura", 3.0), "alvo": ALVO,
             "motions": v.get("motions", [])}
    print(f"{v['id']}: {total:.1f}s, {len(trechos)} trechos, {len(legenda)} palavras", flush=True)
    return plano


def main():
    alvo = sys.argv[1:]
    caminho = os.path.join(PV, "src", "cortes", "planos.json")
    os.makedirs(os.path.dirname(caminho), exist_ok=True)
    planos = json.load(open(caminho, encoding="utf-8")) if os.path.exists(caminho) else {}
    for v in CFG["videos"]:
        if not alvo or v["id"] in alvo:
            planos[v["id"]] = monta(v)
    json.dump(planos, open(caminho, "w", encoding="utf-8"), ensure_ascii=False, indent=1)


if __name__ == "__main__":
    main()
