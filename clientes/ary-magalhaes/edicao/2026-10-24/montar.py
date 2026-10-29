"""Monta os planos dos reels da diária de 2026-10-24 (Ary) a partir de cortes.json.

- Cada trecho de fala encaixa nas pausas entre palavras e é dividido nas pausas longas (> PAUSA s) pra
  tirar o "ar" entre as frases. Tentativas e direção ficam de fora porque não entram no cortes.json.
- Todos os tempos de B-roll, cartões, animações, textos e efeitos são escritos em segundos do vídeo ORIGINAL
  (a palavra que dispara) e convertidos aqui pro tempo da montagem.
- Voz nivelada (-20 dBFS só onde há fala), fade curto em cada corte, limitador suave → public/reels/<id>/voz.wav
- Legenda palavra a palavra → public/reels/<id>/legendas.json
- Rosto (YuNet, midia/rosto/<arq>.json) → keyframes de enquadramento e posição dos cartões ao lado da cabeça.
Uso: python montar.py [id ...]
"""
import json, os, shutil, subprocess, sys, wave
import numpy as np

AQUI = os.path.dirname(os.path.abspath(__file__))
PV = os.path.normpath(os.path.join(AQUI, "..", "video"))
FF = os.path.join(PV, "node_modules", "@remotion", "compositor-win32-x64-msvc", "ffmpeg.exe")
PUB = os.path.join(PV, "public")
SR = 48000
PAUSA = 0.32

CFG = json.load(open(os.path.join(AQUI, "cortes.json"), encoding="utf-8"))
COR = CFG.get("correcoes", {})


def palavras(arq):
    j = json.load(open(os.path.join(AQUI, "transcricoes", arq + ".json"), encoding="utf-8"))
    return [w for s in j["segmentos"] for w in s["palavras"]]


_env = {}
LIMIAR = -48.0  # dBFS: abaixo disso é silêncio (o ruído da sala fica em -60 a -75; a fala, em -25 a -35)


def energia(arq):
    """Energia (dBFS) a cada 10 ms do áudio 16 kHz do vídeo."""
    if arq not in _env:
        with wave.open(os.path.join(AQUI, "midia", "wav", arq + ".wav")) as f:
            a = np.frombuffer(f.readframes(f.getnframes()), np.int16).astype(np.float32) / 32768
        H = 160
        k = len(a) // H
        _env[arq] = 20 * np.log10(np.sqrt((a[: k * H].reshape(k, H) ** 2).mean(axis=1)) + 1e-9)
    return _env[arq]


def ate_silencio(arq, t, limite, passo):
    """Anda de t na direção 'passo' (+1 ou -1) até achar 40 ms de silêncio, sem passar de 'limite'."""
    e = energia(arq)
    i = int(round(t * 100))
    fim = int(round(limite * 100))
    quietos = 0
    while (passo > 0 and i < fim) or (passo < 0 and i > fim):
        if 0 <= i < len(e) and e[i] < LIMIAR:
            quietos += 1
            if quietos >= 4:
                return (i - passo * 3) / 100
        else:
            quietos = 0
        i += passo
    return None


def encaixa(arq, de, ate):
    """Divide [de, ate] nas pausas longas e corta cada pedaço SÓ no silêncio.
    Entra toda palavra que COMEÇA dentro do trecho (a palavra inteira, mesmo que o fim dela passe do 'ate');
    o corte anda até a voz acabar de verdade (energia do áudio), sem invadir a palavra seguinte."""
    ws = palavras(arq)
    dentro = [w for w in ws if w["ini"] >= de - 0.05 and w["ini"] < ate - 0.02]
    if not dentro:
        return [(de, ate, [])]
    grupos, g = [], [dentro[0]]
    for a, b in zip(dentro, dentro[1:]):
        if b["ini"] - a["fim"] > PAUSA:
            grupos.append(g); g = []
        g.append(b)
    grupos.append(g)
    out = []
    for g in grupos:
        i0, i1 = ws.index(g[0]), ws.index(g[-1])
        # palavra vizinha com duração absurda (> 1 s) é tempo mal marcado pela transcrição: não serve de limite
        ok = lambda w: (w["fim"] - w["ini"]) <= 1.0
        antes = ws[i0 - 1]["fim"] + 0.02 if i0 > 0 and ok(ws[i0 - 1]) else max(0.0, g[0]["ini"] - 0.5)
        depois = ws[i1 + 1]["ini"] - 0.02 if i1 + 1 < len(ws) and ok(ws[i1 + 1]) else g[-1]["fim"] + 0.8
        s_ini = ate_silencio(arq, g[0]["ini"], max(antes, g[0]["ini"] - 0.5), -1)
        s_fim = ate_silencio(arq, g[-1]["fim"], min(depois, g[-1]["fim"] + 0.7), +1)
        # sem silêncio antes: começa colado na palavra (não puxa o fim da fala anterior)
        ini = s_ini - 0.04 if s_ini is not None else g[0]["ini"] - 0.03
        fim = s_fim + 0.07 if s_fim is not None else depois
        out.append((max(0.0, antes, ini), min(fim, depois), g))
    return out


