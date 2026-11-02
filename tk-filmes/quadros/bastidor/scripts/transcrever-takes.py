"""Transcreve todos os takes brutos de um cliente (faster-whisper, palavra a palavra), carregando o modelo uma vez só.
Grava <saida>/<take>.json ([{texto, ini, fim, prob}]) e <saida>/_resumo.txt (duração + fala de cada take, com tempos).
uso: python transcrever-takes.py <pasta_dos_brutos> <pasta_saida>
"""
import sys, os, json, glob, subprocess, tempfile, wave
import numpy as np
from faster_whisper import WhisperModel

FFMPEG = r"C:\Users\kumyt\AppData\Local\CapCut\Apps\9.6.0.4097\ffmpeg.exe"
pasta, saida = sys.argv[1], sys.argv[2]
os.makedirs(saida, exist_ok=True)
arqs = sorted(glob.glob(os.path.join(pasta, "*.MOV")) + glob.glob(os.path.join(pasta, "*.mov")))
arqs = sorted(set(arqs))
model = WhisperModel("large-v3-turbo", device="cpu", compute_type="int8", cpu_threads=8)
wav = os.path.join(tempfile.gettempdir(), "tk-takes.wav")
resumo = []
for a in arqs:
    nome = os.path.splitext(os.path.basename(a))[0]
    if os.path.getsize(a) < 200_000:
        resumo.append(f"== {nome}: arquivo vazio"); continue
    r = subprocess.run([FFMPEG, "-hide_banner", "-loglevel", "error", "-y", "-i", a, "-ac", "1", "-ar", "16000", "-c:a", "pcm_s16le", wav])
    if r.returncode != 0:
        resumo.append(f"== {nome}: sem áudio"); continue
    with wave.open(wav) as w:
        audio = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32) / 32768.0
    dur = len(audio) / 16000
    segs, _ = model.transcribe(audio, language="pt", beam_size=3, word_timestamps=True, vad_filter=True, condition_on_previous_text=False)
    P = []
    linhas = []
    for s in segs:
        for p in s.words:
            P.append({"texto": p.word.strip(), "ini": round(p.start, 2), "fim": round(p.end, 2), "prob": round(float(p.probability), 2)})
        linhas.append(f"  [{s.start:5.1f}-{s.end:5.1f}] {s.text.strip()}")
    json.dump(P, open(os.path.join(saida, nome + ".json"), "w", encoding="utf-8"), ensure_ascii=False)
    resumo.append(f"== {nome} ({dur:.1f} s)")
    resumo += linhas or ["  (sem fala)"]
    print(nome, round(dur, 1), "s", len(P), "palavras", flush=True)
open(os.path.join(saida, "_resumo.txt"), "w", encoding="utf-8").write("\n".join(resumo))
print("pronto")
