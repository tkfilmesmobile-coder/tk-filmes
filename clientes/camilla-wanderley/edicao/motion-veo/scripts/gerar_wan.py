"""Animação GRATUITA via Hugging Face Spaces (Wan 2.2, código aberto, GPU ZeroGPU do Hugging Face).
Alternativa sem custo ao Veo (2026-09-30). Mesma entrada sobre chroma verde → recorte com
scripts/recortar_chroma.py → WebM com alfa.

Spaces:
  rapido : zerogpu-aoti/wan2-2-fp8da-aoti-faster   (imagem → vídeo)
  flf    : multimodalart/wan-2-2-first-last-frame   (primeiro + último quadro → vídeo)
Cota gratuita limitada por dia (sem conta). Se estourar, espere ou use um token do Hugging Face (HF_TOKEN no .env).

Uso:
  python scripts/gerar_wan.py --space rapido --image entradas/01_molar_realista_verde.png --prompt "..." --dur 3.5 --name m1_wan
  python scripts/gerar_wan.py --space flf --image entradas/02_..._verde.png --end-image entradas/03_..._verde.png --prompt "..." --name m4_wan
"""
import argparse, os, shutil, time
from pathlib import Path
from dotenv import load_dotenv
from gradio_client import Client, handle_file

load_dotenv()
SPACES = {"rapido": "zerogpu-aoti/wan2-2-fp8da-aoti-faster", "flf": "multimodalart/wan-2-2-first-last-frame"}
FUNDO = (
    " The background is a solid, perfectly uniform chroma green (#00B140) for the whole video and never changes. "
    "Locked-off camera, the object stays centered and fully inside the frame. Premium realistic 3D clinical CGI, "
    "soft studio light, smooth natural easing, subtle and precise motion."
)
NEG_EXTRA = (
    "background change, gradient background, room, scenery, floor, text, watermark, logo, hands, people, cartoon, "
    "plastic, fire, flames, blood, camera shake, fast motion, glitch, flicker, morphing object, extra teeth, deformed"
)

ap = argparse.ArgumentParser()
ap.add_argument("--space", choices=SPACES, default="rapido")
ap.add_argument("--image", required=True)
ap.add_argument("--end-image")
ap.add_argument("--prompt", required=True)
ap.add_argument("--dur", type=float, default=3.5)
ap.add_argument("--steps", type=float, default=None)
ap.add_argument("--seed", type=int, default=None)
ap.add_argument("--name", required=True)
a = ap.parse_args()

client = Client(SPACES[a.space], token=os.getenv("HF_TOKEN") or None, verbose=False)
neg_padrao = client.view_api(return_format="dict", print_info=False)["named_endpoints"]["/generate_video"]["parameters"]
neg_padrao = next(p["parameter_default"] for p in neg_padrao if p["parameter_name"] == "negative_prompt")
kw = dict(prompt=a.prompt + FUNDO, negative_prompt=f"{neg_padrao}, {NEG_EXTRA}", duration_seconds=a.dur,
          seed=a.seed if a.seed is not None else 42, randomize_seed=a.seed is None, api_name="/generate_video")
if a.space == "rapido":
    kw.update(input_image=handle_file(a.image), steps=a.steps or 6)
else:
    kw.update(start_image_pil=handle_file(a.image), end_image_pil=handle_file(a.end_image or a.image), steps=a.steps or 8)

t0 = time.time()
res = client.predict(**kw)
video, seed = res if isinstance(res, (list, tuple)) else (res, None)
caminho = video["video"] if isinstance(video, dict) else video
Path("saidas").mkdir(exist_ok=True)
destino = Path("saidas") / f"{a.name}.mp4"
shutil.copy(caminho, destino)
print(f"ok: {destino} | seed {seed} | {time.time() - t0:.0f}s")
