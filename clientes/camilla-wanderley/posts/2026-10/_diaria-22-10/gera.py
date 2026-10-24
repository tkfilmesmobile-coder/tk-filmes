"""Posts e stories dos conteúdos da diária de 2026-10-22 (pedido da Talyta em 2026-10-24: um post/carrossel pra
cada conteúdo aprovado, com o banco de imagens). Estética "foto editorial" aprovada (marca/esteticas.md, modelo
modelos/carrossel-foto-editorial.py). Fotos: quadros dos vídeos da diária já com o color grade da cliente e fotos da
diária de 22/10; sem procedimento em andamento nem instrumental (Res. CFO 196/2019).
Saída: ../<nn-nome>/01..NN.png (1080x1350) e story-01..03.png (1080x1920).
Uso: python gera.py [pasta ...]   (sem argumento: todos)
"""
import os, shutil, subprocess, sys

AQUI = os.path.dirname(os.path.abspath(__file__)).replace("\\", "/")
POSTS = os.path.dirname(AQUI)
CHROME = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
QUADROS = os.path.normpath(os.path.join(AQUI, "..", "..", "..", "edicao", "perfil-video", "public", "midia", "2026-10-23")).replace("\\", "/")

CSS = """
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@500;600;700&family=Montserrat:wght@300;400;500;600;700&family=Playfair+Display:wght@400;500&display=swap');
*{margin:0;padding:0;box-sizing:border-box}
html,body{overflow:hidden;background:#111}
.p{position:relative;overflow:hidden;color:#fff;font-family:Montserrat,sans-serif}
.foto{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.bruta{filter:saturate(.86) contrast(1.06) brightness(.97)}
.sombra{position:absolute;inset:0}
.pilula{position:absolute;top:58px;left:50%;translate:-50% 0;border:1.6px solid rgba(255,255,255,.9);border-radius:40px;padding:12px 34px;font-size:19px;letter-spacing:5px;font-weight:500;white-space:nowrap}
.topo{position:absolute;top:56px;left:0;right:0;text-align:center;font-size:19px;letter-spacing:3px;font-weight:400;opacity:.92}
.arroba{position:absolute;bottom:46px;left:0;right:0;text-align:center;font-family:Poppins;font-weight:500;font-size:22px;opacity:.95}
.sh{text-shadow:0 2px 24px rgba(0,0,0,.4)}
.capsP{font-family:Montserrat;font-weight:500;font-size:36px;letter-spacing:1px;text-transform:uppercase}
.grosso{font-family:Poppins;font-weight:700;letter-spacing:-4px;line-height:.92}
.fino{font-family:Montserrat;font-weight:300;text-transform:uppercase;letter-spacing:-2px;line-height:.98}
.fino2{font-family:Montserrat;font-weight:300;font-size:46px;letter-spacing:-1px}
.nota{border:1.4px solid rgba(255,255,255,.85);padding:18px 24px;font-family:Montserrat;font-weight:300;font-size:30px;line-height:1.14;letter-spacing:-.5px}
.serifa{font-family:'Playfair Display';font-weight:400;letter-spacing:-2px;line-height:.98}
.selo{display:inline-block;background:#8E2737;padding:14px 24px;font-family:Montserrat;font-weight:500;font-size:30px;line-height:1.2;text-transform:uppercase;text-align:center}
.selo b{font-weight:700}
"""
ARROBA = '<div class="arroba">@dra.camillawanderley</div>'
TOPO = '<div class="topo">DRA. CAMILLA WANDERLEY | CLÍNICA GERAL E ENDODONTIA</div>'
PILULA = '<div class="pilula">CLÍNICA GERAL E ENDODONTIA</div>'
SO = set(sys.argv[1:])


def Q(nome):  # quadro de vídeo (já com o color grade)
    return f"file:///{QUADROS}/quadros-posts/{nome}.jpg"


def FOTO(nome):  # foto da diária de 22/10 (sem grade: leva o filtro do modelo)
    return f"file:///{QUADROS}/fotos/{nome}.jpg"


def foto(src, pos, bruta=False, extra=""):
    return f'<img class="foto{" bruta" if bruta else ""}" src="{src}" style="object-position:{pos};{extra}">'


def sombra(css):
    return f'<div class="sombra" style="background:{css}"></div>'


