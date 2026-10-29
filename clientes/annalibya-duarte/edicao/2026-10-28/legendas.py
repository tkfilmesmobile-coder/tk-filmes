"""Legendas palavra a palavra dos 2 vídeos de 2026-10-28, a partir da transcrição (analise/*-transcricao.json).
Correções conferidas trecho a trecho com conferir_trechos.py: "E receber" é "te receber"; no fim do vídeo 2 é "Clica".
Trechos sem legenda: o que o título já mostra (abertura dos dois) e o endereço do vídeo 2 (vai no cartão de endereço).
Saída: ../src/legendas.json (quadros a 24 fps).
Uso: python legendas.py
"""
import json
import os

AQUI = os.path.dirname(os.path.abspath(__file__))
FPS = 24
SEGURA = 0.5      # segundos que o bloco fica depois da última palavra (se o próximo não começar antes)

VIDEOS = {
    # vídeo 1: o título cobre "Muito prazer, eu sou a Anna Libya, sou cirurgiã-dentista há 12 anos";
    # a headline dos tratamentos (v2 da edição, 2026-10-29) cobre "o seu tratamento completo ... tudo aqui"
    "v1": {"json": "v41-transcricao.json", "fora": [(0.0, 4.22), (16.45, 26.2)], "troca": {}},
    # vídeo 2: o título cobre "Seja muito bem-vindo ao meu consultório"; o cartão cobre o endereço.
    # 2026-10-29: saiu a 2ª entrada no consultório; o som corta em 30,09 → 37,40, então tudo depois de 37,40 s
    # anda 7,31 s pra trás (preparar.py)
    "v2": {"json": "v63-transcricao.json", "fora": [(0.0, 2.55), (4.75, 11.5)], "troca": {60.0: "te", 60.94: "Clica"},
           "corte": (37.40, 7.31)},
}


# Quebras à mão: frases curtas (até ~25 letras, uma linha), sem cortar ideia no meio.
# O texto tem que bater palavra por palavra com a transcrição; se não bater, o script para.
FRASES = {
    "v1": [
        "e hoje eu quero", "me apresentar", "um pouquinho para vocês", "Sou especialista", "em endodontia",
        "mais conhecido como canal", "mas aqui eu cuido", "muito mais do que isso", "Eu atendo desde a criança",
        "até o idoso", "Aqui você vai encontrar",
        "Eu quero que você", "sinta bem à vontade", "aqui comigo", "Eu sei que é comum", "ter medo de dentista",
        "mas eu prometo", "que vou fazer você", "mudar de opinião", "Já que agora você", "me conhece um pouquinho",
        "eu espero", "te encontrar aqui", "Clica no link da bio", "e vem!",
    ],
    "v2": [
        "A nossa localização", "é bem facinho", "Esse espaço foi projetado", "com todo amor e carinho",
        "pensando no seu conforto", "Vai ser um prazer imenso", "te receber aqui", "Clica no link da bio",
        "e agenda teu horário",
    ],
}


def limpa(p):
    return p.rstrip(".,") if p[-1:] in ".," else p


def norm(t):
    return "".join(c for c in t.lower() if c.isalnum())


def blocos(palavras, frases):
    out, i = [], 0
    for f in frases:
        n = len(f.split())
        trecho = palavras[i:i + n]
        if [norm(w["p"]) for w in trecho] != [norm(x) for x in f.split()]:
            raise SystemExit(f"frase não bate com a transcrição: {f!r} x {' '.join(w['p'] for w in trecho)!r}")
        for w, x in zip(trecho, f.split()):
            w["p"] = x  # grafia da frase (hífen, maiúscula), mesmas palavras
        out.append(trecho)
        i += n
    if i != len(palavras):
        raise SystemExit(f"sobraram palavras sem frase: {' '.join(w['p'] for w in palavras[i:])}")
    return out


saida = {}
for k, cfg in VIDEOS.items():
    pal = json.load(open(os.path.join(AQUI, "analise", cfg["json"]), encoding="utf-8"))["palavras"]
    for w in pal:
        if w["ini"] in cfg["troca"]:
            w["p"] = cfg["troca"][w["ini"]] + (w["p"][-1] if w["p"][-1:] in ".,!?" else "")
    pal = [w for w in pal if not any(a <= w["ini"] < b for a, b in cfg["fora"])]
    if "corte" in cfg:
        de, menos = cfg["corte"]
        for w in pal:
            if w["ini"] >= de:
                w["ini"] = round(w["ini"] - menos, 3); w["fim"] = round(w["fim"] - menos, 3)
    lista = []
    for b in blocos(pal, FRASES[k]):
        for j, w in enumerate(b):
            ultimo = j == len(b) - 1
            lista.append({
                "texto": limpa(w["p"]),
                "de": round(w["ini"] * FPS),
                "ate": round((w["fim"] + (SEGURA if ultimo else 0)) * FPS),
                "quebra": ultimo,
            })
    saida[k] = lista
    print(f"== {k}")
    linha = []
    for w in lista:
        linha.append(w["texto"])
        if w["quebra"]:
            print(f"  {w['de'] / FPS:6.2f}s  {' '.join(linha)}")
            linha = []

json.dump(saida, open(os.path.join(AQUI, "..", "src", "legendas.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
