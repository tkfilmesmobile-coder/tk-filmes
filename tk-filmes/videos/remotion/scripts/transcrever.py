"""Transcrição palavra a palavra (faster-whisper, large-v3-turbo) de um vídeo ou áudio.
Grava no formato dos scripts montar-*.py: [{texto, ini, fim, prob}] (segundos).
uso: python scripts/transcrever.py <video_ou_wav> <saida.json>
"""
import sys, json, subprocess, tempfile, os, wave
import numpy as np
from faster_whisper import WhisperModel

FFMPEG = os.environ.get("FFMPEG", r"C:\Users\kumyt\AppData\Local\CapCut\Apps\9.6.0.4097\ffmpeg.exe")
ent, saida = sys.argv[1], sys.argv[2]
wav = os.path.join(tempfile.gettempdir(), "tk-transcrever.wav")
subprocess.run([FFMPEG, "-hide_banner", "-loglevel", "error", "-y", "-i", ent, "-ac", "1", "-ar", "16000", "-c:a", "pcm_s16le", wav], check=True)
with wave.open(wav) as w:
    audio = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32) / 32768.0
model = WhisperModel("large-v3-turbo", device="cpu", compute_type="int8", cpu_threads=8)
segs, _ = model.transcribe(audio, language="pt", beam_size=3, word_timestamps=True, vad_filter=False, condition_on_previous_text=False)
P = []
for s in segs:
    for p in s.words:
        P.append({"texto": p.word.strip(), "ini": round(p.start, 3), "fim": round(p.end, 3), "prob": round(float(p.probability), 3)})
json.dump(P, open(saida, "w", encoding="utf-8"), ensure_ascii=False, indent=0)
# texto corrido com tempos, pra ler
linha, t0 = [], None
for p in P:
    if t0 is None: t0 = p["ini"]
    linha.append(p["texto"])
    if p["texto"].endswith((".", "?", "!")):
        print(f"[{t0:6.2f}] " + " ".join(linha)); linha, t0 = [], None
if linha: print(f"[{t0:6.2f}] " + " ".join(linha))
print(len(P), "palavras ->", saida)
