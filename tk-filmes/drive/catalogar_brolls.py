"""Catálogo do banco de b-roll da TK (2026-10-12).
Casa cada arquivo local (baixado antes, com rótulos deslocados) ao nome verdadeiro do Drive pelo TAMANHO em bytes,
lê duração e formato com ffprobe, junta a descrição levantada dos frames e gera:
  tk-filmes/b-roll/catalogo.csv · catalogo.md · miniaturas/BR-XXX.jpg · miniaturas/_folha.jpg · renomear.tsv
uso: python tk-filmes/drive/catalogar_brolls.py
"""
import csv, json, pathlib, subprocess, shutil
from PIL import Image, ImageDraw, ImageFont

RAIZ = pathlib.Path(r"C:/Users/tamar/TK FILMES")
LOCAL = pathlib.Path(r"C:/Users/tamar/AppData/Local/Temp/claude/C--Users-tamar-TK-FILMES/f14848a6-e416-43c8-bda3-19a91fbc49f8/scratchpad/takes/takes")
SAIDA = RAIZ / "tk-filmes/b-roll"; (SAIDA / "miniaturas").mkdir(parents=True, exist_ok=True)

# nome verdadeiro no Drive -> tamanho em bytes (fonte: listagem do Drive em 2026-10-12)
TAM = {
 "IMG_1460.MOV": 5771069, "IMG_1461.MOV": 2310645, "FFD6D4D4-447B-47AC-973A-5967464D3DDA.mp4": 5931761, "fb63af698b6a4cb3a80215e4917bb3b9.mov": 2816474,
 "IMG_7970.MOV": 60764770, "IMG_7975.MOV": 42604149, "IMG_7980.MOV": 33755105, "IMG_7983.MOV": 29350503, "IMG_7986.MOV": 49346340,
 "IMG_7990.MOV": 86925196, "IMG_7996.MOV": 49255220, "IMG_8003.MOV": 20124541, "IMG_8005.MOV": 43709039, "IMG_8013.MOV": 30793832,
 "IMG_8018.MOV": 60966654, "IMG_8025.MOV": 35469089, "IMG_8026.MOV": 57245233, "IMG_8028.MOV": 99560578, "IMG_8038.MOV": 43938921,
 "IMG_8042.MOV": 72852450, "IMG_8057.MOV": 49250774, "IMG_8063.MOV": 43591347,
}
# descrição por nome verdadeiro: (grupo, descrição curta p/ nome, descrição completa, plano, bom para frases sobre)
D = {
 "IMG_7970.MOV": ("casamento", "cerimônia, celular no tripé", "Talyta de preto operando o celular no tripé durante a cerimônia; noiva e convidados ao fundo.", "médio-aberto", "bastidor, direção, estar presente, trabalho invisível"),
 "IMG_7975.MOV": ("casamento", "conferindo o celular no jardim", "Talyta em pé no jardim, conferindo a tela do celular no tripé.", "médio", "conferir, cuidado, preparação, detalhe"),
 "IMG_7980.MOV": ("casamento", "close com o celular", "Close de Talyta segurando o celular em frente a cortinas brancas.", "close", "foco, concentração, atenção"),
 "IMG_7983.MOV": ("casamento", "gravando, convidado ao fundo", "Talyta gravando; convidado de cabeça baixa em primeiro plano.", "médio", "emoção, momento, ninguém vê o que fica por trás"),
 "IMG_7986.MOV": ("casamento", "de costas, revela noivos", "Talyta de costas filmando com tripé; a câmera revela o noivo no altar e a noiva de vestido branco.", "médio, revela", "o que ninguém vê, dedicação, o momento certo"),
 "IMG_7990.MOV": ("casamento", "filmando de lado, convidados", "Talyta de lado filmando com o celular; convidados e palmeira ao fundo, a câmera abre o plano.", "close abre pra aberto", "olhar de quem filma, antecipar, estar um passo à frente"),
 "IMG_7996.MOV": ("casamento", "ao lado do cinegrafista", "Talyta com o celular ao lado de outro cinegrafista com câmera de cinema, que passa por cima.", "médio", "equipe, mercado, cada um no seu papel"),
 "IMG_8003.MOV": ("casamento", "no altar, cinegrafista e flores", "Talyta junto à mesa do altar; close no cinegrafista de câmera de vídeo e nas flores brancas.", "médio e close", "bastidor de evento, correria organizada"),
 "IMG_8005.MOV": ("casamento", "celular no tripé, tela em capa verde", "Celular em capa verde mostrando a tela, Talyta ajustando o equipamento.", "close", "equipamento, tecnologia, o celular é ferramenta"),
 "IMG_8013.MOV": ("casamento", "de costas ao lado da noiva", "Talyta filmando de costas, ao lado da noiva de vestido, durante a cerimônia.", "médio", "estar perto, confiança do cliente, bastidor"),
 "IMG_8018.MOV": ("casamento", "filmando na estrutura de madeira", "Talyta filmando junto à estrutura de madeira do altar; convidado de camisa branca ao lado.", "médio", "jardim, cenário, planejamento"),
 "IMG_8025.MOV": ("casamento", "close filmando, plateia desfocada", "Close de Talyta filmando, plateia desfocada atrás.", "close", "foco, atenção, trabalho em público"),
 "IMG_8026.MOV": ("casamento", "close lateral, céu nublado", "Close lateral de Talyta filmando; céu nublado e telhado ao fundo.", "close", "clima, imprevisto, trabalhar com o que tem"),
 "IMG_8028.MOV": ("casamento", "convidada se aproxima da tela", "Talyta filmando; uma convidada de blusa marrom se aproxima e olha a tela do celular.", "médio", "gente que pergunta, curiosidade, resultado na hora"),
 "IMG_8038.MOV": ("casamento", "filmando perto das flores", "Talyta filmando perto de flores brancas, convidados passando.", "médio", "detalhe, decoração, cuidado"),
 "IMG_8042.MOV": ("casamento", "ao lado de um homem; abre pro altar", "Talyta filmando ao lado de um homem; corta pro plano aberto do altar com mesas vermelhas.", "médio e aberto", "visão geral, antes e depois, bastidor"),
 "IMG_8057.MOV": ("casamento", "sentada filmando, piscina", "Talyta sentada em cadeira branca filmando, piscina ao fundo.", "médio", "pausa, esperar o momento, paciência"),
 "IMG_8063.MOV": ("casamento", "em pé, plano aberto, piscina", "Plano aberto: Talyta em pé com equipamento, piscina e convidados ao fundo.", "aberto", "estar no lugar, organização, contexto"),
 "IMG_1460.MOV": ("clinica", "fachada da clínica Eduarda", "Fachada branca e verde-água de uma clínica; a câmera inclina até a placa circular.", "aberto, tilt", "presença física, o espaço do cliente, território"),
 "IMG_1461.MOV": ("clinica", "close na placa Eduarda Pereira", "Close na placa circular verde-água com o nome Eduarda Pereira e o logo de pássaro.", "close", "marca, nome, identidade"),
 "FFD6D4D4-447B-47AC-973A-5967464D3DDA.mp4": ("edicao", "editando vídeo no celular", "Mãos editando um vídeo no celular; linha do tempo roxa e um vídeo de lancha na tela.", "close, tela", "edição, tecnologia, o que acontece depois da gravação"),
}
GRUPOS = {"casamento": "01 Casamento - Talyta filmando", "clinica": "02 Clientes - clínica Eduarda", "edicao": "03 Edição e telas"}
OUTROS = {"fb63af698b6a4cb3a80215e4917bb3b9.mov": "Vídeo da Tamara Chagas (60 s, 'aumentar a aposentadoria'): não é b-roll, é conteúdo de cliente; saiu do banco."}

