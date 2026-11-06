"""Monta o vídeo base de um reel a partir da CURADORIA: só os trechos escolhidos (índices de palavras da transcrição),
sem as pausas longas, e com cada corte no ponto mais silencioso entre as palavras (pra nunca cortar fala no meio).
Gera 1080x1920, 24 fps, H.264 + AAC, e reescreve os tempos das palavras pro vídeo cortado.

uso: python scripts/cortar-trechos.py <bruto> <palavras.json> <curadoria.json> <saida.mp4> <palavras-saida.json>
curadoria.json: {"trechos": [[i_ini, i_fim], ...], "pausa_max": 0.35, "corrige": {"palavra errada": "certa"}}
  · i_ini e i_fim são índices (inclusivos) das palavras no palavras.json (ver scripts/ver-palavras.py)
"""
import sys, json, subprocess, os, tempfile, wave
import numpy as np
FFMPEG = os.environ.get("FFMPEG", r"C:\Users\kumyt\AppData\Local\CapCut\Apps\9.6.0.4097\ffmpeg.exe")
bruto, pj, cj, saida, pjs = sys.argv[1:6]
P = json.load(open(pj, encoding="utf-8-sig"))
C = json.load(open(cj, encoding="utf-8-sig"))
PAUSA = C.get("pausa_max", 0.35)
# A transcrição às vezes estica o fim de uma palavra por cima de um silêncio longo (ex.: "pessoas" com 8 s).
# Palavra longa de verdade ("intencionalidade") passa de 1,3 s; acima de 2,5 s é esticamento: o fim vira começo + 1,2 s.
for p in P:
    if p["fim"] - p["ini"] > 2.5:
        print(f"  fim esticado: '{p['texto']}' {p['ini']:.2f}-{p['fim']:.2f}s -> {p['ini'] + 1.2:.2f}s")
        p["fim"] = round(p["ini"] + 1.2, 3)
ANTES, DEPOIS, BUSCA = 0.10, 0.16, 0.30

# envelope de energia do áudio (janelas de 10 ms)
wav = os.path.join(tempfile.gettempdir(), "tk-trechos.wav")
subprocess.run([FFMPEG, "-hide_banner", "-loglevel", "error", "-y", "-i", bruto, "-ac", "1", "-ar", "16000", "-c:a", "pcm_s16le", wav], check=True)
with wave.open(wav) as w:
    a = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32)
