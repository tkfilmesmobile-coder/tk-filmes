"""Tempo de cada palavra com o faster-whisper (large-v3-turbo, CPU, int8): bem mais rápido que o whisper.cpp
medium do palavras.mjs, com o mesmo formato de saída ([{texto, ini, fim}]).
uso: python scripts/palavras-fw.py <audio.wav> <saida.json> [modelo=large-v3-turbo]
"""
import sys, json, wave
import numpy as np
from faster_whisper import WhisperModel
wav, saida = sys.argv[1], sys.argv[2]
nome = sys.argv[3] if len(sys.argv) > 3 else "mobiuslabsgmbh/faster-whisper-large-v3-turbo"
m = WhisperModel(nome, device="cpu", compute_type="int8", cpu_threads=8)
with wave.open(wav) as w:  # o av desta máquina não abre arquivo direto: passa as amostras (16 kHz mono)
    audio = np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(np.float32) / 32768
segs, info = m.transcribe(audio, language="pt", word_timestamps=True, vad_filter=True, beam_size=5,
                          vad_parameters={"min_silence_duration_ms": 400}, condition_on_previous_text=False)
P = []
for s in segs:
    for w in s.words:
        t = w.word.strip()
        if t: P.append({"texto": t, "ini": round(w.start, 2), "fim": round(w.end, 2)})
    print(f"{s.start:7.2f}-{s.end:7.2f}  {s.text.strip()}", flush=True)
json.dump(P, open(saida, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
print(f"{len(P)} palavras -> {saida}")