def render(pasta, nome, corpo, w=1080, h=1350):
    os.makedirs(pasta, exist_ok=True)
    html = (f'<!doctype html><html><head><meta charset="utf-8"><style>{CSS}html,body{{width:{w}px;height:{h}px}}'
            f'.p{{width:{w}px;height:{h}px}}</style></head><body><div class="p">{corpo}</div></body></html>')
    hp = f"{pasta}/{nome}.html"
    open(hp, "w", encoding="utf-8").write(html)
    subprocess.run([CHROME, "--headless=new", f"--user-data-dir={AQUI}/.chrome-render", "--hide-scrollbars",
                    "--virtual-time-budget=6000", "--allow-file-access-from-files", f"--window-size={w},{h}",
                    f"--screenshot={pasta}/{nome}.png", "file:///" + hp], capture_output=True)
    os.remove(hp)


BAIXO = "linear-gradient(to bottom,rgba(0,0,0,.25) 0%,rgba(0,0,0,0) 16%,rgba(0,0,0,0) 44%,rgba(0,0,0,.6) 72%,rgba(0,0,0,.72) 100%)"
BAIXO_FORTE = "linear-gradient(to bottom,rgba(0,0,0,.2) 0%,rgba(0,0,0,0) 14%,rgba(0,0,0,.1) 40%,rgba(0,0,0,.7) 66%,rgba(0,0,0,.8) 100%)"


def A(top, caps1, grosso, caps2, tam=130, extra=""):
    return (f'<div class="sh" style="position:absolute;left:60px;right:60px;top:{top}px;text-align:center">'
            f'<div class="capsP">{caps1}</div><div class="grosso" style="font-size:{tam}px;margin-top:10px">{grosso}</div>'
            f'<div class="capsP" style="font-size:31px;margin-top:20px;line-height:1.3">{caps2}</div>{extra}</div>')


def B(top, fino, fino2, nota, tam=88, nota_top=None):
    nt = f'<div class="nota sh" style="position:absolute;right:70px;top:{nota_top}px;width:480px">{nota}</div>' if nota else ""
    return (f'<div class="sh" style="position:absolute;left:100px;top:{top}px;width:880px">'
            f'<div class="fino" style="font-size:{tam}px">{fino}</div><div class="fino2" style="margin-top:14px">{fino2}</div></div>{nt}')


def C(top, caps, serifa, selo, tam=118):
    return (f'<div class="sh" style="position:absolute;left:40px;right:40px;top:{top}px;text-align:center">'
            f'<div style="font-family:Montserrat;font-weight:500;font-size:34px">{caps}</div>'
            f'<div class="serifa" style="font-size:{tam}px;margin-top:12px">{serifa}</div>'
            f'<div class="selo" style="margin-top:30px">{selo}</div></div>')


# ------------------------------------------------------------------------------------------------------------
# v2 (pedido da Talyta em 2026-10-24): nenhuma foto de olho fechado, borrada ou feia; nenhuma imagem repetida dentro
# do mesmo carrossel (stories incluídos); quando o vídeo não rende, entra o banco de fotos (fotos/grade, com o color
# grade da cliente). Feedbacks não repetem o que a pessoa falou: viram um tema do perfil ligado ao feedback.


def BANCO(nome):  # foto do banco da doutora, já com o color grade (fotos/grade/<diária>-<número>.jpg)
    return f"file:///{AQUI}/fotos/grade/{nome}.jpg"


POSTS_DEF = {}

