"""Vídeo do feed da 2ª Corrida Start Fitness (1º/11/2026): monta o vídeo-base cortado a partir das captações.
Curadoria (Talyta, 2026-11-01): rigorosa. Nada de tentativa, direcionamento, erro, pergunta sem resposta ou fala
cortada; só frases com início, meio e fim. Onde a fala é boa mas a imagem é fraca, a fala continua por baixo de
B-roll ou foto da corrida.

Cada trecho: áudio de um clipe (ou silêncio) + uma lista de pedaços de imagem que somam a mesma duração.
  ("v", clipe, início, duração)  vídeo   · duração None = o que sobrar
  ("f", foto, duração)            foto com aproximação lenta
Saída: ../video/public/midia/feed.mp4 (1080x1920, 24 fps) + ../video/src/feed-edl.json
Uso: python montar.py            (monta tudo)
     python montar.py --conferir (só transcreve cada trecho cortado e compara com o texto esperado)
"""
import json
import os
import shutil
import site
import subprocess
import sys

AQUI = os.path.dirname(os.path.abspath(__file__))
BRUTO = os.path.join(AQUI, "bruto")
TMP = os.path.join(AQUI, "analise", "trechos")
FF = os.path.join(os.environ["LOCALAPPDATA"], "CapCut", "Apps", "9.6.0.4097", "ffmpeg.exe")
SAIDA = os.path.join(AQUI, "..", "video", "public", "midia", "feed.mp4")
EDL = os.path.join(AQUI, "..", "video", "src", "feed-edl.json")
FPS = 24
GRADE = "lutyuv=y='clip((val-128)*1.05+128,16,235)',hue=s=1.08"  # leve: as captações vêm do iPhone sem cor; nada de look novo

# fala fora: tudo do 0848, 0853, 0855 (comentários de bastidor), "Cadê a musiquinha" e o som falhando (0866),
# a apresentação abortada da Sueli (0861) e a entrevista dela ("não me preparei", "não sei se eu termino"),
# Rosilda (pausas e "RTI"), Juliana (0927: cerveja, "corta, é ao vivo?"), a campeã chamando a academia de
# "Smart Fit" (0891, 21,6 s), agradecimento a patrocinador com nome incerto (0934), letra de música (0887)
TRECHOS = [
    dict(id="abre", txt="", dur=1.25, img=[("v", "IMG_0871", 8.6, None)]),
    dict(id="gancho", txt="Uma corrida, muita energia e superação. Acompanha com a gente a segunda edição da corrida Start Fitness.",
         som=("IMG_0844", 0.00, 6.30), img=[("v", "IMG_0844", 0.0, 0.95), ("v", "IMG_0856", 0.4, 1.6), ("v", "IMG_0844", 2.55, None)]),
    dict(id="ponte", txt="", dur=3.2, img=[("v", "IMG_0836", 1.4, 1.0), ("v", "IMG_0855", 6.0, 1.2), ("v", "IMG_0857", 1.0, None)]),
    dict(id="organizacao", txt="A princípio, quando eu vi a corrida pela primeira vez, foi a organização. Muito bem organizado, o percurso muito bem definido, sem erros.",
         som=("IMG_0860", 14.85, 23.95), img=[("v", "IMG_0860", 14.85, 5.2), ("f", "IMG_0905", 2.0), ("v", "IMG_0860", 22.05, None)]),
    dict(id="nervoso", txt="Dormi sete horinhas ali, mas sempre bate aquele nervoso na hora da largada.",
         som=("IMG_0860", 64.60, 68.85), img=[("v", "IMG_0860", 64.60, None)]),
    dict(id="alinhados", txt="", dur=1.0, img=[("v", "IMG_0863", 2.0, None)]),
    dict(id="contagem", txt="cinco, quatro, três, dois, largou!", som=("IMG_0867", 5.85, 13.60), img=[("v", "IMG_0867", 5.85, None)]),
    dict(id="percurso", txt="", dur=4.56, img=[("f", "IMG_0899", 0.42), ("f", "IMG_0901", 0.42), ("f", "IMG_0904", 0.42), ("f", "IMG_0906", 0.42),
                                                 ("f", "IMG_0908", 0.42), ("f", "IMG_0910", 0.42), ("f", "IMG_0913", 0.42), ("f", "IMG_0915", 0.42),
                                                 ("v", "IMG_0875", 0.5, None)]),
    dict(id="chegada", txt="É o primeiro a chegar na segunda edição da Corrida Start Fitness. Adriano Barbosa, parabéns!",
         som=("IMG_0871", 0.74, 10.62), img=[("v", "IMG_0871", 0.74, None)]),
    dict(id="emocao", txt="", dur=1.3, img=[("f", "IMG_0872", None)]),
    dict(id="campea", txt="Pessoal, a Adriana Teodosio foi a vencedora do 5KM, foi a mulher que chegou mais rápido na segunda edição da Corrida Start Fitness.",
         som=("IMG_0891", 0.00, 8.37), img=[("v", "IMG_0891", 0.0, 2.0), ("v", "IMG_0876", 2.7, 2.3), ("f", "IMG_0892", 1.6), ("v", "IMG_0891", 5.9, None)]),
    dict(id="dedica", txt="Essa primeira colocação eu dedico ao meu filho, né, porque eu sou mãe atleta.",
         som=("IMG_0891", 74.95, 80.95), img=[("v", "IMG_0891", 74.95, None)]),
    dict(id="cuidar", txt="E a Corrida Start Fitness vocês sabem que sabe cuidar da galera. Tem essa estação aqui que é de fisioterapia.",
         som=("IMG_0926", 0.00, 7.72), img=[("v", "IMG_0926", 0.0, 4.9), ("v", "IMG_0925", 0.5, None)]),
    dict(id="catiana", txt="Foi maravilhoso, teve tudo e mais um pouco. Superou todas as expectativas. Não é só a medalha e banana não.",
         som=("IMG_0929", 29.62, 37.88), img=[("v", "IMG_0929", 29.62, 1.95), ("v", "IMG_0885", 14.0, 1.1), ("v", "IMG_0888", 1.0, 1.1), ("v", "IMG_0929", 33.77, None)]),
    dict(id="gratidao", txt="É um sentimento de gratidão muito grande. Ver o pessoal que se fez aqui presente.",
         som=("IMG_0934", 20.95, 25.95), img=[("v", "IMG_0934", 20.95, 2.55), ("f", "IMG_0858", None)]),
]
FADE = 0.015


