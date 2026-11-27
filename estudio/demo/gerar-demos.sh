#!/usr/bin/env bash
# Gera toda a mídia de exemplo dos moldes, só com código (Chrome, ImageMagick e ffmpeg).
# Nada aqui é foto, vídeo ou voz de alguém: troque cada arquivo pelo seu quando for fazer um vídeo de verdade.
# Uso: bash demo/gerar-demos.sh   (de dentro da pasta estudio/)
set -euo pipefail
cd "$(dirname "$0")/.."
P=public
mkdir -p $P/demo $P/capas $P/papercraft
CHROME=$(command -v google-chrome || command -v chromium || command -v chromium-browser || true)
FONTE=$(fc-match -f '%{file}' 'DejaVu Sans:bold' 2>/dev/null || true)

# 1. A página de exemplo, capturada em 1440 px de largura e 2x de densidade (o CaseCard e o SplitScreen rolam por ela).
if [ -n "$CHROME" ]; then
  "$CHROME" --headless=new --disable-gpu --hide-scrollbars --force-device-scale-factor=2 \
    --window-size=1440,2500 --screenshot=$P/demo/site.png "file://$PWD/demo/pagina.html" >/dev/null 2>&1
  magick $P/demo/site.png -quality 88 $P/demo/site.jpg && rm -f $P/demo/site.png
else
  echo "sem Chrome: pulei a página de exemplo (public/demo/site.jpg)"; fi

# 2. Silêncio para os moldes que pedem um áudio.
ffmpeg -nostdin -loglevel error -y -f lavfi -i anullsrc=r=44100:cl=mono -t 10 -q:a 9 $P/demo/silencio.mp3
ffmpeg -nostdin -loglevel error -y -f lavfi -i anullsrc=r=44100:cl=mono -t 10 $P/papercraft/audio.wav

# 3. "Seu rosto aqui": um boneco simples sobre um degradê, 8 s, no lugar do vídeo de quem fala.
magick -size 1080x1080 gradient:'#2F5BEA'-'#141414' \
  -fill '#F4F4F2' -draw 'circle 540,430 540,250' -draw 'ellipse 540,1010 330,300 180,360' \
  ${FONTE:+-font "$FONTE"} -fill '#141414' -pointsize 54 -gravity center -annotate +0+330 'seu vídeo aqui' \
  $P/demo/rosto.png
ffmpeg -nostdin -loglevel error -y -loop 1 -i $P/demo/rosto.png -f lavfi -i anullsrc=r=44100:cl=mono \
  -vf "zoompan=z='1+0.0008*on':d=240:s=1080x1080:fps=30,format=yuv420p" -t 8 -c:v libx264 -c:a aac -shortest $P/demo/rosto.mp4
rm -f $P/demo/rosto.png

# 4. A ilustração da capa: um boneco recortado sobre fundo amarelo (o letreiro vai em cima).
magick -size 1080x1500 xc:'#FFCC02' \
  -fill '#141414' -draw 'circle 540,560 540,330' -draw 'roundrectangle 250,820 830,1500 160,160' \
  -fill '#F4F4F2' -draw 'circle 460,540 460,505' -draw 'circle 620,540 620,505' \
  -fill '#141414' -draw 'circle 470,545 470,530' -draw 'circle 630,545 630,530' \
  $P/capas/ilustra.png

# 5. Recortes de papel para o Papercraft (fundo transparente).
magick -size 600x600 xc:none -fill '#2F5BEA' -draw 'polygon 300,40 370,230 570,230 410,350 470,550 300,430 130,550 190,350 30,230 230,230' $P/papercraft/estrela.png
magick -size 600x600 xc:none -fill '#1FA37A' -draw 'circle 300,300 300,60' -fill '#F4F4F2' -draw 'circle 300,300 300,180' $P/papercraft/anel.png
magick -size 800x500 xc:none -fill '#F4F4F2' -stroke '#141414' -strokewidth 10 -draw 'roundrectangle 20,20 780,480 50,50' \
  -fill '#2F5BEA' -stroke none -draw 'rectangle 90,110 520,150' -draw 'rectangle 90,200 680,240' -draw 'rectangle 90,290 400,330' $P/papercraft/cartao.png

# 6. Sem metadados nas imagens.
exiftool -q -overwrite_original -all= $P/demo/*.jpg $P/capas/*.png $P/papercraft/*.png 2>/dev/null || true
echo "demos geradas em $P/"
