#!/usr/bin/env bash
set -e

echo "Configurando Motion Studio..."

if [ ! -d ".venv" ]; then
  python3 -m venv .venv
fi

source .venv/bin/activate
pip install -r requirements.txt

if [ ! -f ".env" ]; then
  cp .env.example .env
  echo "Arquivo .env criado. Edite os dados antes de gerar vídeos."
fi

echo "Configuração concluída."
