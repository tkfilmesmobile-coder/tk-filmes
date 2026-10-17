Write-Host "Configurando Motion Studio..." -ForegroundColor Cyan

if (!(Test-Path ".venv")) {
    python -m venv .venv
}

& ".\.venv\Scripts\Activate.ps1"
pip install -r requirements.txt

if (!(Test-Path ".env")) {
    Copy-Item ".env.example" ".env"
    Write-Host "Arquivo .env criado. Edite os dados antes de gerar vídeos." -ForegroundColor Yellow
}

Write-Host "Configuração concluída." -ForegroundColor Green
