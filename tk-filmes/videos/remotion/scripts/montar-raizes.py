"""Monta public/raizes/edicao.json do reels "O marketing é como uma planta" (bruto IMG_1713, 16/11/2026), o primeiro
no estilo novo de edição da TK (tk-filmes/videos/perfil-de-edicao.md).
v2 (16/11, retorno da Talyta sobre a v1): sem headlines nem pílulas; cartões brancos com FRASE DE IMPACTO grande;
curtida/comentário/compartilhamento com a estética real do Instagram; a planta só com sombra leve (sem faixa escura);
música escolhida por ela (Download.mp4 do TikTok) bem abaixo da voz (voz normalizada em -16 LUFS no bruto);
o trecho lido ("é sobre construir algo que continue fazendo sentido…") trocado pela tomada 9.
Gera também public/raizes/trilha.wav (música + batidas + whooshes, no tempo da edição).
uso: python scripts/montar-raizes.py
"""
import json, subprocess, sys
from montar_base import Reel, R, FPS

r = Reel("raizes", legenda_pos="alto")
a = r.acha
F = Reel.F
som = {"boom": [0.0], "whoosh": [], "drop": [], "abafar": [],
       "musica": str(R / "public/raizes/musica-original.wav"), "musica_ini": 0.0,
       "musica_db": -21.5,   # a faixa mede -17,2 LUFS: fica perto de -37, uns 20 dB abaixo da voz (-16)
       "fx_ganho": 0.6, "sobe_db": 10}
extras, inserts = [], []

def capitulo(t0, texto, rotulo, dur=1.5):
    extras.append({"tipo": "capitulo", "from": F(t0), "durationInFrames": F(dur), "texto": texto, "rotulo": rotulo})
    som["boom"].append(t0); som["whoosh"].append(t0); som["abafar"].append([t0, t0 + dur])
def insert(t0, t1, src):
    inserts.append({"from": F(t0), "durationInFrames": F(t1) - F(t0), "src": f"raizes/{src}.mp4", "modo": "cheio"})

# 0 · gancho: batida grave no primeiro quadro, aproximação na "pergunta"
r.zoom(a("pergunta"), 1.07, 0.9)
t_empresa = a("empresa")

# 1 · a planta: cartão de impacto → planta desenhada (semente, folhinhas, a fase parada, as raízes)
t_planta = a("planta", t_empresa)
capitulo(t_planta - 0.5, "O marketing é uma [[planta]].", "parte 1", dur=1.5)
t_semente = a("semente", t_planta); t_folhas = a("folhinhas", t_semente)
t_parece = a("parece", t_folhas); t_raizes = a("raizes", t_parece); t_saudavel = a("saudavel", t_raizes)
p0 = t_planta + 1.05
extras.append({"tipo": "planta", "from": F(p0), "durationInFrames": F(t_saudavel + 0.7) - F(p0),
               "folhas": F(t_folhas) - F(p0), "parada": F(t_parece) - F(p0), "raizes": F(t_raizes - 0.2) - F(p0)})
r.zoom(t_raizes, 1.07, 0.9)

# 2 · "e o marketing é exatamente assim" → cartão; postar (b-roll) → o Instagram de verdade se mexendo
t_assim = a("assim", t_saudavel)
capitulo(a("marketing", t_saudavel) - 0.1, "No começo, [[tudo cresce]].", "parte 2", dur=1.5)
t_postar = a("postar", t_assim)
insert(t_postar - 0.9, t_postar + 0.75, "br-celular")
t_acontece = a("acontece", t_postar)
t_chegando = a("chegando", t_acontece); t_curtida = a("curtida", t_chegando); t_coment = a("comentario", t_curtida); t_compart = a("compartilhamento", t_coment)
i0 = t_acontece - 0.5
extras.append({"tipo": "instagram", "from": F(i0), "durationInFrames": F(t_compart + 1.1) - F(i0), "foto": "raizes/post.jpg",
               "seguir": F(a("muita", t_acontece)) - F(i0), "curtida": F(t_curtida) - F(i0), "comentario": F(t_coment) - F(i0), "compartilhar": F(t_compart) - F(i0)})
# "parece que tudo isso trava": a música fica abafada até o "mas é aí"
t_trava = a("trava", t_compart); t_mas = a("mas", t_trava)
r.zoom(t_trava, 1.06, 0.9)
som["abafar"].append([t_trava, t_mas - 0.05])

