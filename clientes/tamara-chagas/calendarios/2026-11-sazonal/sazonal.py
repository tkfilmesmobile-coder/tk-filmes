# Calendário sazonal da Tamara Chagas Advocacia: 23/11/2026 ao Carnaval de 2027.
# Gera o rascunho editável (.md) e o HTML do PDF a partir da mesma lista de datas.
# uso: python sazonal.py   (gera calendario-sazonal.md e calendario-sazonal.html nesta pasta)
import html, pathlib

AQUI = pathlib.Path(__file__).parent

# camada: prev (nicho previdenciário), nac (nacional), saude (campanha do mês), local (União dos Palmares/AL), util (prazo e dinheiro)
# prio: 3 = Reels, 2 = arte ou carrossel, 1 = só stories ou aviso
MESES = [
 ("Novembro", "fim de mês", "A reta final de novembro: golpes da Black Friday e o enfrentamento à violência contra a mulher.", [
  ("25/11", "qua", "Dia Internacional pela Eliminação da Violência contra a Mulher", "nac", 2,
   "Retomar o Benefício Lei Maria da Penha: quem é afastada do trabalho por medida protetiva recebe pelo INSS. Arte curta ou repost do carrossel de 12/11.",
   "ONU, 25/11 · Lei 11.340/2006, art. 9º, § 2º, II"),
  ("27/11", "sex", "Black Friday", "nac", 3,
   "Golpe da semana: oferta de empréstimo consignado \"com desconto\", desconto indevido no benefício e link falso \"do INSS\". Reels da equipe, no formato que mais circula (alertas: 69 compartilhamentos).",
   "canais oficiais: Meu INSS e 135"),
 ]),
 ("Dezembro", "Dezembro Vermelho e Laranja", "Mês de campanhas de saúde, do pagamento antecipado de dezembro e do recesso da Justiça. O escritório continua atendendo.", [
  ("todo o mês", "", "Golpe do \"13º de dezembro\"", "prev", 3,
   "Em 2026 o 13º do INSS foi pago em abril e maio: mensagem de \"13º liberado\" em dezembro é golpe. BPC não tem 13º. Reels da Doutora no começo do mês.",
   "Decreto 12.884/2026 (antecipação) · confirmar caso a caso no Meu INSS"),
  ("todo o mês", "", "Safra da cana na Zona da Mata", "local", 2,
   "Gancho regional que mais conversa com União: safrista com carteira, segurado especial e aposentadoria híbrida. Gravar na roça.",
   "Lei 8.213/1991, arts. 11, 48 e 143"),
  ("todo o mês", "", "Dezembro Laranja (câncer de pele)", "saude", 3,
   "Quem trabalha no sol (cortador de cana, agricultor) e tem câncer de pele: auxílio por incapacidade, sem carência nos casos de neoplasia maligna. Reels gravado na roça.",
   "campanha da SBD · Lei 8.213, art. 151"),
  ("01/12", "ter", "Dia Mundial de Luta contra a Aids · Dezembro Vermelho", "saude", 2,
   "HIV/aids: auxílio e aposentadoria por incapacidade sem carência; aposentado por invalidez com HIV dispensado de reavaliação.",
   "Lei 13.504/2017 · Lei 8.213, art. 151 · Lei 13.847/2019"),
  ("03/12", "qui", "Dia Internacional da Pessoa com Deficiência", "nac", 3,
   "Carrossel: BPC, auxílio-inclusão e aposentadoria da pessoa com deficiência (por idade e por tempo, com tempo reduzido).",
   "LC 142/2013 · Lei 8.742/1993, arts. 20 e 26-A"),
  ("08/12", "ter", "Nossa Senhora da Conceição · Dia da Justiça", "local", 1,
   "Feriado municipal em União dos Palmares e feriado na Justiça Federal. Confirmar se o escritório abre; se fechar, aviso de funcionamento na véspera (07/12) e story de fé, sem post obrigatório.",
   "Lei Municipal 336/67 · Lei 6.741/79 (Portaria JFAL 199/2025)"),
  ("10/12", "qui", "Dia Internacional dos Direitos Humanos", "nac", 1,
   "Story ou frase da Doutora: previdência social é direito humano.",
   "Declaração Universal dos Direitos Humanos, arts. 22 e 25"),
  ("15/12", "ter", "Vence a contribuição de novembro", "util", 1,
   "Lembrete em story para contribuinte individual e facultativo: a guia de novembro vence dia 15.",
   "Lei 8.212/1991, art. 30, II"),
  ("20/12", "dom", "Começa o recesso da Justiça", "prev", 3,
   "\"Meu processo para no recesso?\" O recesso vai de 20/12 a 06/01 e os prazos ficam suspensos até 20/01, mas o escritório segue atendendo e acompanhando. Reels na sexta, 18/12.",
   "Lei 5.010/66, art. 62, I · CPC, art. 220"),
  ("22/12", "ter", "Começa o pagamento de dezembro do INSS", "util", 3,
   "Arte do calendário (a melhor arte do escritório foi um calendário de pagamento). Até um mínimo: finais 1 e 2 em 22 e 23/12, 3 a 5 de 28 a 30/12, 6 a 0 de 04 a 08/01. Acima do mínimo: 04 a 08/01.",
   "conferir no Meu INSS e no gov.br antes de publicar"),
  ("24 e 25/12", "qui/sex", "Véspera de Natal e Natal", "nac", 3,
   "Mensagem de Natal da Doutora e da equipe no escritório decorado (na saga do Natal de 2026, o post de 01/11 alcançou 7.433 pessoas e o vídeo oficial, 6.816). Publicar na quarta, 23/12; nos dias 24 e 25, só stories.",
   "sem expediente (config da rotina)"),
  ("28 a 30/12", "seg a qua", "Contagem regressiva: o que muda em 1º de janeiro", "prev", 3,
   "Reels da Doutora e carrossel: as regras de transição sobem em 2027 (pontos 94/104, idade mínima progressiva 60/65); os pedágios não mudam.",
   "EC 103/2019, arts. 15 e 16"),
  ("31/12 e 01/01", "qui/sex", "Réveillon e Confraternização Universal", "nac", 1,
   "Sem post obrigatório. Story de Feliz Ano Novo.",
   "sem expediente (config da rotina)"),
 ]),
 ("Janeiro", "Janeiro Branco e Roxo", "Mês das regras novas, do reajuste e do Dia do Aposentado, com a saúde mental como tema de fundo.", [
  ("01/01", "sex", "Valem as regras de transição de 2027", "prev", 2,
   "Post fixo de utilidade, para salvar: tabela das regras de transição de 2027. Também é a data do novo salário mínimo, que só vira post com o decreto publicado.",
   "EC 103/2019, arts. 15 e 16 · decreto do mínimo (aguardar)"),
  ("todo o mês", "", "Janeiro Branco (saúde mental)", "saude", 3,
   "Depressão e ansiedade dão direito a auxílio? O que o laudo precisa ter para a perícia. Reels da Doutora e arte.",
   "Lei 8.213, arts. 59 e 60"),
  ("04 a 08/01", "seg a sex", "Pagamento de dezembro de quem ganha acima do mínimo", "util", 1,
   "Stories lembrando as datas (finais 1 e 6 em 04/01, até 5 e 0 em 08/01).",
   "conferir no Meu INSS"),
  ("07/01", "qui", "A Justiça Federal volta do recesso", "prev", 1,
   "Story: o expediente da Justiça volta, os prazos voltam a correr em 21/01.",
   "Lei 5.010/66, art. 62, I · CPC, art. 220"),
  ("assim que sair", "", "Reajuste dos benefícios, novo teto e nova tabela de contribuição", "util", 3,
   "Carrossel \"saiu o reajuste\": percentual de quem ganha acima do mínimo, novo teto e novos valores de contribuição. Só depois da portaria publicada.",
   "Portaria Interministerial MPS/MF do ano (aguardar)"),
  ("15/01", "sex", "Vence a contribuição de dezembro", "util", 1,
   "Story de lembrete, já com a tabela nova, se tiver saído.",
   "Lei 8.212, art. 30, II"),
  ("21/01", "qui", "Prazos processuais voltam a correr", "prev", 1,
   "Story curto ou nota no Reels da semana.",
   "CPC, art. 220"),
  ("24/01", "dom", "Dia Nacional do Aposentado e Dia da Previdência Social", "prev", 3,
   "A data mais forte do nicho no período. Semana do Aposentado: homenagem com aposentados de União (com autorização de imagem) na segunda, 25/01, e véspera na sexta, 22/01: direitos de quem já se aposentou.",
   "Lei 6.926/1981 · Lei Eloy Chaves (24/01/1923)"),
  ("31/01", "dom", "Dia Mundial de Combate à Hanseníase · Janeiro Roxo", "saude", 2,
   "Hanseníase: auxílio e aposentadoria sem carência. Arte na sexta, 29/01.",
   "último domingo de janeiro · Lei 8.213, art. 151"),
 ]),
 ("Fevereiro", "até o Carnaval", "A festa da Padroeira de União abre o mês, e o Carnaval fecha o período.", [
  ("todo o mês", "", "Fevereiro Roxo e Laranja", "saude", 2,
   "Alzheimer, lúpus e fibromialgia (roxo) e leucemia (laranja): quando a doença dá direito a benefício. Arte ou carrossel.",
   "Lei 8.213, arts. 42, 59 e 151"),
  ("02/02", "ter", "Festividades da Padroeira de União dos Palmares", "local", 2,
   "Feriado municipal. Data local rende mais que data nacional: story e arte de homenagem à cidade, e aviso de funcionamento na segunda, 01/02, se o escritório fechar.",
   "Lei Municipal 327/67 (Portaria JFAL 199/2025)"),
  ("04/02", "qui", "Dia Mundial do Câncer", "saude", 3,
   "Câncer e INSS: auxílio sem carência, aposentadoria e isenção de Imposto de Renda do aposentado. Reels da Doutora.",
   "Lei 8.213, art. 151 · Lei 7.713/1988, art. 6º, XIV"),
  ("05/02", "sex", "Véspera do Carnaval", "prev", 3,
   "Reels da equipe, \"Golpe ou verdade?\": \"no Carnaval o INSS não funciona\" (Meu INSS e 135 seguem no ar). Mais o aviso de funcionamento do escritório.",
   "canais oficiais do INSS"),
  ("08 a 10/02", "seg a qua", "Carnaval e Quarta-feira de Cinzas", "nac", 1,
   "Sem expediente na segunda e na terça (config da rotina). Só stories: acidente na folia e auxílio-acidente para quem contribui; ambulante de Carnaval pode contribuir como individual. Na quarta, \"estamos de volta\"; a contribuição de janeiro vence na segunda, 15/02.",
   "Lei 8.213, art. 86 · Lei 8.212, art. 21 · Cinzas: ponto facultativo"),
 ]),
]

