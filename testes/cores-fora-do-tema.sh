#!/usr/bin/env bash
# Confere que nenhum molde tem cor da marca escrita dentro dele: toda cor com tom vem de src/tema.ts.
# Passa: cinza puro (#111, #FFFFFF, rgba(0,0,0,.3)), linha de comentário, e linha marcada "cor-da-referencia"
# (o visual fiel ao criador de referência, como a skin "tudor" do FakeUI, que existe de propósito).
# Uso: bash testes/cores-fora-do-tema.sh             (o estúdio do plugin)
#      bash testes/cores-fora-do-tema.sh ./estudio   (a cópia do estúdio no seu projeto)
PASTA=${1:-"$(dirname "$0")/../estudio"}
cd "$PASTA/src" || { echo "FALHOU: não achei $PASTA/src"; exit 1; }
python3 - <<'PY'
import re, pathlib, sys
ruins = []
for f in sorted(pathlib.Path(".").rglob("*.ts*")):
    if f.name == "tema.ts":
        continue
    for n, linha in enumerate(f.read_text().split("\n"), 1):
        if "cor-da-referencia" in linha or linha.strip().startswith("//"):
            continue
        codigo = re.sub(r"\s//\s.*$", "", linha)
        cores = []
        for h in re.findall(r"#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})\b", codigo):
            h = "".join(c * 2 for c in h) if len(h) == 3 else h
            cores.append(tuple(int(h[i:i + 2], 16) for i in (0, 2, 4)))
        for r, g, b in re.findall(r"rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)", codigo):
            cores.append((int(r), int(g), int(b)))
        if any(not (c[0] == c[1] == c[2]) for c in cores):
            ruins.append(f"{f}:{n}: {linha.strip()[:110]}")
if ruins:
    print("FALHOU: cor com tom escrita fora do tema (troque por MARCA/ESCURO/CLARO/MOLDES/RGB, ou marque cor-da-referencia):")
    print("\n".join(ruins))
    sys.exit(1)
print("cores: nenhuma cor de marca fora do tema.ts")
PY
