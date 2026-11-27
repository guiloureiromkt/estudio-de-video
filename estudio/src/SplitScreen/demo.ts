import type { SplitScreenProps } from "./schema";
import words from "./words-exemplo.json";

// Demo: em cima a página de exemplo rolando (public/demo/site.jpg); embaixo o "seu vídeo aqui"
// (public/demo/rosto.mp4). Troque os dois pelos seus e a legenda (words-exemplo.json) pela transcrição
// do seu vídeo, que a skill editar-video gera.
export const splitScreenDemo: SplitScreenProps = {
  durationInSeconds: 8,
  top: { type: "image", src: "demo/site.jpg", scrollFrom: 0, scrollTo: 900 },
  bottom: { src: "demo/rosto.mp4", focusY: 0.62, zoom: 1 },
  words,
  wordsPerCard: 4,
  accent: "#2F5BEA",
  handle: "suamarca",
};
