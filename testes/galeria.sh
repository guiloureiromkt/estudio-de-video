#!/usr/bin/env bash
# Tira uma captura de cada molde do estúdio para docs/galeria/<id>.png, um de cada vez.
# Uso: bash testes/galeria.sh   (precisa do npm ci já feito em estudio/)
set -euo pipefail
cd "$(dirname "$0")/../estudio"
SAIDA=../docs/galeria
mkdir -p "$SAIDA"
# o quadro de cada molde: um momento em que o estilo aparece inteiro (30 quadros = 1 segundo)
declare -A QUADRO=(
  [CaseCard-4x5]=110 [CaseCard-1x1]=110 [Explainer-9x16]=100 [FakeUI-9x16]=230
  [SplitScreen-9x16]=75 [Animacao-9x16]=70 [ReelMisto-9x16]=75 [ReelMisto-4x5]=75
  [Capa-9x16]=0 [Papercraft-9x16]=85
)
# com teto de memória onde existir systemd (Linux); nos outros sistemas roda direto
TETO=()
command -v systemd-run >/dev/null && TETO=(systemd-run --user --scope -q -p MemoryMax=3G)
# o FakeUI mostra, dentro do app falso, um quadro do Explicador: gera esse quadro antes, se faltar
[ -f public/demo/explainer-frame.jpg ] || "${TETO[@]}" npx remotion still src/index.ts Explainer-9x16 public/demo/explainer-frame.jpg --frame=100 --image-format=jpeg --log=error
IDS=$(npx remotion compositions src/index.ts -q 2>/dev/null | tr ' ' '\n' | grep -E '^[A-Za-z]+-[0-9x]+$')
N=0
for id in $IDS; do
  q=${QUADRO[$id]:-30}
  "${TETO[@]}" npx remotion still src/index.ts "$id" "$SAIDA/$id.png" --frame="$q" --log=error
  N=$((N+1))
done
command -v exiftool >/dev/null && exiftool -q -overwrite_original -all= "$SAIDA"/*.png || true
echo "galeria: $N capturas em docs/galeria/"
