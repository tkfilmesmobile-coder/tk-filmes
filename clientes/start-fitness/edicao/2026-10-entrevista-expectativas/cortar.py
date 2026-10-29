"""Curadoria da entrevista "expectativas pra 2ª Corrida": monta o vídeo cortado a partir do bruto.
Regras da Talyta (2026-10-28): sem tentativa de fala nem direcionamento, só falas com início, meio e fim; pergunta
repetida pra várias pessoas aparece UMA vez (o take do apresentador) e as respostas de todos vêm em seguida.

Saída: ../video/public/midia/entrevista.mp4 (h264 24 fps) + ../video/src/entrevista-edl.json (trechos e palavras
já no tempo do vídeo cortado, pro plano das headlines e pra curadoria).
Uso: python cortar.py
"""
import json
import os
import subprocess

AQUI = os.path.dirname(os.path.abspath(__file__))
BRUTO = os.path.join(AQUI, "bruto", "entrevista.mov")
FF = os.path.join(os.environ["LOCALAPPDATA"], "CapCut", "Apps", "9.6.0.4097", "ffmpeg.exe")
SAIDA = os.path.join(AQUI, "..", "video", "public", "midia", "entrevista.mp4")
EDL = os.path.join(AQUI, "..", "video", "src", "entrevista-edl.json")

# (início, fim no bruto, quem, papel). Cortes no meio do silêncio entre palavras (analise/transcricao.json).
# Fora: "Roda aí!" (8,0 s, direção), 1º take do Wendel (34,7–42,2, refeito em 49,9), "Pessoal, estamos com..."
# (apresentação de cada um), "você já corre?" do Wendel (não é sobre a corrida), "Pronto." e "Muito bem." do
# apresentador, "chega logo dia 1º de..." da Nisse (o fim sai embolado: não dá pra garantir que é "novembro"),
# e as perguntas repetidas pro Wendel e pro terceiro entrevistado.
TRECHOS = [
    (0.00, 7.92, "apresentador", "abertura"),       # a 2ª edição está batendo na porta... expectativas do pessoal
    (11.62, 15.92, "nisse", "p1"),                  # P1 (11,62: o chiado do "-sse" do nome dela vai até 11,60) você se inscreveu pra 2ª edição? · com certeza!
    (61.75, 65.80, "wendel", "r1"),                 # já, assim que lançou, já me inscrevi na hora pra estar preparado
    (90.95, 92.02, "terceiro", "r1"),               # com certeza.
    (15.95, 20.95, "nisse", "p2"),                  # P2 e do ano passado, participou? · não, infelizmente não deu
    (68.70, 73.22, "wendel", "r2"),                 # participei, e esse ano estou mais ansioso pra melhorar
    (93.40, 95.84, "terceiro", "r2"),               # também. segundo ano, a expectativa só aumenta
    (21.25, 31.05, "nisse", "p3"),                  # P3 quais são as suas expectativas? · as melhores possíveis...
    (101.32, 113.95, "terceiro", "r3"),             # ano passado super organização... mais premiações, mais dinheiro
    (73.30, 82.40, "wendel", "p4"),                 # P4 vai disputar pódio ou só pela diversão? · no mínimo o 10º
    (116.35, 118.45, "terceiro", "r4"),             # tentar. vamos tentar.
    (119.20, 130.30, "apresentador", "convite"),    # e você aí, já fez a sua inscrição? ... vem fazer parte
]
FADE = 0.02  # fade de áudio em cada emenda (sem estalo)

palavras = json.load(open(os.path.join(AQUI, "analise", "transcricao.json"), encoding="utf-8"))["palavras"]
filtros, ent, t, saida_trechos, saida_pal = [], [], 0.0, [], []
for i, (a, b, quem, papel) in enumerate(TRECHOS):
    d = b - a
    filtros.append(f"[0:v]trim={a}:{b},setpts=PTS-STARTPTS[v{i}]")
    filtros.append(f"[0:a]atrim={a}:{b},asetpts=PTS-STARTPTS,afade=t=in:d={FADE},afade=t=out:st={d - FADE}:d={FADE}[a{i}]")
    ent.append(f"[v{i}][a{i}]")
    saida_trechos.append({"de": round(t, 3), "ate": round(t + d, 3), "src": [a, b], "quem": quem, "papel": papel})
    for w in palavras:
        if w["ini"] >= a - 0.02 and w["fim"] <= b + 0.05:
            saida_pal.append({"p": w["p"], "ini": round(w["ini"] - a + t, 3), "fim": round(w["fim"] - a + t, 3), "trecho": i})
    t += d
filtros.append("".join(ent) + f"concat=n={len(TRECHOS)}:v=1:a=1[v][a]")

os.makedirs(os.path.dirname(SAIDA), exist_ok=True)
subprocess.run([FF, "-v", "error", "-y", "-i", BRUTO, "-filter_complex", ";".join(filtros), "-map", "[v]", "-map", "[a]",
                "-r", "24", "-c:v", "h264_nvenc", "-preset", "p7", "-rc", "vbr", "-cq", "14", "-b:v", "20M", "-pix_fmt", "yuv420p",
                "-color_range", "tv", "-colorspace", "bt709", "-color_primaries", "bt709", "-color_trc", "bt709",
                "-c:a", "pcm_s16le", "-ar", "48000", SAIDA.replace(".mp4", ".mov")], check=True)
# Remotion lê melhor mp4 com aac: remuxa
subprocess.run([FF, "-v", "error", "-y", "-i", SAIDA.replace(".mp4", ".mov"), "-c:v", "copy", "-c:a", "aac", "-b:a", "320k", SAIDA], check=True)
os.remove(SAIDA.replace(".mp4", ".mov"))
json.dump({"total": round(t, 3), "trechos": saida_trechos, "palavras": saida_pal}, open(EDL, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
print(f"total {t:.2f} s, {len(TRECHOS)} trechos, {len(saida_pal)} palavras")
for s in saida_trechos:
    txt = " ".join(w["p"] for w in saida_pal if w["trecho"] == saida_trechos.index(s))
    print(f"{s['de']:6.2f}-{s['ate']:6.2f} {s['quem']:12} {s['papel']:9} {txt}")
