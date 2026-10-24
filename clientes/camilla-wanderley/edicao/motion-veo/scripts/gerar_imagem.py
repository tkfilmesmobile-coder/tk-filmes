"""Imagem de partida GRATUITA via Hugging Face Spaces (FLUX.1, código aberto, GPU ZeroGPU do Hugging Face).
Gera a cena realista sobre chroma verde, pronta pro scripts/gerar_wan.py (animação) e pro recorte.
Cota gratuita limitada por dia; com HF_TOKEN no .env a cota aumenta.

Uso:
  python scripts/gerar_imagem.py --name implante_corte --prompt "..." [--modelo schnell|dev] [--seed 7] [--w 768 --h 1344]
"""
import argparse, os, shutil, time
from pathlib import Path
from dotenv import load_dotenv
from gradio_client import Client

load_dotenv()
SPACES = {"schnell": "black-forest-labs/FLUX.1-schnell", "dev": "black-forest-labs/FLUX.1-dev"}
ESTILO = (
    " Photorealistic premium 3D medical CGI render, physically based materials, soft clinical studio lighting with gentle "
    "rim light, ultra detailed, sharp focus, elegant and clean, centered object fully inside the frame with generous margin, "
    "isolated on a solid perfectly uniform chroma green background (#00B140), no shadow on the background, no text, no logo."
)

ap = argparse.ArgumentParser()
ap.add_argument("--name", required=True)
ap.add_argument("--prompt", required=True)
ap.add_argument("--modelo", choices=SPACES, default="dev")
ap.add_argument("--seed", type=int, default=0)
ap.add_argument("--w", type=int, default=768)
ap.add_argument("--h", type=int, default=1344)
a = ap.parse_args()

client = Client(SPACES[a.modelo], token=os.getenv("HF_TOKEN") or None, verbose=False)
t0 = time.time()
kw = dict(prompt=a.prompt + ESTILO, seed=a.seed, randomize_seed=a.seed == 0, width=a.w, height=a.h, api_name="/infer")
if a.modelo == "dev":
    kw.update(guidance_scale=3.5, num_inference_steps=28)
else:
    kw.update(num_inference_steps=4)
res = client.predict(**kw)
img, seed = res if isinstance(res, (list, tuple)) else (res, None)
caminho = img["path"] if isinstance(img, dict) else img
Path("entradas").mkdir(exist_ok=True)
destino = Path("entradas") / f"{a.name}.webp"
shutil.copy(caminho, destino)
print(f"ok: {destino} | seed {seed} | {time.time() - t0:.0f}s")
