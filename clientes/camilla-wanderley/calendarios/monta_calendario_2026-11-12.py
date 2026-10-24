"""Calendário de postagens da Dra. Camilla, 26/10 a 31/12/2026, com o conteúdo já produzido.
Regras da Talyta (2026-10-24):
- data comemorativa sai no dia certo;
- vídeo e depois o carrossel feito em cima dele; um dia livre entre um post e outro (postou hoje, o próximo sai depois de amanhã);
- se um vídeo/carrossel cair no dia de uma data comemorativa, ele pula pro dia seguinte, e o resto segue com um dia de espaço.
Stories de data sem post no feed (Maceió 05/12, Réveillon 31/12) não ocupam vaga.
Gera calendarios/2026-11-12-calendario-postagens.md."""
import datetime as dt, os

AQUI = os.path.dirname(os.path.abspath(__file__))
INICIO = dt.date(2026, 10, 26)
DIAS = ["seg", "ter", "qua", "qui", "sex", "sáb", "dom"]

DATAS = {  # feed, dia fixo
    dt.date(2026, 11, 1): ("post de data", "Novembro Azul + Semana de Prevenção do Câncer Bucal", "posts/2026-11/02-semana-cancer-bucal"),
    dt.date(2026, 11, 14): ("post de data", "Dia Mundial do Diabetes", "posts/2026-11/14-dia-mundial-do-diabetes"),
    dt.date(2026, 11, 17): ("post de data", "Dia Mundial da Prematuridade (com o pai)", "posts/2026-11/17-prematuridade"),
    dt.date(2026, 11, 20): ("post de data", "Dia de Zumbi e da Consciência Negra", "posts/2026-11/20-consciencia-negra"),
    dt.date(2026, 12, 5): ("post de data", "211 anos de Maceió", "posts/2026-12/05-maceio-211-anos"),
    dt.date(2026, 12, 8): ("post de data", "Dia Nacional da Família", "posts/2026-12/08-dia-da-familia"),
    dt.date(2026, 12, 25): ("post de data", "Natal", "posts/2026-12/25-natal"),
    dt.date(2026, 12, 31): ("post de data", "Réveillon", "posts/2026-12/31-reveillon"),
}
# Toda data comemorativa vai pro feed também (pedido da Talyta, 2026-10-24): não sobra data só de stories.
BLOQUEADOS = {dt.date(2026, 11, 2)}  # Finados: sem post de vídeo/carrossel (pedido da Talyta, 2026-10-24)
SO_STORIES = {}
V = "Drive: VÍDEOS EDITADOS/2026-10/"
SEQUENCIA = [  # vídeo → carrossel dele
    # 26/10: o reels da Mari sai na segunda (pedido da Talyta, 2026-10-24); o carrossel dela já saiu em 22/10
    ("reels", "Depoimento da Mari · 7 anos de sorriso", "Notebook: reels \"Depoimento da Mari\" v4 (legenda vai com o arquivo)", "mari"),
    ("reels", "Vlog · uma quinta na CIP", V + "2026-10-22 · Vlog · uma quinta na CIP.mp4", "vlog"),
    ("carrossel", "Bastidores de uma quinta na CIP", "posts/2026-10/11-bastidores-quinta-cip", None),
    ("reels", "Clareamento antes do casamento", V + "2026-10-22 · Clareamento antes do casamento.mp4", "noiva"),
    ("carrossel", "Vai casar? Comece o clareamento antes", "posts/2026-10/14-clareamento-casamento", None),
    ("reels", "Feedback · Robervânia", V + "2026-10-22 · Feedback · Robervânia.mp4", "robervania"),
    ("carrossel", "Trauma de dentista e atendimento humanizado", "posts/2026-10/12-atendimento-humanizado", None),
    ("reels", "Clareamento caseiro · o erro que zera tudo", V + "2026-10-22 · Clareamento caseiro · o erro que zera tudo.mp4", "caseiro"),
    ("carrossel", "O erro que zera o clareamento caseiro", "posts/2026-10/15-clareamento-caseiro-erro", None),
    ("reels", "Feedback · colaboradora da CIP", V + "2026-10-22 · Feedback · colaboradora da CIP.mp4", "colaboradora"),
    ("carrossel", "Medo de dentista? Você não está sozinha", "posts/2026-10/13-medo-de-dentista", None),
    ("reels", "Espaço entre os dentes · resina", V + "2026-10-22 · Espaço entre os dentes · resina.mp4", "espaco"),
    ("carrossel", "Aquele espacinho entre os dentes tem solução", "posts/2026-10/16-espaco-entre-dentes", None),
]

