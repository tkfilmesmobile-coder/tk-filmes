import subprocess,imageio_ffmpeg,concurrent.futures as cf
FF=imageio_ffmpeg.get_ffmpeg_exe()
VIVO="eq=saturation=0.88:contrast=1.1:brightness=-0.02:gamma=0.97,colorbalance=rs=-0.01:bs=0.015,vignette=PI/5,noise=alls=3:allf=t"
def run(a): subprocess.run([FF,"-v","error","-y"]+a,check=True)
# falas: última tentativa com a frase inteira, sem o "por uma vida sem violência" (que vai só no coro)
F=[("f00","IMG_2171.MOV",0.2,3.85),("f01","IMG_2161.MOV",0.06,3.85),("f02","IMG_2159.MOV",1.5,6.12),("f03","IMG_2163.MOV",28.29,31.9),
   ("f04","IMG_2154.MOV",0.4,3.8),("f05","IMG_2153.MOV",25.39,34.3),("f06","IMG_2152.MOV",40.52,44.4),("f07","IMG_2170.MOV",0.92,8.9)]
def fala(c):
    n,f,a,b=c
    run(["-ss",str(a),"-to",str(b),"-i","bruto/"+f,"-vf",f"scale=1080:1920:flags=lanczos,fps=30,{VIVO},format=yuv420p","-c:v","libx264","-crf","17","-preset","fast","-c:a","aac","-ar","48000","-ac","2",f"edicao/public/c/{n}.mp4"]); return n
with cf.ThreadPoolExecutor(4) as ex:
    for r in ex.map(fala,F): print("ok",r,flush=True)