def sondar(p):
    def q(args):
        r = subprocess.run(["npx", "remotion", "ffprobe", "-v", "error"] + args + [str(p)], capture_output=True, text=True, shell=True)
        return [l.strip() for l in r.stdout.splitlines() if l.strip() and not l.startswith("npm")]
    d = q(["-show_entries", "format=duration", "-of", "default=nw=1:nk=1"])
    w = q(["-select_streams", "v:0", "-show_entries", "stream=width,height", "-of", "csv=p=0:s=x"])
    try: return float(d[-1]), w[-1]
    except Exception: return 0.0, "?"

por_tam = {}
for f in LOCAL.iterdir():
    if f.is_file() and f.suffix.lower() in (".mov", ".mp4"): por_tam[f.stat().st_size] = f

linhas = []; n = 0
for g in ["casamento", "clinica", "edicao"]:
    for nome in sorted([k for k, v in D.items() if v[0] == g]):
        n += 1; bid = f"BR-{n:03d}"
        loc = por_tam.get(TAM[nome])
        dur, res = sondar(loc) if loc else (0.0, "?")
        _, curta, longa, plano, frases = D[nome]
        ext = pathlib.Path(nome).suffix
        orig = pathlib.Path(nome).stem if nome.startswith("IMG_") else nome[:8]
        novo = f"{bid} {GRUPOS[g][3:].split(' - ')[0]} - {curta} - {round(dur)}s ({orig}){ext}"
        linhas.append(dict(id=bid, grupo=GRUPOS[g], nome_original=nome, nome_novo=novo, duracao_s=round(dur, 1), formato=res, plano=plano, descricao=longa, bom_para_frases_sobre=frases, local=str(loc) if loc else ""))
        if loc:
            fr = LOCAL / f"{loc.stem}-f0.jpg"
            if fr.exists(): shutil.copy(fr, SAIDA / "miniaturas" / f"{bid}.jpg")

