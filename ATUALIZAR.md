# Como atualizar o pacote

Para quem mantém o pacote. Quem só usa pode ignorar este arquivo; para receber uma atualização basta `/plugin marketplace update estudio-de-video`.

## O que este pacote é

Uma **cópia limpa** de ferramentas que continuam evoluindo em outro lugar. Só passa para cá o que for pedido, sempre pelo mesmo caminho: copiar, tirar o que é pessoal, provar e publicar. De onde veio cada parte, com os commits de origem, está anotado com quem mantém, fora deste repositório.

## O que ficou de fora, e por quê

- **Marca pessoal** (cores, fontes, nome, vinhetas): virou o tema neutro `estudio/src/tema.ts` e o `NOME_DA_MARCA` de `estudio/src/Vinhetas.tsx`.
- **Mídia de exemplo original** (capturas, vídeos, vozes, ilustrações, legendas de fala real): trocada por mídia feita por código (`estudio/demo/gerar-demos.sh`).
- **Tudo o que depende de gerador pago de imagem, vídeo ou voz.** Decisão de 27/11/2026: o pacote só leva o que roda com o Claude e a máquina de quem usa.
- **Skills de outros autores** (Remotion, Lottie, roteiro curto): instaladas da fonte pelo README, não copiadas.

## Versões fixadas

- Remotion **4.0.527**, React **19.2.3**, zod **4.5.4** (`estudio/package.json` e `package-lock.json`).
- faster-whisper **1.2.1** com PyAV **abaixo de 19** (`skills/editar-video/pyproject.toml`): o PyAV 19 tirou um parâmetro que o faster-whisper 1.2.1 usa, e a transcrição quebra.
- Os três `npx skills add` do README foram conferidos em 27/11/2026.

## Como passar uma mudança para cá

Quem atualiza é quem mantém, quando quiser passar adiante um molde novo ou corrigido. Não há rotina automática.

1. Copiar só o molde que mudou para `estudio/src/<Molde>/`.
2. Ligar o molde ao tema: cores e fontes vêm de `../tema` (`MARCA`, `ESCURO`, `CLARO`, `FONT`), nunca escritas direto no molde. Mídia nova de exemplo se faz por código, em `estudio/demo/gerar-demos.sh`.
3. Provar, nesta ordem:
   - o teste de limpeza de quem mantém (fora deste repositório) → `limpo`
   - `cd estudio && npx tsc --noEmit` → sem erro
   - `bash testes/galeria.sh` e olhar as capturas que mudaram; se for molde novo, uma ficha nova em `docs/galeria.md`
   - `bash testes/instalar-limpo.sh` → `Successfully installed plugin: video@estudio-de-video`
4. Subir a versão em `.claude-plugin/plugin.json`, commitar e dar push.

## Acesso

- Dar acesso: `gh api -X PUT repos/guiloureiromkt/estudio-de-video/collaborators/<usuário> -f permission=pull`.
- Tirar acesso: `gh api -X DELETE repos/guiloureiromkt/estudio-de-video/collaborators/<usuário>`.
- Se algo pessoal escapar para o repositório: tirar o acesso, apagar o repositório e recriar a partir de uma cópia limpa. O que já foi clonado não volta; por isso a limpeza vem antes de cada push.
