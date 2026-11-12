"""Story no layout que a Talyta definiu em 12/11/2026 (sequência postada à mão em 11/11 no @tamarachagas_prev):
vídeo (ou foto com movimento) em tela cheia, música, e um texto curto no centro, branco, sem caixa nem degradê:
  estilo "titulo": TÍTULO em serifa itálica fina e caixa alta + uma linha pequena em caixa alta embaixo
                   (ex.: BOM DIA / COM A MAGIA DO NATAL REINANDO POR AQUI)
  estilo "local":  📍 Tamara Chagas Advocacia + linha pequena em caixa alta + frase grande em letra fina
                   (ex.: POR AQUI A NOSSA PRODUÇÃO / INICIA CEDO)
Sem o áudio original (só música). Vídeo HDR do iPhone vira SDR; rotação corrigida; 1080x1920, 30 fps.

uso: python modelos/stories_modelo.py <pasta-do-lote> <spec.json>
spec.json: lista de {"id", "src", "a" (s), "b" (s) | "dur" (foto), "cx" (0-1, centro do recorte), "estilo",
                     "titulo", "linha", "pre", "grande", "musica", "trilha_ini"}
"""
import json, pathlib, subprocess, sys
import imageio_ffmpeg
from playwright.sync_api import sync_playwright

FF = imageio_ffmpeg.get_ffmpeg_exe()
SDR = ("zscale=tin=arib-std-b67:min=bt2020nc:pin=bt2020:rin=tv:t=linear:npl=203,format=gbrpf32le,"
       "zscale=p=bt709,tonemap=tonemap=mobius:desat=0,zscale=t=bt709:m=bt709:r=tv,format=yuv420p,")
FONTES = ('<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@1,300;1,400'
          '&family=Josefin+Sans:wght@200;300&family=Montserrat:wght@500;600&display=swap" rel="stylesheet">')
CSS = """*{margin:0;padding:0;box-sizing:border-box}html,body{width:1080px;height:1920px;background:transparent}
.b{position:absolute;left:60px;right:60px;text-align:center;color:#fff;text-shadow:0 2px 14px rgba(0,0,0,.45),0 0 2px rgba(0,0,0,.25)}
.t{font-family:'Cormorant Garamond',serif;font-style:italic;font-weight:300;font-size:118px;letter-spacing:.04em;text-transform:uppercase;line-height:1}
.l{margin-top:22px;font-family:Montserrat,sans-serif;font-weight:500;font-size:27px;letter-spacing:.06em;text-transform:uppercase}
.pin{font-family:Montserrat,sans-serif;font-weight:500;font-size:27px;letter-spacing:.01em;display:flex;justify-content:center;align-items:center;gap:10px}
.pin svg{width:24px;height:28px}
.p{margin-top:20px;font-family:Montserrat,sans-serif;font-weight:500;font-size:27px;letter-spacing:.05em;text-transform:uppercase}
.g{margin-top:6px;font-family:'Josefin Sans',sans-serif;font-weight:300;font-size:84px;letter-spacing:.02em;text-transform:uppercase;line-height:1.05}"""
PIN = ('<svg viewBox="0 0 24 28"><path d="M12 1.5a8.5 8.5 0 0 0-8.5 8.5c0 6.4 8.5 16 8.5 16s8.5-9.6 8.5-16A8.5 8.5 0 0 0 12 1.5z" '
       'fill="none" stroke="#fff" stroke-width="2"/><circle cx="12" cy="10" r="3" fill="none" stroke="#fff" stroke-width="2"/></svg>')


def html(s):
    if s.get("estilo") == "local":
        corpo = (f'<div class="pin">{PIN}Tamara Chagas Advocacia</div>' +
                 (f'<div class="p">{s["pre"]}</div>' if s.get("pre") else "") + f'<div class="g">{s["grande"]}</div>')
        topo = s.get("y", 1150)
    else:
        # sem título: só as linhas pequenas (como o "RECEBENDO CADA UM DE VOCÊS / COM MUITO CARINHO" do modelo)
        corpo = ((f'<div class="t">{s["titulo"]}</div>' if s.get("titulo") else "") +
                 (f'<div class="l" style="{"" if s.get("titulo") else "margin-top:0;line-height:1.45"}">{s["linha"]}</div>'
                  if s.get("linha") else ""))
        topo = s.get("y", 1120)
    return (f'<!doctype html><html><head><meta charset="utf-8">{FONTES}<style>{CSS}</style></head><body>'
            f'<div class="b" style="top:{topo}px">{corpo}</div></body></html>')


