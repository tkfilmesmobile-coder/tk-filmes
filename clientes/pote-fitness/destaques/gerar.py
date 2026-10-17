# Capas dos destaques e stories (5+ por destaque) do @potefitness, 1080x1920.
# Saída: imagens/capa-<destaque>.jpg e imagens/<destaque>-NN.jpg
# Uso: python gerar.py
import pathlib
from playwright.sync_api import sync_playwright

BASE = pathlib.Path(__file__).resolve().parent
SAIDA, BUILD = BASE / "imagens", BASE / "build"
SAIDA.mkdir(exist_ok=True); BUILD.mkdir(exist_ok=True)
FOTOS = BASE.parent / "feed-inicial/fotos"
LOGO = (BASE.parent / "marca/logo-reduzida-perfil.png").as_uri()

CSS = """
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&display=swap');
:root{--verde:#0C2F20;--creme:#FDF9EF;--natural:#496B30;--morango:#C72F35;--amarelo:#E7B944}
*{margin:0;padding:0;box-sizing:border-box}
body{width:1080px;height:1920px;overflow:hidden;font-family:Montserrat,sans-serif;background:var(--verde);color:var(--creme);position:relative}
body.claro{background:var(--creme);color:var(--verde)}
.capa{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:520px;height:520px;border-radius:50%;
  border:6px solid var(--creme);display:flex;align-items:center;justify-content:center}
.capa svg{width:260px;height:260px;stroke:var(--creme);fill:none;stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round}
.topo{position:absolute;top:150px;left:0;right:0;text-align:center}
.topo img{width:150px;height:150px;border-radius:50%}
.pill{display:inline-block;margin-top:40px;border:3px solid currentColor;border-radius:24px;padding:10px 32px;font-size:36px;font-weight:700}
h1{position:absolute;top:500px;left:80px;right:80px;text-align:center;font-size:120px;font-weight:800;letter-spacing:-.035em;line-height:1}
h1.menor{font-size:96px}
.card{position:absolute;left:90px;right:90px;top:800px;background:var(--creme);color:var(--verde);border-radius:44px;padding:60px 64px}
.claro .card{background:#fff;box-shadow:0 20px 50px rgba(12,47,32,.12)}
.linha{display:flex;justify-content:space-between;align-items:baseline;font-size:46px;font-weight:700;padding:22px 0;border-bottom:2px solid #E5DFD0}
.linha:last-child{border-bottom:0}
.linha span{color:var(--natural);font-weight:600}
.passo{display:flex;gap:30px;align-items:center;font-size:44px;font-weight:600;padding:20px 0;line-height:1.2}
.passo b{flex:none;width:96px;height:96px;border-radius:28px;background:var(--natural);color:#fff;display:flex;align-items:center;justify-content:center;font-size:42px}
.nota{font-size:34px;font-weight:500;color:var(--natural);margin-top:20px;line-height:1.4}
.par{font-size:46px;font-weight:500;line-height:1.45;text-align:center}
.par b{font-weight:800}
.foto{position:absolute;left:90px;right:90px;top:780px;height:500px;border-radius:44px;background-size:cover;background-position:center}
.txt{position:absolute;left:90px;right:90px;top:1330px;text-align:center;font-size:42px;font-weight:500;line-height:1.4}
.txt b{font-weight:800}
.big{position:absolute;top:800px;left:0;right:0;text-align:center;font-size:260px;font-weight:800;letter-spacing:-.04em;color:var(--amarelo)}
.rodape{position:absolute;bottom:170px;left:0;right:0;text-align:center}
.btn{display:inline-block;background:var(--morango);color:#fff;font-size:38px;font-weight:700;letter-spacing:.06em;padding:28px 54px;border-radius:999px}
.zap{margin-top:26px;font-size:44px;font-weight:700}
"""

ICONES = {  # traço fino, 64x64
    "cardapio": '<rect x="16" y="8" width="32" height="48" rx="4"/><line x1="23" y1="20" x2="41" y2="20"/><line x1="23" y1="30" x2="41" y2="30"/><line x1="23" y1="40" x2="35" y2="40"/>',
    "como-pedir": '<path d="M12 14h40a4 4 0 0 1 4 4v22a4 4 0 0 1-4 4H28l-10 8v-8h-6a4 4 0 0 1-4-4V18a4 4 0 0 1 4-4z"/><circle cx="22" cy="29" r="1.5"/><circle cx="32" cy="29" r="1.5"/><circle cx="42" cy="29" r="1.5"/>',
    "horarios": '<circle cx="32" cy="32" r="22"/><polyline points="32,18 32,32 42,38"/>',
    "entregas": '<path d="M14 24h36l-3 30H17z"/><path d="M24 24v-4a8 8 0 0 1 16 0v4"/>',
    "clientes": '<path d="M32 52S10 39 10 24a11 11 0 0 1 22-3 11 11 0 0 1 22 3c0 15-22 28-22 28z"/>',
    "bastidores": '<path d="M12 28h40c0 13-9 22-20 22S12 41 12 28z"/><circle cx="24" cy="20" r="5"/><circle cx="36" cy="18" r="6"/><path d="M44 22c2-6 7-8 10-8"/>',
}

