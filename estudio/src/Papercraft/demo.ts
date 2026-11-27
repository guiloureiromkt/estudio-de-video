import type { PapercraftProps } from "./Papercraft";

// Demo: duas cenas de colagem com os recortes gerados por demo/gerar-demos.sh.
// Cada palavra do título entra no segundo "em" (relativo à cena): é assim que a colagem acompanha a fala.
// Troque o áudio (public/papercraft/audio.wav) pela sua locução e os tempos pelos da transcrição.
export const papercraftDemo: PapercraftProps = {
  durationInSeconds: 8,
  audio: "papercraft/audio.wav",
  cenas: [
    {
      inicio: 0,
      fim: 4,
      semente: 7,
      paleta: ["#F4F4F2", "#2F5BEA"],
      fundoClaro: true,
      titulo: {
        linhas: [
          [{ t: "Ideia", em: 0.2 }, { t: "boa", em: 0.5, destaque: true }],
          [{ t: "cabe", em: 0.9 }, { t: "num", em: 1.1 }, { t: "papel", em: 1.4 }],
        ],
        x: 90, y: 380, tam: 120, rot: -3, largura: 900,
      },
      elementos: [
        { src: "papercraft/estrela.png", x: 300, y: 1200, w: 380, em: 1.6, rot: -8, anim: "girar" },
        { src: "papercraft/anel.png", x: 790, y: 1350, w: 320, em: 2.0, rot: 0, anim: "crescer" },
      ],
      etiquetas: [{ t: "exemplo", x: 700, y: 860, em: 2.4, rot: 4, tam: 44 }],
    },
    {
      inicio: 4,
      fim: 8,
      semente: 21,
      paleta: ["#141414", "#1FA37A"],
      titulo: {
        linhas: [[{ t: "Recorte,", em: 0.2 }, { t: "cola", em: 0.6 }], [{ t: "e", em: 0.9 }, { t: "publica", em: 1.1, destaque: true }]],
        x: 90, y: 380, tam: 120, rot: 2, largura: 900,
      },
      elementos: [{ src: "papercraft/cartao.png", x: 540, y: 1250, w: 760, em: 1.5, rot: -4, anim: "cair" }],
      etiquetas: [],
      check: { x: 860, y: 1560, em: 2.6, tam: 160 },
    },
  ],
};