CAMADA = {"prev": "previdência", "nac": "nacional", "saude": "campanha de saúde", "local": "União dos Palmares", "util": "prazo e dinheiro"}
PRIO = {3: "Reels", 2: "arte ou carrossel", 1: "stories ou aviso"}

# ---------- markdown ----------
md = ["# Calendário sazonal · Tamara Chagas Advocacia", "", "De 23/11/2026 ao Carnaval de 2027 (08 e 09/02). Rascunho editável; o PDF sai do `sazonal.py`.", "",
      "Prioridade: ●●● vira Reels · ●● arte ou carrossel · ● stories ou aviso. Camadas: previdência, nacional, campanha de saúde, União dos Palmares, prazo e dinheiro.", ""]
for nome, tema, intro, datas in MESES:
    md += [f"## {nome} · {tema}", "", intro, "", "| data | o quê | camada | prioridade | como usar | base |", "|---|---|---|---|---|---|"]
    for d, dia, titulo, cam, pr, uso, base in datas:
        md.append(f"| {d} {dia} | {titulo} | {CAMADA[cam]} | {'●' * pr} | {uso} | {base} |")
    md.append("")
md += ["## Sem expediente (confirmar com o escritório)", "",
       "- 08/12 (Nossa Senhora da Conceição, municipal) e 02/02 (Padroeira, municipal): **não estão** na lista `sem_expediente` da rotina. Se o escritório fechar, incluir e agendar o aviso na véspera.",
       "- 24/12, 25/12, 31/12, 01/01, 08/02 e 09/02 já estão na lista da rotina.", "",
       "## Regras", "",
       "- Data só entra quando vira direito (o que não funciona: data genérica sem direito por trás, ver relatório de 6 meses).",
       "- Previsão (salário mínimo, reajuste, datas de pagamento) só vira post depois do número oficial publicado.",
       "- OAB (Provimento 205/2021): sem promessa de resultado, sem caso concreto identificável, sem ostentação.", ""]
