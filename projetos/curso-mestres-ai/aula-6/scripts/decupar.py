"""Decupagem rápida com faster-whisper (CPU, int8): transcreve cada vídeo de uma pasta e grava
<nome>.frases.json (frase, início, fim) na pasta de saída.
Uso: python decupar.py <pasta_dos_videos> <pasta_saida> [modelo=small]
"""
import sys, os, json, subprocess, time, wave
import numpy as np
from faster_whisper import WhisperModel

FF = r"C:/Users/tamar/TK FILMES/projetos/curso-mestres-ai/remotion/node_modules/@remotion/compositor-win32-x64-msvc/ffmpeg.exe"
src, out = sys.argv[1], sys.argv[2]
modelo = sys.argv[3] if len(sys.argv) > 3 else "small"
os.makedirs(out, exist_ok=True)
wavdir = os.path.join(os.environ.get("TEMP", "."), "decupagem-wav")
os.makedirs(wavdir, exist_ok=True)

model = WhisperModel(modelo, device="cpu", compute_type="int8", cpu_threads=8)
vids = sorted(f for f in os.listdir(src) if f.lower().endswith((".mov", ".mp4")))
for f in vids:
    n = os.path.splitext(f)[0]
    dst = os.path.join(out, n + ".frases.json")
    if os.path.exists(dst) and os.path.getsize(dst) > 2:
        continue
    wav = os.path.join(wavdir, n + ".wav")
    if not os.path.exists(wav):
        subprocess.run([FF, "-y", "-v", "error", "-i", os.path.join(src, f), "-ar", "16000", "-ac", "1", "-c:a", "pcm_s16le", wav], check=True)
    t0 = time.time()
    with wave.open(wav) as w:
        audio = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32) / 32768.0
    segs, info = model.transcribe(audio, language="pt", beam_size=1, vad_filter=True, condition_on_previous_text=False)
    frases = [{"de": round(s.start, 2), "ate": round(s.end, 2), "texto": s.text.strip()} for s in segs]
    json.dump(frases, open(dst, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    print(f"{n}: {len(frases)} frases, {info.duration:.0f}s de áudio em {time.time()-t0:.0f}s", flush=True)
print("FIM", flush=True)
