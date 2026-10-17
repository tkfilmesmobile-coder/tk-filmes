"""Coleta as métricas do @dra.camillawanderley pela Graph API (Instagram Login) e grava em JSON.
Uso: python clientes/camilla-wanderley/relatorios/dados/coleta.py"""
import json, urllib.request, urllib.parse, os, datetime
RAIZ = os.path.dirname(os.path.abspath(__file__))
tok = [l.split('=', 1)[1].strip() for l in open('.env', encoding='utf-8') if l.startswith('INSTAGRAM_ACCESS_TOKEN_DRA_CAMILLAWANDERLEY=')][0]
B = 'https://graph.instagram.com/v21.0'

import time

def abre(url):
    # a rede daqui oscila: tenta de novo antes de desistir
    for t in range(6):
        try:
            return json.load(urllib.request.urlopen(url, timeout=30))
        except urllib.error.HTTPError:
            raise
        except Exception:
            time.sleep(3 + 3 * t)
    return json.load(urllib.request.urlopen(url, timeout=30))

def get(path, **p):
    p['access_token'] = tok
    url = f"{B}/{path}?{urllib.parse.urlencode(p)}" if not path.startswith('http') else path
    try:
        return abre(url)
    except urllib.error.HTTPError as e:
        return {'erro': json.loads(e.read().decode())}

conta = get('me', fields='id,username,followers_count,follows_count,media_count,account_type')
midia = []
r = get('me/media', fields='id,timestamp,media_type,media_product_type,like_count,comments_count,permalink,caption', limit=50)
while True:
    midia += r.get('data', [])
    nxt = r.get('paging', {}).get('next')
    if not nxt:
        break
    r = abre(nxt)
for m in midia:
    if m.get('media_product_type') == 'REELS':
        mets = 'reach,saved,shares,views,total_interactions,ig_reels_avg_watch_time,ig_reels_video_view_total_time'
    else:
        mets = 'reach,saved,shares,views,total_interactions'
    ins = get(f"{m['id']}/insights", metric=mets)
    if 'erro' in ins:  # tenta métricas mínimas
        ins = get(f"{m['id']}/insights", metric='reach,saved,shares,total_interactions')
    m['insights'] = {d['name']: d['values'][0]['value'] for d in ins.get('data', [])} if 'data' in ins else ins
# insights da conta (janelas de até 30 dias)
hoje = datetime.date.today()
conta_ins = {}
for nome, kw in {
    'reach': dict(metric='reach', period='day', metric_type='total_value'),
    'views': dict(metric='views', period='day', metric_type='total_value'),
    'accounts_engaged': dict(metric='accounts_engaged', period='day', metric_type='total_value'),
    'total_interactions': dict(metric='total_interactions', period='day', metric_type='total_value'),
    'follower_count': dict(metric='follower_count', period='day'),
}.items():
    serie = []
    for k in range(4):  # 4 janelas de 28 dias pra trás
        ate = hoje - datetime.timedelta(days=28 * k)
        de = ate - datetime.timedelta(days=28)
        r = get('me/insights', since=int(datetime.datetime.combine(de, datetime.time()).timestamp()), until=int(datetime.datetime.combine(ate, datetime.time()).timestamp()), **kw)
        serie.append({'de': str(de), 'ate': str(ate), 'r': r})
    conta_ins[nome] = serie
json.dump({'coletado_em': str(datetime.datetime.now()), 'conta': conta, 'midia': midia, 'conta_insights': conta_ins},
          open(os.path.join(RAIZ, f'coleta-{hoje}.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print(conta)
print(len(midia), 'posts; exemplo de insights:', midia[0]['insights'] if midia else None)
for n, s in conta_ins.items():
    print(n, [('erro' if 'erro' in x['r'] else 'ok') for x in s], str(s[0]['r'])[:200])
