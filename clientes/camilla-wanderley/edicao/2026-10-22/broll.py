"""B-rolls qualificados da diária de 2026-10-22 (regra de 2026-10-23): corta os trechos bons dos vídeos já em
SDR e grava com nome que diz a cena. Som original mantido (dá pra tirar na edição).
Uso: python broll.py <pasta sdr> <pasta saída>
"""
import os, subprocess, sys

AQUI = os.path.dirname(os.path.abspath(__file__))
FF = os.path.join(AQUI, "..", "perfil-video", "node_modules", "@remotion", "compositor-win32-x64-msvc", "ffmpeg.exe")

# (arquivo, início, fim, nome da cena)
BROLLS = [
    ("IMG_6589", 1.5, 9.0, "doutora calçando as luvas"),
    ("IMG_6571", 0.5, 12.5, "atendimento em close com sugador"),
    ("IMG_6571", 12.5, 19.2, "atendimento plano aberto com a auxiliar"),
    ("IMG_6572", 0.0, 14.8, "atendimento em close de perfil"),
    ("IMG_6594", 0.0, 9.6, "atendimento em close"),
    ("IMG_6599", 0.0, 14.7, "atendimento visto de cima"),
    ("IMG_6591", 17.0, 24.7, "close da boca com espelho (luz baixa)"),
    ("IMG_6600", 1.5, 9.5, "close da boca com espelho e seringa"),
    ("IMG_6617", 0.0, 24.0, "atendimento plano médio na cadeira"),
    ("IMG_6618", 0.0, 8.5, "luz azul fotopolimerizando a resina"),
    ("IMG_6621", 0.0, 8.3, "atendimento com a auxiliar"),
    ("IMG_6623", 2.9, 4.29, "bancada de instrumentos"),
    ("IMG_6624", 0.0, 7.5, "paciente se olhando no espelho e sorrindo"),
    ("IMG_6627", 0.0, 2.9, "paciente sorrindo na cadeira"),
    ("IMG_6610", 0.0, 2.9, "paciente sentando pra consulta"),
    ("IMG_6611", 0.0, 7.5, "consulta com a doutora escrevendo"),
    ("IMG_6615", 110.0, 128.0, "consulta da noiva com a mãe, risada"),
    ("IMG_6626", 40.0, 55.0, "doutora explicando na mesa"),
    ("IMG_6582", 99.0, 117.0, "abraço emocionado depois do depoimento"),
]


def main():
    src, out = sys.argv[1], sys.argv[2]
    os.makedirs(out, exist_ok=True)
    for i, (arq, a, b, cena) in enumerate(BROLLS, 1):
        nome = f"{i:02d} · {cena} ({arq} {a:g}-{b:g}s).mp4".replace(".", ",", 0)
        dst = os.path.join(out, nome)
        if os.path.exists(dst):
            continue
        subprocess.run([FF, "-v", "error", "-y", "-ss", f"{a}", "-to", f"{b}", "-i", os.path.join(src, arq + ".mp4"),
                        "-c:v", "h264_nvenc", "-preset", "p5", "-cq", "18", "-b:v", "0", "-c:a", "aac", "-b:a", "192k",
                        "-movflags", "+faststart", dst], check=True)
        print(nome, flush=True)


if __name__ == "__main__":
    main()
