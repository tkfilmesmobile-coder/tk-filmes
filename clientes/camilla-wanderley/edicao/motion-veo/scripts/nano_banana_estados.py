"""Nano Banana 2 (gemini-3.1-flash-image) gera os ESTADOS de cada animação a partir do PNG aprovado.
A animação em si é montada no Remotion (transições, micro-movimento 3D, tempo preso à fala);
o Nano Banana garante que cada estado seja o mesmo dente, mesma luz, mesmo material.

Cada estado é uma EDIÇÃO da imagem de referência (sobre chroma verde, pra recortar depois com
scripts/recortar_chroma.py). Estados em sequência usam o estado anterior como referência extra,
pra manter consistência entre quadros.

Acesso (um dos dois, no .env):
  - Vertex AI (projeto com faturamento): GOOGLE_CLOUD_PROJECT + login do gcloud (já feito)
  - Gemini API (AI Studio): GEMINI_API_KEY
Uso: python scripts/nano_banana_estados.py <motion>   (ex.: m3)   ·   --listar
"""
import os, sys, json
from pathlib import Path
from dotenv import load_dotenv
from google import genai
from google.genai import types

load_dotenv()
MODELO = "gemini-3.1-flash-image"
BASE = (
    "Edit the supplied reference image. Keep the exact same object, anatomy, materials, colors, size, "
    "position and studio lighting. Keep the solid uniform chroma green background (#00B140) untouched, "
    "no gradient, no shadows on the background, no green reflections on the object. "
    "Premium realistic 3D clinical CGI. No text, no people, no extra objects. Only apply this change: "
)

# motion -> (imagem de referência, [(nome do estado, instrução)])
ESTADOS = {
    "m1": ("01_molar_realista", [
        ("a_frio_longe", "a faint translucent swirl of cold white-lilac air appears far at the upper right edge, small and soft"),
        ("b_frio_meio", "the translucent cold white-lilac air swirl is halfway, curving toward the tooth crown"),
        ("c_frio_toca", "the cold white-lilac air swirl gently wraps around the crown; a subtle frost sheen on the enamel"),
    ]),
    "m3": ("02_molar_corte_anatomico", [
        ("a_frio_toca", "a soft stream of cold pearl-white air touches the enamel from the right side"),
        ("b_dor_inicio", "the cold air touches the enamel and a small pink-red pain glow starts inside the pulp chamber"),
        ("c_dor_pico", "the cold air touches the enamel and a sharp bright pink-red pain pulse radiates through the pulp and nerve canals"),
        ("d_frio_sai", "the cold air stream moves away to the right; the pain glow inside the pulp is fading"),
        ("e_calmo", "no cold air; the pulp is calm and normal, no glow at all"),
    ]),
    "m4": ("02_molar_corte_anatomico", [
        ("a_inicio", "a faint red inflammation starts inside the pulp chamber"),
        ("b_espalha", "a controlled red inflammation glow spreads through the pulp chamber and nerve canals"),
        ("c_persistente", "the whole pulp and nerve canals are inflamed with a steady, persistent red glow"),
    ]),
    "m5": ("03_molar_polpa_inflamada", [
        ("a_calor_longe", "a soft spiral of warm orange-pink thermal energy (not fire, no flames) appears at the right side"),
        ("b_calor_toca", "the warm orange-pink thermal energy spiral touches the tooth; the red glow inside intensifies slightly"),
    ]),
    "m6": ("03_molar_polpa_inflamada", [
        ("a_frio_chega", "a gentle cool lilac-white air swirl starts wrapping around the crown"),
        ("b_alivio", "the cool lilac-white swirl wraps the crown and the red glow inside the pulp is visibly dimmer and softer"),
    ]),
    "m7": ("07_dente_anatomia_com_lupa", [
        ("a_lupa_esq", "move the magnifying glass slightly to the left over the crown"),
        ("b_lupa_dir", "move the magnifying glass slightly to the right over the roots, showing the canals in sharp detail"),
    ]),
    "m8": ("06_instrumentos_odontologicos", [
        ("a_brilho", "a soft specular highlight runs along the polished steel of both instruments"),
    ]),
}


def cliente():
    if os.getenv("GEMINI_API_KEY"):
        return genai.Client(api_key=os.getenv("GEMINI_API_KEY"))
    return genai.Client(vertexai=True, project=os.getenv("GOOGLE_CLOUD_PROJECT"), location="global")


def gerar(motion):
    ref_nome, estados = ESTADOS[motion]
    ref = Path(f"entradas/{ref_nome}_verde.png").read_bytes()
    out = Path(f"estados/{motion}"); out.mkdir(parents=True, exist_ok=True)
    c = cliente()
    anterior = None
    for nome, instr in estados:
        partes = [types.Part.from_bytes(data=ref, mime_type="image/png")]
        if anterior:
            partes.append(types.Part.from_bytes(data=anterior, mime_type="image/png"))
            instr += ". Keep continuity with the second image (previous state)."
        partes.append(BASE + instr)
        r = c.models.generate_content(
            model=MODELO,
            contents=partes,
            config=types.GenerateContentConfig(
                response_modalities=["IMAGE"],
                image_config=types.ImageConfig(aspect_ratio="9:16"),
            ),
        )
        img = next((p.inline_data.data for p in r.candidates[0].content.parts if p.inline_data), None)
        if not img:
            raise SystemExit(f"{motion}/{nome}: o modelo não devolveu imagem")
        (out / f"{nome}.png").write_bytes(img)
        anterior = img
        print(f"{motion}/{nome}.png ok")


if __name__ == "__main__":
    if len(sys.argv) < 2 or sys.argv[1] == "--listar":
        print(json.dumps({k: [n for n, _ in v[1]] for k, v in ESTADOS.items()}, indent=1))
    else:
        gerar(sys.argv[1])