# Dezembro: vídeos de setembro que nunca saíram e falam com adulto (pedido da Talyta, 2026-10-24); mesmas regras
INICIO_DEZ = dt.date(2026, 12, 1)
V9 = "Drive: VÍDEOS EDITADOS/2026-09/"
SEQUENCIA_DEZ = [
    ("reels", "Canal dói? (vídeo de setembro)", V9 + "Fazer canal dói (v1).mp4", "canal"),
    ("reels", "Sensibilidade ou canal? (vídeo de setembro)", V9 + "Sensibilidade x Canal (v2).mp4", "sensibilidade"),
    ("reels", "Acompanhamento de 6 em 6 meses (vídeo de setembro)", V9 + "acompanhamento 6 em 6 meses .mp4", "seis"),
]

ASSINA = "\n\nDra. Camilla Wanderley · Clínica Geral e Endodontia · às quintas na CIP, União dos Palmares"
LEG_VIDEO = {
    "mari": "",  # a legenda está com o arquivo no notebook
    "canal": """"Canal dói?"

Quase sempre, quem chega pra fazer canal já chega com dor, e essa dor vem da inflamação dentro do dente, não do tratamento. O canal é feito com anestesia, com calma e com cuidado em cada etapa.

Se o medo de canal te faz adiar aquele dente, me chama no direct que eu te explico tudo antes. 🤍

#canal #endodontia #tratamentodecanal #uniaodospalmares""",
    "seis": """Se você quer me ver feliz, é chegar na cadeira e não ter nada pra fazer além da limpeza.

A consulta de 6 em 6 meses evita problema de gengiva e cárie. E se aparece alguma coisa, a gente pega no começo, quando o tratamento ainda é simples.

É assim que a gente cria vínculo, e você cria o hábito de se cuidar.

Quando foi a sua última limpeza? Me chama no direct. 🤍

#limpezadental #prevencao #saudebucal #uniaodospalmares""",
    "sensibilidade": """Sensibilidade ou canal?

A sensibilidade dá aquela dor aguda com o gelado e passa assim que o estímulo sai. Já a dor que pode indicar canal costuma ser mais intensa, pode aparecer com o quente e às vezes até melhora com o gelado.

Quem diferencia uma da outra é a avaliação. Sentiu algo assim? Me chama no direct. 🤍

#sensibilidade #canal #endodontia #dicadedentista""",
    "vlog": """Uma quinta inteira na CIP, do primeiro ao último atendimento.

Toda semana eu pego a estrada de Maceió até União, e cada quinta tem um pouco de tudo: conversa, cuidado, mãe e filha com o mesmo sorriso, noiva planejando o clareamento e paciente de anos contando a própria história.

Obrigada a cada pessoa que confia o sorriso a mim e à Joana. 🤍

#bastidores #dentista #uniaodospalmares #cip""",
    "noiva": """Vai casar? Comece o clareamento antes.

Só o caseiro leva cerca de 21 dias, e começar com um gel forte demais pode trazer sensibilidade. Quando a data está perto, dá pra associar o clareamento de consultório com o caseiro e planejar cada etapa até o grande dia.

Sensibilidade pode aparecer, sim. Com acompanhamento, ela é controlável.

Tem uma data importante chegando? Me chama no direct que a gente planeja junto. 🤍

#clareamentodental #noiva #casamento #uniaodospalmares""",
    "robervania": """"Eu não fui tratada apenas como uma paciente."

Ouvir isso me lembra por que eu faço o que faço. Cuidar de dente é técnica; cuidar de gente é escuta, paciência e tempo.

Obrigada pela confiança, Robervânia, e por trazer a sua família e as suas amigas. E obrigada, Joana, por estar comigo em cada atendimento. 🤍

#atendimentohumanizado #depoimento #dentista #uniaodospalmares""",
    "caseiro": """O erro que zera o clareamento caseiro: esquecer um dia.

Quem clareia é a dentina, lá dentro do dente. Quando você pula um dia, a saliva volta a fechar o caminho do gel, e o clareamento praticamente recomeça do zero.

Outra ajuda: durante o tratamento, evitar o que tem corante, como café, refrigerante e açaí.

Está clareando em casa? Salva esse vídeo pra lembrar. 🤍

#clareamentocaseiro #clareamentodental #dicadedentista""",
    "colaboradora": """"Eu tinha muito medo de ir ao dentista."

Ela é paciente há dois anos e também trabalha aqui na CIP. Ver o medo dar lugar à confiança, consulta após consulta, é uma das partes mais bonitas do meu trabalho.

Se o medo é o que te segura, me conta no direct. A gente começa pela conversa. 🤍

#medodedentista #depoimento #atendimentohumanizado #uniaodospalmares""",
    "espaco": """Aquele espacinho entre os dentes tem solução.

Com resina, dá pra fechar pequenos espaços e ajustar o tamanho e a posição dos dentes, quando faz sentido pro seu sorriso. Cada caso tem o seu plano, e ele começa na avaliação.

Me chama no direct. 🤍

#resina #diastema #sorriso #uniaodospalmares""",
}


