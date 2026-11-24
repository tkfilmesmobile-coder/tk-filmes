import sys,json,subprocess,pathlib,numpy as np,imageio_ffmpeg
from faster_whisper import WhisperModel
FF=imageio_ffmpeg.get_ffmpeg_exe(); m=WhisperModel("small",device="cpu",compute_type="int8"); out={}
for f in sorted(pathlib.Path("bruto").iterdir()):
    raw=subprocess.run([FF,"-v","error","-i",str(f),"-ac","1","-ar","16000","-f","s16le","-"],capture_output=True).stdout
    a=np.frombuffer(raw,np.int16).astype(np.float32)/32768
    segs,_=m.transcribe(a,language="pt",word_timestamps=True,vad_filter=False)
    W=[];print("==",f.name,flush=True)
    for s in segs:
        print(f"  {s.start:6.2f}-{s.end:6.2f} {s.text.strip()}",flush=True)
        W+=[[w.word.strip(),round(w.start,2),round(w.end,2)] for w in s.words]
    out[f.name]=W
json.dump(out,open("palavras.json","w",encoding="utf-8"),ensure_ascii=False)
