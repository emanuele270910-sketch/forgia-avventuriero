# -*- coding: utf-8 -*-
"""
build.py — Genera un UNICO file HTML autosufficiente da condividere.

Problema risolto:
  index.html carica 9 file separati dalla cartella src/ con <script src="...">.
  Se invii solo index.html (o un collegamento) ad altri, quei file non
  viaggiano con esso: sul telefono / altro computer la pagina resta vuota.

Soluzione:
  Questo script legge index.html e "incolla" dentro tutto il codice dei file
  locali, producendo un singolo file `Forgia-dell-Avventuriero.html` che
  funziona ovunque, basta inviarlo. (Tailwind e i font restano via CDN:
  servono solo durante la prima apertura con connessione a Internet.)

Uso:
  python build.py
"""
import re
import pathlib

BASE = pathlib.Path(__file__).resolve().parent
SRC_HTML = BASE / "index.html"
OUT_HTML = BASE / "Forgia-dell-Avventuriero.html"

# Solo gli script LOCALI (terminano in .js). Il CDN di Tailwind
# (https://cdn.tailwindcss.com) non termina in .js e quindi resta invariato.
LOCAL_SCRIPT = re.compile(r'[ \t]*<script src="([^"]+\.js)"></script>\n?')


def inline(match):
    rel = match.group(1)
    path = BASE / rel
    code = path.read_text(encoding="utf-8")
    # Evita che un eventuale "</script>" dentro il codice chiuda il blocco.
    code = code.replace("</script", "<\\/script")
    return (
        "  <script>\n"
        "  /* ===== " + rel + " ===== */\n"
        + code
        + "\n  </script>\n"
    )


def main():
    html = SRC_HTML.read_text(encoding="utf-8")
    count = len(LOCAL_SCRIPT.findall(html))
    bundled = LOCAL_SCRIPT.sub(inline, html)

    # Sanity check: non deve restare nessun riferimento ai file locali.
    leftovers = re.findall(r'src="src/[^"]+"', bundled)
    if leftovers:
        raise SystemExit("ERRORE: riferimenti non incorporati: " + ", ".join(leftovers))

    OUT_HTML.write_text(bundled, encoding="utf-8")
    kb = len(bundled.encode("utf-8")) / 1024
    print("OK: incorporati %d script locali." % count)
    print("Creato: %s (%.0f KB)" % (OUT_HTML.name, kb))
    print("Condividi QUEL file: funziona da solo, senza la cartella src/.")


if __name__ == "__main__":
    main()