(AQUI / "calendario-sazonal.md").write_text("\n".join(md), encoding="utf-8")

# ---------- html ----------
e = html.escape
def linha(d, dia, titulo, cam, pr, uso, base):
    pts = "".join(f'<i class="{"on" if k < pr else ""}"></i>' for k in range(3))
    per = ' class="per"' if '/' not in d else ''
    return (f'<div class="dt {cam}"><div class="q"><b{per}>{e(d)}</b><span>{e(dia)}</span></div>'
            f'<div class="c"><div class="tt">{e(titulo)}</div><div class="uso">{e(uso)}</div><div class="base">{e(base)}</div></div>'
            f'<div class="m"><span class="tag {cam}">{CAMADA[cam]}</span><span class="pr">{pts}</span><span class="fm">{PRIO[pr]}</span></div></div>')

# Paginação corrida: os meses fluem pelas páginas; altura estimada de cada bloco em mm.
import math
UTIL = 238
def alt_linha(x):
    return 15 + math.ceil(len(x[5]) / 92) * 4.4 + (4.6 if len(x[2]) > 62 else 0)
def cab_html(nome, tema, intro, topo, cont):
    if topo:
        return (f'<div class="mes"><div class="k">{e(tema)}</div><h2>{e(nome)}{"<span> (continuação)</span>" if cont else ""}</h2>'
                + ("" if cont else f'<p class="lead">{e(intro)}</p>') + '</div>')
    return f'<div class="mes2"><div class="k">{e(tema)}</div><h3>{e(nome)}</h3><p>{e(intro)}</p></div>'
