"""Monta public/amador/edicao.json do reels "3 erros que deixam seu vídeo com cara de amador" a partir das
palavras faladas (scripts/amador-palavras.json). Mesma gramática visual dos outros reels da TK.
uso: python scripts/montar-amador.py
"""
import json, pathlib, unicodedata
R = pathlib.Path(__file__).resolve().parents[1]
FPS = 24
P = json.load(open(R / "scripts/amador-palavras.json", encoding="utf-8"))
F = lambda s: round(s * FPS)
CAR = "#E3B48C"

def norm(t):
    t = unicodedata.normalize("NFD", t.lower())
    return "".join(c for c in t if unicodedata.category(c) != "Mn").strip(".,!?…:;\"'“”")

def acha(palavra, depois=0.0, n=1):
    k = 0
    alts = [norm(x) for x in palavra.split("|")]
    for p in P:
        if p["ini"] >= depois and any(norm(p["texto"]).startswith(a) for a in alts):
            k += 1
            if k == n: return p["ini"]
    raise SystemExit(f"palavra não achada: {palavra} depois de {depois}")

def fim_frase(depois):
    ant = None
    for p in P:
        if p["ini"] < depois: continue
        if ant and p["ini"] - ant["fim"] > 0.5: return ant["fim"]
        ant = p
    return P[-1]["fim"]

figs, zooms = [], []
def cartao(a, b, **k):
    figs.append({"tipo": "cartao", "from": F(a), "durationInFrames": F(b) - F(a), "segue": False, **k})
def lin(texto, t, a, tom, cor=None):
    d = {"texto": texto, "atraso": F(t) - F(a), "fala": F(t) - F(a), "tom": tom}
    if cor: d["cor"] = cor
    return d
def frase(a, b, texto, t_fala, pos="baixo"):
    figs.append({"tipo": "frase", "from": F(a), "durationInFrames": F(b) - F(a), "texto": texto, "pos": pos, "fala": F(t_fala) - F(a)})

# 0 · "cara de amador… longe de ser a câmera" → título com brilho na "câmera"
t_amador = acha("amador")
t_cam = acha("camera", t_amador)
a = t_amador - 0.2
figs.append({"tipo": "titulo", "from": F(a), "durationInFrames": F(fim_frase(t_cam) + 0.8) - F(a), "texto": "Cara de amador?", "sub": "a câmera não tem culpa", "fala": F(t_cam) - F(a)})
zooms.append({"from": F(t_amador - 0.05), "durationInFrames": F(0.8), "escala": 1.07})

# 1 · iluminação: janela atrás → rosto escuro, fundo estourado; vira de frente
t_ilu = acha("iluminacao|primeiro", t_cam)
t_janela = acha("janela", t_ilu)
t_escuro = acha("escuro", t_janela)
t_estour = acha("estourado", t_escuro)
t_vira = acha("vira", t_estour)
t_frente = acha("frente", t_vira)
a = t_ilu - 0.1
cartao(a, fim_frase(t_frente) + 0.8, pos="baixo", etiqueta="luz", linhas=[
    lin("janela atrás de você", t_janela, a, "neg", CAR), lin("rosto escuro, fundo estourado", t_escuro, a, "neg", CAR), lin("vira de frente pra janela", t_vira, a, "pos")])

# 2 · altura da lente: celular de baixo pra cima → queixo e teto; na altura dos olhos; livros
t_alt = acha("altura", t_frente)
t_olhos = acha("olhos", t_alt)
t_baixo = acha("baixo", t_olhos)
t_queixo = acha("queixo", t_baixo)
t_livros = acha("livros|livro", t_queixo)
a = t_alt - 0.1
cartao(a, fim_frase(t_livros) + 0.8, pos="baixo", etiqueta="altura da lente", linhas=[
    lin("lente na altura dos olhos", t_olhos, a, "pos"), lin("de baixo pra cima: queixo e teto", t_baixo, a, "neg", CAR), lin("empilha uns livros", t_livros, a, "pos")])

# 3 · áudio: sala vazia → eco, voz distante; aproxima, microfone, sofá e cortina
t_aud = acha("audio", t_livros)
t_eco = acha("eco", t_aud)
t_dist = acha("distante", t_eco)
t_aprox = acha("aproxima", t_dist)
t_mic = acha("microfone", t_aprox)
t_sofa = acha("sofa", t_mic)
a = t_aud - 0.1
cartao(a, min(fim_frase(t_sofa) + 0.8, acha("nada", t_sofa) - 0.3), pos="baixo", etiqueta="áudio", linhas=[
    lin("sala vazia: eco, voz distante", t_eco, a, "neg", CAR), lin("aproxima o celular", t_aprox, a, "pos"), lin("microfone · sofá · cortina", t_mic, a, "pos")])

