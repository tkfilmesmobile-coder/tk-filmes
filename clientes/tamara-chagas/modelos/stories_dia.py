"""Monta o lote de stories do dia (mínimo 15) no layout do modelo da Talyta (sequência de 11/11/2026), sem depender de
ninguém: mídias do banco conferido (stories/auto/banco.json) em rodízio, sem repetir as do dia anterior, textos curtos
do modelo e a arte do feed do dia. REGRA IMUTÁVEL (Talyta, 12/11/2026): stories e feed saem todo dia útil, às 7h30.

uso: python modelos/stories_dia.py <AAAA-MM-DD> [--saudacao "Bom dia"] [--extra <spec.json>]
  --extra: stories a mais (mesmo formato do stories_modelo.py), entram antes do "até amanhã"
Gera stories/<data>-b-roll/ com os .mp4, as artes .jpg e o ordem.txt. Roda de novo sem problema (refaz o lote).
"""
import datetime as dt, json, pathlib, shutil, subprocess, sys

BASE = pathlib.Path(__file__).resolve().parent.parent          # clientes/tamara-chagas
# o Google Drive monta como G: num PC e H: no outro
DRIVE = next((f"{l}:/Meu Drive/Tamara Chagas/CONTEÚDO/B-ROLL/" for l in "GHI"
              if pathlib.Path(f"{l}:/Meu Drive/Tamara Chagas/CONTEÚDO/B-ROLL").exists()), "G:/Meu Drive/Tamara Chagas/CONTEÚDO/B-ROLL/")


def existe(x):
    s = str(x["src"])
    return pathlib.Path(DRIVE + s[6:] if s.startswith("drive:") else BASE / s).exists()
AUTO = BASE / "stories" / "auto"
PY = sys.executable
MUS = {"natal": "marca/audio/natal-philadelphia-orchestra.mp3", "escritorio": "marca/audio/chill-rnb-danyvin-pixabay.mp3",
       "viagem": "marca/audio/fresh-bransboynd-pixabay.mp3"}
MUS_MAX = {"natal": 46, "escritorio": 145, "viagem": 115}       # até onde a faixa ainda tem música (s)

# textos do modelo (rodam por dia; sempre curtos, sem prometer resultado, sem oferecer serviço: regra da OAB)
LINHA_NATAL = ["com a magia do Natal reinando por aqui", "o Natal já chegou ao escritório", "clima de Natal em cada detalhe"]
LINHA_SEMANA = ["mais um dia de trabalho por aqui", "começando o dia com você", "seguimos de portas abertas"]
PRODUCAO = [("Por aqui a nossa produção", "inicia cedo"), ("Equipe", "a postos"), ("Mais um dia", "de trabalho")]
RECEPCAO = ["recebendo cada um de vocês<br>com muito carinho", "a nossa recepção<br>está pronta pra você",
            "cada atendimento<br>com cuidado e atenção"]
VIAGEM = [("Diário de viagem", "a Dra. Tamara está viajando"), ("De longe", "mas sempre presente"),
          ("Enquanto isso", "a Doutora aproveita a viagem")]
VIAGEM_ESCRITORIO = ["e o escritório segue funcionando<br>normalmente pra você",
                     "por aqui, o atendimento continua<br>com a excelência de sempre",
                     "a equipe segue firme<br>atendendo cada cliente"]
EXCELENCIA = [("Atendimento", "com excelência"), ("Cuidado", "em cada caso"), ("Seguimos", "a todo vapor")]
DETALHE_NATAL = ["detalhes que fazem<br>o nosso Natal", "feito à mão,<br>com muito carinho", "a magia está<br>nos detalhes"]
VOLTA_VIAGEM = [("Enquanto isso", "seguimos aqui, prontos pra te atender"), ("Pode contar", "com a nossa equipe"),
                ("Estamos aqui", "pra cuidar de você")]


def ler(p, padrao):
    return json.loads(p.read_text(encoding="utf-8")) if p.exists() else padrao


