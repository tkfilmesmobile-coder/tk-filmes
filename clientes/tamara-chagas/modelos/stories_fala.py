"""Story com fala, com curadoria (regra da Talyta, 27/10/2026): só a fala aprovada e legenda palavra a palavra
com o texto exato do que a pessoa fala. Vídeo do iPhone em HDR vira SDR bt709, sem a marcação de rotação,
1080x1920 a 30 fps, com avanço suave da câmera e entrada e saída suaves.

uso: python modelos/stories_fala.py <pasta-dos-brutos> <pasta-do-lote> <spec.json>
spec.json: lista de vídeos
  {"id": "03-horario", "bruto": "FALA_preto_fachada_horario_02.MOV", "kicker": "HORÁRIO DE ATENDIMENTO",
   "trechos": [[4.4, 7.6]],                      # segundos do bruto; vários trechos = corte só nos silêncios
   "linhas": [[["Horário", 4.42], ["de", 4.78], ...], [...]]}   # palavra exata + início dela no bruto
Os tempos das palavras vêm do faster-whisper (modelo small, no processador); o texto é conferido à mão.
Grava <id>.mp4 na pasta do lote e as camadas em <lote>/_tmp/.
"""
import json, pathlib, subprocess, sys
import imageio_ffmpeg
from playwright.sync_api import sync_playwright

FF = imageio_ffmpeg.get_ffmpeg_exe()
XF = 0.15  # fusão curtinha entre trechos (o corte cai no silêncio)
SDR = ("zscale=tin=arib-std-b67:min=bt2020nc:pin=bt2020:rin=tv:t=linear:npl=203,format=gbrpf32le,"
       "zscale=p=bt709,tonemap=tonemap=mobius:desat=0,zscale=t=bt709:m=bt709:r=tv,format=yuv420p")
FONTE = '<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;600;700&display=swap" rel="stylesheet">'
CSS = ("*{margin:0;padding:0}html,body{width:1080px;height:1920px;font-family:Inter,sans-serif;"
       "background:linear-gradient(180deg,rgba(20,20,20,.5) 0%,rgba(20,20,20,.2) 12%,rgba(20,20,20,0) 22%,"
       "rgba(20,20,20,0) 62%,rgba(20,20,20,.5) 80%,rgba(20,20,20,.3) 94%,rgba(20,20,20,0) 100%)}"
       ".k{position:absolute;left:96px;top:250px;display:flex;align-items:center;gap:18px;font-size:26px;letter-spacing:.34em;"
       "font-weight:600;color:#E6D3B8;text-shadow:0 1px 8px rgba(0,0,0,.5)}.k i{display:block;width:56px;height:2px;background:#E6D3B8}"
       # alinhada à esquerda, na margem do título: a frase cresce palavra a palavra sem pular de lugar
       ".l{position:absolute;left:96px;right:96px;top:1380px;text-align:left;font-size:58px;line-height:1.22;"
       "font-weight:300;color:rgba(255,255,255,.92);text-shadow:0 2px 16px rgba(0,0,0,.7),0 0 2px rgba(0,0,0,.8)}"
       ".l span{display:inline-block;margin-right:.26em}.l .x{visibility:hidden}.l .on{font-weight:700;color:#fff}")


def hdr(arq):
    """True se o vídeo é HDR (HLG do iPhone). Vídeo já em SDR não passa pela conversão (fica alaranjado)."""
    info = subprocess.run([FF, "-hide_banner", "-i", str(arq)], capture_output=True, text=True, errors="replace").stderr
    return "arib-std-b67" in info


def base(dur, zoom=0.04, conv=True):
    return (f"{SDR + ',' if conv else ''}fps=30,scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,"
            f"scale=w='trunc(1080*(1+{zoom}*t/{dur})/2)*2':h='trunc(1920*(1+{zoom}*t/{dur})/2)*2':eval=frame,"
            "crop=1080:1920,setsar=1,sidedata=mode=delete:type=DISPLAYMATRIX")


def camada(pg, tmp, nome, kicker, palavras, n):
    """n primeiras palavras visíveis, a última em destaque (n=0: só o título)."""
    sp = "".join(f'<span class="{"on" if i == n - 1 else ("" if i < n else "x")}">{w}</span>' for i, (w, _) in enumerate(palavras))
    html = (f"<!doctype html><html><head><meta charset='utf-8'>{FONTE}<style>{CSS}</style></head><body>"
            f"<div class='k'><i></i>{kicker}</div><div class='l'>{sp}</div></body></html>")
    arq = tmp / f"{nome}.html"; arq.write_text(html, encoding="utf-8")
    pg.goto(arq.as_uri()); pg.wait_for_load_state("networkidle"); pg.evaluate("document.fonts.ready"); pg.wait_for_timeout(150)
    out = tmp / f"{nome}.png"; pg.screenshot(path=str(out), omit_background=True)
    return out


