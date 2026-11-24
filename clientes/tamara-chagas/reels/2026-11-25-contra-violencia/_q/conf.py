import subprocess,numpy as np,imageio_ffmpeg
from faster_whisper import WhisperModel
FF=imageio_ffmpeg.get_ffmpeg_exe(); m=WhisperModel("medium",device="cpu",compute_type="int8")
for f,a,b in [("IMG_2159.MOV",1.3,6.2),("IMG_2163.MOV",27.3,31.9),("IMG_2152.MOV",40.4,44.4),("IMG_2161.MOV",0,3.9),("IMG_2153.MOV",24.9,28.7),("IMG_2152.MOV",33.2,36.9),("IMG_2153.MOV",28.7,34.3)]:
    raw=subprocess.run([FF,"-v","error","-ss",str(a),"-to",str(b),"-i","bruto/"+f,"-ac","1","-ar","16000","-f","s16le","-"],capture_output=True).stdout
    x=np.frombuffer(raw,np.int16).astype(np.float32)/32768
    s,_=m.transcribe(x,language="pt",beam_size=5)
    print(f,a,"|"," ".join(t.text.strip() for t in s),flush=True)
