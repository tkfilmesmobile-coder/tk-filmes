"""Aplica o color grade fixo da Camilla (look CAMILLA) só nos trechos usados em cortes.json, 4 de cada vez.
Trechos do mesmo clipe com menos de 10 s de distância viram uma janela só. Cada janela vira um arquivo
grade/<IMG>_<início>.mp4 (sem som) e o índice grade/janelas.json, que o montar.py usa pra apontar o vídeo.
Cada janela roda num processo próprio (o pool do multiprocessing travava no detector de rosto do OpenCV)."""
import json, os, subprocess, sys, time

AQUI = os.path.dirname(os.path.abspath(__file__))
PV = os.path.normpath(os.path.join(AQUI, "..", "perfil-video"))
SDR = os.path.join(PV, "public", "midia", "2026-10-23", "sdr")
GRADE = os.path.join(PV, "public", "midia", "2026-10-23", "grade")
SCRIPT = os.path.join(PV, "scripts", "grade.py")


def janelas(cfg):
    por_arq = {}
    for v in cfg["videos"]:
        for t in v["trechos"]:
            por_arq.setdefault(t["arq"], []).append((max(0.0, t["de"] - 1.0), t["ate"] + 1.0))
    out = {}
    for arq, rs in por_arq.items():
        rs.sort()
        js = [list(rs[0])]
        for a, b in rs[1:]:
            if a - js[-1][1] < 10:
                js[-1][1] = max(js[-1][1], b)
            else:
                js.append([a, b])
        out[arq] = [[round(a, 2), round(b, 2), f"{arq}_{int(a):03d}.mp4"] for a, b in js]
    return out


if __name__ == "__main__":
    os.makedirs(GRADE, exist_ok=True)
    cfg = json.load(open(os.path.join(AQUI, "cortes.json"), encoding="utf-8"))
    js = janelas(cfg)
    json.dump(js, open(os.path.join(GRADE, "janelas.json"), "w", encoding="utf-8"), indent=1)
    refazer = "--refazer" in sys.argv
    falta = [(arq, a, b, nome) for arq, l in js.items() for a, b, nome in l if refazer or not os.path.exists(os.path.join(GRADE, nome))]
    falta.sort(key=lambda x: -(x[2] - x[1]))  # longas primeiro
    print(f"{len(falta)} janelas, {sum(b - a for _, a, b, _ in falta):.0f} s de vídeo", flush=True)
    rodando = {}
    while falta or rodando:
        while falta and len(rodando) < 4:
            arq, a, b, nome = falta.pop(0)
            rodando[nome] = (subprocess.Popen([sys.executable, SCRIPT, "clipe", "CAMILLA", os.path.join(SDR, arq + ".mp4"),
                                               os.path.join(GRADE, nome), str(a), str(b)], stdout=subprocess.DEVNULL,
                                              stderr=subprocess.DEVNULL), time.time())
        for nome, (p, t0) in list(rodando.items()):
            if p.poll() is not None:
                print(f"{nome} {'ok' if p.returncode == 0 else 'FALHOU'} {time.time() - t0:.0f}s", flush=True)
                del rodando[nome]
        time.sleep(2)
    print("fim", flush=True)
