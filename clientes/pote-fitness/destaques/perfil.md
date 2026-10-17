# @potefitness · bio e destaques

A API do Instagram não muda bio nem cria destaque: aplicar no app (Editar perfil).
Base: brand book, seção 07 (biografia-base e estrutura de destaques).

## Perfil
- **Nome** (entra na busca): `Pote Fitness | Salada de Frutas`
- **Bio** (128 de 150 caracteres):
  ```
  Frutas frescas, feitas do seu jeito. 🍓
  Sabor e carinho em cada pedido.
  📍 União dos Palmares · 8h30 às 17h30
  👇 Peça pelo WhatsApp
  ```
- **Link:** `https://wa.me/5582991202604?text=Oi!%20Quero%20montar%20meu%20pote%20%F0%9F%8D%93`
  (abre o WhatsApp com a mensagem "Oi! Quero montar meu pote 🍓" já escrita)
- **Foto de perfil:** `../marca/logo-reduzida-perfil.png`
- **Botão de contato:** ligar o WhatsApp no perfil comercial (Editar perfil → Opções de contato).

## Destaques (nesta ordem) · 32 stories publicados em 2026-10-11
| destaque | capa | stories (`imagens/`) |
|---|---|---|
| Cardápio | `capa-cardapio.jpg` | `cardapio-01` a `06` (tabela, 3 tamanhos, frutas, complementos) |
| Como pedir | `capa-como-pedir.jpg` | `como-pedir-01` a `05` (resumo + passo a passo) |
| Horários | `capa-horarios.jpg` | `horarios-01` a `05` (8h30, 17h30, encomenda) |
| Entregas | `capa-entregas.jpg` | `entregas-01` a `05` (sem bairro/taxa: "pergunta no WhatsApp") |
| Clientes | `capa-clientes.jpg` | `clientes-01` a `05` (convite pra marcar; sem depoimento inventado) |
| Bastidores | `capa-bastidores.jpg` | `bastidores-01` a `06` (fotos de banco até ter as reais) |

A API não cria destaque. No app: perfil → "+" Novo destaque → selecionar os stories daquele grupo
(eles saíram em sequência, na ordem da tabela) → nome → Editar capa → escolher a capa no rolo da câmera.
Story some do perfil em 24h, mas fica no Arquivo: dá pra montar os destaques depois também.
Gerador: `gerar.py` · publicação: `publicar-stories.py` (registro em `publicados.log`).