with open(SAIDA / "catalogo.csv", "w", newline="", encoding="utf-8-sig") as f:
    w = csv.DictWriter(f, fieldnames=[k for k in linhas[0] if k != "local"], extrasaction="ignore"); w.writeheader(); w.writerows(linhas)
with open(SAIDA / "renomear.tsv", "w", encoding="utf-8", newline="
") as f:
    for l in linhas: f.write(f'{l["nome_original"]}\t{l["grupo"]}\t{l["nome_novo"]}\n')

md = ["# Banco de b-roll da TK · catálogo", "", "> Gerado em 2026-10-12 por `tk-filmes/drive/catalogar_brolls.py`. No Drive: `04 BANCO DE B-ROLL`. Nome do arquivo = código + onde + o que mostra + duração + nome original da câmera.", ""]
for g in GRUPOS.values():
    md += [f"## {g}", "", "| código | o que mostra | plano | duração | bom para frases sobre | nome original |", "|---|---|---|---|---|---|"]
    for l in linhas:
        if l["grupo"] == g: md.append(f'| {l["id"]} | {l["descricao"]} | {l["plano"]} | {l["duracao_s"]} s | {l["bom_para_frases_sobre"]} | {l["nome_original"]} |')
    md.append("")
md += ["## Saiu do banco", ""] + [f"- `{k}`: {v}" for k, v in OUTROS.items()] + [""]
(SAIDA / "catalogo.md").write_text("\n".join(md), encoding="utf-8")

# folha de contato com o código em cada miniatura
fonte = ImageFont.load_default()
thumbs = sorted((SAIDA / "miniaturas").glob("BR-*.jpg"))
cols, W, H = 7, 220, 390
folha = Image.new("RGB", (cols * W, ((len(thumbs) + cols - 1) // cols) * H), "white")
for i, t in enumerate(thumbs):
    im = Image.open(t).convert("RGB"); im.thumbnail((W - 8, H - 30))
    x, y = (i % cols) * W + 4, (i // cols) * H + 4
    folha.paste(im, (x, y + 22)); ImageDraw.Draw(folha).text((x, y + 4), t.stem, fill="black", font=fonte)
folha.save(SAIDA / "miniaturas" / "_folha.jpg", quality=82)
print(n, "b-rolls catalogados")