def f(fid): return (FOTOS / f"{fid}.jpg").as_uri()
def topo(pill): return f'<div class="topo"><img src="{LOGO}"><br><div class="pill">{pill}</div></div>'
ZAP = '<div class="rodape"><div class="btn">PEÇA PELO WHATSAPP</div><div class="zap">(82) 99120-2604</div></div>'

def card(pill, tit, miolo, claro=False, menor=False):
    return f'<body class="{"claro" if claro else ""}">{topo(pill)}<h1 class="{"menor" if menor else ""}">{tit}</h1><div class="card">{miolo}</div>{ZAP}</body>'
def foto(pill, tit, fid, txt, claro=False):
    return f'<body class="{"claro" if claro else ""}">{topo(pill)}<h1 class="menor">{tit}</h1><div class="foto" style="background-image:url(\'{f(fid)}\')"></div><div class="txt">{txt}</div>{ZAP}</body>'
def preco(pill, tamanho, valor, fid):
    return f'<body>{topo(pill)}<h1>{tamanho}</h1><div class="foto" style="background-image:url(\'{f(fid)}\')"></div><div class="txt"><b style="font-size:96px;color:#E7B944">{valor}</b><br>frutas à sua escolha</div>{ZAP}</body>'
def passos(*itens): return "".join(f'<div class="passo"><b>{i+1:02d}</b>{t}</div>' for i, t in enumerate(itens))
def passo_unico(n, t): return f'<div class="passo"><b>{n:02d}</b>{t}</div>'

FRUTAS = "abacaxi, morango, banana, uva, melancia, goiaba, mamão e laranja"

