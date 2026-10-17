"""Monta public/pode/edicao.json do "Pode ou não pode?" a partir das palavras faladas (scripts/pode-palavras.json).
Cada figura é ancorada na primeira ocorrência de uma palavra-chave depois de um instante mínimo.
uso: python scripts/montar-pode.py
"""
import json, pathlib, unicodedata
R = pathlib.Path(__file__).resolve().parents[1]
FPS = 24
P = json.load(open(R / "scripts/pode-palavras.json", encoding="utf-8"))
F = lambda s: round(s * FPS)
CAR = "#E3B48C"

def norm(t):
    t = unicodedata.normalize("NFD", t.lower())
    return "".join(c for c in t if unicodedata.category(c) != "Mn").strip(".,!?…:;\"'“”")

def acha(palavra, depois=0.0, n=1):
    """instante (s) da n-ésima ocorrência da palavra (ou de uma das alternativas, separadas por |) depois de `depois`"""
    k = 0
    alts = [norm(x) for x in palavra.split("|")]
    for p in P:
        if p["ini"] >= depois and any(norm(p["texto"]).startswith(a) for a in alts):
            k += 1
            if k == n: return p["ini"]
    raise SystemExit(f"palavra não achada: {palavra} depois de {depois}")

def fim_frase(depois):
    """fim da última palavra antes de uma pausa > 0.5s após `depois` (fim natural da frase)"""
    ant = None
    for p in P:
        if p["ini"] < depois: continue
        if ant and p["ini"] - ant["fim"] > 0.5: return ant["fim"]
        ant = p
    return P[-1]["fim"]

figs, zooms = [], []
def cartao(a, b, **k):
    figs.append({"tipo": "cartao", "from": F(a), "durationInFrames": F(b) - F(a), "segue": True, **k})
def chips(a, b, linhas, pos="baixo"):
    figs.append({"tipo": "chips", "from": F(a), "durationInFrames": F(b) - F(a), "pos": pos, "segue": True, "linhas": linhas})
def lin(texto, t, a, tom, cor=None):
    d = {"texto": texto, "atraso": F(t) - F(a), "fala": F(t) - F(a), "tom": tom}
    if cor: d["cor"] = cor
    return d

# 0 · "Médico, dentista, advogado" → headline atrás da cabeça, com impacto e zoom por palavra
t_m0, t_d0, t_a0 = acha("medico"), acha("dentista", 0.3), acha("advogado", 0.6)
h0 = t_m0 - 0.1
figs.append({"tipo": "headline", "from": F(h0), "durationInFrames": F(t_a0 + 2.2) - F(h0),
             "palavras": [{"texto": "médico", "fala": F(t_m0) - F(h0)}, {"texto": "dentista", "fala": F(t_d0) - F(h0)}, {"texto": "advogado", "fala": F(t_a0) - F(h0)}]})
for tt in (t_m0, t_d0, t_a0):
    zooms.append({"from": F(tt - 0.05), "durationInFrames": F(0.7), "escala": 1.08})

# 1 · "Gente, calma. Deixa sim." → título arredondado acima da cabeça, com brilho
t_calma = acha("calma")
t_deixa = acha("deixa|libera", t_calma)
a = t_calma - 0.2
figs.append({"tipo": "titulo", "from": F(a), "durationInFrames": F(t_deixa + 2.6) - F(a), "texto": "Pode ou não pode?", "sub": "o conselho deixa, sim", "fala": F(t_deixa) - F(a)})

# 2 · "você, consultório, local de trabalho, equipe" → chips
t_voce = acha("voce", t_deixa + 1.0)
t_cons = acha("consult", t_voce)
t_equipe = acha("equipe", t_cons)
a = t_voce - 0.1
# as pílulas somem logo depois de "os três conselhos liberam, sim"
t_sim = acha("sim|liberam", t_equipe) + 0.9
chips(a, t_sim + 0.4, [lin("você", t_voce, a, "pos"), lin("seu consultório", t_cons, a, "pos"), lin("sua equipe", t_equipe, a, "pos")])
figs.append({"tipo": "sutil", "from": F(t_sim + 0.55), "durationInFrames": F(2.2), "texto": "liberado pelos três conselhos"})

# 2b · "a dúvida que o cliente mais te faz" → dois adesivos de pergunta com exemplos
t_duv = acha("duvida", t_sim)
t_nome = acha("nome", t_duv)
figs.append({"tipo": "stickers", "from": F(t_duv - 0.1), "durationInFrames": F(t_nome - 0.3) - F(t_duv - 0.1), "exemplos": ["Dói? 😬", "Preciso de advogado pra isso?"]})

# 3 · "conteúdo informativo" → título arredondado com brilho
t_info = acha("informativo", t_nome)
a = t_nome - 0.1
figs.append({"tipo": "titulo", "from": F(a), "durationInFrames": F(fim_frase(t_info) + 1.2) - F(a), "texto": "Conteúdo informativo", "sub": "isso tem até nome", "fala": F(t_info) - F(a)})

# 4 · "valor da consulta": entra na palavra "valor", não antes
t_med = acha("medico", t_info)
t_valor = acha("valor", t_med)
t_dent = acha("dentista", t_valor)
t_adv = acha("advogado", t_dent)
t_nao = acha("nao", t_adv) if any(norm(q["texto"]).startswith("nao") and q["ini"] > t_adv for q in P) else t_adv + 0.6
a = t_valor - 0.1
cartao(a, fim_frase(t_nao) + 1.0, pos="baixo", etiqueta="valor da consulta", linhas=[
    lin("médico · pode", t_valor, a, "pos"), lin("dentista", t_dent, a, "neg", CAR), lin("advogado", t_nao, a, "neg", CAR)])