paginas, atual, usado = [], [], 0
def fecha():
    global atual, usado
    if atual: paginas.append("".join(atual))
    atual, usado = [], 0
for nome, tema, intro, datas in MESES:
    i = 0
    while i < len(datas):
        topo = not atual
        h = (40 if not i else 24) if topo else 30
        if not topo and usado + h + alt_linha(datas[i]) > UTIL:
            fecha(); continue
        atual.append(cab_html(nome, tema, intro, topo, i > 0)); usado += h
        linhas = []
        while i < len(datas) and usado + alt_linha(datas[i]) <= UTIL:
            linhas.append(linha(*datas[i])); usado += alt_linha(datas[i]); i += 1
        atual.append(f'<div class="lista">{"".join(linhas)}</div>')
        if i < len(datas): fecha()
fecha()
paginas = [(p, k + 3) for k, p in enumerate(paginas)]

CSS = (AQUI / "estilo.css").read_text(encoding="utf-8")
TOPO = '<div class="topo"><span>Tamara Chagas Advocacia</span><span>Calendário sazonal · até o Carnaval 2027</span></div>'
def rod(k): return f'<div class="rod"><span>{k:02d}</span><img src="../../../../_contexto/marca/logo-2.0/tkfilmes-horizontal.svg" alt=""></div>'

todas = [x + ((nm.lower() if x[0] == 'todo o mês' else x[0]),) for nm, _, _, ds in MESES for x in ds]
altas = [x for x in todas if x[4] == 3]

# linha do tempo da visão geral: posição pelo dia do período (23/11 = 0, 10/02 = 79)
import datetime as dtm
ini = dtm.date(2026, 11, 23); fim = dtm.date(2027, 2, 10); tot = (fim - ini).days
def pos(dd):
    import re
    dia = re.search(r"\d{2}", dd); mes = re.search(r"/(\d{2})", dd)
    if not dia or not mes:
        return None
    d, m = int(dia.group()), int(mes.group(1))
    a = 2026 if m >= 11 else 2027
    return round((dtm.date(a, m, d) - ini).days / tot * 100, 2)
marcas = []
for x in todas:
    p = pos(x[0])
    if p is not None:
        marcas.append(f'<i class="mk {x[3]} p{x[4]}" style="left:{p}%"></i>')
meses_tl = "".join(f'<span style="left:{pos(m)}%">{t}</span>' for m, t in [("01/12", "dez"), ("01/01", "jan"), ("01/02", "fev")])

capa = f'''<section class="pg capa"><div class="foto"></div><div class="veu"></div><div class="cobre"></div>
<img class="logo" src="../../marca/logo-escuro-recortado.png" alt="">
<div class="txt"><div class="k">Calendário sazonal · 23/11/2026 a 10/02/2027</div>
<h1>Daqui até<b>o Carnaval.</b></h1>
<p class="sub">As datas de dezembro, janeiro e fevereiro que viram conteúdo para o escritório: o que cada uma pede, em que formato e com qual base oficial.</p></div>
<div class="base"><div class="pf"><div><b>{len(todas)}</b>datas e temporadas</div><div><b>{len(altas)}</b>viram Reels</div><div><b>2</b>feriados de União</div></div>
<div class="tk">preparado por<img src="../../../../_contexto/marca/logo-2.0/tkfilmes-horizontal.svg" alt=""></div></div></section>'''