STORIES = {
    "cardapio": [
        card("Cardápio", "Monte<br>seu pote.", '<div class="linha">Pote Pequeno<span>R$ 5</span></div><div class="linha">Pote Médio<span>R$ 8</span></div><div class="linha">Pote Grande<span>R$ 10</span></div><div class="linha">Complemento<span>R$ 2 cada</span></div>'),
        preco("Cardápio", "Pote<br>Pequeno", "R$ 5", "HLwc-ne0IQM"),
        preco("Cardápio", "Pote<br>Médio", "R$ 8", "yo3kr2teY7w"),
        preco("Cardápio", "Pote<br>Grande", "R$ 10", "2cXZQ862gws"),
        card("Cardápio", "Nossas<br>frutas.", f'<div class="par">Abacaxi · Morango<br>Banana · Uva<br>Melancia · Goiaba<br>Mamão · Laranja</div>', claro=True),
        card("Cardápio", "Complementos", '<div class="par"><b>R$ 2</b> cada, se você quiser.<br><br>As frutas são as protagonistas; o complemento é um charme a mais.</div><div class="nota" style="text-align:center">Pergunta no WhatsApp quais estão disponíveis.</div>', menor=True),
    ],
    "como-pedir": [
        card("Como pedir", "Pedir<br>é fácil.", passos("Chama no WhatsApp", "Escolhe o tamanho", "Escolhe as frutas e os complementos", "Confirma e recebe")),
        card("Como pedir", "Passo 1", passo_unico(1, "Chama a gente no WhatsApp") + '<div class="nota">(82) 99120-2604, das 8h30 às 17h30.</div>', claro=True),
        card("Como pedir", "Passo 2", passo_unico(2, "Escolhe o tamanho") + '<div class="nota">Pequeno R$ 5 · Médio R$ 8 · Grande R$ 10</div>'),
        card("Como pedir", "Passo 3", passo_unico(3, "Escolhe as frutas e, se quiser, os complementos") + f'<div class="nota">Frutas: {FRUTAS}.</div>', claro=True),
        card("Como pedir", "Passo 4", passo_unico(4, "Recebe o resumo e confirma") + '<div class="nota">Pote, frutas, adicionais, valor total, endereço e horário: tudo por escrito antes de sair.</div>'),
    ],
    "horarios": [
        card("Horários", "Quando<br>pedir?", '<div class="linha">Abre<span>8h30</span></div><div class="linha">Fecha<span>17h30</span></div>'),
        foto("Horários", "Abrimos<br>às 8h30.", "-4Ee0IbO1M4", "Pra quem começa o dia cedo<br>e quer <b>um lanche gostoso</b> na rotina.", claro=True),
        foto("Horários", "Até as<br>17h30.", "HQJ9B9YSGKc", "Aquela <b>pausa no fim da tarde</b><br>também tem pote."),
        card("Horários", "Encomenda", '<div class="par">Quer pra um <b>dia e hora</b> certos?<br><br>Você pede, a gente confere a disponibilidade e <b>confirma</b>.</div>', claro=True),
        card("Horários", "Encomenda<br>confirmada", '<div class="par">A encomenda é <b>paga antes</b> da confirmação final.<br><br>Condições de alteração e cancelamento a gente explica antes.</div>', menor=True),
    ],
    "entregas": [
        card("Entregas", "A gente<br>leva até você.", passos("Entregamos em União dos Palmares", "Avisamos quando o pedido sair", "Imprevisto? A gente avisa na hora")),
        foto("Entregas", "Onde?", "zRGs0d6Lntk", "Em <b>União dos Palmares</b>.<br>Pergunta no WhatsApp se seu bairro está na rota.", claro=True),
        card("Entregas", "Saiu pra<br>entrega!", '<div class="par">Assim que seu pote sai, você recebe um <b>aviso no WhatsApp</b>.</div>'),
        card("Entregas", "E se<br>atrasar?", '<div class="par">A gente <b>avisa</b>, explica e passa uma <b>nova previsão</b>.<br>Sem te deixar no vácuo.</div>', claro=True, menor=True),
        card("Entregas", "Chegou!", '<div class="par">Aproveita seu pote. 💚<br><br>Depois conta pra gente <b>o que achou</b>: sua opinião é muito importante.</div>'),
    ],
    "clientes": [
        card("Clientes", "Mostra<br>seu pote!", passos("Tira uma foto do seu pote", "Posta nos stories", "Marca a @potefitness") + '<div class="nota">A gente reposta aqui, com todo carinho. 💚</div>'),
        card("Clientes", "Sua opinião<br>importa.", '<div class="par">Provou? Conta pra gente <b>o que achou</b>.<br><br>É assim que cada pote fica ainda melhor.</div>', claro=True, menor=True),
        foto("Clientes", "Qual a sua<br>combinação?", "1N7Ftmynp48", "Morango com banana? Abacaxi com uva?<br><b>Responde no direct!</b>"),
        card("Clientes", "Este espaço<br>é seu.", '<div class="par">Aqui vão ficar as <b>fotos e recados</b> de quem já provou o Pote Fitness.</div>', claro=True, menor=True),
        foto("Clientes", "Pote bom<br>se divide.", "xOYbXWGp-WQ", "Indica pra quem você <b>gosta</b>:<br>manda o nosso perfil pra um amigo."),
    ],
    "bastidores": [
        foto("Bastidores", "Capricho em<br>cada pote.", "qvuqrj68_eI", "Fruta escolhida, bem lavada,<br>cortada com cuidado e <b>montada com carinho</b>."),
        foto("Bastidores", "1. Escolha", "yTCDs4LBbQs", "Tudo começa na <b>fruta boa</b>.", claro=True),
        foto("Bastidores", "2. Preparo", "bULD0lNVXOA", "Lavada e cortada <b>com cuidado</b>."),
        foto("Bastidores", "3. Corte", "8_Tlng54n8Y", "Pedaços do tamanho certo<br>pra <b>comer de colher</b>.", claro=True),
        foto("Bastidores", "4. Montagem", "FGiTmCncTWQ", "Do jeito que <b>você pediu</b>."),
        foto("Bastidores", "5. Pronto!", "sEK8OMsJJ08", "Feito com carinho,<br><b>cheio de sabor</b>.", claro=True),
    ],
}

with sync_playwright() as p:
    nav = p.chromium.launch(); pg = nav.new_page(viewport={"width": 1080, "height": 1920})
    pecas = {f"capa-{n}": f'<body><div class="capa"><svg viewBox="0 0 64 64">{ICONES[n]}</svg></div></body>' for n in ICONES}
    for dest, lista in STORIES.items():
        for i, corpo in enumerate(lista, 1):
            pecas[f"{dest}-{i:02d}"] = corpo
    for nome, corpo in pecas.items():
        arq = BUILD / f"{nome}.html"
        arq.write_text(f"<!doctype html><html><head><meta charset='utf-8'><style>{CSS}</style></head>{corpo}</html>", encoding="utf-8")
        pg.goto(arq.as_uri()); pg.wait_for_load_state("networkidle"); pg.evaluate("document.fonts.ready"); pg.wait_for_timeout(250)
        pg.screenshot(path=str(SAIDA / f"{nome}.jpg"), type="jpeg", quality=92); print("ok", nome)
    nav.close()
