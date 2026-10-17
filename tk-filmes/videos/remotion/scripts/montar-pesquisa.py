"""Monta public/pesquisa/edicao.json do reels "Pesquisa o seu nome no Instagram" (ter 13/10 no calendário)
a partir das palavras faladas (scripts/pesquisa-palavras.json). Mesma gramática visual do "Pode ou não pode?".
uso: python scripts/montar-pesquisa.py
"""
import json, pathlib, unicodedata
R = pathlib.Path(__file__).resolve().parents[1]
FPS = 24
P = json.load(open(R / "scripts/pesquisa-palavras.json", encoding="utf-8"))
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
def chips(a, b, linhas, pos="baixo"):
    figs.append({"tipo": "chips", "from": F(a), "durationInFrames": F(b) - F(a), "pos": pos, "segue": False, "linhas": linhas})
def lin(texto, t, a, tom, cor=None):
    d = {"texto": texto, "atraso": F(t) - F(a), "fala": F(t) - F(a), "tom": tom}
    if cor: d["cor"] = cor
    return d
def frase(a, b, texto, t_fala, pos="baixo"):
    figs.append({"tipo": "frase", "from": F(a), "durationInFrames": F(b) - F(a), "texto": texto, "pos": pos, "fala": F(t_fala) - F(a)})

# 1 · "faz um teste rapidinho comigo… pesquisa o seu nome" → título com brilho + zoom
t_teste = acha("teste")
t_pesq = acha("pesquisa", t_teste)
t_cliente = acha("cliente", t_pesq)
a = t_teste - 0.15
figs.append({"tipo": "titulo", "from": F(a), "durationInFrames": F(t_pesq + 2.4) - F(a), "texto": "Faz o teste", "sub": "pesquisa o seu nome no Instagram", "fala": F(t_pesq) - F(a)})
zooms.append({"from": F(t_teste - 0.05), "durationInFrames": F(0.8), "escala": 1.07})
frase(t_cliente - 0.3, fim_frase(t_cliente) + 0.6, "Olha o seu perfil como se fosse cliente.", t_cliente)

# 2 · "O que apareceu? trend… vídeo perdido… buraco de 20 dias" → cartão com três linhas negativas
t_apar = acha("apareceu", t_cliente)
t_trend = acha("trend|atreende|atrend", t_apar)
t_perd = acha("perdido", t_trend)
t_bur = acha("buraco", t_perd)
t_pois = acha("pois", t_bur)
a = t_apar - 0.1
cartao(a, t_pois - 0.1, pos="baixo", etiqueta="o que apareceu?", linhas=[
    lin("uma trend de três semanas atrás", t_trend, a, "neg", CAR), lin("um vídeo bom perdido lá embaixo", t_perd, a, "neg", CAR), lin("vinte dias sem nada", t_bur, a, "neg", CAR)])
# "é isso que o seu cliente vê antes de mandar mensagem" → headline expansiva, palavra a palavra, com impacto
t_isso = acha("isso", t_pois)
t_que = acha("que", t_isso)
t_ve = acha("cliente", t_pois)
t_ver = acha("ver|ve", t_ve)
t_msg = acha("mensagem", t_ver)
h = t_isso - 0.15
figs.append({"tipo": "headline", "from": F(h), "durationInFrames": F(t_msg + 0.6) - F(h),
             "palavras": [{"texto": "é isso", "fala": F(t_isso) - F(h)}, {"texto": "que o seu", "fala": F(t_que) - F(h)}, {"texto": "cliente vê", "fala": F(t_ve) - F(h)}]})
for tt in (t_isso, t_ve):
    zooms.append({"from": F(tt - 0.05), "durationInFrames": F(0.7), "escala": 1.06})

# 3 · "não é que você não poste… não conversa entre si… não tem intenção… recomeço do zero" → título
t_olha = acha("olha", t_ve)
t_int = acha("intencao", t_olha)
t_zero = acha("zero", t_int)
a = t_int - 0.2
figs.append({"tipo": "titulo", "from": F(a), "durationInFrames": F(fim_frase(t_zero) + 1.0) - F(a), "texto": "Sem intenção", "sub": "cada post é um recomeço do zero", "fala": F(t_int) - F(a)})
zooms.append({"from": F(t_olha - 0.1), "durationInFrames": F(1.0), "escala": 1.06})

# 4 · "faz o seguinte: uma dúvida… três conteúdos… vídeos, stories, prints" → cartão de passos
t_seg = acha("seguinte", t_zero)
t_duv = acha("duvida", t_seg)
t_tres = acha("tres", t_duv)
t_vid = acha("videos|video", t_tres)
t_sto = acha("stories|story", t_vid)
t_pri = acha("print", t_sto)
a = t_seg - 0.1
cartao(a, t_vid - 0.4, pos="baixo", etiqueta="faz o seguinte", linhas=[
    lin("uma dúvida que o cliente sempre faz", t_duv, a, "pos"), lin("três conteúdos respondendo só ela", t_tres, a, "pos", CAR)])
