"""Monta public/legendas/1105.json (formato Caption do Remotion + enfase/apoio) a partir do texto CONFERIDO de cada
trecho (trechos.py). O texto manda; o tempo de cada palavra vem de uma transcrição do PRÓPRIO trecho cortado (o tempo
de palavra no clipe inteiro sai deslocado até 1 s). Palavra do texto que a transcrição não tem (elisão: "do", "de")
ganha tempo interpolado entre as vizinhas. O tempo fica em analise/tempos.json (apague pra refazer).
Uso: python legendas.py  (depois do montar.py, que grava o 1105-edl.json com o tempo de cada trecho no vídeo final)
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
from trechos import TRECHOS  # noqa: E402

PUB = os.path.join(AQUI, "..", "..", "public", "legendas")
FF = os.path.join(os.environ["LOCALAPPDATA"], "CapCut", "Apps", "9.6.0.4097", "ffmpeg.exe")
BASE = os.path.join(AQUI, "..", "..", "public", "midia", "1105.mp4")
edl = json.load(open(os.path.join(PUB, "1105-edl.json"), encoding="utf-8"))
norm = lambda s: "".join(c for c in s.lower() if c.isalnum())

# headlines: (trecho, apoio, título). Apoio em manuscrito, título em Anton dourado; são palavras seguidas do texto.
HEADLINES = [
    ("abre", "dia", "inédito"),
    ("abre", "a nossa produção", "de carne"),
    ("parceria", "eu ia escolher", "outro frigorífico?"),
    ("parceria", "a melhor carne de", "hambúrguer"),
    ("parceria", "parceria", "topada."),
    ("eduardo", "a melhor", "qualidade"),
    ("confianca", "confiar no", "açougue"),
    ("confianca", "trabalham", "pelo certo."),
    ("blend", "conclusão do", "nosso blend."),
    ("exclusiva", "eu não cedo", "pra ninguém."),
    ("exclusiva", "a carne é", "só pra ele."),
    ("preza", "preza a", "qualidade"),
    ("camara", "dentro do coração do", "frigorífico."),
    ("higiene", "e esse padrão de", "higiene,"),
    ("temperatura", "dentro dos padrões de", "temperatura,"),
    ("temperatura", "eu sigo no", "meu lado."),
    ("moagem", "ambiente", "climatizado,"),
    ("moagem", "dentro do", "padrão."),
    ("crua", "dá vontade de comer", "crua."),
    ("todo-dia", "te entrega", "todo dia,"),
    ("todo-dia", "o melhor", "pra você."),
    ("chamada", "o melhor hambúrguer", "da sua vida."),
]
MAX = 4  # palavras por bloco de legenda corrente
INICIO_VOZ = {"exclusiva": 0.25}  # segundos depois do começo do trecho

# --- tempo de cada palavra, transcrevendo o trecho já cortado (áudio do vídeo-base) ----------------------------
ARQ_T = os.path.join(AQUI, "analise", "tempos.json")
if os.path.exists(ARQ_T):
    tempos_trecho = json.load(open(ARQ_T, encoding="utf-8"))
else:
    for sp in site.getsitepackages():
        for sub in ("nvidia/cublas/bin", "nvidia/cudnn/bin"):
            d = os.path.join(sp, sub)
            if os.path.isdir(d):
                os.add_dll_directory(d); os.environ["PATH"] = d + os.pathsep + os.environ["PATH"]
    import numpy as np
    from faster_whisper import WhisperModel
    wav = os.path.join(AQUI, "analise", "base16k.wav")
    subprocess.run([FF, "-v", "error", "-y", "-i", BASE, "-vn", "-ac", "1", "-ar", "16000", wav], check=True)
    with wave.open(wav) as w:
        x = np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(np.float32) / 32768
    m = WhisperModel("large-v3", device="cuda", compute_type="float16")
    tempos_trecho = {}
    for t in edl["trechos"]:
        if not t["som"]:
            continue
        pedaco = x[int(t["de"] * 16000): int(t["ate"] * 16000)]
        segs, _ = m.transcribe(pedaco, language="pt", beam_size=5, word_timestamps=True, condition_on_previous_text=False)
        tempos_trecho[t["id"]] = [{"p": p.word.strip(), "ini": round(t["de"] + p.start, 3), "fim": round(t["de"] + p.end, 3)}
                                  for s in segs for p in s.words]
    json.dump(tempos_trecho, open(ARQ_T, "w", encoding="utf-8"), ensure_ascii=False, indent=1)


def blocos_corridos(pal):
    """Quebra um trecho corrido (sem headline) em blocos de até MAX palavras: frases curtas inteiras, frases longas
    divididas por igual, e frase de 1–2 palavras junta com a vizinha quando cabe."""
    frases, atual = [], []
    for k in pal:
        atual.append(k)
        if re.search(r"[.?!]$", k[1]) or (re.search(r",$", k[1]) and not re.fullmatch(r"\d+,", k[1])):
            frases.append(atual); atual = []
    if atual:
        frases.append(atual)
    pedacos = []
    for f in frases:
        n = -(-len(f) // MAX)
        tamanhos = [len(f) // n + (1 if i < len(f) % n else 0) for i in range(n)]  # 13 palavras -> 4, 3, 3, 3
        ini = 0
        for tam in tamanhos:
            pedacos.append(f[ini:ini + tam]); ini += tam
    juntos = []
    for p in pedacos:
        fim_de_frase = juntos and re.search(r"[.?!]$", juntos[-1][-1][1])
        if juntos and not fim_de_frase and (len(p) <= 2 or len(juntos[-1]) <= 2) and len(juntos[-1]) + len(p) <= MAX:
            juntos[-1] = juntos[-1] + p
        else:
            juntos.append(p)
    return juntos


caps, saida = [], []
for t in edl["trechos"]:
    if not t["som"]:
        continue
    tr = next(x for x in TRECHOS if x["id"] == t["id"])
    texto = tr["txt"].split()
    fala = tempos_trecho[t["id"]]
    A, B = [norm(w) for w in texto], [norm(w["p"]) for w in fala]
    tempos = [None] * len(texto)
    for op, i1, i2, j1, j2 in difflib.SequenceMatcher(None, A, B, autojunk=False).get_opcodes():
        if op == "equal" or (op == "replace" and i2 - i1 == j2 - j1):
            for k in range(i2 - i1):
                w = fala[j1 + k]
                tempos[i1 + k] = [max(w["ini"], t["de"]), min(w["fim"], t["ate"])]
    conhecidos = [(i, x) for i, x in enumerate(tempos) if x]
    for i in range(len(tempos)):
        if tempos[i]:
            continue
        ant = max(((j, x) for j, x in conhecidos if j < i), default=(-1, [t["de"], t["de"]]))
        pro = min(((j, x) for j, x in conhecidos if j > i), default=(len(tempos), [t["ate"], t["ate"]]))
        passo = (pro[1][0] - ant[1][1]) / (pro[0] - ant[0])
        ini = ant[1][1] + passo * (i - ant[0] - 1)
        tempos[i] = [ini, ini + passo]
    # início real da voz (espectrograma), quando o Whisper marca a 1ª palavra tarde: "A carne" começa em 152,55 no
    # bruto (0,25 s depois do corte), e o large põe o "A" 0,33 s depois disso porque inventa um "Verdade" antes
    if t["id"] in INICIO_VOZ:
        tempos[0][0] = t["de"] + INICIO_VOZ[t["id"]]
    marca = [None] * len(texto)
    for tid, apoio, titulo in HEADLINES:
        if tid != t["id"]:
            continue
        alvo = [norm(w) for w in (apoio + " " + titulo).split()]
        for i in range(len(A) - len(alvo) + 1):
            if A[i:i + len(alvo)] == alvo and not any(marca[i:i + len(alvo)]):
                na = len(apoio.split())
                for k in range(len(alvo)):
                    marca[i + k] = "apoio" if k < na else "titulo"
                break
        else:
            raise SystemExit(f"headline não achada em {tid}: {apoio} | {titulo}")
    # grupos: cada headline é um bloco; o texto entre elas vira blocos corridos
    grupos, corrido, i = [], [], 0
    while i < len(texto):
        if marca[i]:
            if corrido:
                grupos += blocos_corridos(corrido); corrido = []
            j = i
            while j + 1 < len(texto) and marca[j + 1] == "titulo" or (j + 1 < len(texto) and marca[j] == "apoio" and marca[j + 1]):
                j += 1
            grupos.append([(k, texto[k]) for k in range(i, j + 1)])
            i = j + 1
        else:
            corrido.append((i, texto[i])); i += 1
    if corrido:
        grupos += blocos_corridos(corrido)
    # fala rápida: bloco corrido com menos de 0,55 s na tela junta com o vizinho corrido (até 6 palavras), pra dar
    # tempo de ler
    k = 0
    while k < len(grupos):
        g = grupos[k]
        dur = tempos[g[-1][0]][1] - tempos[g[0][0]][0]
        livre = lambda x: not any(marca[i] for i, _ in x)
        fecha = lambda x: re.search(r"[.?!]$", x[-1][1])  # nunca junta uma frase com a seguinte
        if livre(g) and dur < 0.55:
            if k > 0 and livre(grupos[k - 1]) and not fecha(grupos[k - 1]) and len(g) + len(grupos[k - 1]) <= 6:
                grupos[k - 1:k + 1] = [grupos[k - 1] + g]; k -= 1; continue
            if k + 1 < len(grupos) and livre(grupos[k + 1]) and not fecha(g) and len(g) + len(grupos[k + 1]) <= 6:
                grupos[k:k + 2] = [g + grupos[k + 1]]; continue
        k += 1
    for g in grupos:
        for n, (k, palavra) in enumerate(g):
            ultimo = n == len(g) - 1
            txt = re.sub(r"[.,]+$", "", palavra) if ultimo else palavra
            ini, fim = tempos[k]
            c = {"text": " " + txt.lower(), "startMs": round(ini * 1000), "endMs": round(fim * 1000),
                 "timestampMs": round((ini + fim) * 500), "confidence": None}
            if marca[k]:
                c["enfase"] = True
                if marca[k] == "apoio":
                    c["apoio"] = True
            if re.search(r"[.?!]$", palavra):
                c["fimDeFrase"] = True  # regra 16: efeito sonoro nunca em cima da última palavra da frase
            if ultimo:
                c["pageBreakAfter"] = True
            caps.append(c)
        k0 = g[0][0]
        saida.append(f"{tempos[k0][0]:6.2f}  {'[H] ' if marca[k0] else '    '}{' '.join(p for _, p in g)}")

json.dump(caps, open(os.path.join(PUB, "1105.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
open(os.path.join(AQUI, "analise", "legendas.txt"), "w", encoding="utf-8").write("\n".join(saida))
print(len(caps), "palavras,", len(saida), "blocos,", len(HEADLINES), "headlines")
