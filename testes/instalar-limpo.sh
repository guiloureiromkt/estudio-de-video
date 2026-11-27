#!/usr/bin/env bash
# Instala o plugin num usuário vazio (HOME temporário), como se fosse a máquina de quem vai usar.
# Uso: bash testes/instalar-limpo.sh                         (instala desta pasta)
#      bash testes/instalar-limpo.sh <dono/repo>              (instala do GitHub)
#      SEM_ACESSO=1 bash testes/instalar-limpo.sh <dono/repo> (sem chave nem login: passa se o repositório é público, falha se é privado)
#
# Atenção: trocar o HOME não esconde a chave SSH da máquina. O ssh lê a pasta ~/.ssh do usuário
# real, não a do HOME. Por isso, na máquina de quem mantém o pacote, o modo do GitHub passa mesmo
# sem login. Para testar o acesso de verdade, use SEM_ACESSO=1, que bloqueia a chave e o agente SSH.
set -uo pipefail
cd "$(dirname "$0")/.."
FONTE=${1:-$PWD}
CASA=$(mktemp -d)
mkdir -p "$CASA/.claude"
if [ "${SEM_ACESSO:-}" = 1 ]; then
  export GIT_TERMINAL_PROMPT=0 SSH_AUTH_SOCK=
  export GIT_SSH_COMMAND="ssh -F /dev/null -o IdentityAgent=none -o IdentitiesOnly=yes -o IdentityFile=/dev/null -o UserKnownHostsFile=/dev/null -o StrictHostKeyChecking=no -o BatchMode=yes"
fi
# sem login do Claude no HOME vazio: o comando de plugin não precisa de conta para instalar
HOME="$CASA" claude plugin marketplace add "$FONTE" 2>&1 | tail -2
HOME="$CASA" claude plugin install video@estudio-de-video 2>&1 | tail -2
RAIZ=$(find "$CASA/.claude/plugins" -path '*/skills/estilos/SKILL.md' 2>/dev/null | head -1)
if [ -z "$RAIZ" ]; then echo "FALHOU: o plugin não apareceu em $CASA/.claude/plugins"; exit 1; fi
RAIZ=$(dirname "$(dirname "$(dirname "$RAIZ")")")
for f in skills/estilos/SKILL.md skills/editar-video/SKILL.md skills/extrair-gravacao/SKILL.md estudio/src/tema.ts docs/galeria.md docs/galeria/SplitScreen-9x16.png; do
  [ -e "$RAIZ/$f" ] || { echo "FALHOU: falta $f no plugin instalado"; exit 1; }
done
echo "instalado em $RAIZ (HOME de teste: $CASA)"
