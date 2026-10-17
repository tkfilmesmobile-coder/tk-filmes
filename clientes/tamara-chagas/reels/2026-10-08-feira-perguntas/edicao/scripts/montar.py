"""Monta o rough cut a partir do edl.json e gera os dados da composição.
uso: python scripts/montar.py [--previa INI FIM]   (tempos de SAÍDA em segundos, só pra conferência)
edl.json:
  {"bruto": "...MOV", "clips": [{"in": 12.3, "out": 15.1, "nota": "..."}, {"freeze": 0.6}],  # freeze repete o último quadro
   "zooms": [{"t": 3.2, "dur": 1.0, "s": 1.14, "x": 0.5, "y": 0.4, "rampa": 4}],               # tempos de SAÍDA
   "pb": [[ini, fim]], "inserts": [{"t":..., "dur":..., "tipo": "tv-erro|glitch|meme|cartao|sistema", ...}],
   "sfx": [[t, "nome", vol]], "destaques": ["palavra", ...], "corrige": {"errado": "certo"}, "omitir_legenda": [[ini, fim]]}
saídas: public/rough.mp4 (1080x1920 30fps), public/dados.json
"""
import json, pathlib, subprocess, sys, re

AQUI = pathlib.Path(__file__).resolve().parent.parent
RAIZ = AQUI.parent
FF = "C:/Users/tamar/AppData/Roaming/Python/Python314/site-packages/imageio_ffmpeg/binaries/ffmpeg-win-x86_64-v7.1.exe"
FPS = 30


def palavras():
    d = json.loads((RAIZ / "transcricao-palavras.json").read_text(encoding="utf8"))
    out = []
    for s in d["transcription"]:
        t = s["text"].strip()
        if not t or t.startswith("["):
            continue
        a, b = s["offsets"]["from"] / 1000, s["offsets"]["to"] / 1000
        out.append([a, b, t])
    return out


def expandir(clips):
    import numpy as np
    db = np.load(RAIZ / "vocals_db.npy")
    out = []
    for g, c in enumerate(clips):
        if not c.get("cortar_pausas"):
            out.append(c); continue
        a, b = int(c["in"] * 100), int(c["out"] * 100)
        bruto_ = (db[a:b] > -28).astype(float)
        fala = np.convolve(bruto_, np.ones(13) / 13, mode="same") > 0.35  # ignora estalos curtos no meio da pausa
        partes, i, n = [], 0, len(fala)
        ini = 0
        while i < n:
            if not fala[i]:
                j = i
                while j < n and not fala[j]: j += 1
                if j - i >= 38 and i > 0 and j < n:  # pausa morta: fecha a parte com 12 cs de folga e reabre 8 cs antes da fala
                    partes.append((ini, i + 22)); ini = j - 15
                i = j
            else:
                i += 1
        partes.append((ini, n))
        juntas = [partes[0]]  # corte que tiraria menos de 0,3 s não compensa o pulo na imagem
        for x, y in partes[1:]:
            if x - juntas[-1][1] < 30: juntas[-1] = (juntas[-1][0], y)
            else: juntas.append((x, y))
        partes = juntas
        for k, (x, y) in enumerate(partes):
            d = dict(c); d.pop("cortar_pausas", None)
            d["in"], d["out"] = round(c["in"] + x / 100, 2), round(c["in"] + y / 100, 2)
            d["grupo"] = g; d["texto"] = c.get("texto", "") if k == 0 else ""
            out.append(d)
    return out


