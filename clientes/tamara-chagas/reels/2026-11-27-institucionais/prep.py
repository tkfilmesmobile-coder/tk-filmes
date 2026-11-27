"""Curadoria: cortes no silêncio (fatias de 50 ms) só entre frases, palavras corrigidas pra legenda -> edicao/src/dados.json"""
import json,wave,numpy as np
def rms(v):
    w=wave.open(f"_q/{v}.wav");a=np.frombuffer(w.readframes(w.getnframes()),np.int16).astype(np.float32)/32768
    n=len(a)//800;x=a[:n*800].reshape(n,800);return 20*np.log10(np.sqrt((x**2).mean(1))+1e-9)  # 50 ms
def borda(db,t,dir,lim):
    i=int(t/0.05)
    while 0<=i<len(db) and db[i]>-42 and abs(i*0.05-t)<lim: i+=dir
    return i*0.05+(0.08 if dir>0 else -0.04)
def fix(W,trocas):
    txt=[w[2].strip() for w in W]
    for velho,novo in trocas:
        n=len(velho)
        for i in range(len(txt)-n+1):
            if [t.lower() for t in txt[i:i+n]]==velho:
                W[i]=[W[i][0],W[i+n-1][1],novo,1];[W.__setitem__(j,None) for j in range(i+1,i+n)];txt[i]=novo
                for j in range(i+1,i+n): txt[j]="\0"
    return [w for w in W if w]
out={}
for v,clips,trocas in [
 ("v1",[(0,22.20)],[(["inicia","mais"],"Iniciamos às")]),
 ("v2",[(0,5.68),(6.42,8.52),(9.06,16.04),(17.36,22.34),(23.92,37.50),(38.10,48.82),(53.86,68.90),(69.54,101.34),(102.14,132.90)],
  [(["inchada,"],"enxada,"),(["exames"],"exames,"),(["lá","os"],"laudos"),(["quiniz,"],"CNIS,"),(["formado","a","teste","média,"],"formato Atestmed,"),(["ateste","médio."],"Atestmed.")])]:
    db=rms(v);W=fix([list(w) for w in json.load(open(f"{v}-palavras.json",encoding="utf-8"))],trocas)
    C=[];T=0
    for k,(a,b) in enumerate(clips):
        prev=clips[k-1][1] if k else 0; nxt=clips[k+1][0] if k+1<len(clips) else len(db)*0.05
        ia=max(borda(db,a,-1,0.4),(prev+a)/2,0); ib=min(borda(db,b,1,0.5),(b+nxt)/2,len(db)*0.05-0.02)
        ws=[[round(w[0]-ia+T,3),round(w[1]-ia+T,3),w[2].strip()] for w in W if w[0]>=ia-0.05 and w[1]<=ib+0.3]
        C.append({"de":round(ia,3),"ate":round(ib,3),"ini":round(T,3),"palavras":ws});T+=ib-ia
    out[v]={"clips":C,"dur":round(T,3)}
    print(v,round(T,2),[(c["de"],c["ate"]) for c in C])
json.dump(out,open("edicao/src/dados.json","w",encoding="utf-8"),ensure_ascii=False,indent=0)
