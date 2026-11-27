import { z } from "zod";
import { zColor } from "@remotion/zod-types";

// Coordenadas x/y são frações da JANELA (0 = borda esquerda/topo, 1 = direita/base).
// scroll é em pixels CSS da página capturada (só vale para mídia do tipo imagem).
export const cameraKeyframe = z.object({
  t: z.number().min(0),
  zoom: z.number().min(1).max(5),
  x: z.number().min(0).max(1),
  y: z.number().min(0).max(1),
  scroll: z.number().min(0).optional(),
});

export const click = z.object({
  t: z.number().min(0),
  x: z.number().min(0).max(1),
  y: z.number().min(0).max(1),
});

export const caseCardSchema = z.object({
  media: z.object({
    type: z.enum(["image", "video"]),
    src: z.string(),
    // tamanho da viewport capturada, em pixels CSS (define a proporção da janela)
    viewportWidth: z.number(),
    viewportHeight: z.number(),
  }),
  durationInSeconds: z.number().min(1),
  stageColor: zColor(),
  windowColor: zColor(),
  caption: z.string(),
  handle: z.string(),
  creditPrefix: z.string(),
  note: z.string(),
  showCursor: z.boolean(),
  camera: z.array(cameraKeyframe).min(1),
  clicks: z.array(click),
  semFaixa: z.boolean().optional(), // dentro do CaseVoz (vertical): o palco sem a faixa de legenda própria
});

export type CaseCardProps = z.infer<typeof caseCardSchema>;
