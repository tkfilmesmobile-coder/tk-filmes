# Roda as duas sincronizações em sequência: arquivos (GitHub) e conversas (Google Drive).
# É este que o Agendador chama, pelo sincronizar-oculto.vbs (pra não piscar janela).
try { & (Join-Path $PSScriptRoot 'sincronizar-github.ps1') } catch {}
try { & (Join-Path $PSScriptRoot 'sincronizar-conversas.ps1') } catch {}