def hdr(arq):
    info = subprocess.run([FF, "-hide_banner", "-i", str(arq)], capture_output=True, text=True, errors="replace").stderr
    return "arib-std-b67" in info


def main():
    lote = pathlib.Path(sys.argv[1]); lote.mkdir(parents=True, exist_ok=True)
    spec = json.load(open(sys.argv[2], encoding="utf-8-sig"))
    tmp = lote / "_tmp"; tmp.mkdir(exist_ok=True)
    with sync_playwright() as p:
        nav = p.chromium.launch(); pg = nav.new_page(viewport={"width": 1080, "height": 1920})
        for s in spec:
            h = tmp / f"{s['id']}.html"; h.write_text(html(s), encoding="utf-8")
            pg.goto(h.resolve().as_uri()); pg.wait_for_load_state("networkidle"); pg.evaluate("document.fonts.ready")
            pg.wait_for_timeout(300); pg.screenshot(path=str(tmp / f"{s['id']}-texto.png"), omit_background=True)
        nav.close()
    for s in spec:
        foto = str(s["src"]).lower().endswith((".jpg", ".jpeg", ".png"))
        dur = float(s.get("dur", 5.0)) if foto else round(float(s["b"]) - float(s["a"]), 3)
        n = round(dur * 30); cx = s.get("cx", 0.5)
        entrada = (["-loop", "1", "-t", str(dur), "-i", s["src"]] if foto else
                   ["-ss", str(s["a"]), "-t", str(dur), "-i", s["src"]])
        conv = "" if foto or not hdr(s["src"]) else SDR
        v = (f"[0:v]{conv}sidedata=mode=delete:type=DISPLAYMATRIX,setpts=PTS-STARTPTS,fps=30,format=yuv420p,"
             f"scale=w='if(gt(iw/ih,1080/1920),-2,1080)':h='if(gt(iw/ih,1080/1920),1920,-2)':flags=lanczos,"
             f"crop=1080:1920:x='max(0,min(iw-1080,iw*{cx}-540))':y='(ih-1920)/2',"
             f"scale=w='trunc(1080*(1+0.06*n/{n})/2)*2':h='trunc(1920*(1+0.06*n/{n})/2)*2':eval=frame,crop=1080:1920,setsar=1[cam];"
             f"[cam][1:v]overlay=0:0,fade=in:st=0:d=0.3,fade=out:st={max(dur - 0.35, 0.1):.2f}:d=0.35,format=yuv420p[v]")
        a = (f"[2:a]atrim=0:{dur},asetpts=PTS-STARTPTS,afade=in:st=0:d=0.5,afade=out:st={max(dur - 0.7, 0.1):.2f}:d=0.7,"
             f"volume={s.get('volume', 0.85)}[a]")
        out = lote / f"{s['id']}.mp4"
        subprocess.run([FF, "-y", "-loglevel", "error", *entrada, "-loop", "1", "-i", str(tmp / f"{s['id']}-texto.png"),
                        "-ss", str(s.get("trilha_ini", 0)), "-i", s["musica"],
                        "-filter_complex", f"{v};{a}", "-map", "[v]", "-map", "[a]", "-t", str(dur),
                        "-c:v", "libx264", "-preset", "medium", "-crf", "19", "-pix_fmt", "yuv420p",
                        "-color_primaries", "bt709", "-color_trc", "bt709", "-colorspace", "bt709",
                        "-c:a", "aac", "-b:a", "160k", "-movflags", "+faststart", str(out)], check=True)
        print("ok", out.name, f"{dur}s", flush=True)


if __name__ == "__main__":
    main()
