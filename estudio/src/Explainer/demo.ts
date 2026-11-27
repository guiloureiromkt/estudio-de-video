import type { ExplainerProps } from "./schema";
import { MOLDES } from "../tema";

// Demo sem locução: um roteiro de exemplo sobre dar ao Claude um jeito de "ver" um vídeo.
// Troque as cenas pelo seu roteiro (a skill short-video-scripter ajuda a escrever).
export const explainerDemo: ExplainerProps = {
  durationInSeconds: 16,
  label: "Claude + Instagram",
  handle: "suamarca",
  scenes: [
    {
      type: "terminal",
      start: 0,
      duration: 2.4,
      caption: "O Claude não assiste *reel do Instagram*",
      title: "Claude Code",
      prompt: "analisa esse reel pra mim",
      status: "tentando abrir o vídeo…",
      result: "fail",
    },
    {
      type: "pair",
      start: 2.4,
      duration: 2.6,
      caption: "A menos que você *dê olhos pra ele*",
      left: { kind: "spark", value: "", dark: false },
      right: { kind: "emoji", value: "🎞️", dark: true },
      symbol: "plug",
    },
    {
      type: "flow",
      start: 5,
      duration: 2.8,
      caption: "Três ferramentas *de terminal*",
      left: { kind: "spark", value: "", dark: true },
      leftLabel: "Claude Code",
      kicker: "yt-dlp · ffmpeg",
      title: "WHISPER",
      right: { kind: "emoji", value: "📱", dark: true },
      rightLabel: "Instagram",
      status: "Reel baixado ✓",
    },
    {
      type: "terminal",
      start: 7.8,
      duration: 2.6,
      caption: "Cola o link. *Recebe a análise.*",
      title: "Claude Code",
      prompt: "analisa esses 17 reels",
      status: "frames + transcrição prontos",
      result: "grid",
    },
    {
      type: "fan",
      start: 10.4,
      duration: 2.4,
      caption: "Roteiro, estilo e *o repo por trás*",
      cards: MOLDES.cartao.fotos.slice(1, 4),
      pills: ["Roteiro", "Estilo", "Repos"],
    },
    {
      type: "cta",
      start: 12.8,
      duration: 3.2,
      caption: "",
      kicker: "Comente",
      word: "REEL",
      sub: "pra receber o passo a passo no direct",
      bubbleKicker: "Claude Code",
      bubbleTitle: "Passo a passo",
      bubbleStatus: "Enviado ✓",
    },
  ],
};