# 11 · vlog · bastidores de uma quinta na CIP
POSTS_DEF["11-bastidores-quinta-cip"] = dict(
    slides=[
        foto(Q("IMG_6615_060-0"), "center 62%") + sombra(BAIXO) + PILULA
        + A(800, "Toda quinta, na CIP", "um dia de<br>consultório", "por trás de cada atendimento", 128),
        foto(Q("IMG_6626_030-0"), "center 60%") + sombra(BAIXO_FORTE) + TOPO
        + B(860, "A consulta<br>começa na conversa", "", None, 84)
        + '<div class="nota sh" style="position:absolute;left:100px;top:1090px;width:620px">antes de qualquer coisa, eu explico o que vamos fazer e por quê</div>' + ARROBA,
        foto(Q("IMG_6624_001-0"), "center 62%") + sombra(BAIXO_FORTE)
        + C(830, "A PARTE QUE EU <b>MAIS GOSTO</b>", "o primeiro sorriso<br>no espelho", "é por isso que eu faço o que faço", 104) + ARROBA,
        foto(BANCO("0924-0355"), "center 30%") + sombra(BAIXO_FORTE) + TOPO
        + A(880, "cada paciente", "vira parte<br>da história", "cuidar de sorriso é cuidar de gente", 112) + ARROBA,
        foto(BANCO("1022-6577"), "center 30%") + sombra(BAIXO_FORTE)
        + C(880, "ÀS QUINTAS NA <b>CIP</b>", "esperamos você", "me chama no direct<br><b>pra agendar sua avaliação</b>", 116) + ARROBA,
    ],
    stories=[(Q("IMG_6615_058-0"), "center 55%", "post novo", "um dia de consultório", "por trás de cada atendimento"),
             (Q("IMG_6626_062-0"), "center 55%", "bastidores", "a consulta começa na conversa", "antes de qualquer coisa, eu explico o que vamos fazer"),
             (BANCO("0903-0163"), "center 25%", "às quintas na CIP", "me chama no direct", "pra agendar sua avaliação")],
)

# 12 · trauma de dentista e atendimento humanizado (ligado ao feedback da Robervânia)
POSTS_DEF["12-atendimento-humanizado"] = dict(
    slides=[
        foto(Q("IMG_6569_020-0"), "center 45%") + sombra(BAIXO_FORTE) + PILULA
        + A(830, "Trauma de dentista", "não nasce<br>do nada", "quase sempre vem de um atendimento frio", 122),
        foto(BANCO("0903-0182"), "center 40%") + sombra(BAIXO_FORTE) + TOPO
        + B(820, "Dor sem<br>explicação,", "pressa e bronca", None, 90)
        + '<div class="nota sh" style="position:absolute;left:100px;top:1080px;width:680px">é o que muita gente lembra quando pensa em dentista, e é por isso que adia o cuidado</div>' + ARROBA,
        foto(Q("IMG_6615_092-0"), "center 62%") + sombra(BAIXO_FORTE)
        + C(830, "ATENDIMENTO <b>HUMANIZADO</b>", "é ouvir antes<br>de tratar", "explicar cada passo<br><b>e respeitar o seu tempo</b>", 112) + ARROBA,
        foto(BANCO("0924-0369"), "center 30%") + sombra(BAIXO_FORTE) + TOPO
        + A(880, "quando a pessoa se sente segura,", "ela volta", "e traz quem ela ama junto", 140) + ARROBA,
        foto(Q("IMG_6569_175-0"), "center 45%") + sombra(BAIXO_FORTE)
        + C(850, "CUIDAR DE SORRISO É <b>CUIDAR DE GENTE</b>", "você merece<br>esse cuidado", "me chama no direct", 112) + ARROBA,
    ],
    stories=[(Q("IMG_6569_012-0"), "center 45%", "post novo", "trauma de dentista não nasce do nada", "atendimento humanizado faz diferença"),
             (BANCO("0903-0181"), "center 40%", "atendimento humanizado", "ouvir antes de tratar", "explicar cada passo e respeitar o seu tempo"),
             (BANCO("0903-0165"), "center 25%", "você merece esse cuidado", "me chama no direct", "a gente conversa com calma")],
)

