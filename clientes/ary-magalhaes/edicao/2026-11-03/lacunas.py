"""Procura fala que a transcrição pulou: retranscreve, sem filtro de silêncio, cada intervalo > 1,2 s entre trechos
(e o fim do arquivo) e grava transcricoes/<nome>-lacunas.json. Uso: python lacunas.py IMG_1040 IMG_1041"""
import json, os, sys, site, wave
import numpy as np

AQUI = os.path.dirname(os.path.abspath(__file__))
for sp in site.getsitepackages():
    for sub in ("nvidia/cublas/bin", "nvidia/cudnn/bin"):
        d = os.path.join(sp, sub)
        if os.path.isdir(d):
            os.add_dll_directory(d); os.environ["PATH"] = d + os.pathsep + os.environ["PATH"]
sys.stdout.reconfigure(encoding="utf-8")
from faster_whisper import WhisperModel
M = WhisperModel("large-v3-turbo", device="cuda", compute_type="float16")

for nome in sys.argv[1:]:
    j = json.load(open(os.path.join(AQUI, "transcricoes", nome + ".json"), encoding="utf-8"))
    with wave.open(os.path.join(AQUI, "midia", "wav", nome + ".wav")) as f:
        a = np.frombuffer(f.readframes(f.getnframes()), np.int16).astype(np.float32) / 32768
    segs = j["segmentos"]
    gaps = [(0.0, segs[0]["ini"])] + [(x["fim"], y["ini"]) for x, y in zip(segs, segs[1:])] + [(segs[-1]["fim"], j["duracao"])]
    out = []
    for g0, g1 in gaps:
        if g1 - g0 < 1.2:
            continue
        trecho = a[int(g0 * 16000):int(g1 * 16000)]
        db = 20 * np.log10(np.sqrt((trecho ** 2).mean()) + 1e-9)
        ss, _ = M.transcribe(trecho, language="pt", beam_size=5, word_timestamps=True, vad_filter=False, condition_on_previous_text=False)
        ss = list(ss)
        txt = " ".join(s.text.strip() for s in ss)
        pal = [{"p": w.word.strip(), "ini": round(g0 + w.start, 2), "fim": round(g0 + w.end, 2), "conf": round(w.probability, 2)} for s in ss for w in (s.words or [])]
        out.append({"de": round(g0, 2), "ate": round(g1, 2), "db": round(float(db), 1), "texto": txt, "palavras": pal})
        print(f"{nome} {g0:7.2f}-{g1:7.2f} ({g1-g0:4.1f}s, {db:.0f} dB): {txt}", flush=True)
    json.dump(out, open(os.path.join(AQUI, "transcricoes", nome + "-lacunas.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
