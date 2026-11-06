"""Curadoria do vídeo final (regra de todos os clientes, 2026-10-24 a 2026-11-01), num passo só:
 1. retranscreve o áudio FINAL (com trilha e efeitos) e compara palavra por palavra com a fala escolhida (trechos.py);
 2. compara a legenda (public/legendas/1105.json) com a retranscrição;
 3. ouve cada emenda: transcreve a janela que TERMINA no corte e a que COMEÇA nele, e mostra ao lado do esperado
    (pega sílaba final comida, que a comparação do texto inteiro esconde);
 4. confere se algum corte cai dentro de voz no bruto (detector de voz);
 5. efeito sonoro em cima da última palavra de frase (regra 16) e trilha alta durante fala;
 6. B-roll repetido (mesmo clipe e mesmo trecho usado duas vezes);
 7. volume integrado e pico real.
Uso: python curadoria.py <final.mp4>
"""
import difflib
import json
import os
import re
import site
import subprocess
import sys
import wave

AQUI = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, AQUI)
for sp in site.getsitepackages():
    for sub in ("nvidia/cublas/bin", "nvidia/cudnn/bin"):
        d = os.path.join(sp, sub)
        if os.path.isdir(d):
            os.add_dll_directory(d); os.environ["PATH"] = d + os.pathsep + os.environ["PATH"]
import numpy as np  # noqa: E402
from faster_whisper import WhisperModel  # noqa: E402

from trechos import TRECHOS  # noqa: E402

FF = os.path.join(os.environ["LOCALAPPDATA"], "CapCut", "Apps", "9.6.0.4097", "ffmpeg.exe")
PUB = os.path.join(AQUI, "..", "..", "public")
final = sys.argv[1]
edl = json.load(open(os.path.join(PUB, "legendas", "1105-edl.json"), encoding="utf-8"))
legenda = json.load(open(os.path.join(PUB, "legendas", "1105.json"), encoding="utf-8"))
norm = lambda s: "".join(c for c in s.lower() if c.isalnum())
problemas = []

wav = os.path.join(AQUI, "analise", "final16k.wav")
subprocess.run([FF, "-v", "error", "-y", "-i", final, "-vn", "-ac", "1", "-ar", "16000", wav], check=True)
with wave.open(wav) as w:
    a = np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(np.float32) / 32768
m = WhisperModel("large-v3", device="cuda", compute_type="float16")

# 1 e 2 · trecho a trecho (a trilha e os efeitos não podem engolir palavra)
print("== 1. fala escolhida x áudio final, trecho a trecho ==")
ouvido_total = []
for t in edl["trechos"]:
    if not t["som"]:
        continue
    tr = next(x for x in TRECHOS if x["id"] == t["id"])
    x = a[int(t["de"] * 16000): int(t["ate"] * 16000)]
    segs, _ = m.transcribe(x, language="pt", beam_size=5, condition_on_previous_text=False)
    ouvido = " ".join(s.text.strip() for s in segs)
    ouvido_total.append(ouvido)
    A, B = [norm(w) for w in tr["txt"].split()], [norm(w) for w in ouvido.split()]
    difs = [(op, " ".join(A[i1:i2]), " ".join(B[j1:j2]))
            for op, i1, i2, j1, j2 in difflib.SequenceMatcher(None, A, B, autojunk=False).get_opcodes() if op != "equal"]
    print(f"[{t['id']}] {'OK' if not difs else f'{len(difs)} diferença(s)'}  ·  {ouvido}")
    for op, e, o in difs:
        print(f"      {op}: esperado {e!r} -> ouvido {o!r}")

print("\n== 2. legenda x fala escolhida ==")
leg = [norm(c["text"]) for c in legenda]
fala = [norm(w) for t in edl["trechos"] if t["som"] for w in next(x for x in TRECHOS if x["id"] == t["id"])["txt"].split()]
d2 = [(op, " ".join(leg[i1:i2]), " ".join(fala[j1:j2]))
      for op, i1, i2, j1, j2 in difflib.SequenceMatcher(None, leg, fala, autojunk=False).get_opcodes() if op != "equal"]
print(f"   {len(leg)} palavras na legenda, {len(fala)} na fala escolhida, {len(d2)} diferença(s)")
for op, l, f_ in d2:
    print(f"      {op}: legenda {l!r} x fala {f_!r}"); problemas.append(f"legenda difere da fala: {l!r} x {f_!r}")
# legenda fora do trecho falado
for c in legenda:
    s, e = c["startMs"] / 1000, c["endMs"] / 1000
    if not any(t["som"] and t["de"] - 0.05 <= s and e <= t["ate"] + 0.05 for t in edl["trechos"]):
        problemas.append(f"palavra de legenda fora de trecho falado: {c['text']!r} {s:.2f}-{e:.2f}")

# 3 · cada emenda, ouvida no vídeo pronto
print("\n== 3. começo e fim de cada fala, no vídeo pronto ==")
for t in edl["trechos"]:
    if not t["som"]:
        continue
    pal = next(x for x in TRECHOS if x["id"] == t["id"])["txt"].split()
    def ouve(t0, t1):
        x = a[int(t0 * 16000): int(t1 * 16000)]
        x = np.concatenate([np.zeros(8000, np.float32), x, np.zeros(8000, np.float32)])
        segs, _ = m.transcribe(x, language="pt", beam_size=5, condition_on_previous_text=False)
        return " ".join(s.text.strip() for s in segs)
    c = ouve(t["de"], min(t["ate"], t["de"] + 2.2))
    f_ = ouve(max(t["de"], t["ate"] - 2.4), t["ate"])
    print(f"[{t['id']}]\n   começo esperado: {' '.join(pal[:5])}\n   começo ouvido:   {c}\n   fim esperado:    ...{' '.join(pal[-5:])}\n   fim ouvido:      ...{f_}")

