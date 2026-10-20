"""Gera um PDF de documento da TK no papel timbrado (regra da Talyta, 20/10/2026: todo documento sai no timbrado).

uso: python sistema/scripts/timbrado.py <documento.html> [saida.pdf]

O HTML traz só o conteúdo, com fundo transparente, fonte Open Sans (a do timbrado) e @page com margens
que deixam livres o cabeçalho e o rodapé, por exemplo:
    @page { size: A4; margin: 47mm 20mm 24mm 20mm; }
O script imprime o HTML pelo Chrome e põe o papel timbrado da marca (_contexto/marca/papel-timbrado.pdf)
por baixo de cada página.
"""
import pathlib, subprocess, sys, tempfile
import fitz  # PyMuPDF

RAIZ = pathlib.Path(__file__).resolve().parents[2]
TIMBRADO = RAIZ / "_contexto" / "marca" / "papel-timbrado.pdf"
CHROME = r"C:\Program Files\Google\Chrome\Application\chrome.exe"


def main():
    html = pathlib.Path(sys.argv[1]).resolve()
    saida = pathlib.Path(sys.argv[2]).resolve() if len(sys.argv) > 2 else html.with_suffix(".pdf")
    with tempfile.TemporaryDirectory() as tmp:
        conteudo = pathlib.Path(tmp) / "conteudo.pdf"
        subprocess.run([CHROME, "--headless=new", "--no-pdf-header-footer", "--virtual-time-budget=8000",
                        f"--print-to-pdf={conteudo}", html.as_uri()], check=True, capture_output=True)
        base, c, out = fitz.open(TIMBRADO), fitz.open(conteudo), fitz.open()
        for i in range(len(c)):
            p = out.new_page(width=base[0].rect.width, height=base[0].rect.height)
            p.show_pdf_page(p.rect, base, 0)
            p.show_pdf_page(p.rect, c, i)
        out.save(saida)
        n = len(c)
        for d in (base, c, out):
            d.close()  # no Windows o PDF aberto trava a limpeza da pasta temporária
    print(f"ok {saida} ({n} página(s))")


if __name__ == "__main__":
    main()
