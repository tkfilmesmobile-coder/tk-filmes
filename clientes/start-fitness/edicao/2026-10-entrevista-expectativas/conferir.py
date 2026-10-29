"""Re-transcreve trechos curtos (com folga) pra tirar dúvida de palavra.
Uso: python conferir.py <audio16k.wav> ini-fim [ini-fim ...]
"""
import os
import site
import sys
import wave

for sp in site.getsitepackages():
    for sub in ("nvidia/cublas/bin", "nvidia/cudnn/bin"):
        d = os.path.join(sp, sub)
        if os.path.isdir(d):
            os.add_dll_directory(d)
            os.environ["PATH"] = d + os.pathsep + os.environ["PATH"]

import numpy as np
from faster_whisper import WhisperModel

with wave.open(sys.argv[1]) as w:
    a = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32) / 32768.0
m = WhisperModel("large-v3", device="cuda", compute_type="float16")
dica = "Corrida Start Fitness, dia primeiro de novembro, segunda edição, pódio, top 10."
for faixa in sys.argv[2:]:
    ini, fim = map(float, faixa.split("-"))
    trecho = a[int(ini * 16000): int(fim * 16000)]
    for prompt in (None, dica):
        segs, _ = m.transcribe(trecho, language="pt", word_timestamps=True, beam_size=5, initial_prompt=prompt)
        pal = [f"{ini + x.start:.2f}:{x.word.strip()}({x.probability:.2f})" for s in segs for x in s.words]
        print(f"[{faixa}] {'dica' if prompt else 'puro'}: " + " ".join(pal))