# 3 · "mas é aí que a gente está construindo as raízes" → batida, você pensando
som["boom"].append(t_mas)
t_construindo = a("construindo", t_mas); t_raizes2 = a("raizes", t_construindo)
insert(t_mas, t_construindo - 0.05, "br-pensando")
r.zoom(t_raizes2, 1.07, 0.9)
# "reconhecimento, posicionamento, confiança e relacionamento" → as raízes ganham nome, uma por palavra
t_just = a("justamente", t_raizes2)
t_rec = a("reconhecimento", t_just); t_pos = a("posicionamento", t_rec); t_conf = a("confianca", t_pos); t_rel = a("relacionamento", t_conf)
p1 = t_just - 0.3
extras.append({"tipo": "planta", "from": F(p1), "durationInFrames": F(t_rel + 0.95) - F(p1), "folhas": 0,
               "palavras": [{"texto": tx, "fala": F(tt) - F(p1)} for tx, tt in (("reconhecimento", t_rec), ("posicionamento", t_pos), ("confiança", t_conf), ("relacionamento", t_rel))]})
t_pessoas = a("pessoas", t_rel); t_tela = a("tela", t_pessoas)
insert(t_pessoas - 0.4, t_tela + 0.45, "br-tela")

# 4 · "o marketing não é sobre fazer uma publicação hoje…" → cartão de impacto; publicação hoje (touchpad)
t_nao = a("nao", t_tela)
capitulo(a("marketing", t_tela) - 0.15, "Não é sobre [[amanhã]].", "parte 3", dur=1.4)
t_pub = a("publicacao", t_nao); t_hoje = a("hoje", t_pub)
insert(t_pub - 0.3, t_hoje + 0.4, "br-touchpad")
t_patamar = a("patamar", t_hoje)

# 5 · o aprendizado: drop (a música some) e batida no "na verdade, ele é sobre gerar algo concreto" → cartão
t_na = a("na", t_patamar); t_concreto = a("concreto", t_na)
som["drop"].append([t_na - 0.45, t_na])
capitulo(t_na, "É sobre construir [[algo concreto]].", "o que fica", dur=1.7)
t_cresc = a("crescimento", t_concreto)
insert(t_cresc - 0.6, t_cresc + 1.0, "br-linha-tempo")

# 6 · fecho: "fica tranquilo… raízes sólidas" → batida na virada, a planta inteira com as quatro raízes
t_entao = a("entao", t_cresc)
som["boom"].append(t_entao)
t_trang = a("tranquilo", t_entao)
r.zoom(t_trang, 1.07, 0.9)
t_crescendo = a("crescendo", t_trang); t_na2 = a("na", t_crescendo); t_solidas = a("solidas", t_na2)
p2 = t_na2 - 0.1
extras.append({"tipo": "planta", "from": F(p2), "durationInFrames": F(r.P[-1]["fim"] + 0.35) - F(p2), "folhas": 0,
               "palavras": [{"texto": tx, "fala": F(p2 + 0.4 + k * 0.18) - F(p2)} for k, tx in enumerate(("reconhecimento", "posicionamento", "confiança", "relacionamento"))]})
r.zoom(t_solidas, 1.08, 1.0)

# cartões e o Instagram entram antes de gravar (a legenda some debaixo deles); a planta entra depois (legenda fica)
for e in extras:
    if e["tipo"] in ("capitulo", "instagram"): r.figs.append(e)
r.gravar()

ed = json.load(open(R / "public/raizes/edicao.json", encoding="utf-8"))
ed["figuras"] += [e for e in extras if e["tipo"] == "planta"]
ed["inserts"] = inserts
ed["trilha"] = "raizes/trilha.wav"
dur = max(c["from"] + c["durationInFrames"] for c in ed["clipes"]) / FPS
som["dur"] = round(dur, 3)
som["sobe"] = round(r.P[-1]["fim"] + 0.35, 3)
json.dump(ed, open(R / "public/raizes/edicao.json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)
json.dump(som, open(R / "scripts/raizes-som.json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)
subprocess.run([sys.executable, str(R / "scripts/trilha-calma.py"), str(R / "scripts/raizes-som.json"), str(R / "public/raizes/trilha.wav")], check=True)
for i in inserts: print(f"{i['from'] / FPS:6.1f}s  insert   {i['src']}")
print("batidas:", [round(x, 1) for x in som["boom"]], "· drop:", som["drop"], "· abafar:", [[round(x, 1) for x in p] for p in som["abafar"]])