visao = f'''<section class="pg">{TOPO}<div class="k"><span class="n">01</span>Visão geral</div>
<h2>Onze semanas, <b>{len(todas)} datas.</b></h2>
<p class="lead">Cada data passou por um filtro: só entra se vira direito para o público do escritório. Data local e alerta de golpe vêm primeiro, porque são os que mais rendem.</p>
<div class="tl"><div class="eixo">{marcas and "".join(marcas)}</div><div class="ms">{meses_tl}</div>
<div class="pontas"><span>23/11</span><span>Carnaval · 08 e 09/02</span></div></div>
<div class="leg">{"".join(f'<span><i class="mk {c} p3" style="position:static"></i>{t}</span>' for c, t in CAMADA.items())}</div>
<div class="k" style="margin-top:9mm">As {len(altas)} que não podem faltar</div>
<div class="altas">{"".join(f'<div><b>{e(x[7])}</b><span>{e(x[2])}</span></div>' for x in altas)}</div>
{rod(2)}</section>'''

corpo = []
for conteudo, k in paginas:
    corpo.append(f'<section class="pg">{TOPO}{conteudo}{rod(k)}</section>')

k = paginas[-1][1] + 1
fecho = f'''<section class="pg">{TOPO}<div class="k"><span class="n">02</span>Antes de publicar</div>
<h2>Expediente, <b>regras e fontes.</b></h2>
<div class="dois">
<div class="bx"><div class="h">Dias sem expediente</div>
<div class="l"><b>08/12 · ter</b>Nossa Senhora da Conceição (feriado municipal). <em>Confirmar com o escritório; não está na lista da rotina.</em></div>
<div class="l"><b>24 e 25/12</b>Véspera de Natal e Natal.</div>
<div class="l"><b>31/12 e 01/01</b>Réveillon e Confraternização Universal.</div>
<div class="l"><b>02/02 · ter</b>Festividades da Padroeira de União (feriado municipal). <em>Confirmar com o escritório; não está na lista da rotina.</em></div>
<div class="l"><b>08 e 09/02</b>Carnaval. Quarta de Cinzas (10/02) é ponto facultativo.</div>
<p class="nota">Nos dias sem expediente a rotina do feed pula; o aviso de funcionamento sai no dia útil anterior.</p></div>
<div class="bx"><div class="h">Datas de dinheiro e prazo</div>
<div class="l"><b>15/12, 15/01 e 15/02</b>Vencimento da contribuição do mês anterior (individual e facultativo).</div>
<div class="l"><b>22/12 a 08/01</b>Pagamento de dezembro do INSS, pelo final do benefício.</div>
<div class="l"><b>20/12 a 06/01</b>Recesso da Justiça Federal; prazos suspensos até 20/01.</div>
<div class="l"><b>01/01</b>Novas regras de transição e novo salário mínimo (aguardar o decreto).</div>
<div class="l"><b>janeiro</b>Reajuste de quem ganha acima do mínimo, novo teto e nova tabela de contribuição (aguardar a portaria).</div></div>
</div>
<div class="regras">
<div><b>Data só com direito.</b>Data comemorativa sem direito por trás não entra: no último semestre, Dia das Crianças e Dia dos Pais tiveram de 25 a 293 de alcance.</div>
<div><b>Previsão não vira post.</b>Salário mínimo, reajuste e datas de pagamento só depois do número oficial publicado.</div>
<div><b>Regras da OAB.</b>Sem promessa de resultado, sem caso concreto identificável e sem ostentação (Provimento 205/2021).</div>
</div>
<p class="fontes">Fontes: Portaria da Direção do Foro da Justiça Federal em Alagoas nº 199/2025 (feriados de 2026, inclusive os de União dos Palmares); Lei 5.010/66, art. 62; CPC, art. 220; EC 103/2019; Leis 8.212/1991 e 8.213/1991; calendário de pagamento do INSS divulgado na imprensa (conferir no Meu INSS). Os feriados municipais de 2027 seguem as mesmas leis municipais e devem ser reconferidos quando a portaria de 2027 sair.</p>
{rod(k)}</section>'''

doc = f'''<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>Calendário sazonal · Tamara Chagas Advocacia</title>
<link href="https://fonts.googleapis.com/css2?family=Libre+Baskerville:wght@400;700&family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
<style>{CSS}</style></head><body>{capa}{visao}{"".join(corpo)}{fecho}</body></html>'''
(AQUI / "calendario-sazonal.html").write_text(doc, encoding="utf-8")
print("datas:", len(todas), "· reels:", len(altas), "· páginas:", 2 + len(paginas) + 1)