# os exemplos, desenhados: vídeo, stories, print de conversa, cada um na palavra
a = t_vid - 0.3
figs.append({"tipo": "tres", "from": F(a), "durationInFrames": F(fim_frase(t_pri) + 1.2) - F(a), "falas": [F(t_vid) - F(a), F(t_sto) - F(a), F(t_pri) - F(a)]})

# 5 · "fixe o melhor… no topo do perfil… em um segundo" → frases simples
t_fix = acha("fixe|fixa", t_pri)
t_topo = acha("topo", t_fix)
t_segundo = acha("segundo", t_topo)
t_rolar = acha("rolar", t_segundo)
t_baixo = acha("baixo", t_rolar)
a = t_fix - 0.2
figs.append({"tipo": "fixar", "from": F(a), "durationInFrames": F(acha("porque|agora", t_topo) - 0.1) - F(a), "fala": F(t_topo) - F(a)})
frase(acha("porque|agora", t_topo) - 0.05, t_rolar - 0.6, "Quem chega entende em um segundo.", t_segundo)
a = t_rolar - 0.5
figs.append({"tipo": "rolar", "from": F(a), "durationInFrames": F(fim_frase(t_baixo) + 0.5) - F(a), "fala": F(t_rolar) - F(a)})

# 6 · "dois dias fixos… postar certo… virar hábito" → chips
t_dois = acha("dois", t_segundo)
t_certo = acha("certo", t_dois)
t_hab = acha("habito", t_certo)
# calendário de um mês subindo atrás dela (recorte em public/pesquisa/pessoa), terça e quinta acendendo semana a semana
a = t_dois - 0.3
figs.append({"tipo": "calendario", "from": F(a), "durationInFrames": F(min(fim_frase(t_hab) + 0.6, 74.4)) - F(a), "dias": [1, 3], "fala": F(acha("fixos", t_dois)) - F(a), "pessoa": "pesquisa/pessoa"})
frase(t_certo - 0.2, fim_frase(t_hab) + 0.5, "Não é postar mais. É postar certo.", t_certo)

# 7 · "faz isso durante um mês… repete a pesquisa… o perfil é o mesmo, mas a leitura não" → título + salvar
t_mes = acha("mes", t_hab)
t_perfil = acha("perfil", t_mes)
t_leit = acha("leitura", t_perfil)
frase(t_mes - 0.15, t_perfil - 0.3, "Faz isso por um mês e pesquisa de novo.", t_mes)
a = t_perfil - 0.15
figs.append({"tipo": "titulo", "from": F(a), "durationInFrames": F(P[-1]["fim"] + 0.1) - F(a), "texto": "O perfil é o mesmo.", "sub": "a leitura dele, não", "fala": F(t_leit) - F(a)})
zooms.append({"from": F(t_perfil - 0.2), "durationInFrames": F(1.2), "escala": 1.07})
t_fim_fala = P[-1]["fim"]
figs.append({"tipo": "salvar", "from": F(t_fim_fala + 0.15), "durationInFrames": F(2.2), "fala": F(0.5)})
figs.append({"tipo": "logo", "from": F(t_fim_fala + 2.3), "durationInFrames": F(2.8)})

# nada se sobrepõe: cada figura termina 6 frames antes da próxima
seq = [f for f in figs if f["tipo"] not in ("headline", "calendario", "logo")]
seq.sort(key=lambda f: f["from"])
for f, g in zip(seq, seq[1:]):
    f["durationInFrames"] = min(f["durationInFrames"], max(F(1.5), g["from"] - f["from"] - 6))
reenq = []  # nada de reenquadrar: ela não quer o vídeo saindo do quadro
dur = F(P[-1]["fim"] + 2.3 + 2.8)

# legendas normais nos buracos
ocupado = sorted((f["from"], f["from"] + f["durationInFrames"]) for f in figs if f["tipo"] != "calendario")
def livre(fr): return not any(a - 6 <= fr < b for a, b in ocupado)
def proximo_inicio(fr):
    return min((a for a, b in ocupado if a > fr), default=10**9)
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
d = {"fps": FPS, "etapa": "completo", "grade": "H", "estilo": "caps", "fonte": "pesquisa/bruto.mp4",
     "clipes": [{"id": "cortado", "trimBefore": 0, "from": 0, "durationInFrames": dur, "zoom": 1.0}],
     "textos": [], "figuras": figs, "legendas": legendas, "zooms": zooms, "reenquadramentos": reenq}
json.dump(d, open(R / "public/pesquisa/edicao.json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)
for f in sorted(figs, key=lambda f: f["from"]): print(f["tipo"], round(f["from"] / FPS, 1), "s", f.get("texto") or f.get("etiqueta") or "")
print("duração", round(dur / FPS, 1), "s")
