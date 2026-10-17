"""Transcrição palavra a palavra (faster-whisper, large-v3-turbo) de um WAV 16 kHz.
Grava no formato Caption do Remotion: [{text, startMs, endMs, timestampMs, confidence}].
Uso: python scripts/palavras.py <entrada.wav> <saida.json>
"""
import sys, json, wave
import numpy as np
from faster_whisper import WhisperModel

wav, saida = sys.argv[1], sys.argv[2]
with wave.open(wav) as w:
    audio = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32) / 32768.0
model = WhisperModel("large-v3-turbo", device="cpu", compute_type="int8", cpu_threads=8)
segs, _ = model.transcribe(audio, language="pt", beam_size=2, word_timestamps=True,
                           vad_filter=True, condition_on_previous_text=False)
caps = []
for s in segs:
    for p in s.words:
        caps.append({"text": " " + p.word.strip(), "startMs": int(p.start * 1000), "endMs": int(p.end * 1000),
                     "timestampMs": int((p.start + p.end) * 500), "confidence": round(float(p.probability), 3)})
json.dump(caps, open(saida, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
print(len(caps), "palavras ->", saida)