def natal(d):
    return (d.month == 11) or (d.month == 12) or (d.month == 1 and d.day <= 6)


def main():
    data = dt.date.fromisoformat(sys.argv[1])
    args = sys.argv[2:]
    saud = args[args.index("--saudacao") + 1] if "--saudacao" in args else (
        "Bom dia" if (data > dt.date.today() or dt.datetime.now().hour < 12) else "Boa tarde")
    extra = json.loads(pathlib.Path(args[args.index("--extra") + 1]).read_text(encoding="utf-8-sig")) if "--extra" in args else []
    banco = ler(AUTO / "banco.json", {})
    # mídia que não está neste PC (vídeo fora do git, Drive desmontado) sai do sorteio em vez de quebrar o lote
    banco = {c: [x for x in v if existe(x)] if isinstance(v, list) else v for c, v in banco.items()}
    for cat in ("viagem", "natal", "fachada_natal", "fachada_dia", "recepcao"):
        if not banco.get(cat):
            banco[cat] = list(banco.get("escritorio", []))
    cfg = ler(AUTO / "config.json", {"viagem_ativa": False})
    usados = ler(AUTO / "usados.json", {})
    ontem = set(sum([v for k, v in usados.items() if k < data.isoformat()][-1:], []))
    k = data.toordinal()
    usados_hoje = []

    def pega(cat, n=1):
        itens = [x for x in banco.get(cat, []) if x["id"] not in ontem and x["id"] not in usados_hoje] or \
                [x for x in banco.get(cat, []) if x["id"] not in usados_hoje] or banco.get(cat, [])
        out = []
        for i in range(n):
            x = dict(itens[(k * 3 + i) % len(itens)]) if itens else None
            if x is None:
                break
            if x in out:
                x = dict(itens[(k * 3 + i + 1) % len(itens)])
            usados_hoje.append(x["id"]); out.append(x)
        return out

    def esc(lista, desloc=0):
        return lista[(k + desloc) % len(lista)]

    slot = [0]

    def st(item, musica, **texto):
        slot[0] += 1
        s = dict(item); s.update(texto)
        if str(s["src"]).startswith("drive:"):
            s["src"] = DRIVE + s["src"][6:]
        else:
            s["src"] = str(BASE / s["src"])
        s["id"] = f"{slot[0]:02d}-{item['id']}"
        s["musica"] = str(BASE / MUS[musica])
        s["trilha_ini"] = (k * 7 + slot[0] * 13) % MUS_MAX[musica]
        return s

    em_natal = natal(data)
    cat_bonita = "natal" if em_natal else "escritorio"
    fach = "fachada_natal" if em_natal else "fachada_dia"
    m_bonita = "natal" if em_natal else "escritorio"
    linha_saud = esc(LINHA_NATAL) if em_natal else esc(LINHA_SEMANA)
    seq = []
    # 1-3 saudação (o modelo repete o mesmo texto em 3 vídeos seguidos)
    for x in pega(cat_bonita, 2) + pega(fach, 1):
        seq.append(st(x, m_bonita, estilo="titulo", titulo=saud, linha=linha_saud))
    # 4-5 produção (alfinete + frase grande)
    pre, gr = esc(PRODUCAO)
    for x in pega("escritorio", 2):
        seq.append(st(x, "escritorio", estilo="local", pre=pre, grande=gr))
    # 6 recepção
    for x in pega("recepcao", 1):
        seq.append(st(x, "escritorio", estilo="titulo", titulo="", linha=esc(RECEPCAO)))
    # 7-8 viagem da Doutora (enquanto ela viaja) ou mais bastidores
    if cfg.get("viagem_ativa"):
        t, l = esc(VIAGEM)
        v = pega("viagem", 3)
        seq.append(st(v[0], "viagem", estilo="titulo", titulo=t, linha=l))
        seq.append(st(v[1], "viagem", estilo="titulo", titulo="", linha=esc(VIAGEM_ESCRITORIO)))
    else:
        v = []
        for x in pega("escritorio", 2):
            seq.append(st(x, "escritorio", estilo="titulo", titulo="", linha=esc(RECEPCAO, 1)))
    # 9 excelência
    pre, gr = esc(EXCELENCIA)
    for x in pega("escritorio", 1):
        seq.append(st(x, "escritorio", estilo="local", pre=pre, grande=gr))
    # 10 detalhe do Natal (ou da estrutura)
    for x in pega(cat_bonita, 1):
        seq.append(st(x, m_bonita, estilo="titulo", titulo="", linha=esc(DETALHE_NATAL) if em_natal else "detalhes que fazem<br>o nosso escritório"))
    # 11 viagem de novo (ou recepção)
    if cfg.get("viagem_ativa") and len(v) > 2:
        t, l = esc(VOLTA_VIAGEM)
        seq.append(st(v[2], "viagem", estilo="titulo", titulo=t, linha=l))
    else:
        for x in pega("recepcao", 1):
            seq.append(st(x, "escritorio", estilo="titulo", titulo="", linha=esc(RECEPCAO, 2)))
    # 12 localização (sem fala: fachada + texto)
    for x in pega("fachada_dia", 1):
        seq.append(st(x, "escritorio", estilo="local", pre="Estamos no Centro de", grande="União dos Palmares"))
    # 13 horário e atendimento online
    for x in pega("escritorio", 1):
        seq.append(st(x, "escritorio", estilo="titulo", titulo="Atendimento", linha="das 8h à 1h da tarde · presencial e online"))
    # 14 mais um da decoração
    for x in pega(cat_bonita, 1):
        seq.append(st(x, m_bonita, estilo="titulo", titulo="", linha="venha ver de pertinho<br>o nosso Natal" if em_natal else "esperamos por você"))
    # extras (curadoria do dia, material novo)
    for e in extra:
        slot[0] += 1
        e = dict(e); e["id"] = f"{slot[0]:02d}-{e['id']}"
        seq.append(e)
    # 15 até amanhã
    for x in pega(fach, 1):
        seq.append(st(x, m_bonita, estilo="titulo", titulo="Até amanhã", linha="seguimos juntos"))

    lote = BASE / "stories" / f"{data.isoformat()}-b-roll"
    lote.mkdir(parents=True, exist_ok=True)
    spec = lote / "auto.json"
    spec.write_text(json.dumps(seq, ensure_ascii=False, indent=1), encoding="utf-8")
    subprocess.run([PY, str(BASE / "modelos" / "stories_modelo.py"), str(lote), str(spec)], check=True)

    # artes do dia (feed e novidade oficial) entram como foto, antes do "até amanhã"
    artes = []
    for pasta in sorted((BASE / "posts").glob(f"{data.isoformat()}-*")):
        for nome in ("story.png", "story.jpg"):
            if (pasta / nome).exists():
                destino = lote / f"arte-{pasta.name[11:]}.jpg"
                from PIL import Image
                Image.open(pasta / nome).convert("RGB").save(destino, quality=93)
                artes.append(destino.name)
                break
    ordem = [f"{s['id']}.mp4" for s in seq]
    ordem = ordem[:-1] + artes + ordem[-1:]
    cab = [f"# lote automático de {data.isoformat()} (modelo da Talyta de 11/11/2026; regra imutável: sai todo dia útil às 7h30)",
           f"# {len(ordem)} stories · saudação: {saud} · Natal: {'sim' if em_natal else 'não'} · viagem: {'sim' if cfg.get('viagem_ativa') else 'não'}"]
    (lote / "ordem.txt").write_text("\n".join(cab + ordem) + "\n", encoding="utf-8")
    usados[data.isoformat()] = usados_hoje
    (AUTO / "usados.json").write_text(json.dumps(dict(sorted(usados.items())[-20:]), indent=1), encoding="utf-8")
    print(f"lote pronto: {lote} · {len(ordem)} stories")
    if len(ordem) < 15:
        sys.exit(f"ERRO: só {len(ordem)} stories (mínimo 15)")


if __name__ == "__main__":
    main()
