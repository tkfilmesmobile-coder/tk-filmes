# Tamara Chagas Advocacia

As regras da raiz e as de todos os clientes (`clientes/_regras.md`) valem aqui. Antes de trabalhar
neste cliente, ler `contexto.md` (a ficha, com a seção "Regras gerais aplicadas")
e `andamento.md` (o que já foi entregue e o que está em aberto).

Nas peças deste cliente vale a marca **dele**, não a da TK (ver "Marca" no `contexto.md`).

Esta pasta é só o marketing do escritório (conteúdo, Instagram, métricas). O trabalho jurídico do
escritório (petições, processos) não é da TK e não entra aqui.

Post de imagem: seguir a skill `post-tamara` (`.claude/skills/post-tamara/SKILL.md` nesta pasta),
com o modelo em `modelos/`. É a regra fixa de estética, legenda e fonte aprovada em 2026-09-28.

Conteúdo de advocacia segue as regras de publicidade da OAB: ver "Cuidados" no `contexto.md`
antes de escrever qualquer post ou legenda.

Vídeos (regra da Talyta, 15/10/2026):
- **Programação automática:** todo vídeo que ela mandar e for aprovado já entra na programação de
  postagens, às 16h, com stories (3 no pessoal, 4 no escritório).
  Não perguntar a data: agendar e avisar, registrando em `_contexto/automacoes.md`.
- **5 Reels por semana, mesclando formatos** (regra de 20/10/2026): um por dia útil, de segunda a
  sexta, sem repetir o mesmo formato em dias seguidos (Tamara pra câmera · equipe/humor · quadro da
  feira · vlog). Semana cheia, o próximo vídeo passa pra semana seguinte. Vale também pro quadro da feira.
- **Tamara falando pra câmera:** publicar sempre no perfil pessoal `@dra.tamarachagas_`
  (conta `DRA_TAMARACHAGAS_`) em colaboração com o `@tamarachagas_prev`.

Stories diários com b-roll (regra da Talyta, 21/10/2026):
- Todo dia útil, **às 8h**, sai o lote de stories do dia no @tamarachagas_prev (6 a 8), feito com o material da
  pasta `CONTEÚDO/B-ROLL` do Drive (subpastas e cuidados no `_LEIA-ME.txt` de lá). Somados aos 4 stories do Reels
  das 16h, batem a meta de 10 por dia. O lote fica em `stories/AAAA-MM-DD-b-roll/` com um `ordem.txt` e é
  **produzido no dia anterior**; a tarefa `modelos/publicar-stories-dia.ps1` publica na ordem (ver `_contexto/automacoes.md`).
- **Estrutura do dia segue a planilha do marketing** (`controle-marketing.xlsx`, aba Checklist Diário), mesclando
  foto, vídeo com fala e vídeo com música: bom dia (foto) · vídeo de localização · bastidores (foto e vídeo, meta de 8
  por dia) · vídeo com funcionário falando · conteúdo da estrutura ou do serviço · novidade das fontes oficiais ·
  chamada do Reel · até amanhã. Nunca dois do mesmo formato seguidos.
- **Localização e horário de atendimento: sempre em 2 stories separados, os dois com fala** (regra de 21/10/2026).
  Depois do vídeo falado da localização, se ele não mostrar a rua, entra em seguida um vídeo da localização
  com música (fachada e rua).
- Vídeo sem fala sai sempre com música, sem o áudio original. **Música padrão: `marca/audio/piano-02-modern-atlasaudio.mp3`** (escolhida em 21/10/2026). Edição fluida: fusão de 0,6 s entre os trechos, avanço suave contínuo da câmera e entrada e saída suaves; nada de corte seco. iPhone grava em HDR: converter pra SDR
  (bt709) e tirar a rotação antes de publicar.
- Escrita elegante (`modelos/stories_elegante.py`): Inter fina com uma palavra forte, título pequeno
  espaçado em champanhe, filete fino. Sem caixa de texto e **sem emoji de carinha**.
- Nunca usar tela com processo, planilha, nome ou CPF de cliente, nem rosto de cliente sem autorização.
