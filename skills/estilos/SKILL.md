---
name: estilos
description: Faz um vídeo num dos dez estilos do estúdio (caso de uso com câmera que passeia, explicador, interface falsa, tela dividida, clipes em tela cheia, reel em blocos, capa, colagem de papel), em Remotion, no tema da marca de quem pede. Começa mostrando a galeria para a pessoa escolher olhando. Use quando pedirem "faz um vídeo no estilo X", "quero um reel com a minha tela", "que estilos de vídeo eu tenho?", "mostra a galeria", "monta uma capa de reel", ou quando a pessoa quiser pintar os moldes com a marca dela. Não gera imagem nem vídeo por IA: usa as gravações, telas e imagens da própria pessoa.
---

# Estilos de vídeo

Chame `$SKILL` o diretório deste arquivo. A raiz do plugin é `$SKILL/../..`; nela ficam `estudio/` (o projeto Remotion com os moldes) e `docs/galeria.md` (a galeria).

## Passo 1 · Mostrar a galeria (sempre primeiro)

Leia `$SKILL/../../docs/galeria.md` e mostre à pessoa as capturas de `docs/galeria/*.png` (abra as imagens; não descreva de memória). Pergunte qual estilo ela quer, e para qual rede (a medida muda: 9:16 para Reels, Shorts e TikTok; 4:5 para o feed e o carrossel do Instagram; 1:1 para LinkedIn e X). Se ela não souber, recomende um, dizendo por quê em uma frase.

## Passo 2 · Preparar o projeto (uma vez por projeto)

Copie o estúdio para a pasta de trabalho da pessoa, nunca trabalhe dentro da pasta do plugin (ela é trocada a cada atualização):

```bash
cp -r "$SKILL/../../estudio" ./estudio && cd estudio && npm ci
```

Precisa de Node 20 ou mais novo (`node -v`). O `npm ci` leva de 1 a 3 minutos na primeira vez.

## Passo 3 · Pintar com a marca (uma vez por marca)

Tudo o que é cor e fonte mora em `src/tema.ts`. Pergunte as cores da marca (ou peça o logo e tire as cores dele) e troque `MARCA` e `RGB`. O nome que aparece na abertura e no fechamento do reel em blocos fica em `src/Vinhetas.tsx` (`NOME_DA_MARCA`); o @ de cada vídeo vai no campo `handle` das props. Para outra fonte: o `.woff2` em `public/fontes/` e as linhas de `loadFont` no fim do `tema.ts`.

Mostre o resultado antes de seguir: `npx remotion still src/index.ts <molde> out/teste.png --frame=<quadro>` e abra a imagem.

## Passo 4 · Trocar a mídia de exemplo pela da pessoa

Cada molde lê os arquivos de `public/` e as props de demonstração (`src/<Molde>/demo.ts` ou o `defaultProps` em `src/Root.tsx`). Troque:

- **Tela ou página:** a captura vai em `public/` e o caminho em `media.src` (CaseCard) ou `top.src` (SplitScreen). Para capturar uma página inteira: `google-chrome --headless=new --screenshot=public/minha-pagina.png --window-size=1440,2500 --force-device-scale-factor=2 <endereço>`.
- **Vídeo de quem fala:** em `public/` e no `bottom.src` (SplitScreen) ou nos `clips` (Animacao).
- **Legenda palavra por palavra:** vem da transcrição. Use a skill `video:editar-video` (`helpers/transcribe.py`) e converta as palavras para `{ text, start, end }`.
- **Roteiro:** para escrever as cenas, a skill `short-video-scripter`, se estiver instalada.

Para regerar a mídia de exemplo: `bash demo/gerar-demos.sh`.

## Passo 5 · Ver e renderizar

- Para ajustar olhando: `npx remotion studio` abre o editor no navegador, com as props editáveis à direita.
- Para o arquivo final, use o comando da ficha do molde em `docs/galeria.md`, por exemplo `npx remotion render src/index.ts SplitScreen-9x16 out/tela-dividida.mp4`. O vídeo sai em H.264, yuv420p, que toca em qualquer celular.
- Vídeos longos pesam na memória: renderize um de cada vez.

Antes de dizer que ficou pronto, tire um quadro do vídeo final e olhe (`ffmpeg -ss 3 -i out/<arquivo>.mp4 -frames:v 1 out/conferir.png`): texto cortado, legenda em cima do rosto e cor errada só aparecem assim.

## Regras

- Os estilos foram aprendidos de criadores (créditos em `CREDITOS.md`). São referência para aprender e para o seu trabalho; não revenda os moldes como seus.
- Não gere rosto, voz ou pessoa por IA para se passar por alguém real.
- Remotion é gratuito para pessoa física e empresa de até 3 pessoas; acima disso precisa de licença (remotion.dev/license).