_audio = {}


def audio48(arq):
    if arq not in _audio:
        pasta = os.path.join(AQUI, "midia", "wav48"); os.makedirs(pasta, exist_ok=True)
        w = os.path.join(pasta, arq + ".wav")
        if not os.path.exists(w):
            subprocess.run([FF, "-v", "error", "-y", "-i", os.path.join(AQUI, "midia", "sdr", arq + ".mp4"), "-vn", "-ac", "2",
                            "-ar", str(SR), "-c:a", "pcm_s16le", w], check=True)
        with wave.open(w) as f:
            _audio[arq] = np.frombuffer(f.readframes(f.getnframes()), np.int16).astype(np.float32).reshape(-1, 2) / 32768
    return _audio[arq]


def ganho_voz(som, alvo_db=-20.0):
    m = np.abs(som).mean(axis=1); H = SR // 50; k = len(m) // H
    if k == 0:
        return 1.0
    rms = np.sqrt((m[: k * H].reshape(k, H) ** 2).mean(axis=1))
    db = 20 * np.log10(rms + 1e-9)
    fala = rms[db > db.max() - 22]
    atual = 20 * np.log10(np.sqrt((fala ** 2).mean()) + 1e-9)
    return float(np.clip(10 ** ((alvo_db - atual) / 20), 0.2, 8.0))


def grava(caminho, s, sr):
    with wave.open(caminho, "w") as f:
        f.setnchannels(s.shape[1]); f.setsampwidth(2); f.setframerate(sr)
        f.writeframes((np.clip(s, -1, 1) * 32767).astype(np.int16).tobytes())


def video_publico(arq):
    """Copia o SDR em 1080x1920 pra public/midia (o Remotion lê de lá)."""
    dst = os.path.join(PUB, "midia", "falas", arq + ".mp4")
    if not os.path.exists(dst):
        os.makedirs(os.path.dirname(dst), exist_ok=True)
        subprocess.run([FF, "-v", "error", "-y", "-i", os.path.join(AQUI, "midia", "sdr", arq + ".mp4"), "-vf",
                        "scale=1080:1920:flags=lanczos", "-c:v", "h264_nvenc", "-preset", "p6", "-cq", "16", "-b:v", "0",
                        "-an", "-movflags", "+faststart", dst], check=True)
    return f"midia/falas/{arq}.mp4"


