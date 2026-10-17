"""Gera motion odontológico com Veo 3.1 (Vertex AI) a partir dos PNGs aprovados.
Versão TK (2026-09-30), sobre o script original do kit:
- entrada sobre CHROMA VERDE (entradas/*_verde.png) pra depois recortar com scripts/recortar_chroma.py
  e ter vídeo com fundo transparente (o Veo não gera alfa);
- --last-image: primeiro e último quadro (o Veo interpola a transformação, ex.: 02 → 03);
- --duration 4/6/8 · sem áudio (o sound design é da edição) · 1080p · prompt negativo fixo;
- baixa o MP4 gerado do Cloud Storage pra saidas/<nome>.mp4.
Uso:
  python scripts/generate_motion.py --mode preview --name m01 --image entradas/01_molar_realista_verde.png --prompt "..."
"""
import os
import time
import argparse
from pathlib import Path

from dotenv import load_dotenv
from google import genai
from google.genai.types import GenerateVideosConfig, Image
from google.cloud import storage

load_dotenv()

PROJECT_ID = os.getenv("GOOGLE_CLOUD_PROJECT")
LOCATION = os.getenv("GOOGLE_CLOUD_LOCATION", "us-central1")
BUCKET_NAME = os.getenv("MOTION_BUCKET")
BASE_PROMPT_FILE = Path("prompts/dental_base_prompt.txt")
NEGATIVE = (
    "background change, gradient background, scenery, room, table, hands, people, text, letters, logo, watermark, "
    "cartoon, toy, plastic look, fire, flames, blood, gore, glitch, fast camera, camera shake, zoom burst, "
    "object leaving frame, extra teeth, deformed anatomy, green spill on the object"
)


def require_env():
    missing = [n for n, v in (("GOOGLE_CLOUD_PROJECT", PROJECT_ID), ("MOTION_BUCKET", BUCKET_NAME)) if not v]
    if missing:
        raise RuntimeError("Configure as variáveis no arquivo .env: " + ", ".join(missing))


def upload_to_gcs(local_path: str, prefix: str = "assets") -> str:
    local = Path(local_path)
    if not local.exists():
        raise FileNotFoundError(f"Asset não encontrado: {local_path}")
    blob = storage.Client(project=PROJECT_ID).bucket(BUCKET_NAME).blob(f"{prefix}/{local.name}")
    blob.upload_from_filename(str(local))
    return f"gs://{BUCKET_NAME}/{prefix}/{local.name}"


def download_from_gcs(uri: str, destino: Path) -> Path:
    sem = uri.replace("gs://", "")
    bucket, caminho = sem.split("/", 1)
    destino.parent.mkdir(parents=True, exist_ok=True)
    storage.Client(project=PROJECT_ID).bucket(bucket).blob(caminho).download_to_filename(str(destino))
    return destino


def build_prompt(scene_prompt: str) -> str:
    base = BASE_PROMPT_FILE.read_text(encoding="utf-8").strip()
    return f"{base}\n\nSCENE INSTRUCTION\n{scene_prompt.strip()}"


def generate_video(scene_prompt, image_path, mode, output_name, last_image=None, duration=6, seed=None):
    require_env()
    model = "veo-3.1-fast-generate-001" if mode == "preview" else "veo-3.1-generate-001"
    image_gcs_uri = upload_to_gcs(image_path)
    last = Image(gcs_uri=upload_to_gcs(last_image), mime_type="image/png") if last_image else None
    output_gcs_uri = f"gs://{BUCKET_NAME}/generated/{output_name}/"

    client = genai.Client(vertexai=True, project=PROJECT_ID, location=LOCATION)
    operation = client.models.generate_videos(
        model=model,
        prompt=build_prompt(scene_prompt),
        image=Image(gcs_uri=image_gcs_uri, mime_type="image/png"),
        config=GenerateVideosConfig(
            aspect_ratio="9:16",
            duration_seconds=duration,
            resolution="1080p",
            generate_audio=False,
            negative_prompt=NEGATIVE,
            number_of_videos=1,
            last_frame=last,
            seed=seed,
            output_gcs_uri=output_gcs_uri,
        ),
    )
    print(f"Modelo: {model} | {duration}s | primeiro quadro: {image_gcs_uri} | último: {last_image or '-'}")
    while not operation.done:
        time.sleep(15)
        operation = client.operations.get(operation)
        print("Aguardando geração...")
    if not operation.response:
        print("A operação terminou sem resposta:", operation)
        return None
    uri = operation.result.generated_videos[0].video.uri
    local = download_from_gcs(uri, Path("saidas") / f"{output_name}.mp4")
    print(f"Vídeo gerado: {uri}\nBaixado em: {local}")
    return local


def main():
    p = argparse.ArgumentParser(description="Gera motion odontológico com Veo 3.1 via Vertex AI.")
    p.add_argument("--prompt", required=True, help="Instrução da cena em inglês.")
    p.add_argument("--image", required=True, help="Primeiro quadro (PNG sobre verde).")
    p.add_argument("--last-image", default=None, help="Último quadro (opcional).")
    p.add_argument("--mode", choices=["preview", "final"], default="preview")
    p.add_argument("--duration", type=int, choices=[4, 6, 8], default=6)
    p.add_argument("--seed", type=int, default=None)
    p.add_argument("--name", required=True)
    a = p.parse_args()
    generate_video(a.prompt, a.image, a.mode, a.name, a.last_image, a.duration, a.seed)


if __name__ == "__main__":
    main()