def dur_de(t):
    return t["som"][2] - t["som"][1] if "som" in t else t["dur"]


def clipe(nome):
    for ext in (".MOV", ".mov", ".JPG", ".jpg"):
        p = os.path.join(BRUTO, nome + ext)
        if os.path.exists(p):
            return p
    raise FileNotFoundError(nome)


def monta_trecho(i, t, saida):
    D = dur_de(t)
    entradas, filtros, rotulos = [], [], []
    usado = 0.0
    for k, p in enumerate(t["img"]):
        d = p[3] if p[0] == "v" else p[2]
        d = D - usado if d is None else d
        usado += d
        if p[0] == "v":
            entradas += ["-ss", f"{p[2]:.3f}", "-t", f"{d + 0.2:.3f}", "-i", clipe(p[1])]
            filtros.append(f"[{k}:v]trim=0:{d:.4f},setpts=PTS-STARTPTS,fps={FPS},scale=1080:1920:force_original_aspect_ratio=increase:out_range=tv,"
                           f"crop=1080:1920,{GRADE},setsar=1,format=yuv420p[p{k}]")
        else:
            n = max(1, round(d * FPS))
            entradas += ["-loop", "1", "-framerate", str(FPS), "-t", f"{d + 0.2:.3f}", "-i", clipe(p[1])]
            # recorta 9:16, aproxima 6% ao longo da foto
            filtros.append(f"[{k}:v]crop='min(iw,ih*9/16)':'min(ih,iw*16/9)',scale=1620:2880,"
                           f"zoompan=z='1+0.06*on/{n}':x='iw/2-iw/zoom/2':y='ih/2-ih/zoom/2':d=1:s=1080x1920:fps={FPS},"
                           f"trim=end_frame={n},setpts=PTS-STARTPTS,{GRADE},setsar=1,format=yuv420p[p{k}]")
        rotulos.append(f"[p{k}]")
    nv = len(t["img"])
    filtros.append("".join(rotulos) + f"concat=n={nv}:v=1:a=0,trim=end_frame={round(D * FPS)}[v]")
    if "som" in t:
        nome, a, b = t["som"]
        entradas += ["-ss", f"{a:.3f}", "-t", f"{b - a:.3f}", "-i", clipe(nome)]
        filtros.append(f"[{nv}:a]aresample=48000,aformat=channel_layouts=stereo,atrim=0:{D:.4f},asetpts=PTS-STARTPTS,"
                       f"afade=t=in:d={FADE},afade=t=out:st={D - FADE:.4f}:d={FADE}[a]")
    else:
        entradas += ["-f", "lavfi", "-t", f"{D:.4f}", "-i", "anullsrc=r=48000:cl=stereo"]
        filtros.append(f"[{nv}:a]anull[a]")
    subprocess.run([FF, "-v", "error", "-y", *entradas, "-filter_complex", ";".join(filtros), "-map", "[v]", "-map", "[a]",
                    "-c:v", "h264_nvenc", "-preset", "p7", "-rc", "vbr", "-cq", "15", "-b:v", "20M", "-r", str(FPS),
                    "-color_range", "tv", "-colorspace", "bt709", "-color_primaries", "bt709", "-color_trc", "bt709",
                    "-c:a", "pcm_s16le", "-t", f"{D:.4f}", saida], check=True)


