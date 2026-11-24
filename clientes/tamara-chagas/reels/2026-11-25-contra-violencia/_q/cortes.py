import subprocess,imageio_ffmpeg,concurrent.futures as cf
FF=imageio_ffmpeg.get_ffmpeg_exe()
G="scale=1080:1920:flags=lanczos,fps=30,eq=saturation=0.55:contrast=1.15:brightness=-0.04:gamma=0.95,colorbalance=rs=-0.02:bs=0.03:rh=0.01,vignette=PI/4.2,noise=alls=5:allf=t,format=yuv420p"
C=[("m_a","67c58a33d1d54fa09a9d76bc62555184.mov",6.4,9.6),("m_b","d9edb505f3874ae6b75567ecc5bebb62.mov",0.2,4.35),("m_c","ea56ebe33a5f4298bb3b632506c463b7.mov",0.2,4.45),
 ("f01","IMG_2152.MOV",33.25,36.95),("f02","IMG_2161.MOV",0.0,3.88),("f03","IMG_2159.MOV",1.38,6.10),("f04","IMG_2163.MOV",27.38,31.95),
 ("f05","IMG_2154.MOV",0.0,3.80),("f06","IMG_2153.MOV",24.95,28.66),("f07","IMG_2153.MOV",28.76,34.30),("f08","IMG_2152.MOV",40.42,44.42),
 ("e1","IMG_2154.MOV",4.04,5.72),("e2","IMG_2159.MOV",6.10,8.62),("e3","IMG_2163.MOV",32.14,33.78),("e4","IMG_2153.MOV",34.40,37.20),("e5","IMG_2152.MOV",44.48,46.75),("f09","IMG_2170.MOV",0.5,8.85),("e6","IMG_2170.MOV",13.8,16.7)]
def run(c):
    n,f,a,b=c
    subprocess.run([FF,"-v","error","-y","-ss",str(a),"-to",str(b),"-i","bruto/"+f,"-vf",G,"-c:v","libx264","-crf","17","-preset","fast","-c:a","aac","-ar","48000","-ac","2",f"edicao/public/c/{n}.mp4"],check=True)
    return n
with cf.ThreadPoolExecutor(4) as ex:
    for n in ex.map(run,C): print("ok",n,flush=True)
