# Monta public/legendas/6498.json a partir da fala real (Whisper local, 2 passadas + repasse por trecho).
# (início_s, fim_s, texto, headline). "|" separa apoio e título. Ver REVISAR.md pros pontos em aberto.
import json

BLOCOS = [
    (0.15, 0.45, "meu nome é", False),
    (0.45, 1.00, "taislane,", False),  # nome confirmado pela Talyta em 2026-10-17
    (1.00, 1.64, "eu sou atendente", False),
    (1.64, 3.00, "aqui do passaporte do galeguinho", False),
    (3.00, 4.76, "e o meu lanche favorito é o", False),
    (4.89, 6.75, "|passaporte de frango com batata palha", True),
    # 6,75–25,8 s: preparo do lanche, sem fala
    (25.80, 28.50, "o que faz a diferença aqui do lanche", False),
    (28.51, 29.40, "são os|ingredientes", True),
    (29.53, 31.39, "e aqui a gente sempre busca", False),
    (31.39, 31.95, "|o melhor!", True),
    # 32 s em diante: música, sem fala
]

caps = []
for ini, fim, texto, enfase in BLOCOS:
    apoio, _, titulo = texto.rpartition("|") if "|" in texto else ("", "", texto)
    palavras = [(p, True) for p in apoio.split()] + [(p, False) for p in titulo.split()]
    passo = (fim - ini) / len(palavras)
    for i, (p, eh_apoio) in enumerate(palavras):
        a = round((ini + i * passo) * 1000)
        z = round((ini + (i + 1) * passo) * 1000)
        c = {"text": " " + p, "startMs": a, "endMs": z, "timestampMs": (a + z) // 2, "confidence": None}
        if enfase:
            c["enfase"] = True
            if eh_apoio:
                c["apoio"] = True
        if i == len(palavras) - 1:
            c["pageBreakAfter"] = True
        caps.append(c)
json.dump(caps, open("public/legendas/6498.json", "w", encoding="utf-8"), ensure_ascii=False, indent=2)
open("scripts/6498/REVISAR.md", "w", encoding="utf-8").write("""# 6498 · pontos da transcrição pra conferir no ouvido

Fonte: Whisper.cpp local (medium, pt), duas passadas + repasse dos trechos 7–29 s e 31–38 s.
Fala só em 0–7 s, 25,8–29,4 s e 29,5–32 s. O resto é preparo com som ambiente e música (sem legenda).

## Sem legenda
- 0,45–1,00 s: nome confirmado pela Talyta: Taislane (o Whisper ouviu "Taizuani" / "Thais Lani").

## Leituras a confirmar
- 1,0–1,6 s: "eu sou atendente" (as duas passadas ouviram "atendida").
- 1,6–3,0 s: "aqui do Passaporte do Galeguinho" (as passadas ouviram "Passaporte Galeguinho", sem o "do").
- 4,9–6,75 s: "Passaporte de Frango com Batata Palha": o cardápio online tem "Passaporte de Frango", sem
  batata palha no nome; vai como ela fala.
""")
print(len(BLOCOS), "blocos,", len(caps), "palavras")