def main():
    edl = sys.argv[1] if len(sys.argv) > 1 and not sys.argv[1].startswith("--") else "edl.json"
    e = json.loads((AQUI / edl).read_text(encoding="utf-8-sig"))
    clips = expandir(e["clips"])
    # 1) rough cut com ffmpeg (trim + concat; micro fade de áudio pra não estalar)
    partes, filtros, t0, mapa = [], [], 0.0, []
    k = 0
    congela = clips[-1].get("freeze", 0) if clips and "freeze" in clips[-1] else 0
    for c in clips:
        if "freeze" in c:
            continue  # congelamento só no fim: aplicado depois do concat
        a, b = c["in"], c["out"]; d = b - a
        audio = (f"anullsrc=r=48000:cl=stereo,atrim=duration={d:.3f}[a{k}]" if c.get("mudo") else
                 f"[0:a]atrim=start={a:.3f}:end={b:.3f},asetpts=PTS-STARTPTS,aresample=48000,aformat=channel_layouts=stereo,"
                 f"afade=t=in:d=0.012,afade=t=out:st={max(0, d - 0.012):.3f}:d=0.012[a{k}]")
        filtros.append(f"[0:v]trim=start={a:.3f}:end={b:.3f},setpts=PTS-STARTPTS,scale=1080:1920,fps={FPS},setsar=1[v{k}];" + audio)
        mapa.append({"in": a, "out": b, "t": t0, "dur": d}); t0 += d
        partes.append(f"[v{k}][a{k}]"); k += 1
    fc = ";".join(filtros) + ";" + "".join(partes) + f"concat=n={k}:v=1:a=1[vc][a0]"
    if congela:
        fc += f";[vc]tpad=stop_mode=clone:stop_duration={congela:.3f}[v];[a0]apad=pad_dur={congela:.3f}[a]"
        mapa.append({"in": None, "out": None, "t": t0, "dur": congela}); t0 += congela
    else:
        fc += ";[vc]null[v];[a0]anull[a]"
    # voz: leve redução de ruído, compressão e nível (sem matar o ambiente da rua)
    fc += ";[a]highpass=f=80,afftdn=nr=8,acompressor=threshold=-20dB:ratio=3:attack=5:release=80,loudnorm=I=-15:TP=-1.5:LRA=9,aresample=48000[ao]"
    pub = AQUI / "public"; pub.mkdir(exist_ok=True)
    cmd = [FF, "-hide_banner", "-loglevel", "error", "-y", "-i", e["bruto"], "-filter_complex", fc, "-map", "[v]", "-map", "[ao]",
           "-fps_mode", "cfr", "-r", str(FPS), "-c:v", "libx264", "-preset", "veryfast", "-crf", "18", "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "192k", str(pub / "rough.mp4")]
    subprocess.run(cmd, check=True)

    # 2) legendas: palavras do bruto remapeadas pro tempo de saída
    corr = e.get("corrige", {})
    ws = []
    if any("texto" in c for c in clips):
        # legenda pelo texto de cada trecho, distribuída sobre a fala real (voz separada, energia > -32 dB)
        import numpy as np
        db = np.load(RAIZ / "vocals_db.npy")
        blocos = []  # [(texto, [(m, mascara_ativa_em_cs)])]
        m_i = 0
        for c in clips:
            if "freeze" in c:
                continue
            m = mapa[m_i]; m_i += 1
            seg = db[int(c["in"] * 100):int(c["out"] * 100)] > -32
            if c.get("grupo") is not None and blocos and blocos[-1][2] == c["grupo"]:
                blocos[-1][1].append((m, seg))
            else:
                blocos.append([c.get("texto", ""), [(m, seg)], c.get("grupo")])
        for texto, partes, _ in blocos:
            frases = [f.strip() for f in texto.split("|") if f.strip()]
            if not frases:
                continue
            ativos = [m["t"] + i / 100 for m, seg in partes for i in np.flatnonzero(seg)]
            if not ativos:
                ativos = [m["t"] + i / 100 for m, seg in partes for i in range(len(seg))]
            palavras_ = [[w, len(w) + 2, k] for k, f in enumerate(frases) for w in f.split()]
            tot = sum(x[1] for x in palavras_); acc = 0
            for w, peso, k in palavras_:
                ta = ativos[min(len(ativos) - 1, int(acc / tot * len(ativos)))]
                acc += peso
                tb = ativos[min(len(ativos) - 1, max(0, int(acc / tot * len(ativos)) - 1))] + 0.01
                ws.append([round(ta, 3), round(tb, 3), w, k])
        ws.sort(key=lambda w: w[0])
    else:
        todas = palavras()
        for m in mapa:
            if m["in"] is None:
                continue
            for a_, b_, t in todas:
                if m["in"] - 0.25 <= a_ < m["out"] - 0.05:
                    ta = m["t"] + max(0, a_ - m["in"]); tb = min(m["t"] + m["dur"], m["t"] + max(0.2, b_ - m["in"]))
                    ws.append([round(ta, 3), round(tb, 3), corr.get(t, t), 0])
        ws.sort(key=lambda w: w[0])
        for i in range(len(ws) - 1):
            if ws[i + 1][2].startswith("INSS"):
                ws[i][2] = {"da": "do", "a": "o", "na": "no", "Da": "Do", "A": "O"}.get(ws[i][2], ws[i][2])
    omit = e.get("omitir_legenda", [])
    ws = [w for w in ws if not any(i <= w[0] < f for i, f in omit)]
    # agrupa em linhas curtas (até ~26 caracteres; quebra em pausa, corte ou pontuação)
    cortes = [m["t"] for m in mapa]
    linhas, cur = [], []
    for w in ws:
        txt = " ".join(x[2] for x in cur + [w])
        quebra = cur and (w[0] - cur[-1][1] > 0.45 or len(txt) > 26 or w[3] != cur[-1][3] or any(cur[-1][0] < c <= w[0] + 0.01 for c in cortes) or re.search(r"[.?!]$", cur[-1][2]))
        if quebra:
            linhas.append(cur); cur = []
        cur.append(w)
    if cur: linhas.append(cur)
    legendas = sorted([{"ini": l[0][0], "fim": max(l[-1][1], l[0][0] + 0.5), "palavras": l} for l in linhas], key=lambda x: x["ini"])
    for i in range(len(legendas) - 1):
        prox_corte = min([c for c in cortes + [t0] if c > legendas[i]["ini"] + 0.01], default=t0)
        legendas[i]["fim"] = min(legendas[i]["fim"] + 0.25, legendas[i + 1]["ini"], prox_corte)
    for l in legendas:
        l["palavras"] = [w[:3] for w in l["palavras"]]
    dados = {"duracao": round(t0, 3), "mapa": mapa, "legendas": legendas, "zooms": e.get("zooms", []), "pb": e.get("pb", []),
             "inserts": e.get("inserts", []), "sfx": e.get("sfx", []), "trilha": e.get("trilha", []), "whips": e.get("whips", []), "headline": e.get("headline"), "destaques": [d.lower() for d in e.get("destaques", [])]}
    (pub / "dados.json").write_text(json.dumps(dados, ensure_ascii=False, indent=1), encoding="utf8")
    print(f"ok rough {t0:.2f}s, {len(clips)} clips, {len(legendas)} legendas")


if __name__ == "__main__":
    main()
