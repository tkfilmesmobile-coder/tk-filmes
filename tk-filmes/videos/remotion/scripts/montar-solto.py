"""Monta public/solto/edicao.json do reels "Vídeo solto não vende" a partir das palavras faladas
(scripts/solto-palavras.json). Mesma gramática visual dos outros reels da TK.
uso: python scripts/montar-solto.py
"""
import json, pathlib, unicodedata
R = pathlib.Path(__file__).resolve().parents[1]
FPS = 24
P = json.load(open(R / "scripts/solto-palavras.json", encoding="utf-8"))
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

# 0 · "vídeo solto não vende" → headline expansiva (mesmo padrão dos outros reels)
t_bonito = acha("bonito")
t_pois = acha("pois", t_bonito)
t_solto = acha("solto", t_pois)
t_nao0 = acha("nao", t_solto)
t_vende = acha("vende", t_nao0)
h = t_solto - 0.3
figs.append({"tipo": "headline", "from": F(h), "durationInFrames": F(t_vende + 1.2) - F(h),
             "palavras": [{"texto": "vídeo solto", "fala": F(t_solto) - F(h)}, {"texto": "não vende", "fala": F(t_nao0) - F(h)}]})
zooms.append({"from": F(t_vende - 0.05), "durationInFrames": F(0.8), "escala": 1.06})

# 1 · "cartão de visita jogado na rua" → frase simples, parada
t_cartao = acha("cartao", t_vende)
t_ignorado = acha("ignorado", t_cartao)
frase(t_cartao - 0.2, fim_frase(t_ignorado) + 0.6, "Cartão de visita jogado na rua: bonito, e ninguém sabe o que fazer com ele.", t_cartao)

# 2 · "antes: responder uma pergunta real do cliente" → comentário em movimento; "depois: apontar" → logos
t_trab = acha("trabalha", t_ignorado)
t_antes = acha("antes", t_trab, 2)
t_depois = acha("depois", t_antes)
t_whats = acha("whatsapp", t_depois)
t_sto = acha("stories", t_whats)
t_lugar = acha("lugar", t_sto)
a = t_antes - 0.1
figs.append({"tipo": "comentario", "from": F(a), "durationInFrames": F(t_depois - 0.3) - F(a), "usuario": "cliente",
             "pergunta": "Vocês atendem aos sábados?", "resposta": "Atendemos! Te explico aqui.", "fala": F(t_antes + 0.6) - F(a)})
a = t_depois - 0.1
figs.append({"tipo": "assets", "from": F(a), "durationInFrames": F(fim_frase(t_lugar) + 0.8) - F(a),
             "itens": [{"icone": "whatsapp", "rotulo": "seu whatsapp", "fala": F(t_whats) - F(a)},
                       {"icone": "stories", "rotulo": "caixinha de stories", "fala": F(t_sto) - F(a)},
                       {"icone": "play", "rotulo": "próximo vídeo", "fala": F(t_lugar) - F(a)}]})

# 3 · "agora, o que mais acontece… dia seguinte… não achou continuação" → frase simples (sem pílula)
t_agora = acha("agora", t_lugar)
t_seg = acha("seguinte", t_agora)
t_cont = acha("continuacao", t_seg)
frase(t_agora - 0.1, fim_frase(t_cont) + 0.7, "No dia seguinte o perfil muda de assunto, e o cliente não acha a continuação.", t_seg)

# 4 · "o vídeo é a porta de entrada" → headline + porta abrindo atrás dela
t_nao = acha("nao", t_cont)
t_porta = acha("porta", t_nao)
t_entrada = acha("entrada", t_porta)
h = t_porta - 0.6
h_porta = h
fim_porta = min(fim_frase(t_entrada) + 1.6, 54.5)
figs.append({"tipo": "porta", "from": F(h), "durationInFrames": F(fim_porta) - F(h), "fala": F(t_porta) - F(h), "pessoa": "solto/pessoa"})
figs.append({"tipo": "headline", "from": F(h), "durationInFrames": F(fim_frase(t_entrada) + 1.0) - F(h),
             "palavras": [{"texto": "o vídeo", "fala": F(t_porta - 0.5) - F(h)}, {"texto": "é a porta", "fala": F(t_porta) - F(h)}, {"texto": "de entrada", "fala": F(t_entrada) - F(h)}]})
zooms.append({"from": F(t_porta - 0.05), "durationInFrames": F(0.8), "escala": 1.06})

# 5 · "faz assim: stories chamando → comentários com a próxima pergunta → vídeo sobre ela"
t_faz = acha("pega", t_entrada)
t_stories = acha("stories", t_faz)
t_coment = acha("comentarios", t_stories)
t_video = acha("video", t_coment)
t_salva = acha("salva", t_video)
a = t_stories - 0.2
figs.append({"tipo": "assets", "from": F(a), "durationInFrames": F(t_coment - 0.4) - F(a),
             "itens": [{"icone": "stories", "rotulo": "stories hoje, chamando pro vídeo", "fala": F(t_stories) - F(a)}]})
a = t_coment - 0.2
figs.append({"tipo": "comentario", "from": F(a), "durationInFrames": F(t_video - 0.4) - F(a), "usuario": "cliente",
             "pergunta": "E se eu tiver outra dúvida?", "resposta": "Boa! Essa vira o próximo vídeo.", "fala": F(t_coment + 0.2) - F(a)})
a = t_video - 0.2
figs.append({"tipo": "assets", "from": F(a), "durationInFrames": F(t_salva - 0.35) - F(a),
             "itens": [{"icone": "play", "rotulo": "o próximo vídeo responde ela", "fala": F(t_video) - F(a)}]})

# 6 · "salva" → Salvar na palavra; logo no fim
t_fim_fala = P[-1]["fim"]
figs.append({"tipo": "salvar", "from": F(t_salva - 0.15), "durationInFrames": F(t_fim_fala + 1.2) - F(t_salva - 0.15), "fala": F(0.35)})
figs.append({"tipo": "logo", "from": F(t_fim_fala + 1.3), "durationInFrames": F(2.8)})

seq = [f for f in figs if f["tipo"] not in ("logo", "headline", "porta")]
seq.sort(key=lambda f: f["from"])
for f, g in zip(seq, seq[1:]):
    f["durationInFrames"] = min(f["durationInFrames"], max(F(1.5), g["from"] - f["from"] - 6))
reenq = [{"from": F(h_porta - 0.3), "durationInFrames": F(fim_porta) - F(h_porta - 0.3), "escala": 1.22}]
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
d = {"fps": FPS, "etapa": "completo", "grade": "H", "estilo": "caps", "fonte": "solto/bruto.mp4",
     "clipes": [{"id": "cortado", "trimBefore": 0, "from": 0, "durationInFrames": dur, "zoom": 1.0}],
     "textos": [], "figuras": figs, "legendas": legendas, "zooms": zooms, "reenquadramentos": reenq}
json.dump(d, open(R / "public/solto/edicao.json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)
for f in sorted(figs, key=lambda f: f["from"]): print(f["tipo"], round(f["from"] / FPS, 1), "s", f.get("texto") or f.get("etiqueta") or "")
print("duração", round(dur / FPS, 1), "s")