def rosto(arq):
    j = json.load(open(os.path.join(AQUI, "midia", "rosto", arq + ".json")))
    a = np.array(j["pts"])
    for col in (1, 2, 3):  # média móvel de 7 amostras (~0,7 s)
        k = 7; pad = np.pad(a[:, col], (k // 2, k // 2), mode="edge")
        a[:, col] = np.convolve(pad, np.ones(k) / k, mode="valid")
    return a


def monta(v):
    out = os.path.join(PUB, "reels", v["id"]); os.makedirs(out, exist_ok=True)
    destaques = {d.lower().strip(".,!?;:") for d in v.get("destaques", [])}
    cor = {**COR, **v.get("correcoes", {})}
    trechos, legenda, partes, mapa, t = [], [], [], [], 0.0
    for tr in v["trechos"]:
        arq = tr["arq"]
        pedacos = encaixa(arq, tr["de"], tr["ate"]) if tr["tipo"] == "voz" else [(tr["de"], tr["ate"], [])]
        if tr.get("fimForcado"):  # fim conferido no áudio, quando a transcrição marcou a palavra vizinha errado
            de0, _, g0 = pedacos[-1]; pedacos[-1] = (de0, tr["fimForcado"], g0)
        for pi, (de, ate, ws) in enumerate(pedacos):
            dur = round(ate - de, 3)
            for k, w in enumerate(ws):
                texto = cor.get(w["p"], w["p"])
                if (k == 0 and not legenda) or (k == 0 and tr.get("maiuscula")) or (legenda and legenda[-1]["text"].strip()[-1:] in ".?!"):
                    texto = texto[:1].upper() + texto[1:]
                if k == 0 and pi == 0 and tr.get("prefixo"):  # palavra que a transcrição perdeu no começo do trecho (conferida no áudio)
                    texto = tr["prefixo"] + " " + texto[:1].lower() + texto[1:]
                limpo = texto.lower().strip(".,!?;:")
                legenda.append({"text": " " + texto, "startMs": int((t + w["ini"] - de) * 1000),
                                "endMs": int((t + w["fim"] - de) * 1000),
                                **({"destaque": True} if limpo in destaques else {}),
                                **({"quebra": True} if k == 0 and tr.get("quebra") else {})})
            r = rosto(arq)
            sel = r[(r[:, 0] >= de - 0.2) & (r[:, 0] <= ate + 0.2)]
            track = [[round(float(x[0] - de), 3), round(float(x[1]), 1), round(float(x[2]), 1), round(float(x[3]), 1)] for x in sel]
            trechos.append({"src": video_publico(arq), "arq": arq, "inicio": round(t, 3), "dur": dur, "srcDe": round(de, 3),
                            "tipo": tr["tipo"], "zoom": tr.get("zoom", 1.0), "track": track})
            mapa.append((de, ate, t, arq))
            som = audio48(arq)[int(round(de * SR)):int(round(de * SR)) + int(round(dur * SR))].copy()
            som *= ganho_voz(som) * (1.0 if tr["tipo"] == "voz" else 10 ** (-14 / 20))
            fi, fo = int(0.025 * SR), int(0.05 * SR)
            som[:fi] *= np.linspace(0, 1, fi)[:, None]; som[-fo:] *= np.linspace(1, 0, fo)[:, None]
            partes.append(som)
            t += dur

    def M(s, arq=None):
        """Tempo do original (do vídeo arq; sem arq, o primeiro) → tempo da montagem.
        No corte, vai pro começo do trecho seguinte do mesmo vídeo."""
        arq = arq or mapa[0][3]
        doArq = [m for m in mapa if m[3] == arq]
        for de, ate, t0, _ in doArq:
            if de - 0.001 <= s <= ate + 0.001:
                return round(t0 + s - de, 3)
        for de, ate, t0, _ in doArq:
            if s < de:
                return round(t0, 3)
        de, ate, t0, _ = doArq[-1]
        return round(t0 + ate - de, 3)

    fim_video = t
    final = v.get("fotoFinal")
    total = t + (final["dur"] if final else 0.0)
    s = np.concatenate(partes)
    s = np.concatenate([s, np.zeros((int(total * SR) - len(s) + SR // 2, 2), np.float32)])
    s = np.tanh(s * 1.15) / np.tanh(1.15) * 0.89
    grava(os.path.join(out, "voz.wav"), s, SR)
    json.dump(legenda, open(os.path.join(out, "legendas.json"), "w", encoding="utf-8"), ensure_ascii=False)

    def conv(item):
        o = dict(item)
        a = o.pop("arq", None)
        for chave in ("de", "ate", "em"):
            if chave in o and isinstance(o[chave], (int, float)):
                o[chave] = M(o[chave], a)
        if "passos" in o:
            o["passos"] = {k: M(x, a) for k, x in o["passos"].items()}
        return o

    camadas = {k: [conv(x) for x in v.get(k, [])] for k in ("brolls", "cartoes", "textos", "motions", "sfx", "zooms")}
    for b in camadas["brolls"]:
        if b.get("video"):
            b["src"] = broll_publico(b["video"])
        else:
            b["src"] = foto_publica(b["foto"])
    for c in camadas["cartoes"]:
        c["src"] = foto_publica(c["foto"]) if c.get("foto") else None
    if final:
        final = {**final, "src": foto_publica(final["foto"])}
    plano = {"id": v["id"], "nome": v["nome"], "total": round(total, 3), "fimVideo": round(fim_video, 3),
             "headline": conv(v["headline"]), "trechos": trechos, "fotoFinal": final, **camadas,
             "textos": [conv(x) for x in v.get("passosTitulo", [])]}
    print(f"{v['id']}: {total:.1f}s ({len(trechos)} trechos, {len(legenda)} palavras)", flush=True)
    return plano


def foto_publica(nome):
    """Fotos: marca/fotos/... (JPG) ou midia/fotos (as da diária) → public/midia/fotos/<nome>."""
    dst = os.path.join(PUB, "midia", "fotos", os.path.basename(nome))
    if not os.path.exists(dst):
        os.makedirs(os.path.dirname(dst), exist_ok=True)
        for base in (os.path.join(AQUI, "..", "..", "marca", "fotos"), os.path.join(AQUI, "midia", "fotos")):
            src = os.path.join(base, nome)
            if os.path.exists(src):
                from PIL import Image, ImageOps
                im = ImageOps.exif_transpose(Image.open(src)).convert("RGB")
                im.thumbnail((1600, 1600)); im.save(dst, quality=92)
                break
        else:
            raise FileNotFoundError(nome)
    return f"midia/fotos/{os.path.basename(nome)}"


def broll_publico(nome):
    dst = os.path.join(PUB, "midia", "broll", nome + ".mp4")
    if not os.path.exists(dst):
        os.makedirs(os.path.dirname(dst), exist_ok=True)
        shutil.copy(os.path.join(AQUI, "midia", "broll", nome + ".mp4"), dst)
    return f"midia/broll/{nome}.mp4"


def main():
    alvo = sys.argv[1:]
    caminho = os.path.join(PV, "src", "reels", "planos.json")
    os.makedirs(os.path.dirname(caminho), exist_ok=True)
    planos = json.load(open(caminho, encoding="utf-8")) if os.path.exists(caminho) else {}
    for v in CFG["videos"]:
        if not alvo or v["id"] in alvo:
            planos[v["id"]] = monta(v)
    json.dump(planos, open(caminho, "w", encoding="utf-8"), ensure_ascii=False, indent=1)


if __name__ == "__main__":
    main()
