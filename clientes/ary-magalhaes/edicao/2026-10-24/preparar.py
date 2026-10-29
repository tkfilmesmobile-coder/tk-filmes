"""Diária de 2026-10-24 (Ary): converte os .MOV (HDR HLG do iPhone) em MP4 SDR, extrai o áudio
e transcreve palavra a palavra (faster-whisper large-v3-turbo na GPU).

Uso: python preparar.py <pasta com os .MOV> [<arquivo.MOV> ...]
Saídas: midia/sdr/<nome>.mp4, midia/wav/<nome>.wav (16 kHz) e transcricoes/<nome>.json ao lado deste script.
A pasta midia/ não vai pro GitHub (vídeo e áudio estão no .gitignore).
"""
import json, os, subprocess, sys, glob, site, wave
import numpy as np

AQUI = os.path.dirname(os.path.abspath(__file__))
FF = os.path.join(AQUI, "..", "..", "..", "camilla-wanderley", "edicao", "perfil-video", "node_modules", "@remotion",
                  "compositor-win32-x64-msvc", "ffmpeg.exe")
MIDIA = os.path.join(AQUI, "midia")
TONEMAP = ("zscale=t=linear:npl=100,format=gbrpf32le,zscale=p=bt709,tonemap=tonemap=hable:desat=0,"
           "zscale=t=bt709:m=bt709:r=tv,format=yuv420p")

for sp in site.getsitepackages():
    for sub in ("nvidia/cublas/bin", "nvidia/cudnn/bin"):
        d = os.path.join(sp, sub)
        if os.path.isdir(d):
            os.add_dll_directory(d)
            os.environ["PATH"] = d + os.pathsep + os.environ["PATH"]


def converter(src):
    nome = os.path.splitext(os.path.basename(src))[0]
    mp4 = os.path.join(MIDIA, "sdr", nome + ".mp4")
    wav = os.path.join(MIDIA, "wav", nome + ".wav")
    if not os.path.exists(mp4):
        subprocess.run([FF, "-v", "error", "-y", "-i", src, "-vf", TONEMAP, "-c:v", "h264_nvenc", "-preset", "p5",
                        "-cq", "18", "-b:v", "0", "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", mp4],
                       check=True)
    if not os.path.exists(wav):
        subprocess.run([FF, "-v", "error", "-y", "-i", src, "-vn", "-ac", "1", "-ar", "16000", wav], check=True)
    return nome, wav


def main():
    args = sys.argv[1:]
    clipes = []
    for a in args:
        clipes += sorted(glob.glob(os.path.join(a, "*.MOV"))) if os.path.isdir(a) else [a]
    os.makedirs(os.path.join(MIDIA, "sdr"), exist_ok=True)
    os.makedirs(os.path.join(MIDIA, "wav"), exist_ok=True)
    saida = os.path.join(AQUI, "transcricoes")
    os.makedirs(saida, exist_ok=True)
    feitos = [converter(c) for c in clipes]
    print(f"convertidos: {len(feitos)}", flush=True)

    from faster_whisper import WhisperModel
    model = WhisperModel("large-v3-turbo", device="cuda", compute_type="float16")
    for nome, wav in feitos:
        js = os.path.join(saida, nome + ".json")
        if os.path.exists(js):
            continue
        with wave.open(wav, "rb") as w:
            audio = np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(np.float32) / 32768.0
        segs, info = model.transcribe(audio, language="pt", beam_size=5, word_timestamps=True, vad_filter=True,
                                      condition_on_previous_text=False)
        out = []
        for s in segs:
            out.append({"ini": round(s.start, 2), "fim": round(s.end, 2), "texto": s.text.strip(),
                        "palavras": [{"p": w.word.strip(), "ini": round(w.start, 2), "fim": round(w.end, 2),
                                      "conf": round(w.probability, 2)} for w in (s.words or [])]})
        with open(js, "w", encoding="utf-8") as f:
            json.dump({"arquivo": nome, "duracao": round(info.duration, 2), "segmentos": out}, f,
                      ensure_ascii=False, indent=1)
        print(f"{nome}: {len(out)} trechos", flush=True)


if __name__ == "__main__":
    main()
