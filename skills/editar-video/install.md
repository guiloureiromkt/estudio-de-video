---
name: video-use-install
description: Primeira instalação do editar-video dentro do pacote estudio-de-video — cria a venv Python, confere o ffmpeg e testa a transcrição local. Sem chave de serviço pago.
---

# Instalação do editar-video

Use este arquivo só na primeira vez (ou se a venv sumir). No dia a dia, leia `SKILL.md`.

Este é o [video-use](https://github.com/browser-use/video-use) (MIT, Browser Use) com uma mudança: a transcrição roda na própria máquina, com o faster-whisper, em vez de depender de uma chave da ElevenLabs. Se a pessoa já tiver a chave, ela continua funcionando.

## O que precisa existir

1. A pasta desta skill. Ela já veio com o plugin: é o diretório onde está este arquivo (o Claude recebe esse caminho como "Base directory for this skill"). Chame de `$SKILL`. Não clone nada.
2. `ffmpeg` e `ffprobe` no `PATH`.
3. Uma venv Python com as dependências, em `~/.local/share/editar-video/.venv`. Fica fora do plugin porque a pasta do plugin é trocada a cada atualização.

## Passos

### 1. ffmpeg

```bash
ffmpeg -version | head -1 && ffprobe -version | head -1
```

Se faltar: macOS `brew install ffmpeg`; Ubuntu/Debian `sudo apt-get install -y ffmpeg`; Windows `winget install Gyan.FFmpeg`. Se pedir senha, diga o comando exato à pessoa e espere. Nunca invente senha.

### 2. Venv e dependências

Com o `uv` (recomendado: não depende de pacote do sistema e instala em segundos):

```bash
VENV=~/.local/share/editar-video/.venv
command -v uv >/dev/null || curl -LsSf https://astral.sh/uv/install.sh | sh
test -x "$VENV/bin/python" || uv venv -q "$VENV"
VIRTUAL_ENV="$VENV" uv pip install -q "$SKILL"
```

Sem o `uv`: `python3 -m venv "$VENV" && "$VENV/bin/pip" install -q "$SKILL"`. No Ubuntu e no Debian isso falha com *"ensurepip is not available"* se faltar o pacote `python3-venv`; nesse caso, use o `uv`.

O `pyproject.toml` instala `requests`, `librosa`, `matplotlib`, `pillow`, `numpy` e `faster-whisper`. A primeira transcrição baixa o modelo (o `small` tem uns 500 MB; o `large-v3`, uns 3 GB, só é usado se houver placa de vídeo NVIDIA).

Todo helper roda com esse Python: `"$VENV/bin/python" "$SKILL/helpers/<nome>.py"`.

### 3. Conferir

```bash
"$VENV/bin/python" "$SKILL/helpers/timeline_view.py" --help >/dev/null && echo "helpers ok"
"$VENV/bin/python" -c "import faster_whisper, ctranslate2; print('transcrição ok · placas de vídeo:', ctranslate2.get_cuda_device_count())"
```

`placas de vídeo: 0` é normal num notebook sem NVIDIA: a transcrição roda na CPU, com o modelo `small`. Medido: 30 segundos de fala em uns 11 segundos.

### 4. Chave da ElevenLabs (opcional)

Só se a pessoa já tiver e quiser separar quem fala em entrevistas (a transcrição local marca tudo como uma pessoa só). Grave em `~/.local/share/editar-video/.env`, com `chmod 600`, nunca dentro da pasta do plugin nem da pasta de vídeos:

```bash
printf 'ELEVENLABS_API_KEY=%s\n' "$KEY" > ~/.local/share/editar-video/.env && chmod 600 ~/.local/share/editar-video/.env
```

Nunca repita a chave na saída.

### 5. Passar a vez

Diga à pessoa, numa mensagem curta: entrar na pasta dos vídeos, abrir o Claude ali e pedir, por exemplo, *"edita esses vídeos num corte de 60 segundos"* ou *"faz o inventário das tomadas e me propõe um corte"*. Tudo o que for gerado vai para `<pasta dos vídeos>/edit/`.
