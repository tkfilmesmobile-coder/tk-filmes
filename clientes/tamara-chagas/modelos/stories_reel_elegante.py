"""Refaz os stories que acompanham um Reel (3 no pessoal + 4 no escritório) no formato de foto em tela cheia
com escrita elegante por cima (regra da Talyta, 22/10/2026: todo story com escrita usa foto no fundo inteiro).
Lê o trio.json e o editorial.json já aprovados da pasta do Reel e grava com os mesmos nomes
(stories/1-card.jpg, 2-notas.jpg, 3-conversa.jpg e editorial/01..04.jpg), então o publicar.ps1 não muda.

uso: python modelos/stories_reel_elegante.py <pasta-do-reel> <foto1> ... <foto7>
     (fotos relativas a marca/fotos: 3 do pessoal e 4 do escritório, nessa ordem)
"""
import json, re, sys, pathlib, subprocess

EMOJI = re.compile("[\U0001F000-\U0001FAFF\u2600-\u27BF\u2B00-\u2BFF\uFE0F\u200D\u2190-\u21FF\u2300-\u23FF]")
limpa = lambda t: re.sub(r"\s{2,}", " ", EMOJI.sub("", t)).strip()

def main():
    pasta = pathlib.Path(sys.argv[1]); fotos = sys.argv[2:9]
    trio = json.loads((pasta / "trio.json").read_text(encoding="utf-8-sig"))
    ed = json.loads((pasta / "editorial.json").read_text(encoding="utf-8-sig"))
    conv = trio["conversa"]
    pergunta = next(c[1] for c in conv if c[0] == "in")
    resposta = next(c[1] for c in conv if c[0] == "out")  # só a 1ª resposta: texto curto
    pessoal = [
        {"id": "1-card", "foto": fotos[0], "kicker": "NOVO NO FEED", "pos": "baixo", "tam": 54, "texto": limpa(trio["card"])},
        {"id": "2-notas", "foto": fotos[1], "kicker": limpa(trio["notas"]["titulo"]).upper(), "pos": "baixo", "tam": 42,
         "texto": "<br>".join(limpa(l) for l in trio["notas"]["linhas"][:3]), "fonte": trio.get("fonte", "")},
        {"id": "3-conversa", "foto": fotos[2], "kicker": "DÚVIDA COMUM", "pos": "baixo", "tam": 50,
         "texto": f"“{limpa(pergunta)}”", "sub": limpa(resposta)},
    ]
    escritorio = []
    for i, t in enumerate(ed["telas"]):
        item = {"id": f"{i + 1:02d}", "foto": fotos[3 + i], "kicker": limpa(t["kicker"]), "pos": "baixo",
                "tam": 62, "texto": limpa(t["titulo"]), "sub": limpa(t.get("texto", "").replace("<br><br>", "<br>"))}
        if 0 < i < 3: item["fonte"] = ed.get("fonte", "")
        escritorio.append(item)
    for nome, itens, sub in (("_pessoal.json", pessoal, "stories"), ("_escritorio.json", escritorio, "editorial")):
        arq = pasta / nome; arq.write_text(json.dumps(itens, ensure_ascii=False, indent=1), encoding="utf-8")
        subprocess.run([sys.executable, str(pathlib.Path(__file__).with_name("stories_elegante.py")), str(pasta / sub), str(arq)], check=True)

if __name__ == "__main__":
    main()