J = 160
rms = np.sqrt(np.convolve(a[: len(a) // J * J].reshape(-1, J).astype(np.float64) ** 2 @ np.ones(J) / J, np.ones(3) / 3, "same"))
def silencio(t0, t1):
    """instante de menor energia entre t0 e t1 (s)"""
    i0, i1 = max(0, int(t0 * 100)), min(len(rms) - 1, int(t1 * 100))
    if i1 <= i0: return (t0 + t1) / 2
    return (i0 + int(np.argmin(rms[i0:i1 + 1]))) / 100

# palavras mantidas, em blocos contínuos: um corte só onde a curadoria tira algo ou a pausa é longa
manter = []
for i0, i1 in C["trechos"]:
    manter.append(list(range(i0, i1 + 1)))
seg = []
for bloco in manter:
    atual = None
    for k, i in enumerate(bloco):
        p = P[i]
        if atual and p["ini"] - P[bloco[k - 1]]["fim"] <= PAUSA:
            atual["fim_i"] = i
            continue
        if atual: seg.append(atual)
        atual = {"ini_i": i, "fim_i": i}
    seg.append(atual)
# nível de referência da voz (percentil 80 da energia nas palavras mantidas) e "silêncio" = abaixo de 10% dele
_voz = np.concatenate([rms[int(P[i]["ini"] * 100):int(P[i]["fim"] * 100) + 1] for b in manter for i in b])
REF0 = float(np.percentile(_voz, 80)) or 1.0
QUIETO = 0.10 * REF0
def fim_real(j):
    """primeiro silêncio de verdade (80 ms seguidos) na parte final da palavra j ou depois dela, antes da seguinte.
    Começa a procurar só depois de 60% da palavra (as pausinhas de consoante, como o "t" de "minutinhos", ficam fora)."""
    ini, fim = P[j]["ini"], P[j]["fim"]
    nxt = P[j + 1]["ini"] if j + 1 < len(P) else fim + BUSCA
    lim = min(fim + 0.6, nxt + 0.06)
    k0, k1 = int(max(ini + 0.6 * (fim - ini), fim - 0.35) * 100), int(lim * 100)
    FORTE = 0.25 * REF0
    k = k0
    while k < k1 - 7:
        if (rms[k:k + 8] < QUIETO).all():
            # trava: voz alta depois desse silêncio e antes da próxima palavra marcada = ainda é esta palavra
            # (a transcrição marcou cedo demais). Pula pra depois dessa voz e procura o silêncio de novo.
            fim_regiao = int((nxt - 0.05) * 100)
            alto = np.nonzero(rms[k + 8:fim_regiao] > FORTE)[0]
            if len(alto) == 0: return min(k / 100 + 0.03, lim)
            k = k + 8 + int(alto[-1]) + 1
            continue
        k += 1
    return None
def ini_real(i):
    """último silêncio de verdade (60 ms seguidos) antes da palavra i começar; nunca depois da marcação - 30 ms"""
    ini = P[i]["ini"]
    lim = max(P[i - 1]["ini"] + 0.1, ini - 0.45) if i > 0 else max(0.0, ini - 0.45)
    k1, k0 = int((ini + 0.05) * 100), int(lim * 100)
    for k in range(k1, k0 + 5, -1):
        if (rms[k - 6:k] < QUIETO).all(): return min(max(k / 100 - 0.03, lim), ini - 0.03)
    return None

cortes = []
for s in seg:
    i, j = s["ini_i"], s["fim_i"]
    a_real, b_real = ini_real(i), fim_real(j)
    # A transcrição às vezes marca o fim de uma palavra DEPOIS do começo da seguinte (sobreposição). Nesses casos o
    # limite do corte não pode ser o "fim" marcado: usa um ponto entre o começo das duas, e o silêncio decide.
    if i > 0:
        ant = P[i - 1]
        lim = ant["fim"] if ant["fim"] < P[i]["ini"] else ant["ini"] + 0.6 * (P[i]["ini"] - ant["ini"])
        a0 = silencio(max(lim, P[i]["ini"] - BUSCA), P[i]["ini"] - 0.02)
        a0 = min(a0, P[i]["ini"] - 0.04)
    else:
        a0 = max(0.0, P[i]["ini"] - ANTES)
    fim_j = P[j]["fim"]
    if j + 1 < len(P):
        prox = P[j + 1]["ini"]
        hi = min(fim_j + BUSCA, max(prox - 0.02, fim_j + 0.06))
        lo = fim_j + 0.04 if prox > fim_j + 0.06 else fim_j - 0.05
        b0 = max(silencio(lo, hi), min(fim_j + 0.06, hi))
    else:
        b0 = fim_j + DEPOIS
    # o silêncio medido no áudio vale mais que a marcação da transcrição
    if a_real is not None and i > 0: a0 = a_real
    if b_real is not None and j + 1 < len(P): b0 = b_real
    # corte fixado à mão na curadoria (fala sem pausa, medida no envelope): {"manual": {"fim:90": 27.72, "ini:64": 20.30}}
    M = C.get("manual", {})
    a0 = M.get(f"ini:{i}", a0); b0 = M.get(f"fim:{j}", b0)
    cortes.append([round(a0, 3), round(b0, 3)])
# junta cortes que se tocam
uni = []
for a0, b0 in cortes:
    if uni and a0 <= uni[-1][1] + 0.01: uni[-1][1] = max(uni[-1][1], b0)
    else: uni.append([a0, b0])

# conferência pelo ÁUDIO: cada ponta de corte tem que cair em silêncio (energia baixa nos 40 ms em volta).
# Referência = nível típico da voz (percentil 80 da energia dentro das palavras mantidas).
voz = np.concatenate([rms[int(P[i]["ini"] * 100):int(P[i]["fim"] * 100) + 1] for b in manter for i in b]) if manter else rms
REF = float(np.percentile(voz, 80)) or 1.0
def energia(t): i = int(t * 100); return float(rms[max(0, i - 2):i + 3].max()) / REF
suspeitos = 0
for n, (a0, b0) in enumerate(uni):
    for nome, t in (("início", a0), ("fim", b0)):
        if (nome == "início" and n == 0 and a0 < 0.05): continue
        e = energia(t)
        if e > 0.18:
            suspeitos += 1
            print(f"  CORTE SUSPEITO ({nome} do trecho {n + 1}, {t:.2f}s no bruto): energia {e:.0%} da voz")
print(f"  conferência do áudio: {suspeitos} corte(s) suspeito(s) em {2 * len(uni)} pontas")

# conferência: toda palavra mantida tem que começar dentro de um trecho (o fim marcado pode passar um pouco)
def dentro(t): return any(a0 - 1e-6 <= t <= b0 + 1e-6 for a0, b0 in uni)
for bloco in manter:
    for i in bloco:
        if not dentro(P[i]["ini"] + 0.01):
            print(f"  AVISO: início de '{P[i]['texto']}' ({P[i]['ini']:.2f}s) ficou fora dos cortes")
        elif not dentro(min(P[i]["fim"], P[i]["ini"] + 0.25)):
            print(f"  AVISO: '{P[i]['texto']}' ({P[i]['ini']:.2f}-{P[i]['fim']:.2f}s) pode estar cortada no fim")

if os.environ.get("TK_SO_CONFERIR"):
    for a0, b0 in uni: print(f"    {a0:7.2f} -> {b0:7.2f}")
    sys.exit(0)

tmp = tempfile.mkdtemp(prefix="tk-trechos-")
lista = os.path.join(tmp, "lista.txt")
VF = "scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,fps=24"
# enquadre: aproxima o quadro preso ao topo (tira a faixa de baixo, ex.: blusa abrindo entre os botões)
EQ = C.get("enquadre")
if EQ:
    z = float(EQ.get("zoom", 1.0)); w2, h2 = int(1080 / z) // 2 * 2, int(1920 / z) // 2 * 2
    y2 = int(EQ.get("topo", 0.0) * 1920)
    VF = f"scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,crop={w2}:{h2}:{(1080 - w2) // 2}:{y2},scale=1080:1920:flags=lanczos,fps=24"
with open(lista, "w", encoding="utf-8") as L:
    for n, (a0, b0) in enumerate(uni):
        parte = os.path.join(tmp, f"p{n:03d}.mp4")
        # 12 ms de fade no áudio nas pontas: tira o estalo do corte sem comer fala
        af = f"afade=t=in:d=0.012,afade=t=out:st={max(0, b0 - a0 - 0.012):.3f}:d=0.012"
        subprocess.run([FFMPEG, "-hide_banner", "-loglevel", "error", "-y", "-ss", f"{a0:.3f}", "-i", bruto, "-t", f"{b0 - a0:.3f}",
                        "-vf", VF, "-af", af, "-c:v", "h264_nvenc", "-preset", "p7", "-rc", "vbr", "-cq", "16", "-b:v", "18M", "-pix_fmt", "yuv420p",
                        "-color_primaries", "bt709", "-color_trc", "bt709", "-colorspace", "bt709",
                        "-c:a", "aac", "-b:a", "256k", "-ar", "48000", "-ac", "2", parte], check=True)
        L.write(f"file '{parte}'\n")
subprocess.run([FFMPEG, "-hide_banner", "-loglevel", "error", "-y", "-f", "concat", "-safe", "0", "-i", lista, "-c", "copy", "-movflags", "+faststart", saida], check=True)

CORR = {k.lower(): v for k, v in C.get("corrige", {}).items()}
def novo(t):
    """tempo no vídeo cortado; um instante que caiu logo fora de um trecho (marcação imprecisa) vai pra borda dele"""
    acc, melhor = 0.0, None
    for a0, b0 in uni:
        if a0 <= t <= b0 + 1e-6: return round(acc + (t - a0), 3)
        d = min(abs(t - a0), abs(t - b0))
        if d <= 0.3 and (melhor is None or d < melhor[0]): melhor = (d, round(acc + (min(max(t, a0), b0) - a0), 3))
        acc += b0 - a0
    return melhor[1] if melhor else None
Q = []
for bloco in manter:
    for i in bloco:
        p = dict(P[i])
        base = p["texto"].strip(".,!?").lower()
        if base in CORR: p["texto"] = p["texto"].replace(p["texto"].strip(".,!?"), CORR[base])
        p["ini"], p["fim"] = novo(P[i]["ini"]), novo(P[i]["fim"])
        if p["ini"] is not None and p["fim"] is not None: Q.append(p)
json.dump(Q, open(pjs, "w", encoding="utf-8"), ensure_ascii=False, indent=0)
# onde cada trecho começa no vídeo cortado (pra alternar o plano a cada corte e esconder o pulo)
acc, tl = 0.0, []
for a0, b0 in uni:
    tl.append({"ini": round(acc, 3), "fim": round(acc + b0 - a0, 3), "bruto": [a0, b0]}); acc += b0 - a0
json.dump(tl, open(pjs.replace("-palavras.json", "-cortes.json"), "w", encoding="utf-8"), indent=0)
print(f"{len(uni)} cortes · {sum(b - a for a, b in uni):.1f}s · {len(Q)} palavras")
for a0, b0 in uni: print(f"  {a0:7.2f} -> {b0:7.2f}")