def agenda():
    feed = {d: (*v, None) for d, v in DATAS.items()}
    dia = INICIO
    for inicio, seq in ((INICIO, SEQUENCIA), (INICIO_DEZ, SEQUENCIA_DEZ)):
        dia = max(dia, inicio)
        for fmt, tema, fonte, leg in seq:
            while dia in DATAS or dia in SO_STORIES or dia in BLOQUEADOS:  # data comemorativa (mesmo só de stories) ou feriado bloqueado: pula
                dia += dt.timedelta(days=1)
            feed[dia] = (fmt, tema, fonte, leg)
            dia += dt.timedelta(days=2)  # um dia livre
    return dict(sorted(feed.items()))


def ler(p):
    f = os.path.join(AQUI, "..", p, "legenda.md")
    return open(f, encoding="utf-8").read().strip() if os.path.exists(f) else ""


if __name__ == "__main__":
    feed = agenda()
    tudo = dict(sorted({**feed, **{d: (*v, None) for d, v in SO_STORIES.items()}}.items()))
    L = ["# Calendário de postagens · 26/10 a 31/12/2026 · Dra. Camilla Wanderley", "",
         "Conteúdo já produzido e aprovado: 6 datas comemorativas (estética homenagem), 6 vídeos da diária de 22/10 e os 6",
         "carrosséis feitos em cima deles. Regras da Talyta (2026-10-24): data comemorativa no dia certo; cada vídeo seguido",
         "do carrossel dele; um dia livre entre um post e outro; se cair em data comemorativa, o post pula pro dia seguinte e",
         "o resto segue com um dia de espaço. Gerado por `monta_calendario_2026-11-12.py` (mudou a regra, roda de novo).", "",
         "## Visão geral", "", "| data | formato | conteúdo | stories |", "|---|---|---|---|"]
    for d, (fmt, tema, fonte, leg) in tudo.items():
        st = "3 (do post)" if fonte.startswith("posts/") else "repostar o reels"
        if fmt == "só stories":
            st = "3 (só stories)"
        L.append(f"| {DIAS[d.weekday()]} {d:%d/%m} | {fmt} | {tema} | {st} |")
    n_nov = sum(1 for d in feed if d.month == 11)
    n_dez = sum(1 for d in feed if d.month == 12)
    n_out = sum(1 for d in feed if d.month == 10)
    L += ["", f"Feed: {n_out} em outubro (26 a 31), {n_nov} em novembro, {n_dez} em dezembro. Contrato: 5 posts fixos por mês.", "",
          "## Cada postagem", ""]
    for d, (fmt, tema, fonte, leg) in tudo.items():
        L += [f"### {DIAS[d.weekday()]} {d:%d/%m} · {fmt} · {tema}", "", f"- Arquivo: `{fonte}`" if fonte.startswith("posts/") else f"- Arquivo: {fonte}"]
        legenda = (LEG_VIDEO[leg] + ASSINA if LEG_VIDEO[leg] else "") if leg else ler(fonte)
        if legenda:
            L += ["- Legenda:", "", "```", legenda, "```"]
        L.append("")
    L += ["## Antes de publicar", "",
          "- Termos de autorização de imagem dos pacientes dos vídeos e carrosséis (Robervânia, colaboradora da CIP, noiva e mãe,",
          "  paciente do espelho/resina, foto 6577). Sem termo, o post não sai.",
          "- Confirmar com a doutora as frases sobre o pai (17/11 e 08/12) e se a filha pode aparecer (08/12 e stories de Natal).",
          "- Conferir a palavra \"abraçada\" na legenda do vídeo da colaboradora.",
          "- Token do Instagram da Camilla vence por volta de 27/11: renovar antes.",
          "- 02/11 (Finados) fica sem post: o carrossel da noiva foi pro 03/11 e o resto andou com um dia de espaço.", "",
          "## Vagas livres", "",
          "Dezembro tem os três vídeos de setembro (canal dói, sensibilidade x canal, 6 em 6 meses) e 4 datas (05, 08, 25 e 31/12):",
          "7 posts. Ainda cabem: o vídeo do implante (falta a animação) e a próxima diária.", ""]
    open(os.path.join(AQUI, "2026-11-12-calendario-postagens.md"), "w", encoding="utf-8").write("\n".join(L))
    for d, v in tudo.items():
        print(f"{DIAS[d.weekday()]} {d:%d/%m}  {v[0]:18} {v[1]}")
    print(n_out, n_nov, n_dez)