# 13 · medo de dentista (ligado ao feedback da colaboradora da CIP)
POSTS_DEF["13-medo-de-dentista"] = dict(
    slides=[
        foto(Q("IMG_6582_066-0"), "center 62%") + sombra(BAIXO_FORTE) + PILULA
        + A(860, "Medo de dentista?", "você não<br>está sozinha", "e ele tem jeito", 124),
        foto(Q("IMG_6582_080-0"), "center 66%") + sombra(BAIXO_FORTE) + TOPO
        + B(860, "Ela chegou<br>com vergonha<br>de sorrir,", "e medo da cadeira", None, 80)
        + '<div class="nota sh" style="position:absolute;right:70px;top:1150px;width:470px">dois anos depois, vem às consultas tranquila</div>' + ARROBA,
        foto(BANCO("0924-0342"), "center 35%") + sombra(BAIXO_FORTE)
        + C(860, "O PRIMEIRO <b>PASSO</b>", "conversar antes<br>de tratar", "entender de onde vem o medo", 110) + ARROBA,
        foto(BANCO("0903-0181"), "center 40%") + sombra(BAIXO_FORTE) + TOPO
        + B(820, "Se você<br>tem medo,", "fala logo no início", None, 90)
        + '<div class="nota sh" style="position:absolute;left:100px;top:1070px;width:700px">combine um sinal pra pausar e peça pra saber cada etapa antes de acontecer</div>' + ARROBA,
        foto(BANCO("0903-0164"), "center 25%") + sombra(BAIXO_FORTE)
        + C(880, "O MEDO <b>TEM JEITO</b>", "com paciência<br>e carinho", "me chama no direct<br><b>a gente vai no seu tempo</b>", 112) + ARROBA,
    ],
    stories=[(Q("IMG_6582_090-0"), "center 50%", "post novo", "medo de dentista?", "você não está sozinha"),
             (Q("IMG_6616_076-0"), "center 55%", "dica", "fala do medo logo no início", "e combine um sinal pra pausar"),
             (BANCO("0924-0356"), "center 25%", "o medo tem jeito", "me chama no direct", "a gente vai no seu tempo")],
)

# 14 · clareamento antes do casamento
POSTS_DEF["14-clareamento-casamento"] = dict(
    slides=[
        foto(Q("IMG_6615_232-0"), "center 62%") + sombra(BAIXO) + PILULA
        + A(800, "Vai casar?", "comece o<br>clareamento antes", "o planejamento faz toda a diferença", 118),
        foto(Q("IMG_6615_055-0"), "center 62%") + sombra(BAIXO_FORTE) + TOPO
        + B(800, "Só o caseiro<br>leva 21 dias", "no mínimo", None, 82)
        + '<div class="nota sh" style="position:absolute;left:100px;top:1080px;width:640px">e começar com gel forte demais traz sensibilidade</div>' + ARROBA,
        foto(Q("IMG_6615_210-0"), "center 62%") + sombra(BAIXO_FORTE)
        + A(820, "o que acelera:", "consultório<br>+ caseiro", "a gente planeja as datas até o grande dia", 112) + ARROBA,
        foto(Q("IMG_6615_100-0"), "center 62%") + sombra(BAIXO_FORTE)
        + C(830, "E A <b>SENSIBILIDADE</b>?", "existe,<br>e é controlável", "gel na medida certa pra você", 112) + ARROBA,
        foto(BANCO("0924-0357"), "center 25%") + sombra(BAIXO_FORTE)
        + C(880, "NO DIA DO <b>CASAMENTO</b>", "sorriso pronto", "me chama no direct<br><b>e a gente monta o seu plano</b>", 120) + ARROBA,
    ],
    stories=[(Q("IMG_6615_064-0"), "center 55%", "post novo", "vai casar?", "comece o clareamento antes"),
             (Q("IMG_6615_218-0"), "center 55%", "dica", "só o caseiro leva 21 dias", "consultório + caseiro acelera"),
             (BANCO("0924-0370"), "center 25%", "noivas", "me chama no direct", "a gente monta o seu plano")],
)

# 15 · clareamento caseiro · o erro que zera tudo
POSTS_DEF["15-clareamento-caseiro-erro"] = dict(
    slides=[
        foto(Q("IMG_6626_076-0"), "center 60%") + sombra(BAIXO) + PILULA
        + A(800, "Clareamento caseiro", "o erro que<br>zera tudo", "e muita gente comete sem saber", 130),
        foto(Q("IMG_6626_020-0"), "center 60%") + sombra(BAIXO_FORTE) + TOPO
        + B(800, "Esqueceu<br>um dia?", "", None, 96)
        + '<div class="nota sh" style="position:absolute;left:100px;top:1040px;width:640px">a saliva fecha o caminho do gel, e o clareamento volta quase do zero</div>' + ARROBA,
        foto(Q("IMG_6626_062-0"), "center 60%") + sombra(BAIXO_FORTE)
        + C(880, "O QUE POUCA GENTE <b>SABE</b>", "quem clareia<br>é a dentina", "o esmalte é transparente:<br><b>o gel age lá dentro</b>", 108) + ARROBA,
        foto(Q("IMG_6626_030-0"), "center 60%") + sombra(BAIXO_FORTE)
        + A(820, "nessa fase, evite", "café, açaí,<br>refrigerante", "tudo que é escuro e tem corante", 108) + ARROBA,
        foto(BANCO("0903-0165"), "center 25%") + sombra(BAIXO_FORTE)
        + C(880, "O SEGREDO É <b>CONSTÂNCIA</b>", "todo dia,<br>sem pular", "dúvida no seu clareamento?<br><b>me chama no direct</b>", 116) + ARROBA,
    ],
    stories=[(Q("IMG_6626_010-0"), "center 55%", "post novo", "o erro que zera o clareamento", "clareamento caseiro"),
             (Q("IMG_6626_110-0"), "center 55%", "dica", "esqueceu um dia?", "o gel recomeça quase do zero"),
             (BANCO("0903-0182"), "center 40%", "clareamento", "me chama no direct", "e tira suas dúvidas")],
)

