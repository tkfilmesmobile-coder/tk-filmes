import json,subprocess,numpy as np,imageio_ffmpeg
from faster_whisper import WhisperModel
FF=imageio_ffmpeg.get_ffmpeg_exe(); m=WhisperModel("small",device="cpu",compute_type="int8"); d=json.load(open("palavras.json",encoding="utf-8"))
for f in ["tamara.mov","IMG_2170.MOV"]:
    raw=subprocess.run([FF,"-v","error","-i","bruto/"+f,"-ac","1","-ar","16000","-f","s16le","-"],capture_output=True).stdout
    a=np.frombuffer(raw,np.int16).astype(np.float32)/32768
    s,_=m.transcribe(a,language="pt",word_timestamps=True); W=[];print("==",f,flush=True)
    for x in s:
        print(f"  {x.start:6.2f}-{x.end:6.2f} {x.text.strip()}",flush=True); W+=[[w.word.strip(),round(w.start,2),round(w.end,2)] for w in x.words]
    d[f]=W
json.dump(d,open("palavras.json","w",encoding="utf-8"),ensure_ascii=False)
