"""Monta os dados de uma finalização (camadas em cima do corte da Talyta) a partir de
scripts/fin/<id>.json. O vídeo dela nunca é cortado nem reordenado.
- Enquadramento por trecho (entre os cortes dela): escala em volta do rosto pra igualar o tamanho
  do rosto entre tomadas (entre 1.0 e o teto) + punch-ins secos em trechos de ênfase.
- Legenda: palavras do Whisper, com correções.
- Headline e card: em segundos do vídeo; CTA depois do fim.
- "ate" (opcional): recorta pra prévia, sem CTA.
Saída: public/reels/<id>/edicao.json
Uso: python scripts/finalizar.py <id>
"""
import sys, json, math, os

cfg_id = sys.argv[1]
cfg = json.load(open(f"scripts/fin/{cfg_id}.json", encoding="utf-8"))
fps = cfg.get("fps", 30)
F = lambda s: int(round(s * fps))
dur = cfg.get("ate", cfg["duracao"])
video_frames = int(math.floor(dur * fps))

segs = json.load(open(f"scripts/cache/{cfg['segmentos']}", encoding="utf-8"))
alvo, teto = cfg.get("alvo_rosto", 320), cfg.get("teto", 1.2)
quadros = []
for s in segs:
    if s["de"] >= dur:
        break
    r = s["rosto"]
    esc = round(min(teto, max(1.0, alvo / max(1, r["w"]))), 3)
    quadros.append({"de": F(s["de"]), "ate": min(F(s["ate"]), video_frames), "escala": esc, "ox": r["x"], "oy": r["y"]})

# punch-in: parte um trecho em três (antes / punch / depois), troca seca
for p in cfg.get("punches", []):
    a, b = F(p["de"]), F(p["ate"])
    if a >= video_frames:
        continue
    novo = []
    for q in quadros:
        if b <= q["de"] or a >= q["ate"]:
            novo.append(q)
            continue
        if a > q["de"]:
            novo.append({**q, "ate": a})
        novo.append({**q, "de": max(a, q["de"]), "ate": min(b, q["ate"]), "escala": round(q["escala"] * p.get("fator", 1.12), 3)})
        if b < q["ate"]:
            novo.append({**q, "de": b})
    quadros = novo

corr = cfg.get("correcoes", {})
def corrige(p):
    t = p["text"].strip()
    pont = ""
    while t and t[-1] in ".,?!…":
        pont = t[-1] + pont
        t = t[:-1]
    c = corr.get(f"{t.lower()}@{p['startMs']}") or corr.get(t.lower())
    return " " + (c or t) + pont

palavras = json.load(open(f"scripts/cache/{cfg['palavras']}", encoding="utf-8"))
legendas = [{"text": corrige(p), "startMs": p["startMs"], "endMs": min(p["endMs"], int(dur * 1000))}
            for p in palavras if p["startMs"] < dur * 1000]

def camada(x):
    a, b = F(x["de"]), min(F(x["ate"]), video_frames)
    return a, b - a

headlines, cards = [], []
for h in cfg.get("headlines", []):
    a, d = camada(h)
    if d > 0:
        headlines.append({"from": a, "durationInFrames": d, "linhas": h["linhas"], "pos": h.get("pos", "baixo")})
for c in cfg.get("cards", []):
    a, d = camada(c)
    if d > 0:
        cards.append({"from": a, "durationInFrames": d, "etiqueta": c["etiqueta"], "texto": c["texto"]})

cta = None
total = video_frames
if cfg.get("cta") and "ate" not in cfg:
    cta = {"from": video_frames, "durationInFrames": F(cfg["cta"].get("dur", 2.4)), "texto": cfg["cta"]["texto"]}
    total += cta["durationInFrames"]

os.makedirs(f"public/reels/{cfg_id}", exist_ok=True)
json.dump({"fps": fps, "durationInFrames": total,
           "props": {"fonte": cfg["fonte"], "videoFrames": video_frames, "quadros": quadros, "legendas": legendas,
                     "headlines": headlines, "cards": cards, "cta": cta}},
          open(f"public/reels/{cfg_id}/edicao.json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)
print(f"{cfg_id}: {total / fps:.2f} s · {len(quadros)} enquadramentos · {len(legendas)} palavras · "
      f"{len(headlines)} headlines · {len(cards)} cards · CTA {'sim' if cta else 'não'}")
for q in quadros:
    print(f"   {q['de'] / fps:6.2f}-{q['ate'] / fps:6.2f}  escala {q['escala']}")
