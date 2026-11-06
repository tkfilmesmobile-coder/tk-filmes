# Roda as sincronizações em sequência: arquivos (GitHub), conversas (Google Drive) e
# segredos do .env (Google Drive da TK, nunca GitHub).
# É este que o Agendador chama, pelo sincronizar-oculto.vbs (pra não piscar janela).
try { & (Join-Path $PSScriptRoot 'sincronizar-github.ps1') } catch {}
try { & (Join-Path $PSScriptRoot 'sincronizar-conversas.ps1') } catch {}
try { & (Join-Path $PSScriptRoot 'sincronizar-segredos.ps1') } catch {}
