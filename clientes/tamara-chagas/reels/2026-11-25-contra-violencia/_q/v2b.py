import subprocess,imageio_ffmpeg,concurrent.futures as cf
FF=imageio_ffmpeg.get_ffmpeg_exe()
VIVO="eq=saturation=0.88:contrast=1.1:brightness=-0.02:gamma=0.97,colorbalance=rs=-0.01:bs=0.015,vignette=PI/5,noise=alls=3:allf=t"
def run(a): subprocess.run([FF,"-v","error","-y"]+a,check=True)
# falas: última tentativa com a frase inteira, sem o "por uma vida sem violência" (que vai só no coro)
F=[("f00","IMG_2171.MOV",0.0,3.85),("f01","IMG_2161.MOV",0.0,3.85),("f02","IMG_2159.MOV",1.52,6.12),("f03","IMG_2163.MOV",27.42,31.9),
   ("f04","IMG_2154.MOV",0.0,3.8),("f05","IMG_2153.MOV",24.98,34.3),("f06","IMG_2152.MOV",40.45,44.4),("f07","IMG_2170.MOV",0.65,8.9)]
def fala(c):
    n,f,a,b=c
    run(["-ss",str(a),"-to",str(b),"-i","bruto/"+f,"-vf",f"scale=1080:1920:flags=lanczos,fps=30,{VIVO},format=yuv420p","-c:v","libx264","-crf","17","-preset","fast","-c:a","aac","-ar","48000","-ac","2",f"edicao/public/c/{n}.mp4"]); return n
# coro: as seis juntas, cada frase ajustada pra 1,6 s; 0,35 s antes e 1,3 s depois olhando pra câmera
T,PRE,POS=1.6,0.35,1.3
C=[("IMG_2163.MOV",31.98,33.455,(272,265,227)),("IMG_2153.MOV",35.06,36.735,(236,245,242)),("IMG_2152.MOV",44.68,46.465,(286,257,198)),
   ("IMG_2159.MOV",6.78,8.255,(262,265,203)),("IMG_2154.MOV",4.28,5.655,(268,254,213)),("IMG_2170.MOV",14.15,16.0,(287,277,257))]
def celula(i):
    f,s,e,(cx,cy,w)=C[i]; d=e-s; k=max(1.0,235/w)   # rosto com ~235 px de largura na célula (medidas feitas em 540x960)
    W,H=int(540*k/2)*2, int(960*k/2)*2
    x=max(0,min(W-540,int(cx*k-270))); y=max(0,min(H-640,int(cy*k-250)))
    v=(f"[0:v]trim={s-PRE}:{s},setpts=PTS-STARTPTS[a];[0:v]trim={s}:{e},setpts=(PTS-STARTPTS)*{T/d}[b];"
       f"[0:v]trim={e}:{e+POS},setpts=PTS-STARTPTS[c];[a][b][c]concat=n=3:v=1:a=0,fps=30,tpad=stop_mode=clone:stop_duration=2,"
       f"trim=0:{PRE+T+POS},scale={W}:{H}:flags=lanczos,crop=540:640:{x}:{y},{VIVO},format=yuv420p[v];"
       f"[0:a]atrim={s-0.04}:{e+0.06},asetpts=PTS-STARTPTS,atempo={d/T},adelay={int((PRE-0.04)*1000)}:all=1,apad,atrim=0:{PRE+T+POS}[au]")
    run(["-i","bruto/"+f,"-filter_complex",v,"-map","[v]","-map","[au]","-c:v","libx264","-crf","17","-c:a","pcm_s16le","-ar","48000","-ac","2",f"_q/coro_{i}.mkv"]); return i
with cf.ThreadPoolExecutor(4) as ex:
    for r in ex.map(celula,range(6)): print("ok coro",r,flush=True)
ins=sum([["-i",f"_q/coro_{i}.mkv"] for i in range(6)],[])
lay="0_0|540_0|0_640|540_640|0_1280|540_1280"
run(ins+["-filter_complex","".join(f"[{i}:v]" for i in range(6))+f"xstack=inputs=6:layout={lay}[v];"+"".join(f"[{i}:a]" for i in range(6))+"amix=inputs=6:normalize=0,volume=0.55,alimiter=limit=0.9[a]",
    "-map","[v]","-map","[a]","-c:v","libx264","-crf","17","-c:a","aac","-ar","48000","edicao/public/c/coro.mp4"])
print("ok coro.mp4")
