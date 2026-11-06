"""Procura voz de outra pessoa DENTRO de cada trecho da montagem (direção de quem grava, conversa ao fundo).

A voz da pessoa que fala pra câmera fica perto do microfone (‑20 a ‑32 dB); quem grava, atrás do celular, fica bem mais
baixo (‑36 a ‑50 dB). Aqui o áudio de cada trecho é olhado a cada 50 ms: um intervalo de pelo menos 0,35 s só com voz
baixa (sem a voz forte da pessoa logo antes, que seria só o fim de uma palavra dela) é marcado, transcrito sozinho e
listado pra conferência. Também confere o 1,5 s antes e depois de cada corte.
Uso: python voz_fundo.py <id> [...]   → imprime e grava curadoria/<id>-voz-fundo.txt
"""
import json, os, site, sys, wave
import numpy as np

AQUI = os.path.dirname(os.path.abspath(__file__))
for sp in site.getsitepackages():
    for sub in ("nvidia/cublas/bin", "nvidia/cudnn/bin"):
        d = os.path.join(sp, sub)
        if os.path.isdir(d):
            os.add_dll_directory(d); os.environ["PATH"] = d + os.pathsep + os.environ["PATH"]

BAIXA = (-50.0, -35.0)   # faixa da voz de quem grava
MIN_DUR = 0.35


def main():
    planos = json.load(open(os.path.join(AQUI, "..", "video", "src", "reels", "planos.json"), encoding="utf-8"))
    from faster_whisper import WhisperModel
    m = WhisperModel("large-v3-turbo", device="cuda", compute_type="float16")
    cache = {}
    os.makedirs(os.path.join(AQUI, "curadoria"), exist_ok=True)
    for rid in sys.argv[1:]:
        linhas = [f"=== {rid} · voz de fundo dentro dos trechos"]
        for n, t in enumerate(planos[rid]["trechos"], 1):
            arq, de = t["arq"], t["srcDe"]
            ate = de + t["dur"]
            if arq not in cache:
                with wave.open(os.path.join(AQUI, "midia", "wav", arq + ".wav")) as f:
                    cache[arq] = np.frombuffer(f.readframes(f.getnframes()), np.int16).astype(np.float32) / 32768
            a = cache[arq]
            H = 800  # 50 ms
            seg = a[int(de * 16000):int(ate * 16000)]
            k = len(seg) // H
            if k == 0:
                continue
            db = 20 * np.log10(np.sqrt((seg[: k * H].reshape(k, H) ** 2).mean(axis=1)) + 1e-9)
            forte = db > -32
            baixa = (db > BAIXA[0]) & (db < BAIXA[1])
            # voz baixa que não é cauda de palavra forte (sem voz forte nos 150 ms antes)
            marca = baixa.copy()
            for i in range(k):
                if baixa[i] and forte[max(0, i - 3):i].any():
                    marca[i] = False
            i = 0
            while i < k:
                if marca[i]:
                    j = i
                    while j + 1 < k and (marca[j + 1] or (j + 2 < k and marca[j + 2])):
                        j += 1
                    dur = (j - i + 1) * 0.05
                    if dur >= MIN_DUR:
                        t0, t1 = de + i * 0.05, de + (j + 1) * 0.05
                        pedaco = a[int(t0 * 16000):int(t1 * 16000)]
                        txt = " ".join(w.word.strip() for s in m.transcribe(pedaco, language="pt", vad_filter=False, word_timestamps=True)[0] for w in (s.words or []))
                        nivel = float(db[i:j + 1].mean())
                        linhas.append(f"  trecho {n:02d} ({arq} {t0:.2f}-{t1:.2f}, montagem {t['inicio'] + i * 0.05:.2f}s, {nivel:.0f} dB): «{txt}»")
                    i = j + 1
                else:
                    i += 1
        if len(linhas) == 1:
            linhas.append("  nada encontrado")
        open(os.path.join(AQUI, "curadoria", rid + "-voz-fundo.txt"), "w", encoding="utf-8").write("\n".join(linhas))
        print("\n".join(linhas), flush=True)


if __name__ == "__main__":
    main()
