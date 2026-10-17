# Monta public/legendas/0930.json (vídeo inteiro) a partir da fala real.
# Fonte dos tempos: 2ª passada do Whisper local (scripts/0930/passo2-completo.txt), conferida com a 1ª.
# Cada linha de BLOCOS é uma entrada na tela: (início_s, fim_s, texto, ênfase).
# Trechos que as duas passadas não confirmaram ficaram SEM legenda (ver REVISAR.md): não se inventa fala.
import json

# Headline: texto com "|" → antes da barra é o apoio (manuscrito pequeno), depois é o título (Anton grande).
BLOCOS = [
    (0.05, 1.21, "já pensasse,", False),
    (1.21, 1.66, "pô?", False),
    (1.66, 2.28, "eu passava aqui", False),
    (2.28, 3.26, "em são josé da laje", False),
    (3.26, 4.93, "e não vinha aqui", False),
    (4.93, 6.06, "no|passaporte do galeguinho?", True),
    (6.06, 6.83, "mas eu não fiz", False),
    (6.83, 7.47, "nada não,", False),
    (7.47, 8.05, "eu não fiz", False),
    (8.05, 8.83, "nada não.", False),
    (8.91, 9.38, "mas rapaz,", False),
    (9.38, 10.45, "já fica aqui já", False),
    # 10,49–11,37 s: trecho não confirmado ("faça o faça" / "faz o que faz") → sem legenda
    (11.37, 12.30, "no cardápio.", False),
    (12.37, 13.95, "opção é que|não falta!", True),
    (14.00, 15.45, "hoje eu vou, galera,", False),
    (15.51, 17.60, "hoje eu vou de|capiana!", True),
    (17.64, 19.05, "esse burger capiana,", False),
    (19.09, 19.78, "já vi logo,", False),
    (19.78, 20.50, "eu já quero esse.", False),
    (20.56, 21.65, "agora, por que esse?", False),
    (21.71, 22.83, "porque esse daqui", False),
    (22.83, 23.90, "eu já tô vendo:", False),
    (23.95, 24.58, "tem|bacon", True),
    (24.61, 26.00, "|cebola caramelizada", True),
    (26.06, 26.62, "tem|cheddar", True),
    # 26,65–27,9 s: trecho não confirmado ("ele tá com preto aqui" / "com o pé daqui") → sem legenda
    (28.03, 29.16, "do jeito que eu tô vendo", False),
    (29.16, 30.20, "aqui,", False),
    (30.29, 30.85, "é ele,", False),
    (30.89, 31.55, "não tem jeito não,", False),
    (31.59, 32.10, "é ele mesmo.", False),
    (32.12, 33.27, "é ele mesmo, ué.", False),
    (33.84, 34.75, "|ixi maria!", True),
    (34.79, 36.10, "o burger|capiana", True),
    (36.13, 37.40, "é esse daqui,", False),
    (37.47, 38.50, "é ele mesmo,", False),
    (38.52, 39.50, "positivo.", False),
    (39.67, 41.30, "mas que coisa linda, gente,", False),
    (41.34, 43.30, "chega tá dando|água na boca", True),
    (43.35, 45.40, "só no|passaporte do galeguinho", True),
    # 45,46–46,4 s: "sem conta" nas duas passadas, sentido incerto → sem legenda
    (46.40, 46.90, "mas e aí,", False),
    (46.91, 48.02, "tu tá esperando o quê", False),
    (48.05, 49.50, "pra fazer uma visita aqui?", False),
    (49.57, 50.80, "ué, não perde tempo não,", False),
    (50.83, 51.50, "|vem simbora", True),
    (51.55, 52.30, "vem simbora provar", False),
    (52.30, 52.75, "|o melhor!", True),
    (52.77, 53.25, "esse daqui", False),
    (53.27, 54.44, "não tem jeito não.", False),
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
json.dump(caps, open("public/legendas/0930.json", "w", encoding="utf-8"), ensure_ascii=False, indent=2)
print(len(BLOCOS), "blocos,", len(caps), "palavras,", sum(1 for b in BLOCOS if b[3]), "headlines")
