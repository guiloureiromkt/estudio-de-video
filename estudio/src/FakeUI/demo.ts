import type { FakeUIProps } from "./schema";
import { MARCA } from "../tema";

// Demo com números de exemplo: 31 links, 29 analisados, acumulado por lote [0, 6, 17, 28, 29].
// Troque pelos números do seu trabalho.
export const fakeUIDemo: FakeUIProps = {
  durationInSeconds: 17,
  // skin "marca" segue o tema; skin "tudor" com accent "#E8772E" e number "#FCC997" refaz o visual da referência
  skin: "marca",
  accent: MARCA.principal,
  number: MARCA.branco,
  screens: [
    { type: "counter", start: 0, duration: 3.4, pill: "Primeira leva", prefix: "POSTS", value: 29, total: 31 },
    { type: "title", start: 3.1, duration: 2.6, lines: ["O Claude", "assiste reel"] },
    {
      type: "chart",
      start: 5.4,
      duration: 4.2,
      pill: "Uma noite de análise",
      points: [0, 6, 17, 28, 29],
      delta: "+29",
      stats: [
        { label: "Posts", value: "29" },
        { label: "Repos", value: "20" },
        { label: "Moldes", value: "2" },
      ],
    },
    {
      type: "app",
      start: 9.3,
      duration: 7.7,
      step: "Passo 3 · Remotion",
      app: "Claude Code",
      badge: "Opus 5.5",
      prompt: "Transforma o estilo desse reel em molde no Remotion: fundo creme, legenda palavra por palavra, --estilo thaleslaray",
      highlight: "--estilo thaleslaray",
      button: "Renderizar",
      output: "demo/explainer-frame.jpg",
    },
  ],
};
