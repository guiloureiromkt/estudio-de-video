---
name: extrair-gravacao
description: >-
  Extrai valor de uma reunião, aula, live ou call gravada (mp4 ou áudio):
  transcreve com marcação de tempo e garimpa conteúdo (posts, roteiros de vídeo
  curto, cortes) só com o que foi dito de verdade, sem expor quem aparece na
  gravação. Use quando pedirem "extrai dessa gravação", "transforma esse vídeo
  em conteúdo", "tira os melhores trechos dessa live" ou apontarem uma gravação.
  A transcrição roda na própria máquina (faster-whisper), sem serviço pago.
---

# extrair-gravacao

Transforma uma gravação em duas coisas: **(1) a transcrição guardada**, com o tempo de cada trecho, e **(2) rascunhos de conteúdo** tirados das falas reais. Os trechos marcados servem também de lista de cortes para a skill `editar-video`.

## Antes de tudo
Diga em uma linha o que vai fazer e confirme o arquivo e o alcance: *"Vou extrair de `<arquivo>`: transcrição e conteúdo. Fecha?"* Nunca comece sem confirmar o arquivo e se é só a transcrição ou também o conteúdo.

## Entradas
- **Gravação:** `.mp4`, `.m4a`, `.wav`, `.mov`.
- **Opcional:** a legenda `.vtt`/`.srt` que o Zoom, o Meet ou o Teams exportam, ao lado do vídeo. Ela traz **quem fala**, o que a transcrição local não sabe separar.
- **Contexto:** de que projeto ou pessoa é a gravação, para saber onde guardar e quem não expor.

## Ambiente
O script usa a mesma venv do `editar-video` (`~/.local/share/editar-video/.venv`; se não existir, siga o `install.md` daquela skill, que fica na pasta vizinha a esta). Chame `$SKILL` o diretório deste arquivo.

## Passo 1 · Transcrever e guardar (sempre)
```bash
~/.local/share/editar-video/.venv/bin/python "$SKILL/scripts/transcribe.py" --rec "<gravação>" --out "<pasta do projeto>/transcricao-<tema>.md" --lang pt
```
- Com `.vtt`/`.srt` ao lado, o script junta as falas **por turno de quem fala** (`[MM:SS-MM:SS] Nome: fala`).
- Sem legenda, usa o faster-whisper: placa de vídeo NVIDIA se houver (modelo `large-v3`), senão CPU (modelo `small`, uns 20 s de processamento por minuto de fala). Sai sem o nome de quem fala; avise e, se for preciso separar, peça a legenda.
- Gravações longas: o script grava `<saída>.parcial` bloco a bloco e mostra o progresso. Se o progresso parar por minutos num trecho, é o modelo preso em repetição; interrompa e rode de novo com `--block-sec 30`.
- Guarde a transcrição junto do projeto, nunca só numa pasta temporária.

## Passo 2 · Garimpar conteúdo
1. **Carregue a voz de quem vai publicar antes de escrever**, se houver um guia de voz no projeto. Sem guia, escreva simples e pergunte o tom.
2. **Só fala real.** Todo gancho e toda frase saem da transcrição. Não invente cena, número nem citação. Na dúvida, omita.
3. **Privacidade (regra dura):** nunca exponha cliente, aluno ou convidado: nome, empresa reconhecível, tela, dado sensível. Use um genérico ("numa conversa com um cliente").
4. **Liste os ganchos primeiro** (momentos que ensinam ou têm força), com o tempo de cada um: `[12:40-13:55] a história do primeiro cliente`. Esses tempos são a lista de cortes para o `editar-video`.
5. **Depois desenvolva os mais fortes** no formato pedido: post, roteiro de vídeo curto, fio. Um chamado para ação por peça.
6. **Salve os rascunhos** num `.md` do projeto, marcados como rascunho. Quem publica escolhe antes; nunca agende nem publique sozinho.

## Regras
- Só fala real · privacidade de quem aparece · confirmar antes de começar · guardar a transcrição · nunca publicar sozinho.