# 16 · espaço entre os dentes · resina
POSTS_DEF["16-espaco-entre-dentes"] = dict(
    slides=[
        foto(Q("IMG_6624_001-0"), "center 70%") + sombra(BAIXO) + PILULA
        + A(820, "Aquele espacinho", "entre<br>os dentes", "tem solução", 132),
        foto(Q("IMG_6624_003-0"), "center 55%") + sombra(BAIXO_FORTE) + TOPO
        + B(820, "Com resina,<br>dá pra fechar", "", None, 84)
        + '<div class="nota sh" style="position:absolute;left:100px;top:1060px;width:660px">e ajustar o tamanho e a posição dos dentes, quando faz sentido pro seu sorriso</div>' + ARROBA,
        # 2026-10-24: carrossel inteiro com a mesma paciente (vídeos 6624 e 6625), sem outros pacientes do banco
        foto(Q("IMG_6624_t700-0"), "center 40%") + sombra(BAIXO_FORTE)
        + C(880, "CADA SORRISO TEM <b>O SEU PLANO</b>", "o seu começa<br>na avaliação", "me chama no direct", 108) + ARROBA,
    ],
    stories=[(Q("IMG_6624_t550-0"), "center 50%", "post novo", "aquele espacinho entre os dentes", "tem solução"),
             (Q("IMG_6625_020-0"), "center 50%", "resina", "dá pra fechar com resina", "quando faz sentido pro seu sorriso"),
             (Q("IMG_6624_t390-0"), "center 50%", "avaliação", "me chama no direct", "e vem conversar comigo")],
)


def story(src, pos, tag, titulo, sub, n):
    """Story 1080x1920 na mesma linguagem: foto inteira, texto no terço de baixo, sem cobrir o rosto."""
    corpo = (foto(src, pos) + sombra("linear-gradient(to bottom,rgba(0,0,0,.25) 0%,rgba(0,0,0,0) 14%,rgba(0,0,0,0) 48%,rgba(0,0,0,.65) 72%,rgba(0,0,0,.8) 100%)")
             + f'<div class="pilula" style="top:120px">{tag.upper()}</div>'
             + f'<div class="sh" style="position:absolute;left:70px;right:70px;top:1300px;text-align:center">'
             + (f'<div class="serifa" style="font-size:96px">{titulo}</div>' if n != 2 else f'<div class="grosso" style="font-size:96px;letter-spacing:-3px">{titulo}</div>')
             + f'<div class="capsP" style="font-size:30px;margin-top:22px;line-height:1.3">{sub}</div>'
             + (f'<div class="selo" style="margin-top:34px;font-size:28px">@dra.camillawanderley</div>' if n == 3 else "")
             + '</div>')
    return corpo


if __name__ == "__main__":
    for pasta, d in POSTS_DEF.items():
        if SO and pasta not in SO:
            continue
        dest = f"{POSTS}/{pasta}".replace("\\", "/")
        for velho in [f for f in os.listdir(dest)] if os.path.isdir(dest) else []:
            if velho.endswith(".png"):
                os.remove(f"{dest}/{velho}")
        for i, corpo in enumerate(d["slides"], 1):
            render(dest, f"{i:02d}", corpo)
        for i, (src, pos, tag, titulo, sub) in enumerate(d["stories"], 1):
            render(dest, f"story-{i:02d}", story(src, pos, tag, titulo, sub, i), 1080, 1920)
        print(pasta, len(d["slides"]), "slides + 3 stories", flush=True)
    shutil.rmtree(f"{AQUI}/.chrome-render", ignore_errors=True)
