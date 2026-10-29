"""Monta public/eleicao/edicao.json do reels "A virada não foi sorte" (V10, 2026-10-27) a partir das palavras
faladas (scripts/eleicao-palavras.json). Mesma gramática visual dos outros reels da TK.
Enquadramento fechado (a cabeça encosta no topo): legenda abaixo do queixo e títulos no "fecho" (embaixo),
em vez de headline acima da cabeça.
uso: python scripts/montar-eleicao.py
"""
import json, pathlib, unicodedata
R = pathlib.Path(__file__).resolve().parents[1]
FPS = 24
P = json.load(open(R / "scripts/eleicao-palavras.json", encoding="utf-8"))
# correções da transcrição (o que ela falou de verdade)
CORRIGE = {"aniversário": "adversário", "lados": "dados"}
for p in P:
    base = p["texto"].strip(".,!?")
    if base.lower() in CORRIGE:
        p["texto"] = p["texto"].replace(base, CORRIGE[base.lower()])
F = lambda s: round(s * FPS)

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

def fim_da_palavra(palavra, depois=0.0):
    alts = [norm(x) for x in palavra.split("|")]
    for p in P:
        if p["ini"] >= depois and any(norm(p["texto"]).startswith(a) for a in alts): return p["fim"]
    raise SystemExit(f"palavra não achada: {palavra}")

figs, zooms = [], []
def fecho(a, b, titulo, t_fala, sub=None):
    d = {"tipo": "fecho", "from": F(a), "durationInFrames": F(b) - F(a), "titulo": titulo, "fala": F(t_fala) - F(a)}
    if sub: d["sub"] = sub
    figs.append(d)
def frase(a, b, texto, t_fala):
    figs.append({"tipo": "frase", "from": F(a), "durationInFrames": F(b) - F(a), "texto": texto, "pos": "baixo", "fala": F(t_fala) - F(a)})
def sutil(a, b, texto):
    figs.append({"tipo": "sutil", "from": F(a), "durationInFrames": F(b) - F(a), "texto": texto})
def lin(texto, t, a, tom=None):
    d = {"texto": texto, "atraso": F(t) - F(a), "fala": F(t) - F(a)}
    if tom: d["tom"] = tom
    return d

CARAMELO = "#E3B48C"
def headline(a, b, palavras):
    """palavras: [(texto, t_fala, cor|None)] · caixa alta, fonte arredondada, sem pílula, no terço de baixo"""
    figs.append({"tipo": "headline", "from": F(a), "durationInFrames": F(b) - F(a), "pos": "baixo",
                 "palavras": [dict(texto=t, fala=F(tf) - F(a), **({"cor": c} if c else {})) for t, tf, c in palavras]})

# 0 · "uma grande virada nas eleições… ótima aula de estratégia"
t_virada = acha("virada")
t_aula = acha("aula", t_virada)
t_calma = acha("calma", t_aula)
headline(t_virada - 0.2, t_calma - 0.15, [("a virada", t_virada, None), ("aula de estratégia", t_aula, CARAMELO)])
zooms.append({"from": F(t_virada - 0.05), "durationInFrames": F(0.8), "escala": 1.06})

# 1 · "calma, não é sobre o lado"
t_e = acha("e", acha("lado", t_calma))
sutil(t_calma - 0.05, t_e - 0.1, "não é sobre lado")

# 2 · "onde colocar a energia do seu negócio"
t_energia = acha("energia", t_e)
t_depois = acha("depois", t_energia)
frase(t_e - 0.05, t_depois - 0.2, "Onde colocar a energia do seu negócio?", t_energia)

# 3 · "convencer quem votou no adversário era difícil… mas tinha milhões que nem foram votar"
#     → prova: a manchete do Correio da Manhã (06/10/2026) sobre a mudança de estratégia
t_conv = acha("convencer", t_depois)
t_milhoes = acha("milhoes", t_conv)
t_eai = acha("e", fim_da_palavra("votar", t_milhoes))
t_foco = acha("foco", t_eai)
a = t_milhoes - 0.3
figs.append({"tipo": "manchete", "from": F(a), "durationInFrames": F(t_foco - 0.35) - F(a), "veiculo": "Correio da Manhã", "data": "06/10/2026",
             "texto": "Lula muda estratégia e mira 33 milhões de ausentes para tentar virar eleição no 2º turno", "fala": F(t_milhoes) - F(a)})

# 4 · "o foco seria esse público"
t_esse = acha("esse", t_foco)
t_toda = acha("toda", t_foco)
headline(t_foco - 0.25, t_toda - 0.1, [("o foco:", t_foco, None), ("quem não votou", t_esse, CARAMELO)])
zooms.append({"from": F(t_foco - 0.05), "durationInFrames": F(0.8), "escala": 1.05})

# 5 · "o resultado foi uns 3 milhões de pessoas a mais" → palco: cenário da marca, contador e barras do TSE,
#     a Talyta recortada no canto direito (scripts/segmentar.py gerou public/eleicao/pessoa/)
t_result = acha("resultado", t_toda)
t_3 = acha("3|tres", t_result)
t_pessoas = acha("pessoas", t_3)
t_eai2 = acha("e", acha("turno", t_3))
a = t_result - 0.2
figs.append({"tipo": "palco", "from": F(a), "durationInFrames": F(t_eai2 - 0.05) - F(a), "pessoa": "eleicao/pessoa",
             "titulo": "comparecimento · presidente 2026", "numero": 2.9, "unidade": "milhões",
             "sub": "de pessoas a mais foram votar no 2º turno (125,3 → 128,2 milhões)", "falaNumero": F(t_3) - F(a),
             "barras": [{"rotulo": "1º turno", "valor": 78.9, "texto": "78,9%"}, {"rotulo": "2º turno", "valor": 80.8, "texto": "80,8%"}],
             "falaBarras": F(t_pessoas) - F(a), "fonte": "Fonte: TSE"})
