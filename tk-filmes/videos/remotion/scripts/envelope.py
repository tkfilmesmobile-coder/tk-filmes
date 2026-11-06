"""Mostra a energia do áudio (janelas de 20 ms) num intervalo do bruto, pra achar o silêncio exato entre palavras.
uso: python scripts/envelope.py <video> <t0> <t1>
"""
import sys, subprocess, wave, os, tempfile
import numpy as np
FF = os.environ.get("FFMPEG", r"C:\Users\kumyt\AppData\Local\CapCut\Apps\9.6.0.4097\ffmpeg.exe")
v, t0, t1 = sys.argv[1], float(sys.argv[2]), float(sys.argv[3])
w = os.path.join(tempfile.gettempdir(), "tk-envelope.wav")
subprocess.run([FF, "-v", "error", "-y", "-ss", str(t0), "-t", str(t1 - t0), "-i", v, "-ac", "1", "-ar", "16000", w], check=True)
a = np.frombuffer(wave.open(w).readframes(10**9), dtype=np.int16).astype(np.float32)
J = 320; r = np.sqrt((a[: len(a) // J * J].reshape(-1, J) ** 2).mean(1)); m = r.max() or 1
print(" ".join(f"{t0 + i * 0.02:.2f}:{int(9 * x / m)}" for i, x in enumerate(r)))
