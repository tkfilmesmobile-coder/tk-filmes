<!-- quem alimenta: o /setup semeia na entrevista; o /atualizar acrescenta ferramenta nova, acesso novo ou "não alcanço"; a /faxina confere e pergunta. Lido antes de dizer "não consigo" e ao criar skill. -->
# Ferramentas

> O que o negócio usa e como o agente alcança cada coisa. **"não ligada" é resposta válida.**
> Chave nunca fica aqui. Chave mora no `.env` (fora do git); aqui vai só o nome da variável.
> O cardápio do que dá pra ligar está no catálogo de ferramentas do kit.

| ferramenta | pra quê | como o agente alcança | estado | última checagem |
|---|---|---|---|---|
| CapCut | edição de vídeo | só você, na mão | não ligada | 2026-09-17 |
| Claude | artes, legendas personalizadas, sites, apps | é o próprio agente | ligada | 2026-09-17 |
| ChatGPT | artes e legendas personalizadas | só você, na mão | não ligada | 2026-09-17 |
| Google Drive | armazenamento de conteúdo, documentação e tudo do cliente | Drive da TK montado em `G:\Meu Drive` (Drive for Desktop): o agente cria pasta e grava direto. O conector também enxerga a conta da TK (busca, metadados, links). Pasta de cliente: `G:\Meu Drive\<CLIENTE>` | ligada | 2026-09-30 |
| Notion | CRM (ainda não estruturado) | MCP (a decidir) | não ligada | 2026-09-17 |
| WhatsApp | comunicação com cliente | só você, na mão | não ligada | 2026-09-17 |
| Instagram (Graph API) | publicar nos perfis de clientes | skill `publicar-social-ratos`, um token por conta no `.env` (`INSTAGRAM_ACCESS_TOKEN_<CONTA>`; contas: TAMARACHAGAS_PREV, DRA_TAMARACHAGAS_, DRA_CAMILLAWANDERLEY, TK_FILMES, PASSAPORTEDOGALEGUINHO, CABELOSMAGALHAES). Publica feed, reels, story e colaboração (inclusive em reels); upload de vídeo com timeout de 10 min; não faz agendamento, música, sticker nem rascunho. Trocar o @ da conta bloqueia o token ("API access blocked"): gerar um novo. O insight `online_followers` ainda vem vazio pra TK: melhor horário sai do histórico de posts. No computador principal (kumyt) não há Node nem git no PATH, e o catbox recusa o envio: publicar em PowerShell direto na Graph API, com imagem em JPG no uguu (PNG grande dá timeout no Instagram) (2026-10-22) | ligada | 2026-10-22 |
| Agendador de Tarefas do Windows | publicar posts em data e hora marcadas | tarefas "TK - ..." criadas pelo agente a pedido; inventário em `automacoes.md` | ligada (só com o PC ligado) | 2026-09-29 |
| Site do TSE | conferir regras eleitorais | bloqueia leitura automática: abrir pelo navegador do app | ligada | 2026-09-29 |
| GitHub | acessar o sistema de qualquer computador | CLI (`/syncar`), repositório tkfilmesmobile-coder/tk-filmes | ligada | 2026-09-17 |
| Remotion + Whisper.cpp local + YuNet (rastreio de rosto) | edição de vídeo em código: curso, Galeguinho e agora os reels da TK | projeto da TK em `tk-filmes/videos/remotion/` (copiado da aula-6); Whisper em `projetos/curso-mestres-ai/remotion/whisper.cpp`; rastreio pelo venv `remotion/.venv-tracking`; efeitos sonoros sintetizados por `scripts/gerar-sfx.mjs`; trilha de ação por `scripts/trilha-acao.py`. Em 2026-10-08 o Whisper não rodou nesta máquina (CPU a 89%) | ligada | 2026-10-10 |
| Google Cloud | APIs do Google (Gemini, Drive, YouTube…) | CLI gcloud + login dos scripts (ADC) com tkfilmesmobile@gmail.com, projeto `tk-filmes-app`. Credencial em `%APPDATA%\gcloud`, fora do git. Cada API se liga quando for usar | ligada (sem API paga, sem cartão) | 2026-09-30 |
| Bancos de imagem e música (Unsplash, Pixabay Music) | foto e trilha quando o cliente não tem material | pelo navegador do app; licença e autor anotados em `marca/fotos/banco/_origem.md` e `marca/audio/_origem.md` do cliente. Material do próprio cliente vem antes | ligada | 2026-10-12 |
| Tratamento de foto e vídeo do celular | recorte de fundo, foto HEIC, vídeo HDR do iPhone em story | rembg (recorte), pillow-heif (HEIC), `clientes/ary-magalhaes/modelos/video_story.py` (HDR → SDR + texto por cima; o ffmpeg do Remotion é enxuto, sem overlay) e `grade.py` (cor editorial). Nesta máquina (pc-escritoriotamarachagas): recorte local com o modelo isnet-general-use em `~/.u2net` + onnxruntime e OpenCV 4 (`clientes/melissa-morais/edicao/scripts/recortar-modelo.py`); ffmpeg pelo pacote imageio-ffmpeg. Foto de paciente não sobe pra serviço de fora | ligada | 2026-10-17 |

## Os sete assuntos que todo negócio tem

| assunto | o que usa hoje | estado |
|---|---|---|
| mensagem com cliente | WhatsApp | não ligada |
| tarefa e prazo | nada | não ligada |
| email | Gmail (tkfilmesmobile@gmail.com) | não ligada |
| agenda | nada | não ligada |
| dinheiro entrando e saindo | nada | não ligada |
| ficha do cliente | Notion (CRM começado) + Google Drive | não ligada |
| reunião | Google Meet e presencial | não ligada |
