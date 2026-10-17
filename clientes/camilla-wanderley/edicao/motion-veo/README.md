# Motion Studio — Veo 3.1 + Google Cloud + Antigravity Skill

Projeto-base para gerar motions odontológicos 3D usando Veo 3.1 no Vertex AI,
com uma identidade visual fixa por meio de um `SKILL.md`.

## 1. Pré-requisitos
- Python 3.10+
- Google Cloud CLI (`gcloud`)
- Projeto Google Cloud com faturamento habilitado
- Vertex AI API habilitada
- Cloud Storage API habilitada
- Bucket no Cloud Storage

## 2. Autenticação

No terminal:

```bash
gcloud auth login
gcloud auth application-default login
```

Defina o projeto:

```bash
gcloud config set project SEU_PROJECT_ID
```

Ative APIs:

```bash
gcloud services enable aiplatform.googleapis.com storage.googleapis.com
```

Crie o bucket:

```bash
gcloud storage buckets create gs://SEU_BUCKET --location=us-central1
```

## 3. Configuração local

Crie o ambiente:

### Windows PowerShell
```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

### macOS/Linux
```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

Copie `.env.example` para `.env` e substitua os valores:

```env
GOOGLE_CLOUD_PROJECT=seu-project-id
GOOGLE_CLOUD_LOCATION=us-central1
MOTION_BUCKET=seu-bucket-sem-gs
```

## 4. Assets

Coloque os PNGs aprovados na pasta:

```text
assets/
```

## 5. Gerar preview

Exemplo:

```bash
python scripts/generate_motion.py   --mode preview   --name sensibilidade-frio   --image assets/02_molar_corte_anatomico.png   --prompt "A realistic 3D dental motion showing cold sensitivity. A soft cooling airflow approaches the tooth. The inner nerve area reacts with a brief sharp pain pulse. When the cold stimulus leaves, the pain quickly fades. Premium clinical CGI, elegant camera movement, pink brand accents."
```

## 6. Gerar final

```bash
python scripts/generate_motion.py   --mode final   --name sensibilidade-frio-final   --image assets/02_molar_corte_anatomico.png   --prompt "A realistic 3D dental motion showing cold sensitivity. A soft cooling airflow approaches the tooth. The inner nerve area reacts with a brief sharp pain pulse. When the cold stimulus leaves, the pain quickly fades. Premium clinical CGI, elegant camera movement, pink brand accents."
```

## 7. Skill do Antigravity

O skill está em:

```text
.agents/skills/veo-odontologia/SKILL.md
```

Mantenha a pasta `.agents` dentro da raiz do projeto para aplicar o comportamento a este workspace.

## 8. Fluxo recomendado

1. Asset PNG aprovado
2. Preview com Veo Fast
3. Revisão
4. Final com Veo principal
5. Baixar MP4 do Cloud Storage
6. Compor no Premiere, After Effects ou CapCut
