import json,subprocess,numpy as np,imageio_ffmpeg,sys
from faster_whisper import WhisperModel
FF=imageio_ffmpeg.get_ffmpeg_exe(); m=WhisperModel("medium",device="cpu",compute_type="int8")
try: d=json.load(open("palavras-medium.json",encoding="utf-8"))
except: d={}
for f in sys.argv[1:]:
    raw=subprocess.run([FF,"-v","error","-i","bruto/"+f,"-ac","1","-ar","16000","-f","s16le","-"],capture_output=True).stdout
    a=np.frombuffer(raw,np.int16).astype(np.float32)/32768
    s,_=m.transcribe(a,language="pt",word_timestamps=True,beam_size=5,condition_on_previous_text=False); W=[];print("==",f,round(len(a)/16000,2),flush=True)
    for x in s:
        print(f"  {x.start:6.2f}-{x.end:6.2f} {x.text.strip()}",flush=True); W+=[[w.word.strip(),round(w.start,2),round(w.end,2)] for w in x.words]
    d[f]=W
    json.dump(d,open("palavras-medium.json","w",encoding="utf-8"),ensure_ascii=False)
