"""Acervo do Instagram da Ary (@cabelosmagalhaes) pela Graph API: lista todas as publicações e baixa as imagens
(foto, slides de carrossel e a capa dos vídeos) em tamanho de trabalho, pra achar material que dê credibilidade à fala
(família, começo de carreira, bastidor antigo). Os arquivos ficam em midia/instagram/ (fora do GitHub).
Uso: python instagram_acervo.py [--baixar]
"""
import json, os, re, sys, urllib.parse, urllib.request
from collections import Counter

AQUI = os.path.dirname(os.path.abspath(__file__))
RAIZ = os.path.normpath(os.path.join(AQUI, "..", "..", "..", ".."))
OUT = os.path.join(AQUI, "midia", "instagram")
CHAVES = r"filh|mãe|mae |materni|marid|espos|famíl|famil|casament|início|inicio|comecei|começ|carreira|trajet|história|historia|anos atr|lembr|primeir|antig|sonho|profiss|gratid|amor da minha|menin"


def env():
    d = {}
    for l in open(os.path.join(RAIZ, ".env"), encoding="utf-8"):
        if "=" in l and not l.startswith("#"):
            k, v = l.strip().split("=", 1)
            d[k] = v.strip('"')
    return d


def main():
    os.makedirs(OUT, exist_ok=True)
    e = env()
    tok, uid = e["INSTAGRAM_ACCESS_TOKEN_CABELOSMAGALHAES"], e["INSTAGRAM_USER_ID_CABELOSMAGALHAES"]
    campos = "id,caption,media_type,media_url,thumbnail_url,timestamp,permalink,children{id,media_type,media_url,thumbnail_url}"
    url = f"https://graph.instagram.com/v21.0/{uid}/media?fields={urllib.parse.quote(campos)}&limit=100&access_token={tok}"
    todos = []
    while url:
        r = json.load(urllib.request.urlopen(url, timeout=60))
        todos += r.get("data", [])
        url = r.get("paging", {}).get("next")
    json.dump(todos, open(os.path.join(OUT, "lista.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    print(len(todos), "publicações", dict(Counter(x["media_type"] for x in todos)), "de", todos[-1]["timestamp"][:10], "a", todos[0]["timestamp"][:10])
    for x in todos:
        c = (x.get("caption") or "").replace("\n", " ")
        if re.search(CHAVES, c, re.I):
            print(x["timestamp"][:10], x["media_type"][:5], x["id"], "|", c[:160])
    if "--baixar" in sys.argv:
        from PIL import Image
        import io
        n = 0
        for x in todos:
            itens = x.get("children", {}).get("data") or [x]
            for k, it in enumerate(itens):
                u = it.get("thumbnail_url") if it.get("media_type") == "VIDEO" else it.get("media_url")
                if not u:
                    continue
                dst = os.path.join(OUT, f"{x['timestamp'][:10]}_{x['id']}_{k:02d}{'_v' if it.get('media_type') == 'VIDEO' else ''}.jpg")
                if os.path.exists(dst):
                    continue
                try:
                    im = Image.open(io.BytesIO(urllib.request.urlopen(u, timeout=60).read())).convert("RGB")
                    im.thumbnail((1080, 1350)); im.save(dst, quality=88); n += 1
                except Exception as ex:
                    print("falhou", x["id"], ex)
        print("baixadas", n)


if __name__ == "__main__":
    main()
