"""Só o áudio: extrai o WAV direto do .MOV e transcreve (sem esperar a conversão do vídeo).
Uso: python transcrever.py <arquivo.MOV> ...   → midia/wav/<nome>.wav e transcricoes/<nome>.json
"""
import json, os, subprocess, sys, site, wave
import numpy as np

AQUI = os.path.dirname(os.path.abspath(__file__))
FF = os.path.join(AQUI, "..", "video", "node_modules", "@remotion", "compositor-win32-x64-msvc", "ffmpeg.exe")
for sp in site.getsitepackages():
    for sub in ("nvidia/cublas/bin", "nvidia/cudnn/bin"):
        d = os.path.join(sp, sub)
        if os.path.isdir(d):
            os.add_dll_directory(d); os.environ["PATH"] = d + os.pathsep + os.environ["PATH"]


def main():
    os.makedirs(os.path.join(AQUI, "midia", "wav"), exist_ok=True)
    os.makedirs(os.path.join(AQUI, "transcricoes"), exist_ok=True)
    from faster_whisper import WhisperModel
    model = WhisperModel("large-v3-turbo", device="cuda", compute_type="float16")
    for src in sys.argv[1:]:
        nome = os.path.splitext(os.path.basename(src))[0]
        js = os.path.join(AQUI, "transcricoes", nome + ".json")
        if os.path.exists(js):
            continue
        wav = os.path.join(AQUI, "midia", "wav", nome + ".wav")
        if not os.path.exists(wav):
            tmp = wav + ".tmp.wav"
            subprocess.run([FF, "-v", "error", "-y", "-i", src, "-vn", "-ac", "1", "-ar", "16000", tmp], check=True)
            os.replace(tmp, wav)
        with wave.open(wav, "rb") as w:
            audio = np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(np.float32) / 32768.0
        segs, info = model.transcribe(audio, language="pt", beam_size=5, word_timestamps=True, vad_filter=True,
                                      condition_on_previous_text=False)
        out = [{"ini": round(s.start, 2), "fim": round(s.end, 2), "texto": s.text.strip(),
                "palavras": [{"p": w.word.strip(), "ini": round(w.start, 2), "fim": round(w.end, 2), "conf": round(w.probability, 2)}
                             for w in (s.words or [])]} for s in segs]
        json.dump({"arquivo": nome, "duracao": round(info.duration, 2), "segmentos": out}, open(js, "w", encoding="utf-8"),
                  ensure_ascii=False, indent=1)
        print(f"{nome}: {info.duration:.0f}s, {len(out)} trechos", flush=True)


if __name__ == "__main__":
    main()
