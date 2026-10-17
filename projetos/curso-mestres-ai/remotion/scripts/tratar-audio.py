# Tratamento de voz (entrada: a voz já isolada pelo Demucs): graves fora, redução de ruído (perfil do ambiente), portão suave,
# compressão leve, loudness -16 LUFS e limitador em -1,5 dB.
# Uso: python scripts/tratar-audio.py <entrada.wav> <saida.wav> "a-b,c-d" (trechos só com ruído)
#      [alvo LUFS] ["a-b,..." trechos que entram no vídeo: o volume é medido só neles]
import sys
import numpy as np, soundfile as sf, noisereduce as nr, pyloudnorm as pyln
from pedalboard import Pedalboard, HighpassFilter, NoiseGate, Compressor, Limiter, Gain

entrada, saida, ruido = sys.argv[1], sys.argv[2], sys.argv[3]
alvo = float(sys.argv[4]) if len(sys.argv) > 4 else -16.0
usados = sys.argv[5] if len(sys.argv) > 5 else None
a, sr = sf.read(entrada, dtype="float32")
voz = a.mean(axis=1) if a.ndim > 1 else a  # canais idênticos: um microfone só

# 1. graves (ronco, vento)
voz = Pedalboard([HighpassFilter(cutoff_frequency_hz=80)])(voz, sr)

# 2. redução de ruído com perfil tirado de trechos sem fala
perfil = np.concatenate([voz[int(float(s) * sr):int(float(e) * sr)]
                         for s, e in (f.split("-") for f in ruido.split(","))])
voz = nr.reduce_noise(y=voz, sr=sr, y_noise=perfil, stationary=True,
                      prop_decrease=0.6, n_fft=2048, time_mask_smooth_ms=64,
                      freq_mask_smooth_hz=500)

# 3. portão suave (abaixa ~10 dB entre frases), 4. compressão leve
voz = Pedalboard([
    NoiseGate(threshold_db=-48, ratio=2.5, attack_ms=2, release_ms=180),
    Compressor(threshold_db=-24, ratio=2.5, attack_ms=8, release_ms=120),
])(voz, sr)

# 5. loudness -16 LUFS e limitador
med = pyln.Meter(sr)
def medir(x):
    # medido como estéreo (a voz sai igual nos dois canais: +3 dB em relação ao mono)
    if usados:
        x = np.concatenate([x[int(float(a) * sr):int(float(b) * sr)]
                            for a, b in (f.split("-") for f in usados.split(","))])
    return med.integrated_loudness(np.stack([x, x], axis=1))
# o Limiter sobe a saída de volta pra 0 dBFS; o -1,5 dB depois dele fixa o pico em -1,5
ganho = alvo - medir(voz)
voz = Pedalboard([Gain(gain_db=ganho), Limiter(threshold_db=-1.5, release_ms=80), Gain(gain_db=-1.5)])(voz, sr)
# o limitador ainda sobe o nível: correção final só pra baixo (não distorce)
ajuste = min(0.0, alvo - medir(voz))
voz = voz * (10 ** (ajuste / 20))
print(f"ajuste final {ajuste:+.1f} dB")
print(f"ganho {ganho:+.1f} dB, final {medir(voz):.1f} LUFS, pico {20*np.log10(np.abs(voz).max()):.1f} dBFS")
sf.write(saida, np.stack([voz, voz], axis=1), sr, subtype="PCM_24")