# 4 · corte dentro de voz no bruto
print("\n== 4. cortes no bruto (detector de voz) ==")
from faster_whisper.vad import VadOptions, get_speech_timestamps  # noqa: E402
cache = {}
for t in edl["trechos"]:
    if not t["som"]:
        continue
    nome, s0, s1 = t["som"]
    if nome not in cache:
        with wave.open(os.path.join(AQUI, "analise", "wav16k", nome + ".wav")) as w:
            x = np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(np.float32) / 32768
        ops = VadOptions(threshold=0.35, min_silence_duration_ms=100, speech_pad_ms=0, min_speech_duration_ms=60)
        cache[nome] = [(r["start"] / 16000, r["end"] / 16000) for r in get_speech_timestamps(x, ops)]
    for rot, p in (("início", s0), ("fim", s1)):
        dentro = [r for r in cache[nome] if r[0] + 0.02 < p < r[1] - 0.02]
        if dentro:
            msg = f"[{t['id']}] {rot} {p:.2f} cai dentro de voz {dentro[0][0]:.2f}-{dentro[0][1]:.2f} (conferir no espectrograma)"
            print("   " + msg)
print("   (cortes conferidos no espectrograma ficam anotados em trechos.py)")

# 5 · efeito sonoro em cima da última palavra de frase
print("\n== 5. efeito sonoro x última palavra de frase ==")
# o que o final tem a mais que o vídeo-base (trilha + efeitos) = final − base, alinhados por correlação
with wave.open(os.path.join(AQUI, "analise", "base16k.wav")) as w:
    base = np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(np.float32) / 32768
# atraso do final em relação à base (o AAC costuma somar ~40 ms): procura em ±100 ms
cand = range(-1600, 1601, 8)
seg_f = a[16000:16000 * 12]
off = max(cand, key=lambda o: float(np.dot(seg_f, base[16000 - o:16000 * 12 - o])))
# ganho da voz no final (o <Video> pode ter volume < 1): mínimos quadrados no trecho de 1 a 12 s
bb = base[16000 - off:16000 * 12 - off]
g = float(np.dot(seg_f, bb) / np.dot(bb, bb))
resto = a.copy()  # resto[i] = final[i] − g·base[i − off]: o que o final tem a mais, no tempo do final
for i0 in range(0, len(a), 16000 * 10):
    i1 = min(len(a), i0 + 16000 * 10)
    j0, j1 = max(0, i0 - off), min(len(base), i1 - off)  # o último bloco é mais curto: subtrai o que existe
    if j1 > j0:
        resto[j0 + off:j1 + off] -= g * base[j0:j1]
print(f"   ganho da voz no final: {g:.2f}")
def rms(x, t0, t1):
    s = x[max(0, int(t0 * 16000)): int(t1 * 16000)]
    return 20 * np.log10(np.sqrt((s ** 2).mean()) + 1e-9) if len(s) else -99
fala_ = [(t["de"], t["ate"]) for t in edl["trechos"] if t["som"]]
fundo = np.median([rms(resto, s, s + 0.05) for d0, d1 in fala_ for s in np.arange(d0, d1 - 0.05, 0.05)])
print(f"   alinhamento final x base: {off / 16 :.1f} ms · trilha+efeitos durante a fala: mediana {fundo:.1f} dB")
for c in legenda:
    if not c.get("fimDeFrase"):
        continue
    s, e = c["startMs"] / 1000, c["endMs"] / 1000
    pico = max(rms(resto, x, x + 0.05) for x in np.arange(s, e + 0.15, 0.025))
    if pico > fundo + 10:
        msg = f"efeito em cima do fim de frase {c['text'].strip()!r} ({s:.2f}-{e:.2f}): {pico - fundo:.0f} dB acima da trilha"
        print("   " + msg); problemas.append(msg)
print("   (alerta = algo 10 dB acima da trilha baixa na última palavra de uma frase)")

# 6 · B-roll repetido
print("\n== 6. B-roll ==")
usos = {}
for t in edl["trechos"]:
    for im in t["imagens"]:
        usos.setdefault(im["fonte"], []).append((round(im["ini"], 1), t["id"]))
for fonte, lista in usos.items():
    if len(lista) > 1:
        print(f"   {fonte}: {lista}")
for fonte, lista in usos.items():
    ini = sorted(i for i, _ in lista)
    for k in range(1, len(ini)):
        if ini[k] - ini[k - 1] < 3:
            problemas.append(f"B-roll repetido: {fonte} em {ini[k - 1]} e {ini[k]}")

# 7 · volume
r = subprocess.run(f'"{FF}" -hide_banner -nostats -i "{final}" -af ebur128=peak=true -f null -', shell=True,
                   capture_output=True, text=True, encoding="utf-8", errors="ignore")
resumo = r.stderr[r.stderr.rfind("Summary"):]
I = re.search(r"I:\s+(-?[\d.]+) LUFS", resumo); P = re.search(r"Peak:\s+(-?[\d.]+) dBFS", resumo)
print(f"\n== 7. volume: {I.group(1) if I else '?'} LUFS integrado, pico real {P.group(1) if P else '?'} dBFS ==")
if P and float(P.group(1)) > -0.5:
    problemas.append(f"pico real alto: {P.group(1)} dBFS")

print("\n== PROBLEMAS ==")
print("\n".join(f" - {p}" for p in problemas) or " nenhum")
