"""Posts em b-roll com frase (formato "áudio em alta"), a partir de um lote.

Entrada: <pasta>/frases.json = [{"frase": "...", "br": "BR-006"}, ...]
- "frase" vem da ferramenta redator-openai e entra LITERAL: nada é reescrito, cortado ou corrigido aqui.
- "br" é o código do clipe no banco do Drive (TK FILMES/04 BANCO DE B-ROLL), ver tk-filmes/b-roll/catalogo.md.

Saída, por item N: <pasta>/broll-N.mp4 (9 s, sem som), broll-N-capa.png (prévia) e broll-N-frase.txt (texto exato).
Nada é publicado. O áudio em alta é aplicado no celular, na hora de postar.

uso: python tk-filmes/posts/brolls/gerar_brolls.py tk-filmes/posts/brolls/<lote>
"""
import json, sys, pathlib, subprocess

RAIZ = pathlib.Path(__file__).resolve().parents[3]
REM = RAIZ / "tk-filmes" / "videos" / "remotion"
BANCO = pathlib.Path(r"G:/Meu Drive/TK FILMES/04 BANCO DE B-ROLL")
SEGUNDOS = 9
VEU_CASAMENTO = 0.42  # clipes do casamento (BR-001 a BR-018): véu escuro, frase em destaque


def npx(*args):
    r = subprocess.run(["npx", "remotion", *map(str, args)], cwd=REM, capture_output=True, text=True, shell=True, encoding="utf-8", errors="replace")
    if r.returncode != 0:
        raise SystemExit(f"falhou: remotion {' '.join(map(str, args))[:160]}\n{r.stderr[-800:]}")
    return r.stdout


def preparar_clipe(br):
    destino = REM / "public" / "broll" / f"{br}.mp4"
    if not destino.exists():
        fonte = next(BANCO.glob(f"*/{br} *"), None)
        if fonte is None:
            raise SystemExit(f"{br} não está no banco de b-roll do Drive")
        npx("ffmpeg", "-v", "error", "-y", "-i", fonte, "-vf", "scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920",
            "-an", "-c:v", "libx264", "-crf", "20", "-pix_fmt", "yuv420p", destino)
    saida = npx("ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "default=nw=1:nk=1", destino)
    return float([l for l in saida.split() if l.replace(".", "", 1).isdigit()][-1])


def main(pasta):
    pasta = pathlib.Path(pasta).resolve()
    itens = json.loads((pasta / "frases.json").read_text(encoding="utf-8"))
    for n, it in enumerate(itens, 1):
        frase, br = it["frase"], it["br"]
        nome = it.get("nome", f"broll-{n}")
        dur = preparar_clipe(br)
        seg = round(min(SEGUNDOS, dur - 0.1), 2)  # sem emenda de repetição: o vídeo não passa do tamanho do clipe
        props = pasta / f".props-{n}.json"
        props.write_text(json.dumps({"clipe": br, "clipeSegundos": dur, "texto": frase, "segundos": seg, "veu": VEU_CASAMENTO if int(br[3:]) <= 18 else 0, "centroY": it.get("centroY", 905)}, ensure_ascii=False), encoding="utf-8")
        (pasta / f"{nome}-frase.txt").write_text(frase + "\n", encoding="utf-8", newline="\n")
        npx("still", "BrollFrase", pasta / f"{nome}-capa.png", "--frame=48", f"--props={props}")
        npx("render", "BrollFrase", pasta / f"{nome}.mp4", f"--props={props}", "--codec=h264", "--crf=18")
        props.unlink()
        print(f"ok {nome} ({br}, {seg}s): {frase}")


if __name__ == "__main__":
    main(sys.argv[1])
