"""Curadoria obrigatória antes de entregar um reel (pedido da Talyta, 2026-10-24).

Pra cada reel montado:
1. Retranscreve o áudio FINAL da montagem (public/reels/<id>/voz.wav) e compara, palavra por palavra, com o que
   deveria estar ali (as palavras dos trechos escolhidos). Palavra faltando ou sobrando = corte errado.
2. Confere cada corte no áudio original: se a voz ainda está saindo no ponto do corte (antes ou depois), é corte no
   meio de palavra.
3. Imprime a fala inteira da montagem, trecho por trecho, pra leitura humana: início, meio e fim, se faz sentido,
   se sobrou tentativa ou direção de quem grava.
Uso: python curadoria.py [id ...]   → também grava curadoria/<id>.txt
"""
import difflib, json, os, re, site, sys, wave
import numpy as np

AQUI = os.path.dirname(os.path.abspath(__file__))
PV = os.path.normpath(os.path.join(AQUI, "..", "video"))
for sp in site.getsitepackages():
    for sub in ("nvidia/cublas/bin", "nvidia/cudnn/bin"):
        d = os.path.join(sp, sub)
        if os.path.isdir(d):
            os.add_dll_directory(d); os.environ["PATH"] = d + os.pathsep + os.environ["PATH"]

VOZ_LIMIAR = -40.0  # acima disso, ainda tem voz no ponto do corte


def norm(p):
    return re.sub(r"[^\wà-ú]", "", p.lower())


def palavras(arq):
    j = json.load(open(os.path.join(AQUI, "transcricoes", arq + ".json"), encoding="utf-8"))
    return [w for s in j["segmentos"] for w in s["palavras"]]


def energia(arq):
    with wave.open(os.path.join(AQUI, "midia", "wav", arq + ".wav")) as f:
        a = np.frombuffer(f.readframes(f.getnframes()), np.int16).astype(np.float32) / 32768
    return a


def db(a, t0, t1):
    s = a[max(0, int(t0 * 16000)):max(0, int(t1 * 16000))]
    return float(20 * np.log10(np.sqrt((s ** 2).mean()) + 1e-9)) if len(s) else -99.0


def le_voz(caminho):
    with wave.open(caminho) as f:
        sr, n, ch = f.getframerate(), f.getnframes(), f.getnchannels()
        a = np.frombuffer(f.readframes(n), np.int16).astype(np.float32).reshape(-1, ch).mean(axis=1) / 32768
    return np.interp(np.arange(0, len(a), sr / 16000), np.arange(len(a)), a).astype(np.float32)


def main():
    planos = json.load(open(os.path.join(PV, "src", "reels", "planos.json"), encoding="utf-8"))
    alvo = sys.argv[1:] or list(planos)
    from faster_whisper import WhisperModel
    model = WhisperModel("large-v3-turbo", device="cuda", compute_type="float16")
    os.makedirs(os.path.join(AQUI, "curadoria"), exist_ok=True)
    for rid in alvo:
        pl = planos[rid]
        linhas, esperado, problemas = [], [], []
        cache = {}
        for n, tr in enumerate(pl["trechos"], 1):
            arq, de = tr["arq"], tr["srcDe"]
            ate = de + tr["dur"]
            ws = [w for w in palavras(arq) if w["ini"] >= de - 0.02 and w["ini"] < ate - 0.02]
            esperado += [(norm(w["p"]), w["p"], tr["inicio"] + w["ini"] - de) for w in ws]
            a = cache.setdefault(arq, energia(arq))
            ini_in, ini_out = db(a, de, de + 0.06), db(a, de - 0.06, de)
            fim_in, fim_out = db(a, ate - 0.06, ate), db(a, ate, ate + 0.06)
            avisos = []
            # volume do trecho: a voz de quem grava fica bem abaixo da voz da pessoa (longe do microfone)
            rms = db(a, de, ate)
            if rms < -38:
                avisos.append(f"volume baixo ({rms:.0f} dB): pode ser voz de quem grava ou cochicho")
            if ini_in > VOZ_LIMIAR and ini_out > VOZ_LIMIAR:
                avisos.append(f"começa com voz ({ini_out:.0f}/{ini_in:.0f} dB)")
            if fim_in > VOZ_LIMIAR and fim_out > VOZ_LIMIAR:
                avisos.append(f"termina com voz ({fim_in:.0f}/{fim_out:.0f} dB)")
            for av in avisos:
                problemas.append(f"trecho {n} ({tr['inicio']:.1f}s, {arq} {de:.2f}s): {av}")
            linhas.append(f"[{n:02d}] {tr['inicio']:6.2f}s  {arq} {de:7.2f}-{ate:7.2f}  {' '.join(w['p'] for w in ws)}" + (f"   ⚠ {'; '.join(avisos)}" if avisos else ""))
        # retranscrição da montagem
        voz = le_voz(os.path.join(PV, "public", "reels", rid, "voz.wav"))
        segs, _ = model.transcribe(voz, language="pt", beam_size=5, word_timestamps=True, vad_filter=False,
                                   condition_on_previous_text=False)
        obtido = [(norm(w.word), w.word.strip(), w.start) for s in segs for w in (s.words or [])]
        texto_final = " ".join(o[1] for o in obtido)
        sm = difflib.SequenceMatcher(a=[e[0] for e in esperado], b=[o[0] for o in obtido], autojunk=False)
        for op, i1, i2, j1, j2 in sm.get_opcodes():
            if op == "equal":
                continue
            exp = " ".join(e[1] for e in esperado[i1:i2])
            obt = " ".join(o[1] for o in obtido[j1:j2])
            t = esperado[i1][2] if i1 < len(esperado) else (obtido[j1][2] if j1 < len(obtido) else 0)
            problemas.append(f"{t:6.1f}s  esperado «{exp}»  ouvido «{obt}»")
        rel = [f"=== {rid} · {pl['total']:.1f}s", "", "TRECHOS (o que foi escolhido do bruto):", *linhas, "",
               "FALA DA MONTAGEM (retranscrita do áudio final):", texto_final, "",
               f"DIFERENÇAS E CORTES SUSPEITOS ({len(problemas)}):", *(problemas or ["nenhum"]), ""]
        open(os.path.join(AQUI, "curadoria", rid + ".txt"), "w", encoding="utf-8").write("\n".join(rel))
        print("\n".join(rel), flush=True)


if __name__ == "__main__":
    main()
