"""Transcreve cada trecho da montagem SOZINHO (com 0,15 s de folga) e também o segundo antes dele, sem filtro de voz,
pra achar fala de outra pessoa (direção da filmmaker, conversa) que a transcrição longa juntou com a fala da Ary.
Também mede o volume de cada trecho: a voz de quem grava fica bem mais baixa (longe do microfone) que a da Ary.
Uso: python vozes_trecho.py <id> [...]
"""
import json, os, site, sys, wave
import numpy as np

AQUI = os.path.dirname(os.path.abspath(__file__))
for sp in site.getsitepackages():
    for sub in ("nvidia/cublas/bin", "nvidia/cudnn/bin"):
        d = os.path.join(sp, sub)
        if os.path.isdir(d):
            os.add_dll_directory(d); os.environ["PATH"] = d + os.pathsep + os.environ["PATH"]


def main():
    planos = json.load(open(os.path.join(AQUI, "..", "video", "src", "reels", "planos.json"), encoding="utf-8"))
    from faster_whisper import WhisperModel
    m = WhisperModel("large-v3-turbo", device="cuda", compute_type="float16")
    cache = {}
    for rid in sys.argv[1:]:
        print(f"=== {rid}")
        for n, t in enumerate(planos[rid]["trechos"], 1):
            arq, de = t["arq"], t["srcDe"]
            ate = de + t["dur"]
            if arq not in cache:
                with wave.open(os.path.join(AQUI, "midia", "wav", arq + ".wav")) as f:
                    cache[arq] = np.frombuffer(f.readframes(f.getnframes()), np.int16).astype(np.float32) / 32768
            a = cache[arq]
            pedaco = a[int(max(0, de - 0.15) * 16000):int((ate + 0.15) * 16000)]
            antes = a[int(max(0, de - 1.2) * 16000):int(de * 16000)]
            txt = lambda x: " ".join(w.word.strip() for s in m.transcribe(x, language="pt", vad_filter=False, word_timestamps=True)[0] for w in (s.words or []))
            rms = 20 * np.log10(np.sqrt((pedaco ** 2).mean()) + 1e-9)
            print(f"[{n:02d}] {t['inicio']:6.2f}s {arq} {de:7.2f}-{ate:7.2f} ({rms:5.1f} dB)  «{txt(pedaco)}»   | antes: «{txt(antes) if len(antes) > 1600 else ''}»", flush=True)


if __name__ == "__main__":
    main()
