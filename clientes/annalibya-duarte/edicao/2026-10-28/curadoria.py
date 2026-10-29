"""Curadoria dos 2 vídeos finais de 2026-10-28 (regra de todos os clientes, 2026-10-24):
1. retranscreve o áudio final e compara palavra por palavra com a fala do vídeo original (a trilha não pode engolir
   palavra nem o fecho cortar o fim);
2. compara a legenda (src/legendas.json) com a retranscrição, no trecho legendado;
3. volume integrado e pico real.
Uso: python curadoria.py
"""
import difflib
import json
import os
import re
import site
import subprocess
import wave

import numpy as np

for sp in site.getsitepackages():
    for sub in ("nvidia/cublas/bin", "nvidia/cudnn/bin"):
        d = os.path.join(sp, sub)
        if os.path.isdir(d):
            os.add_dll_directory(d); os.environ["PATH"] = d + os.pathsep + os.environ["PATH"]
from faster_whisper import WhisperModel

AQUI = os.path.dirname(os.path.abspath(__file__))
FF = os.path.join(os.environ["LOCALAPPDATA"], "CapCut", "Apps", "9.6.0.4097", "ffmpeg.exe")
FINAL = os.path.join(AQUI, "..", "out", "final")
VIDEOS = [
    ("v1", "2026-10-28-dra-anna-libya-apresentacao.mp4", "v41-transcricao.json"),
    ("v2", "2026-10-28-dra-anna-libya-consultorio.mp4", "v63-transcricao.json"),
]
norm = lambda t: "".join(c for c in t.lower() if c.isalnum())
legendas = json.load(open(os.path.join(AQUI, "..", "src", "legendas.json"), encoding="utf-8"))
m = WhisperModel("large-v3", device="cuda", compute_type="float16")


def compara(A, B, rotulo):
    dif = 0
    for op, i1, i2, j1, j2 in difflib.SequenceMatcher(None, A, B, autojunk=False).get_opcodes():
        if op != "equal":
            dif += 1
            print(f"  {rotulo} {op}: {' '.join(A[i1:i2])!r} -> {' '.join(B[j1:j2])!r}")
    print(f"  {rotulo}: {len(A)} x {len(B)} palavras, {dif} diferença(s)")


for k, arq, orig in VIDEOS:
    final = os.path.join(FINAL, arq)
    wav = os.path.join(AQUI, "analise", f"final-{k}-16k.wav")
    subprocess.run([FF, "-v", "error", "-y", "-i", final, "-vn", "-ac", "1", "-ar", "16000", wav], check=True)
    with wave.open(wav) as w:
        a = np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(np.float32) / 32768
    segs, _ = m.transcribe(a, language="pt", word_timestamps=True, beam_size=5)
    nova = [w for s in segs for w in s.words if norm(w.word)]
    original = [w for w in json.load(open(os.path.join(AQUI, "analise", orig), encoding="utf-8"))["palavras"] if norm(w["p"])]
    esperado = [norm(w["p"]) for w in original]
    if k == "v1":  # 2026-10-29: a abertura tem a fala do bruto IMG_0618 antes do vídeo
        esperado = [norm(x) for x in "Alexa ligar as luzes do consultório".split()] + esperado
    print(f"== {arq}")
    print("  texto final:", " ".join(w.word.strip() for w in nova))
    compara(esperado, [norm(w.word) for w in nova], "fala esperada x final")
    # legenda: toda palavra legendada tem que estar na fala final, na mesma ordem (trechos sem legenda,
    # como título, endereço e headline, aparecem só do lado da fala e não contam)
    leg = [norm(w["texto"]) for w in legendas[k]]
    fala = [norm(w.word) for w in nova]
    faltam = []
    for op, i1, i2, j1, j2 in difflib.SequenceMatcher(None, leg, fala, autojunk=False).get_opcodes():
        if op in ("replace", "delete"):
            faltam.append(f"{' '.join(leg[i1:i2])!r} -> {' '.join(fala[j1:j2])!r}")
    print(f"  legenda x fala final: {len(leg)} palavras legendadas, {len(faltam)} diferença(s)")
    for f in faltam:
        print("   ", f)
    r = subprocess.run(f'"{FF}" -hide_banner -nostats -i "{final}" -af ebur128=peak=true -f null -', shell=True,
                       capture_output=True, text=True, encoding="utf-8", errors="ignore")
    resumo = r.stderr[r.stderr.rfind("Summary"):]
    I = re.search(r"I:\s+(-?[\d.]+) LUFS", resumo); P = re.search(r"Peak:\s+(-?[\d.]+) dBFS", resumo)
    print(f"  volume: {I.group(1) if I else '?'} LUFS integrado, pico real {P.group(1) if P else '?'} dBFS")
