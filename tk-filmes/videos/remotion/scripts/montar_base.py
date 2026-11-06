"""Peças comuns dos scripts montar-<id>.py (mesma gramática visual do V10 "A virada não foi sorte"):
achar a palavra falada, headline/frase/sutil/titulo/salvar, zoom na palavra-chave, logo no fim, legenda palavra a palavra
só onde não há arte, e gravar public/<id>/edicao.json.
uso dentro de um montar-<id>.py:
    from montar_base import Reel
    r = Reel("tempo")            # lê scripts/tempo-palavras.json
    t = r.acha("hora"); r.headline(t - .2, t + 2, [("1 hora", t, None)]) ...
    r.gravar()
"""
import json, pathlib, unicodedata
R = pathlib.Path(__file__).resolve().parents[1]
FPS = 24
CARAMELO = "#E3B48C"

def norm(t):
    t = unicodedata.normalize("NFD", t.lower())
    return "".join(c for c in t if unicodedata.category(c) != "Mn").strip(".,!?…:;\"'“”")

class Reel:
    # grade H (2026-11-04): a Talyta achou os reels "sem color grade" na B; a H é o tratamento que ela pediu pros reels da TK
    def __init__(self, id, grade="H", legenda_pos="baixo"):
        self.id, self.grade, self.legenda_pos = id, grade, legenda_pos
        self.P = json.load(open(R / f"scripts/{id}-palavras.json", encoding="utf-8-sig"))
        try: self.cortes = json.load(open(R / f"scripts/{id}-cortes.json", encoding="utf-8-sig"))
        except FileNotFoundError: self.cortes = []
        self.figs, self.zooms, self.reenq = [], [], []
    F = staticmethod(lambda s: round(s * FPS))

    def acha(self, palavra, depois=0.0, n=1):
        k, alts = 0, [norm(x) for x in palavra.split("|")]
        for p in self.P:
            if p["ini"] >= depois - 1e-6 and any(norm(p["texto"]) == a or (len(a) > 3 and norm(p["texto"]).startswith(a)) for a in alts):
                k += 1
                if k == n: return p["ini"]
        raise SystemExit(f"[{self.id}] palavra não achada: {palavra} depois de {depois}")
    def fim(self, palavra, depois=0.0):
        alts = [norm(x) for x in palavra.split("|")]
        for p in self.P:
            if p["ini"] >= depois - 1e-6 and any(norm(p["texto"]) == a or (len(a) > 3 and norm(p["texto"]).startswith(a)) for a in alts): return p["fim"]
        raise SystemExit(f"[{self.id}] palavra não achada: {palavra}")

    def _add(self, d, a, b):
        F = self.F
        d.update({"from": F(a), "durationInFrames": max(F(1.0), F(b) - F(a))})
        self.figs.append(d)
    def headline(self, a, b, palavras, pos="baixo", forte=False):
        """palavras: [(texto, t_fala, cor|None)] · caixa alta, fonte arredondada, cada uma entra na hora em que é dita.
        forte: letra maior, a palavra com cor vira etiqueta caramelo e cada palavra com cor ganha um zoom de impacto"""
        F = self.F
        d = {"tipo": "headline", "pos": pos, "palavras": [dict(texto=t, fala=F(tf) - F(a), **({"cor": c} if c else {})) for t, tf, c in palavras]}
        if forte:
            d["forte"] = True
            for t, tf, c in palavras:
                if c: self.zoom(tf, 1.17, 1.0)
        self._add(d, a, b)
    def feed(self, a, b, t_fala, rotulo=None, modo="barulho", t_sai=None):
        d = {"tipo": "feed", "fala": self.F(t_fala) - self.F(a), "modo": modo}
        if rotulo: d["rotulo"] = rotulo
        if t_sai is not None: d["sai"] = self.F(t_sai) - self.F(a)
        self._add(d, a, b)
    def chips(self, a, b, linhas, pos="baixo"):
        """linhas: [(texto, t_fala, tom|None)] · lista com ✓, cada item entra na palavra dita"""
        F = self.F
        self._add({"tipo": "chips", "pos": pos, "linhas": [dict(texto=t, atraso=F(tf) - F(a), fala=F(tf) - F(a), **({"tom": tm} if tm else {})) for t, tf, tm in linhas]}, a, b)
    def cartao(self, a, b, linhas, titulo=None, etiqueta=None, pos="baixo"):
        """linhas: [(texto, t_fala, "pos"|"neg"|None)] · "neg" sai riscado com ✕"""
        F = self.F
        d = {"tipo": "cartao", "pos": pos, "linhas": [dict(texto=t, atraso=F(tf) - F(a), fala=F(tf) - F(a), **({"tom": tm} if tm else {})) for t, tf, tm in linhas]}
        if titulo: d["titulo"] = titulo
        if etiqueta: d["etiqueta"] = etiqueta
        self._add(d, a, b)
    def celular(self, a, b, telas):
        """telas: [("painel"|"publico"|"pessoa", t_fala)] · o passo a passo no Instagram"""
        self._add({"tipo": "celular", "telas": [{"tela": tl, "fala": max(0, self.F(t) - self.F(a))} for tl, t in telas]}, a, b)
    def acompanha(self, a, b, escala=1.12):
        """movimento trackeado: o quadro aproxima e acompanha o rosto nesse trecho"""
        self.reenq.append({"from": self.F(a), "durationInFrames": max(self.F(1.0), self.F(b) - self.F(a)), "escala": escala})
    def frase(self, a, b, texto, t_fala, pos="baixo"):
        self._add({"tipo": "frase", "texto": texto, "pos": pos, "fala": self.F(t_fala) - self.F(a)}, a, b)
    def sutil(self, a, b, texto):
        self._add({"tipo": "sutil", "texto": texto}, a, b)
    def fecho(self, a, b, titulo, t_fala, sub=None):
        d = {"tipo": "fecho", "titulo": titulo, "fala": self.F(t_fala) - self.F(a)}
        if sub: d["sub"] = sub
        self._add(d, a, b)
    def salvar(self, a, b, t_fala):
        self._add({"tipo": "salvar", "fala": self.F(t_fala) - self.F(a)}, a, b)
    def zoom(self, t, escala=1.14, dur=0.9):
        self.zooms.append({"from": self.F(t - 0.05), "durationInFrames": self.F(dur), "escala": escala})

    def gravar(self, logo=2.8, respiro=6):
        F = self.F
        fim_fala = self.P[-1]["fim"] + 0.35
        self.figs.append({"tipo": "logo", "from": F(fim_fala), "durationInFrames": F(logo)})
        dur = F(fim_fala) + F(logo)
        seq = sorted([f for f in self.figs if f["tipo"] != "logo"], key=lambda f: f["from"])
        for f, g in zip(seq, seq[1:]):
            f["durationInFrames"] = min(f["durationInFrames"], max(F(1.0), g["from"] - f["from"] - respiro))
        for f in seq:  # nenhuma arte passa do fim da fala
            f["durationInFrames"] = min(f["durationInFrames"], F(fim_fala) - f["from"])
        ocupado = sorted((f["from"], f["from"] + f["durationInFrames"]) for f in self.figs)
        livre = lambda fr: not any(a - 6 <= fr < b for a, b in ocupado)
        prox = lambda fr: min((a for a, b in ocupado if a > fr), default=10**9)
        legendas, grupo = [], []
        def fecha():
            nonlocal grupo
            if not grupo: return
            a, b = F(grupo[0]["ini"]), F(grupo[-1]["fim"] + 0.15)
            b = min(b, prox(a) - 3)
            if b - a >= 4: legendas.append({"from": a, "durationInFrames": b - a, "texto": " ".join(g["texto"] for g in grupo)})
            grupo = []
        for w in self.P:
            if not livre(F(w["ini"])): fecha(); continue
            # quebra também em pausa e em palavra com maiúscula (começo de frase que a transcrição não pontuou)
            if grupo and (len(grupo) >= 3 or w["ini"] - grupo[-1]["fim"] > 0.35 or grupo[-1]["texto"].endswith((".", "?", "!", ","))
                          or (w["texto"][:1].isupper() and w["texto"] not in ("União", "Instagram", "GPT", "Color", "Deus"))
                          or sum(len(g["texto"]) for g in grupo) + len(w["texto"]) > 22): fecha()
            grupo.append(w)
        fecha()
        for l, m in zip(legendas, legendas[1:]):
            l["durationInFrames"] = max(4, min(l["durationInFrames"], m["from"] - l["from"] - 1))
        # um plano por trecho do corte, alternando o enquadramento (1,00 / 1,09): o corte vira troca de plano, não pulo
        clipes = []
        if self.cortes:
            for k, c in enumerate(self.cortes):
                a0 = F(c["ini"]); b0 = F(self.cortes[k + 1]["ini"]) if k + 1 < len(self.cortes) else dur
                clipes.append({"id": f"t{k + 1:02d}", "trimBefore": a0, "from": a0, "durationInFrames": b0 - a0, "zoom": 1.0 if k % 2 == 0 else 1.09})
        else:
            clipes = [{"id": "cortado", "trimBefore": 0, "from": 0, "durationInFrames": dur, "zoom": 1.0}]
        # zooms que se sobrepõem: fica o mais forte (o componente aplica um por vez)
        zs = sorted(self.zooms, key=lambda z: z["from"])
        limpos = []
        for z in zs:
            if limpos and z["from"] < limpos[-1]["from"] + limpos[-1]["durationInFrames"]:
                if z["escala"] > limpos[-1]["escala"]: limpos[-1] = z
                continue
            limpos.append(z)
        d = {"fps": FPS, "etapa": "completo", "grade": self.grade, "estilo": "caps", "fonte": f"{self.id}/bruto.mp4",
             "legendaPos": self.legenda_pos, "sombraBase": True,
             "clipes": clipes, "textos": [], "figuras": self.figs, "legendas": legendas, "zooms": limpos, "reenquadramentos": self.reenq}
        json.dump(d, open(R / f"public/{self.id}/edicao.json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)
        for f in sorted(self.figs, key=lambda f: f["from"]):
            txt = f.get("titulo") or f.get("texto") or " / ".join(p["texto"] for p in f.get("palavras", []))
            print(f"{f['from'] / FPS:6.1f}s  {f['tipo']:8s} {txt}")
        print(f"[{self.id}] {len(legendas)} legendas · duração {dur / FPS:.1f}s")