t_veio = acha("veio", t_eai2)
t_virada2 = acha("virada", t_eai2)
t_agora = acha("agora", t_virada2)
headline(t_eai2, t_agora - 0.1, [("veio a virada", t_veio, None)])
zooms.append({"from": F(t_virada2 - 0.05), "durationInFrames": F(0.8), "escala": 1.06})

# 6 · "imagina no seu Instagram"
t_imagina = acha("imagina", t_virada2)
t_voce = acha("voce", t_imagina)
sutil(t_imagina - 0.1, t_voce - 0.1, "e no seu Instagram?")

# 7 · "isso tem nome: atirar no escuro"
t_isso = acha("isso", t_voce)
t_atirar = acha("atirar", t_isso)
t_escuro = acha("escuro", t_atirar)
t_mas = acha("mas", t_escuro)
a = t_isso - 0.05
figs.append({"tipo": "escuro", "from": F(a), "durationInFrames": F(t_mas - 0.1) - F(a), "pessoa": "eleicao/pessoa", "rotulo": "atirar no escuro",
             "tiros": [F(t_atirar) - F(a) + k for k in (0, 5, 9, 14, 18, 23)]})

# 8 · "estratégia não é fazer mais"
t_estr2 = acha("estrategia", t_mas)
t_e2 = acha("e", acha("mais", t_estr2))
frase(t_estr2 - 0.15, t_e2 - 0.15, "Estratégia não é fazer mais.", t_estr2)

# 9 · "olhar os dados, escolher pra quem falar, concentrar tudo ali"
t_olhar = acha("olhar", t_e2)
t_escolher = acha("escolher", t_olhar)
t_concentrar = acha("concentrar", t_escolher)
t_comeca = acha("comeca", t_concentrar)
headline(t_olhar - 0.2, t_comeca - 0.1, [("olhar os dados", t_olhar, None), ("escolher pra quem", t_escolher, None), ("concentrar tudo", t_concentrar, CARAMELO)])

# 10 · "começa pelos seus insights, vê quem mais te assiste e fala diretamente com essas pessoas"
#      → celular com o passo a passo: painel profissional → público → a pessoa com quem falar
t_insights = acha("insights", t_comeca)
t_ve = acha("ve", t_insights)
t_fala = acha("fala", t_ve)
t_fim_fala = P[-1]["fim"]
a = t_comeca - 0.05
FIM = t_fim_fala + 0.35
figs.append({"tipo": "celular", "from": F(a), "durationInFrames": F(FIM) - F(a),
             "telas": [{"tela": "painel", "fala": 0}, {"tela": "publico", "fala": F(t_ve) - F(a)}, {"tela": "pessoa", "fala": F(t_fala) - F(a)}]})

# 11 · logo da TK (o fundo creme sobe e cobre o fim do vídeo)
figs.append({"tipo": "logo", "from": F(FIM), "durationInFrames": F(2.8)})
dur = F(FIM) + F(2.8)

# nenhuma figura encosta na seguinte (6 frames de respiro)
seq = sorted([f for f in figs if f["tipo"] != "logo"], key=lambda f: f["from"])
for f, g in zip(seq, seq[1:]):
    f["durationInFrames"] = min(f["durationInFrames"], max(F(1.0), g["from"] - f["from"] - 6))

# legenda palavra a palavra só onde não há arte (2 a 3 palavras por vez)
ocupado = sorted((f["from"], f["from"] + f["durationInFrames"]) for f in figs)
def livre(fr): return not any(a - 6 <= fr < b for a, b in ocupado)
def proximo_inicio(fr): return min((a for a, b in ocupado if a > fr), default=10**9)
legendas, grupo = [], []
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
    if grupo and (len(grupo) >= 3 or w["ini"] - grupo[-1]["fim"] > 0.6 or grupo[-1]["texto"].endswith((".", "?", "!", ","))
                  or sum(len(g["texto"]) for g in grupo) + len(w["texto"]) > 22): fecha()
    grupo.append(w)
fecha()
# uma legenda nunca encosta na seguinte (sem sobreposição de texto)
for l, m in zip(legendas, legendas[1:]):
    l["durationInFrames"] = max(4, min(l["durationInFrames"], m["from"] - l["from"] - 1))

d = {"fps": FPS, "etapa": "completo", "grade": "B", "estilo": "caps", "fonte": "eleicao/bruto.mp4", "legendaPos": "baixo", "sombraBase": True,
     "clipes": [{"id": "cortado", "trimBefore": 0, "from": 0, "durationInFrames": dur, "zoom": 1.0}],
     "textos": [], "figuras": figs, "legendas": legendas, "zooms": zooms, "reenquadramentos": []}
json.dump(d, open(R / "public/eleicao/edicao.json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)
for f in sorted(figs, key=lambda f: f["from"]):
    print(f"{f['from'] / FPS:5.1f}s  {f['tipo']:8s} {f.get('titulo') or f.get('texto') or f.get('etiqueta') or ''}")
print(len(legendas), "legendas · duração", round(dur / FPS, 1), "s")
