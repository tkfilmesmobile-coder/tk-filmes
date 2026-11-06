"""Inventário da visita ao fornecedor de carnes (gravação de 2026-11-05, 23 clipes IMG_1310 a IMG_1338).
Pra cada clipe: duração, nível de áudio, transcrição palavra a palavra (faster-whisper large-v3, GPU) e uma folha
de quadros (1 quadro a cada ~2 s, no máximo 24, em grade de 6 colunas).
Saída: analise/inventario.json + analise/folhas/<clipe>.jpg + analise/transcricoes.txt (legível)
Uso: python inventariar.py            (tudo)
     python inventariar.py --folhas   (só as folhas)
"""
import json
import os
import re
import site
import subprocess
import sys
import wave

for sp in site.getsitepackages():
    for sub in ("nvidia/cublas/bin", "nvidia/cudnn/bin"):
        d = os.path.join(sp, sub)
        if os.path.isdir(d):
            os.add_dll_directory(d)
            os.environ["PATH"] = d + os.pathsep + os.environ["PATH"]

import numpy as np

AQUI = os.path.dirname(os.path.abspath(__file__))
BRUTO = os.path.join(AQUI, "bruto")
AN = os.path.join(AQUI, "analise")
FOLHAS = os.path.join(AN, "folhas")
WAVS = os.path.join(AN, "wav16k")
FF = os.path.join(os.environ["LOCALAPPDATA"], "CapCut", "Apps", "9.6.0.4097", "ffmpeg.exe")
os.makedirs(FOLHAS, exist_ok=True)
os.makedirs(WAVS, exist_ok=True)


def sonda(p):
    r = subprocess.run([FF, "-hide_banner", "-i", p], capture_output=True, text=True, encoding="utf-8", errors="ignore").stderr
    dur = re.search(r"Duration: (\d+):(\d+):([\d.]+)", r)
    fps = re.search(r"([\d.]+) fps", r)
    criado = re.search(r"com.apple.quicktime.creationdate\s*:\s*(\S+)", r)
    return {"dur": (int(dur[1]) * 3600 + int(dur[2]) * 60 + float(dur[3])) if dur else 0,
            "fps": float(fps[1]) if fps else None, "hora": criado[1] if criado else None}


arquivos = sorted(f for f in os.listdir(BRUTO) if f.upper().endswith(".MOV"))
inv = {}
for f in arquivos:
    p = os.path.join(BRUTO, f)
    info = sonda(p)
    nome = os.path.splitext(f)[0]
    # folhas de quadros: folhas.py (OpenCV)
    wav = os.path.join(WAVS, nome + ".wav")
    if not os.path.exists(wav):
        subprocess.run([FF, "-v", "error", "-y", "-i", p, "-vn", "-ac", "1", "-ar", "16000", wav])
    inv[f] = info
    print(f, f"{info['dur']:.1f}s", info["fps"], info["hora"])

if "--folhas" in sys.argv:
    sys.exit()

from faster_whisper import WhisperModel

# 2026-11-06: sem initial_prompt (com ele o large-v3 "ouviu" o próprio contexto repetido nos trechos longos) e sem
# condicionar no texto anterior (evita laço do tipo "o o o o"). 2ª passada: medium, só pra confirmar o texto.
m = WhisperModel("large-v3", device="cuda", compute_type="float16")
linhas = []
for f, info in inv.items():
    nome = os.path.splitext(f)[0]
    w = os.path.join(WAVS, nome + ".wav")
    with wave.open(w) as wv:
        a = np.frombuffer(wv.readframes(wv.getnframes()), dtype=np.int16).astype(np.float32) / 32768.0
    info["rms_db"] = round(float(20 * np.log10(np.sqrt((a ** 2).mean()) + 1e-9)), 1)
    segs, _ = m.transcribe(a, language="pt", word_timestamps=True, beam_size=5, vad_filter=True,
                           condition_on_previous_text=False)
    pal, txt = [], []
    for s in segs:
        txt.append(f"[{s.start:6.2f}-{s.end:6.2f}] {s.text.strip()}")
        for x in s.words:
            pal.append({"p": x.word.strip(), "ini": round(x.start, 3), "fim": round(x.end, 3), "prob": round(x.probability, 2)})
    info["palavras"] = pal
    info["_a"] = a
    linhas.append(f"===== {f} ({info['dur']:.1f}s, áudio {info['rms_db']} dB, gravado {info['hora']})")
    linhas += txt or ["(sem fala)"]
    print(f"{f}: {len(pal)} palavras")
del m
m2 = WhisperModel("medium", device="cuda", compute_type="float16")
saida = []
for f, info in inv.items():
    segs2, _ = m2.transcribe(info.pop("_a"), language="pt", beam_size=5, vad_filter=True, condition_on_previous_text=False)
    info["medium"] = [[round(s.start, 2), round(s.end, 2), s.text.strip()] for s in segs2]
i = 0
for f, info in inv.items():
    j = next(k for k, l in enumerate(linhas) if l.startswith(f"===== {f}"))
    fim = next((k for k in range(j + 1, len(linhas)) if linhas[k].startswith("=====")), len(linhas))
    saida += linhas[j:fim]
    saida += [f"   medium [{a:6.2f}-{b:6.2f}] {t}" for a, b, t in info["medium"]] or ["   medium: (sem fala)"]
linhas = saida

json.dump(inv, open(os.path.join(AN, "inventario.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
open(os.path.join(AN, "transcricoes.txt"), "w", encoding="utf-8").write("\n".join(linhas))
print("ok")
