"""Converte os vídeos de apoio do Drive da Ary (atendimentos e resultados de clientes) em MP4 SDR 1080x1920
e gera uma folha de quadros (1 a cada 2 s) de cada um, pra escolher os trechos de B-roll.

Uso: python broll_preparar.py
Saídas: midia/broll/<nome>.mp4 e midia/broll/folhas/<nome>.jpg
"""
import os, subprocess, glob, json
from PIL import Image, ImageDraw

AQUI = os.path.dirname(os.path.abspath(__file__))
BIN = os.path.join(AQUI, "..", "..", "..", "camilla-wanderley", "edicao", "perfil-video", "node_modules", "@remotion",
                   "compositor-win32-x64-msvc")
FF, FP = os.path.join(BIN, "ffmpeg.exe"), os.path.join(BIN, "ffprobe.exe")
BRUTO = r"H:\Meu Drive\Ary Magalhães\B-ROLL\VÍDEOS"
OUT = os.path.join(AQUI, "midia", "broll")
HLG = ("zscale=t=linear:npl=100,format=gbrpf32le,zscale=p=bt709,tonemap=tonemap=hable:desat=0,"
       "zscale=t=bt709:m=bt709:r=tv,format=yuv420p")


def info(src):
    r = subprocess.run([FP, "-v", "error", "-select_streams", "v:0", "-show_entries",
                        "stream=width,height,color_transfer:stream_side_data=rotation:format=duration", "-of", "json", src],
                       capture_output=True, text=True)
    return json.loads(r.stdout)


def main():
    os.makedirs(os.path.join(OUT, "folhas"), exist_ok=True)
    fontes = sorted(glob.glob(os.path.join(BRUTO, "*", "*.MOV")))  # B-ROLL/VÍDEOS/<assunto> (Drive reorganizado em 2026-10-24)
    resumo = {}
    for src in fontes:
        nome = os.path.splitext(os.path.basename(src))[0]
        mp4 = os.path.join(OUT, nome + ".mp4")
        j = info(src)
        hdr = j["streams"][0].get("color_transfer") in ("arib-std-b67", "smpte2084")
        vf = (HLG + "," if hdr else "") + "scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920"  # o ffmpeg do Remotion não tem setsar
        if not os.path.exists(mp4):
            subprocess.run([FF, "-v", "error", "-y", "-i", src, "-vf", vf, "-r", "30", "-c:v", "h264_nvenc", "-preset", "p5",
                            "-cq", "19", "-b:v", "0", "-c:a", "aac", "-b:a", "160k", "-movflags", "+faststart", mp4], check=True)
        dur = float(info(mp4)["format"]["duration"])
        pasta = os.path.basename(os.path.dirname(src))
        resumo[nome] = {"pasta": pasta, "dur": round(dur, 2), "hdr": hdr}
        # folha de quadros: 1 a cada 2 s, miniaturas de 135x240 com o tempo escrito
        qs = []
        t = 0.5
        while t < dur:
            q = os.path.join(OUT, "folhas", f"_{nome}_{t:.1f}.jpg")
            subprocess.run([FF, "-v", "error", "-y", "-ss", str(t), "-i", mp4, "-frames:v", "1", "-vf", "scale=135:240", q])
            if os.path.exists(q):
                qs.append((t, q))
            t += 2.0
        col = 10
        lin = (len(qs) + col - 1) // col
        folha = Image.new("RGB", (col * 135, max(1, lin) * 240), "black")
        d = ImageDraw.Draw(folha)
        for i, (t, q) in enumerate(qs):
            x, y = (i % col) * 135, (i // col) * 240
            folha.paste(Image.open(q), (x, y))
            d.rectangle([x, y, x + 46, y + 16], fill="black")
            d.text((x + 3, y + 2), f"{t:.1f}", fill="white")
            os.remove(q)
        folha.save(os.path.join(OUT, "folhas", nome + ".jpg"), quality=80)
        print(nome, pasta, f"{dur:.1f}s", "HDR" if hdr else "SDR", flush=True)
    json.dump(resumo, open(os.path.join(OUT, "resumo.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)


if __name__ == "__main__":
    main()
