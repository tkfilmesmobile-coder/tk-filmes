"""Carrossel "Contribuição do INSS: qual é a sua?" (16/11/2026, pedido da Talyta: tipos de contribuição, como é feito e
como pagar; complementa o Reels do vencimento). Fontes: INSS, tabela de contribuição mensal (atualizada 13/01/2026,
Portaria Interministerial MPS/MF 13/2026); INSS, cálculo da GPS; Receita Federal, códigos de receita da GPS.
Gera slide-01.png ... slide-08.png (1080x1350) e post.png (= capa)."""
import pathlib, shutil
from playwright.sync_api import sync_playwright

AQUI = pathlib.Path(__file__).parent
MARCA = (AQUI.parent.parent / "marca").as_uri()
CSS = """*{margin:0;padding:0;box-sizing:border-box;font-variant-numeric:lining-nums}
body{width:1080px;height:1350px;overflow:hidden;background:#ECEBE9;font-family:Inter,sans-serif;color:#141414}
.s{position:relative;width:1080px;height:1350px;padding:200px 96px 0}
.logo{position:absolute;left:96px;top:56px;width:118px}.n{position:absolute;right:96px;top:80px;font-size:18px;letter-spacing:.25em;color:#8C7B6B;font-weight:600}
.fio{position:absolute;left:96px;right:96px;bottom:110px;border-top:1px solid rgba(20,20,20,.18)}
.fonte{position:absolute;left:96px;right:280px;bottom:60px;font-size:16px;color:#555}.fonte b{letter-spacing:.2em;font-size:13px;margin-right:10px}
.arr{position:absolute;right:96px;bottom:60px;font-size:16px;letter-spacing:.3em;font-weight:600}
.k{font-size:20px;letter-spacing:.3em;font-weight:600;color:#8C7B6B}
h1{margin-top:22px;font-size:76px;line-height:1.03;letter-spacing:-.035em;font-weight:200}h1 b{font-weight:800}
h2{margin-top:18px;font-size:58px;line-height:1.05;letter-spacing:-.03em;font-weight:200}h2 b{font-weight:800}
.sub{margin-top:26px;font-size:33px;line-height:1.4;font-weight:300;max-width:860px}.sub b{font-weight:700}
.cards{margin-top:40px;display:flex;flex-direction:column;gap:18px}
.c{background:#fff;border-radius:22px;padding:28px 34px;display:flex;justify-content:space-between;align-items:center;gap:24px}
.c .a{font-size:68px;font-weight:800;letter-spacing:-.03em;min-width:190px}
.c .t{flex:1;font-size:30px;line-height:1.35}.c .t b{font-weight:700}.c .t small{display:block;margin-top:6px;font-size:21px;color:#8C7B6B;letter-spacing:.04em}
.lista{margin-top:36px}.li{display:flex;gap:24px;padding:22px 0;border-bottom:1px solid rgba(20,20,20,.15);font-size:29px;line-height:1.35}
.li span{font-weight:800;color:#8C7B6B;min-width:54px}.li b{font-weight:700}
.nota{margin-top:30px;background:#141414;color:#fff;border-radius:18px;padding:24px 32px;font-size:25px;line-height:1.4}.nota b{color:#E6D3B8}
.foto{position:absolute;right:-170px;top:0;height:1350px;-webkit-mask-image:linear-gradient(90deg,transparent 0%,#000 38%),linear-gradient(0deg,transparent 0px,#000 160px);-webkit-mask-composite:source-in}"""
FONTES = "INSS, tabela de contribuição mensal 2026 (Portaria MPS/MF 13/2026) · Receita Federal, códigos da GPS"


def slide(i, corpo, fonte=FONTES, arrasta=True):
    return (f'<!doctype html><html><head><meta charset="utf-8"><link href="https://fonts.googleapis.com/css2?family=Inter:wght@200;300;400;600;700;800&display=swap" rel="stylesheet">'
            f'<style>{CSS}</style></head><body><div class="s"><img class="logo" src="{MARCA}/logo-escuro-recortado.png"><div class="n">{i:02d} / 08</div>'
            f'{corpo}<div class="fio"></div><div class="fonte"><b>FONTE</b>{fonte}</div>{"<div class=arr>ARRASTE →</div>" if arrasta else ""}</div></body></html>')