# 5 · "ninguém pode: prometer milagre, resultado perfeito"
t_ning = acha("ninguem", t_nao)
t_mil = acha("milagre", t_ning)
t_perf = acha("perfeito", t_mil)
a = t_ning - 0.1
cartao(a, fim_frase(t_perf) + 1.0, pos="baixo", etiqueta="ninguém pode", linhas=[lin("prometer milagre", t_mil, a, "neg", CAR), lin("resultado perfeito", t_perf, a, "neg", CAR)])
zooms.append({"from": F(t_ning - 0.2), "durationInFrames": F(2.4), "escala": 1.07})

# 6 · "hoje… semana que vem… CRM, CRO ou OAB" → chips
t_hoje = acha("hoje", t_perf)
t_sem = acha("semana|outro", t_hoje)
t_crm = acha("crm", t_sem)
a = t_hoje - 0.1
figs.append({"tipo": "frase", "from": F(a), "durationInFrames": F(t_sem - 0.15) - F(a), "texto": "Começa hoje pelo mais fácil: mostra o seu espaço.", "fala": F(acha("espaco|espaço", t_hoje)) - F(a)})
figs.append({"tipo": "frase", "from": F(t_sem - 0.1), "durationInFrames": F(t_crm - 0.15) - F(t_sem - 0.1), "texto": "Outro dia, responde a dúvida do seu cliente.", "fala": F(acha("duvida", t_sem)) - F(t_sem - 0.1)})
figs.append({"tipo": "frase", "from": F(t_crm - 0.1), "durationInFrames": F(fim_frase(t_crm) + 0.8) - F(t_crm - 0.1), "texto": "CRM, CRO ou OAB na legenda.", "fala": 3})

# 7 · "salva" → fecho
# 7 · "as regras ... estão aqui embaixo, na legenda" → frase simples; o "Salvar" só depois que a fala termina
t_regras = acha("regras", t_crm)
t_fim_fala = P[-1]["fim"]
figs.append({"tipo": "frase", "from": F(t_regras - 0.1), "durationInFrames": F(t_fim_fala + 0.1) - F(t_regras - 0.1), "texto": "As regras, com nome e número, estão na legenda 👇", "fala": F(acha("legenda", t_regras)) - F(t_regras - 0.1)})
figs.append({"tipo": "salvar", "from": F(t_fim_fala + 0.15), "durationInFrames": F(2.2), "fala": F(0.5)})
figs.append({"tipo": "logo", "from": F(t_fim_fala + 2.3), "durationInFrames": F(2.8)})

# cada figura (menos a headline) termina 6 frames antes da próxima começar: nada se sobrepõe
seq = [f for f in figs if f["tipo"] not in ("headline", "logo")]
seq.sort(key=lambda f: f["from"])
for f, g in zip(seq, seq[1:]):
    f["durationInFrames"] = min(f["durationInFrames"], max(F(1.5), g["from"] - f["from"] - 6))
# reenquadramentos (zoom leve acompanhando o rosto) em dois momentos
reenq = [{"from": F(h0 - 0.3), "durationInFrames": F(t_a0 + 2.4) - F(h0 - 0.3), "escala": 1.12},
         {"from": F(t_ning - 0.4), "durationInFrames": F(fim_frase(t_perf) + 0.6) - F(t_ning - 0.4), "escala": 1.1}]
dur = F(P[-1]["fim"] + 2.3 + 2.8)

# legendas normais nos trechos sem arte: grupos de até 4 palavras (duas linhas no máximo)
ocupado = []
for f in figs:
    ocupado.append((f["from"], f["from"] + f["durationInFrames"]))
def livre(fr): return not any(a <= fr < b for a, b in ocupado)
legendas = []; grupo = []
def fecha():
    global grupo
    if not grupo: return
    a, b = F(grupo[0]["ini"]), F(grupo[-1]["fim"] + 0.15)
    if b - a >= 4: legendas.append({"from": a, "durationInFrames": b - a, "texto": " ".join(g["texto"] for g in grupo)})
    grupo = []
for w in P:
    fr = F(w["ini"])
    if not livre(fr): fecha(); continue
    if grupo and (len(grupo) >= 3 or w["ini"] - grupo[-1]["fim"] > 0.6 or sum(len(g["texto"]) for g in grupo) + len(w["texto"]) > 22): fecha()
    grupo.append(w)
fecha()
d = {"fps": FPS, "etapa": "completo", "grade": "H", "estilo": "caps", "fonte": "pode/bruto.mp4",
     "clipes": [{"id": "cortado", "trimBefore": 0, "from": 0, "durationInFrames": dur, "zoom": 1.0}],
     "textos": [], "figuras": figs, "legendas": legendas, "zooms": zooms, "reenquadramentos": reenq}
json.dump(d, open(R / "public/pode/edicao.json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)
for f in figs: print(f["tipo"], round(f["from"] / FPS, 1), "s", f.get("titulo") or f.get("etiqueta") or "")
print("duração", round(dur / FPS, 1), "s")
