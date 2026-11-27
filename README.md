# Estúdio de vídeo

Um pacote de skills do Claude Code para fazer vídeo só com o Claude e a sua máquina, sem gerador pago de imagem, vídeo ou voz. São três skills:

- **`video:estilos`**: dez estilos de vídeo prontos (caso de uso com câmera que passeia, explicador, interface falsa, tela dividida, reel em blocos, capa, colagem de papel e outros), feitos em Remotion (vídeo escrito em código React). Vêm num tema neutro que você pinta com a sua marca trocando um arquivo.
- **`video:editar-video`**: edita vídeo conversando. Corta pausas e tomadas ruins, legenda palavra por palavra e acerta a cor. A transcrição roda no seu computador.
- **`video:extrair-gravacao`**: transcreve uma gravação longa (aula, live, reunião), com o tempo de cada trecho, e garimpa posts e cortes só com o que foi dito de verdade.

## Comece pela galeria

**[Veja os dez estilos na galeria](docs/galeria.md)**: uma captura de cada, para que serve e o comando para gerar.

## O que você precisa ter

Confira cada um no terminal. Se faltar algum, o Claude ajuda a instalar.

| O quê | Para quê | Como conferir |
|---|---|---|
| Claude Code | rodar as skills | `claude --version` |
| Node 20 ou mais novo | os estilos (Remotion) | `node -v` |
| ffmpeg | cortar, juntar e converter vídeo | `ffmpeg -version` |
| Python 3.10 ou mais novo | a transcrição | `python3 --version` |
| uv (recomendado) | instalar a parte de Python em segundos | `uv --version` (se faltar: `curl -LsSf https://astral.sh/uv/install.sh \| sh`) |
| Google Chrome ou Chromium (opcional) | capturar uma página inteira para os estilos de tela, e regerar a mídia de exemplo | `google-chrome --version` |

## Instalar

Dentro do Claude Code, digite na linha onde você conversa com ele, um de cada vez:

```
/plugin marketplace add guiloureiromkt/estudio-de-video
/plugin install video@estudio-de-video
```

Ou no terminal, numa linha só:

```bash
claude plugin marketplace add guiloureiromkt/estudio-de-video && claude plugin install video@estudio-de-video
```

No fim, a mensagem tem que dizer `Successfully installed plugin: video@estudio-de-video`. Feche e abra o Claude Code e pergunte: *que estilos de vídeo eu tenho?*

⚠️ **Não misture os dois.** Comando que começa com barra (`/plugin`) só funciona dentro do Claude Code.

### Três skills de outros autores que combinam com estas

Não vêm dentro do pacote: cada uma é instalada da fonte, para você receber as atualizações de quem as mantém. No terminal:

```bash
npx skills add remotion-dev/skills
npx skills add diffusionstudio/lottie
npx skills add aaron-he-zhu/aaron-marketing-skills
```

- **remotion-dev/skills**: as boas práticas do Remotion, do próprio time do Remotion. Ajuda o Claude a criar um estilo novo.
- **diffusionstudio/lottie**: animações Lottie (ícones e vinhetas animados, leves) a partir de texto.
- **aaron-he-zhu/aaron-marketing-skills**: entre outras, a `short-video-scripter`, que escreve roteiro de vídeo curto.

## Primeiro uso

1. **Transcrição:** na primeira vez que pedir para editar um vídeo, o Claude cria o ambiente de Python em `~/.local/share/editar-video/` (uns 2 minutos e uns 500 MB com o modelo de transcrição). Sem placa de vídeo NVIDIA, a transcrição roda no processador: 30 segundos de fala levam uns 11 segundos.
2. **Estilos:** na primeira vez, o Claude copia o estúdio para a sua pasta de trabalho e roda `npm ci` (de 1 a 3 minutos).
3. **Sua marca:** peça *"pinta o estúdio com as cores da minha marca"*. Muda um arquivo só, `estudio/src/tema.ts`.

## Se der erro

- **`/plugin marketplace add` falha ao baixar** (*"Failed to clone"*): confira a internet e o endereço `guiloureiromkt/estudio-de-video`, e tente de novo. Não precisa de login no GitHub.
- **`ensurepip is not available`** ao criar o ambiente de Python: falta o pacote `python3-venv` do Ubuntu. Use o `uv` (tabela acima).
- **A transcrição está lenta:** é o processador trabalhando. Para um vídeo de 10 minutos, conte uns 4 minutos.
- **O render trava ou fecha:** renderize um vídeo de cada vez e feche outros programas pesados.

## Uso

Os estilos foram aprendidos de criadores (ver [CREDITOS.md](CREDITOS.md)). Use para aprender e no seu trabalho, inclusive para clientes; não revenda os moldes como se fossem seus. Os moldes não se vendem nem se reembalam como produto ou curso (ver [LICENSE](LICENSE)).

Para quem mantém o pacote: [ATUALIZAR.md](ATUALIZAR.md).