S = [
 f"""<img class="foto" src="{MARCA}/fotos/tamara/tamara-estudio-0110.jpg"><div style="position:relative;max-width:500px;margin-top:120px">
 <div class="k">INSS · CONTRIBUIÇÃO</div><h1>Contribuição do INSS: <b>qual é a sua?</b></h1>
 <div class="sub">Os <b>tipos</b>, <b>quanto custa</b> em 2026 e <b>como pagar</b> a guia.</div></div>""",
 """<div class="k">1 · QUEM TRABALHA DE CARTEIRA</div><h2>Empregado, doméstico e avulso: <b>desconto no salário</b></h2>
 <div class="sub">Você não paga guia: o <b>empregador desconta e recolhe</b>. O percentual sobe por faixa de salário.</div>
 <div class="cards"><div class="c"><div class="a">7,5%</div><div class="t">até <b>R$ 1.621,00</b></div></div>
 <div class="c"><div class="a">9%</div><div class="t">de R$ 1.621,01 a <b>R$ 2.902,84</b></div></div>
 <div class="c"><div class="a">12%</div><div class="t">de R$ 2.902,85 a <b>R$ 4.354,27</b></div></div>
 <div class="c"><div class="a">14%</div><div class="t">de R$ 4.354,28 a <b>R$ 8.475,55</b> (o teto)</div></div></div>""",
 """<div class="k">2 · AUTÔNOMO (CONTRIBUINTE INDIVIDUAL)</div><h2>Quem trabalha <b>por conta própria</b> paga a própria guia</h2>
 <div class="cards"><div class="c"><div class="a">20%</div><div class="t"><b>Plano normal</b>: de R$ 324,20 a R$ 1.695,11 por mês, conforme o valor declarado. Conta pra todas as aposentadorias.<small>CÓDIGO 1007 (MENSAL)</small></div></div>
 <div class="c"><div class="a">11%</div><div class="t"><b>Plano simplificado</b>: R$ 178,31 (sobre o salário mínimo). Dá direito à aposentadoria <b>só por idade</b>.<small>CÓDIGO 1163 · AUTÔNOMO QUE NÃO PRESTA SERVIÇO A EMPRESA</small></div></div></div>""",
 """<div class="k">3 · QUEM NÃO TEM RENDA PRÓPRIA (FACULTATIVO)</div><h2>Dona de casa, estudante, desempregado: <b>dá pra contribuir</b></h2>
 <div class="cards"><div class="c"><div class="a">20%</div><div class="t">plano normal, de R$ 324,20 a R$ 1.695,11<small>CÓDIGO 1406 (MENSAL)</small></div></div>
 <div class="c"><div class="a">11%</div><div class="t">plano simplificado, R$ 178,31: aposentadoria só por idade<small>CÓDIGO 1473 (MENSAL)</small></div></div>
 <div class="c"><div class="a">5%</div><div class="t"><b>baixa renda</b>, R$ 81,05<small>CÓDIGO 1929 (MENSAL)</small></div></div></div>
 <div class="nota"><b>Os 5% só valem se:</b> você não tem renda própria (fora o Bolsa Família), está no <b>CadÚnico atualizado</b> (a cada 2 anos) e a família ganha até 2 salários mínimos.</div>""",
 """<div class="k">4 · MEI</div><h2>No MEI, a contribuição <b>já vai no boleto do mês</b> (DAS)</h2>
 <div class="cards"><div class="c"><div class="a">5%</div><div class="t">do salário mínimo: <b>R$ 81,05</b>, já incluídos no DAS. Garante a aposentadoria por idade e os outros benefícios.</div></div></div>
 <div class="nota">Quer que o MEI conte também como <b>tempo de contribuição</b>? É possível <b>complementar</b> a diferença em guia própria (<b>código 1910</b>).</div>""",
 """<div class="k">5 · TRABALHADOR RURAL (SEGURADO ESPECIAL)</div><h2>Quem vive da roça <b>não precisa de guia mensal</b> pra aposentadoria rural</h2>
 <div class="sub">A contribuição do segurado especial é feita <b>sobre a venda da produção</b>. O que conta pra aposentadoria rural é <b>provar o trabalho no campo</b>.</div>
 <div class="nota">Quer se aposentar por <b>tempo de contribuição</b> ou com valor acima do mínimo? Aí é preciso contribuir também como <b>facultativo</b>.</div>""",
 """<div class="k">6 · COMO PAGAR A GUIA (GPS)</div><h2>Passo a passo <b>pelo Meu INSS</b></h2>
 <div class="lista"><div class="li"><span>01</span><div>Entre no <b>Meu INSS</b> (site ou app) com a sua conta gov.br</div></div>
 <div class="li"><span>02</span><div>Em Serviços, escolha <b>"Emitir Guia de Pagamento (GPS)"</b>: abre o sistema SAL, da Receita</div></div>
 <div class="li"><span>03</span><div>Informe a <b>categoria</b>, o NIT/PIS, o <b>mês</b> (competência) e o <b>valor</b>; gere a guia</div></div>
 <div class="li"><span>04</span><div>Pague no <b>banco</b> ou no <b>aplicativo do banco</b>, pelo código de barras</div></div>
 <div class="li"><span>05</span><div>Confira depois no <b>extrato de contribuições (CNIS)</b>, no Meu INSS</div></div></div>""",
 f"""<img class="foto" src="{MARCA}/fotos/tamara/tamara-estudio-0110.jpg"><div style="position:relative;max-width:470px;margin-top:80px">
 <div class="k">NÃO ESQUEÇA</div><h2>Vence no <b>dia 15</b> do mês seguinte</h2>
 <div class="sub">Caiu em dia sem expediente bancário? Passa pro <b>próximo dia útil</b>. Pagar em dia mantém a sua <b>qualidade de segurado</b>.</div>
 <div class="nota" style="margin-top:40px">Cada caso é único. Na dúvida sobre qual contribuição é a sua, procure orientação profissional.</div></div>""",
]

with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page(viewport={"width": 1080, "height": 1350})
    for i, corpo in enumerate(S, 1):
        f = AQUI / f"slide-{i:02d}.html"
        fonte = "INSS, cálculo da GPS (gov.br/inss) · Lei nº 8.212/1991, art. 30, II" if i in (7, 8) else (
            "Lei nº 8.212/1991, art. 25 (planalto.gov.br)" if i == 6 else FONTES)
        f.write_text(slide(i, corpo, fonte, arrasta=i < 8), encoding="utf-8")
        pg.goto(f.as_uri()); pg.wait_for_load_state("networkidle"); pg.evaluate("document.fonts.ready"); pg.wait_for_timeout(300)
        pg.screenshot(path=str(AQUI / f"slide-{i:02d}.png"))
    b.close()
shutil.copy(AQUI / "slide-01.png", AQUI / "post.png")
print("ok")
