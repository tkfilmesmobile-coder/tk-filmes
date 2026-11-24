import json,subprocess,numpy as np,imageio_ffmpeg
from faster_whisper import WhisperModel
FF=imageio_ffmpeg.get_ffmpeg_exe(); m=WhisperModel("medium",device="cpu",compute_type="int8"); out={}
for f in ["tamara.mov","IMG_2170.MOV"]:
    raw=subprocess.run([FF,"-v","error","-i","bruto/"+f,"-ac","1","-ar","16000","-f","s16le","-"],capture_output=True).stdout
    a=np.frombuffer(raw,np.int16).astype(np.float32)/32768
    s,_=m.transcribe(a,language="pt",word_timestamps=True,beam_size=5); W=[];print("==",f,flush=True)
    for x in s:
        print(f"  {x.start:6.2f}-{x.end:6.2f} {x.text.strip()}",flush=True); W+=[[w.word.strip(),round(w.start,2),round(w.end,2)] for w in x.words]
    out[f]=W
json.dump(out,open("palavras-medium.json","w",encoding="utf-8"),ensure_ascii=False)