def montar(brutos, lote, s, pg):
    tmp = lote / "_tmp"; tmp.mkdir(parents=True, exist_ok=True)
    trechos = s["trechos"]
    durs = [round(b - a, 3) for a, b in trechos]
    inicio = []  # início de cada trecho na saída
    acc = 0.0
    for i, d in enumerate(durs):
        inicio.append(acc); acc += d - (XF if i < len(durs) - 1 else 0)
    total = round(acc, 3)

    def saida(t):  # tempo do bruto -> tempo do vídeo final
        for (a, b), ini in zip(trechos, inicio):
            if a - 0.05 <= t <= b + 0.05:
                return round(ini + max(t - a, 0), 3)
        raise ValueError(f"{s['id']}: palavra em {t}s fora dos trechos {trechos}")

    janelas = []
    linhas = s["linhas"]
    for li, pal in enumerate(linhas):
        fim_l = saida(linhas[li + 1][0][1]) if li + 1 < len(linhas) else total
        if li == 0 and saida(pal[0][1]) > 0.05:
            janelas.append((camada(pg, tmp, f"{s['id']}-l0-0", s["kicker"], pal, 0), 0.0, saida(pal[0][1])))
        for n in range(1, len(pal) + 1):
            a = saida(pal[n - 1][1])
            b = saida(pal[n][1]) if n < len(pal) else fim_l
            janelas.append((camada(pg, tmp, f"{s['id']}-l{li}-{n}", s["kicker"], pal, n), a, b))

    ins, g = [], []
    conv = hdr(brutos / s["bruto"])
    for i, (a, b) in enumerate(trechos):
        ins += ["-ss", str(a), "-t", str(durs[i]), "-i", str(brutos / s["bruto"])]
        g.append(f"[{i}:v]{base(durs[i], conv=conv)}[c{i}]")
        g.append(f"[{i}:a:0]aresample=48000,aformat=channel_layouts=stereo[s{i}]")
    v, a_ = "c0", "s0"
    for i in range(1, len(trechos)):
        g.append(f"[{v}][c{i}]xfade=transition=fade:duration={XF}:offset={round(inicio[i], 3)}[x{i}]")
        g.append(f"[{a_}][s{i}]acrossfade=d={XF}[y{i}]")
        v, a_ = f"x{i}", f"y{i}"
    g.append(f"[{v}]fade=in:st=0:d=0.2,fade=out:st={total - 0.25}:d=0.25[v0]")
    n0 = len(trechos); ult = "v0"
    for j, (png, a, b) in enumerate(janelas):
        ins += ["-loop", "1", "-t", str(total), "-i", str(png)]
        g.append(f"[{n0 + j}:v]format=rgba[o{j}]")
        g.append(f"[{ult}][o{j}]overlay=0:0:enable='gte(t,{a})*lt(t,{b})'[w{j}]"); ult = f"w{j}"
    g.append(f"[{a_}]afade=in:st=0:d=0.08,afade=out:st={total - 0.2}:d=0.2,loudnorm=I=-16:TP=-1.5:LRA=11[aud]")
    out = lote / f"{s['id']}.mp4"
    subprocess.run([FF, "-y", "-hide_banner", "-loglevel", "error"] + ins +
                   ["-filter_complex", ";".join(g), "-map", f"[{ult}]", "-map", "[aud]", "-c:v", "libx264", "-preset", "medium",
                    "-crf", "19", "-pix_fmt", "yuv420p", "-color_primaries", "bt709", "-color_trc", "bt709", "-colorspace", "bt709",
                    "-r", "30", "-c:a", "aac", "-b:a", "160k", "-ar", "48000", "-movflags", "+faststart", str(out)], check=True)
    texto = " ".join(w for l in linhas for w, _ in l)
    print(f"ok {out.name} {total}s · {texto}")


def main():
    brutos, lote = pathlib.Path(sys.argv[1]), pathlib.Path(sys.argv[2]).resolve()
    specs = json.loads(pathlib.Path(sys.argv[3]).read_text(encoding="utf-8"))
    with sync_playwright() as p:
        b = p.chromium.launch(); pg = b.new_page(viewport={"width": 1080, "height": 1920})
        for s in specs:
            montar(brutos, lote, s, pg)
        b.close()


if __name__ == "__main__":
    main()