def conferir():
    for sp in site.getsitepackages():
        for sub in ("nvidia/cublas/bin", "nvidia/cudnn/bin"):
            d = os.path.join(sp, sub)
            if os.path.isdir(d):
                os.add_dll_directory(d); os.environ["PATH"] = d + os.pathsep + os.environ["PATH"]
    import wave

    import numpy as np
    from faster_whisper import WhisperModel
    m = WhisperModel("large-v3", device="cuda", compute_type="float16")
    norm = lambda s: " ".join("".join(c for c in w.lower() if c.isalnum()) for w in s.split())
    for i, t in enumerate(TRECHOS):
        if "som" not in t:
            continue
        nome, a, b = t["som"]
        w16 = os.path.join(TMP, f"{i:02d}-{t['id']}.wav")
        subprocess.run([FF, "-v", "error", "-y", "-ss", f"{a:.3f}", "-t", f"{b - a:.3f}", "-i", clipe(nome), "-vn", "-ac", "1", "-ar", "16000",
                        "-af", f"afade=t=in:d={FADE},afade=t=out:st={b - a - FADE:.3f}:d={FADE}", w16], check=True)
        with wave.open(w16) as w:
            x = np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(np.float32) / 32768
        segs, _ = m.transcribe(x, language="pt", word_timestamps=True, beam_size=5)
        pal = [p for s in segs for p in s.words]
        ouvido = " ".join(p.word.strip() for p in pal)
        ok = norm(ouvido) == norm(t["txt"])
        print(f"[{t['id']}] {'OK ' if ok else '?? '}{ouvido}")
        if not ok:
            print(f"{'':>{len(t['id']) + 3}}esperado: {t['txt']}")
            if pal:
                print(f"{'':>{len(t['id']) + 3}}primeira '{pal[0].word.strip()}' ({pal[0].probability:.2f}) · última '{pal[-1].word.strip()}' ({pal[-1].probability:.2f})")


if __name__ == "__main__":
    os.makedirs(TMP, exist_ok=True)
    if "--conferir" in sys.argv:
        conferir(); sys.exit()
    inv = json.load(open(os.path.join(AQUI, "analise", "inventario.json"), encoding="utf-8"))
    lista, edl, palavras, t0 = [], [], [], 0.0
    for i, t in enumerate(TRECHOS):
        arq = os.path.join(TMP, f"{i:02d}-{t['id']}.mov")
        monta_trecho(i, t, arq)
        D = dur_de(t)
        lista.append(f"file '{arq}'")
        # imagens com o tempo no vídeo final (pro plano das headlines)
        u, imgs = 0.0, []
        for p in t["img"]:
            d = (p[3] if p[0] == "v" else p[2])
            d = D - u if d is None else d
            imgs.append({"de": round(t0 + u, 3), "ate": round(t0 + u + d, 3), "fonte": p[1], "tipo": p[0]})
            u += d
        edl.append({"id": t["id"], "de": round(t0, 3), "ate": round(t0 + D, 3), "txt": t["txt"], "imagens": imgs,
                    "som": list(t["som"]) if "som" in t else None})
        if "som" in t:
            nome, a, b = t["som"]
            for w in inv[nome + ".MOV"]["palavras"]:
                if w["ini"] >= a - 0.02 and w["fim"] <= b + 0.08:
                    palavras.append({"p": w["p"], "ini": round(w["ini"] - a + t0, 3), "fim": round(min(w["fim"], b) - a + t0, 3), "trecho": t["id"]})
        t0 += D
        print(f"{t['id']:12s} {D:5.2f}s  -> {t0:6.2f}s")
    lst = os.path.join(TMP, "lista.txt")
    open(lst, "w", encoding="utf-8").write("\n".join(lista))
    os.makedirs(os.path.dirname(SAIDA), exist_ok=True)
    subprocess.run([FF, "-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", lst, "-c:v", "copy", "-c:a", "aac", "-b:a", "320k",
                    "-movflags", "+faststart", SAIDA], check=True)
    json.dump({"total": round(t0, 3), "trechos": edl, "palavras": palavras}, open(EDL, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    print(f"total {t0:.2f} s -> {SAIDA}")
