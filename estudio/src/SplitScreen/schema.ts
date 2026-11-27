import { z } from "zod";
import { zColor } from "@remotion/zod-types";

export const splitScreenSchema = z.object({
  skin: z.enum(["neutro", "marca"]).optional(),
  durationInSeconds: z.number().min(1),
  // metade de cima: gravação de tela (vídeo) ou print de página que rola de scrollFrom a scrollTo
  // (em px da imagem já redimensionada pra 1080 de largura)
  top: z.object({
    type: z.enum(["image", "video"]),
    src: z.string(),
    scrollFrom: z.number(),
    scrollTo: z.number(),
  }),
  // metade de baixo: o avatar (vídeo com o áudio da fala). focusY = altura do rosto no quadro (0-1)
  bottom: z.object({ src: z.string(), focusY: z.number().min(0).max(1), zoom: z.number().min(1).max(3) }),
  // palavras com tempo, vindas do Whisper (segundos)
  words: z.array(z.object({ text: z.string(), start: z.number(), end: z.number() })),
  wordsPerCard: z.number().int().min(1).max(8),
  accent: zColor(),
  handle: z.string(),
  selo: z.string().optional(), // "Feito com IA": todo vídeo leva
});

export type SplitScreenProps = z.infer<typeof splitScreenSchema>;
