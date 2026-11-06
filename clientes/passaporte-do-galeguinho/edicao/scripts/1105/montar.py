"""Visita ao Açougue Diniz (gravação de 2026-11-05): monta o vídeo-base cortado a partir dos 23 brutos.
Curadoria (pedido da Talyta, 2026-11-06): só as falas necessárias, sem tentativa, sem fala repetida, sem
orientação de quem grava, sem frase pela metade. Onde a fala é boa e a imagem é fraca, a fala segue por baixo de
imagem da visita (B-roll). A escolha dos trechos e o porquê de cada um ficam em trechos.py.

Cada trecho: áudio de um clipe (ou silêncio) + uma lista de pedaços de imagem que somam a mesma duração.
  ("v", clipe, início, duração)   duração None = o que sobrar
Saída: ../../public/midia/1105.mp4 (1080x1920, 30 fps) + ../../public/legendas/1105-edl.json
Uso: python montar.py            (monta tudo)
     python montar.py --conferir (só transcreve cada trecho cortado e compara com o texto esperado)
"""
import json
import os
import site
import subprocess
import sys

AQUI = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, AQUI)
from trechos import TRECHOS  # noqa: E402
BRUTO = os.path.join(AQUI, "bruto")
TMP = os.path.join(AQUI, "analise", "trechos")
FF = os.path.join(os.environ["LOCALAPPDATA"], "CapCut", "Apps", "9.6.0.4097", "ffmpeg.exe")
SAIDA = os.path.join(AQUI, "..", "..", "public", "midia", "1105.mp4")
EDL = os.path.join(AQUI, "..", "..", "public", "legendas", "1105-edl.json")
FPS = 30
FADE = 0.02


def dur_de(t):
    return t["som"][2] - t["som"][1] if "som" in t else t["dur"]


def clipe(nome):
    return os.path.join(BRUTO, nome + ".MOV")


def monta_trecho(t, saida):
    D = dur_de(t)
    entradas, filtros, rotulos = [], [], []
    usado = 0.0
    for k, p in enumerate(t["img"]):
        d = D - usado if p[3] is None else p[3]
        usado += d
        entradas += ["-ss", f"{p[2]:.3f}", "-t", f"{d + 0.3:.3f}", "-i", clipe(p[1])]
        # o bruto já é vertical 9:16 (2160x3840): só reduz, sem cortar nem reenquadrar
        filtros.append(f"[{k}:v]trim=0:{d:.4f},setpts=PTS-STARTPTS,fps={FPS},scale=1080:1920:flags=lanczos:out_range=tv,"
                       f"setsar=1,format=yuv420p[p{k}]")
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
                    "-c:v", "h264_nvenc", "-preset", "p7", "-rc", "vbr", "-cq", "16", "-b:v", "20M", "-r", str(FPS),
                    "-color_range", "tv", "-colorspace", "bt709", "-color_primaries", "bt709", "-color_trc", "bt709",
                    "-c:a", "pcm_s16le", "-t", f"{D:.4f}", saida], check=True)


def whisper():
    for sp in site.getsitepackages():
        for sub in ("nvidia/cublas/bin", "nvidia/cudnn/bin"):
            d = os.path.join(sp, sub)
            if os.path.isdir(d):
                os.add_dll_directory(d); os.environ["PATH"] = d + os.pathsep + os.environ["PATH"]
    from faster_whisper import WhisperModel
    return WhisperModel("large-v3", device="cuda", compute_type="float16")


def conferir():
    import wave

    import numpy as np
    m = whisper()
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
        segs, _ = m.transcribe(x, language="pt", word_timestamps=True, beam_size=5, condition_on_previous_text=False)
        pal = [p for s in segs for p in s.words]
        ouvido = " ".join(p.word.strip() for p in pal)
        ok = norm(ouvido) == norm(t["txt"])
        print(f"[{t['id']}] {'OK ' if ok else '?? '}{ouvido}")
        if not ok:
            print(f"{'':>{len(t['id']) + 3}}esperado: {t['txt']}")


if __name__ == "__main__":
    os.makedirs(TMP, exist_ok=True)
    if "--conferir" in sys.argv:
        conferir(); sys.exit()
    inv = json.load(open(os.path.join(AQUI, "analise", "inventario.json"), encoding="utf-8"))
    lista, edl, palavras, t0 = [], [], [], 0.0
    for i, t in enumerate(TRECHOS):
        arq = os.path.join(TMP, f"{i:02d}-{t['id']}.mov")
        monta_trecho(t, arq)
        D = dur_de(t)
        lista.append(f"file '{arq}'")
        u, imgs = 0.0, []
        for p in t["img"]:
            d = D - u if p[3] is None else p[3]
            imgs.append({"de": round(t0 + u, 3), "ate": round(t0 + u + d, 3), "fonte": p[1], "ini": p[2]})
            u += d
        edl.append({"id": t["id"], "de": round(t0, 3), "ate": round(t0 + D, 3), "txt": t.get("txt", ""), "imagens": imgs,
                    "som": list(t["som"]) if "som" in t else None})
        if "som" in t:
            nome, a, b = t["som"]
            for w in inv[nome + ".MOV"]["palavras"]:
                if w["ini"] >= a - 0.02 and w["ini"] < b:
                    palavras.append({"p": w["p"], "ini": round(w["ini"] - a + t0, 3), "fim": round(min(w["fim"], b) - a + t0, 3), "trecho": t["id"]})
        t0 += D
        print(f"{t['id']:14s} {D:5.2f}s  -> {t0:6.2f}s")
    lst = os.path.join(TMP, "lista.txt")
    open(lst, "w", encoding="utf-8").write("\n".join(lista))
    os.makedirs(os.path.dirname(SAIDA), exist_ok=True)
    subprocess.run([FF, "-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", lst, "-c:v", "copy", "-c:a", "aac", "-b:a", "320k",
                    "-movflags", "+faststart", SAIDA], check=True)
    json.dump({"total": round(t0, 3), "fps": FPS, "trechos": edl, "palavras": palavras}, open(EDL, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    print(f"total {t0:.2f} s -> {SAIDA}")