# 4 · "nada disso é equipamento. é direção." → headline expansiva
t_nada = acha("nada", t_sofa)
t_equip = acha("equipamento", t_nada)
t_dir = acha("direcao", t_equip)
t_det = acha("detalhe", t_dir)
h = t_nada - 0.1
figs.append({"tipo": "headline", "from": F(h), "durationInFrames": F(t_dir + 1.6) - F(h),
             "palavras": [{"texto": "não é", "fala": F(t_nada) - F(h)}, {"texto": "equipamento", "fala": F(t_equip) - F(h)}, {"texto": "é direção", "fala": F(t_dir) - F(h)}]})
zooms.append({"from": F(t_dir - 0.05), "durationInFrames": F(0.8), "escala": 1.07})
# recap desenhado dos três detalhes em "prestar atenção em cada detalhe"
t_prestar = acha("prestar|atencao", t_dir)
a = t_prestar - 0.2
figs.append({"tipo": "tres", "from": F(a), "durationInFrames": F(fim_frase(t_det) + 1.0) - F(a),
             "falas": [F(t_prestar) - F(a), F(t_prestar + 0.35) - F(a), F(t_prestar + 0.7) - F(a)],
             "itens": [{"rotulo": "luz", "desenho": "luz"}, {"rotulo": "altura da lente", "desenho": "lente"}, {"rotulo": "áudio", "desenho": "mic"}]})

# 5 · "faz o teste agora: dez segundos como antes, dez segundos prestando atenção" → frase
t_teste = acha("teste", t_det)
t_dez = acha("10|dez", t_teste)
t_fim_fala = P[-1]["fim"]
t_salva = acha("salva", t_dez)
frase(t_teste - 0.15, t_salva - 0.25, "Dez segundos como antes. Dez segundos corrigindo. Compara.", t_dez)
figs.append({"tipo": "salvar", "from": F(t_salva - 0.15), "durationInFrames": F(t_fim_fala + 1.2) - F(t_salva - 0.15), "fala": F(0.35)})
figs.append({"tipo": "logo", "from": F(t_fim_fala + 1.3), "durationInFrames": F(2.8)})

seq = [f for f in figs if f["tipo"] not in ("headline", "logo")]
seq.sort(key=lambda f: f["from"])
for f, g in zip(seq, seq[1:]):
    f["durationInFrames"] = min(f["durationInFrames"], max(F(1.5), g["from"] - f["from"] - 6))
reenq = []
dur = F(P[-1]["fim"] + 1.3 + 2.8)

ocupado = sorted((f["from"], f["from"] + f["durationInFrames"]) for f in figs)
def livre(fr): return not any(a - 6 <= fr < b for a, b in ocupado)
def proximo_inicio(fr): return min((a for a, b in ocupado if a > fr), default=10**9)
legendas = []; grupo = []
def fecha():
    global grupo
    if not grupo: return
    a, b = F(grupo[0]["ini"]), F(grupo[-1]["fim"] + 0.15)
    b = min(b, proximo_inicio(a) - 3)
    if b - a >= 4: legendas.append({"from": a, "durationInFrames": b - a, "texto": " ".join(g["texto"] for g in grupo)})
    grupo = []
for w in P:
    fr = F(w["ini"])
    if not livre(fr): fecha(); continue
    if grupo and (len(grupo) >= 3 or w["ini"] - grupo[-1]["fim"] > 0.6 or sum(len(g["texto"]) for g in grupo) + len(w["texto"]) > 22): fecha()
    grupo.append(w)
fecha()
d = {"fps": FPS, "etapa": "completo", "grade": "H", "estilo": "caps", "fonte": "amador/bruto.mp4",
     "clipes": [{"id": "cortado", "trimBefore": 0, "from": 0, "durationInFrames": dur, "zoom": 1.0}],
     "textos": [], "figuras": figs, "legendas": legendas, "zooms": zooms, "reenquadramentos": reenq}
json.dump(d, open(R / "public/amador/edicao.json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)
for f in sorted(figs, key=lambda f: f["from"]): print(f["tipo"], round(f["from"] / FPS, 1), "s", f.get("texto") or f.get("etiqueta") or "")
print("duração", round(dur / FPS, 1), "s")
