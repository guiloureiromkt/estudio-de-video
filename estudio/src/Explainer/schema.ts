import { z } from "zod";

// Um ícone de nó: a faísca (estilo Claude), um emoji ou texto curto, em quadrado escuro ou sem fundo.
export const icon = z.object({
  kind: z.enum(["spark", "emoji", "text"]),
  value: z.string(),
  dark: z.boolean(),
});

// Toda cena tem início e duração em segundos. Na legenda, *asteriscos* marcam o trecho em destaque.
// wordTimes (opcional): segundo de entrada de cada palavra, relativo ao início da cena.
// Vem do Whisper quando há locução; sem ele, as palavras se distribuem na primeira metade da cena.
const base = {
  start: z.number().min(0),
  duration: z.number().min(0.3),
  caption: z.string(),
  wordTimes: z.array(z.number()).optional(),
};

export const scene = z.discriminatedUnion("type", [
  z.object({
    ...base,
    type: z.literal("terminal"),
    title: z.string(),
    prompt: z.string(),
    status: z.string(),
    result: z.enum(["none", "fail", "grid"]),
  }),
  z.object({
    ...base,
    type: z.literal("pair"),
    left: icon,
    right: icon,
    symbol: z.enum(["=", "+", "→", "plug"]),
  }),
  z.object({
    ...base,
    type: z.literal("flow"),
    left: icon,
    leftLabel: z.string(),
    kicker: z.string(),
    title: z.string(),
    right: icon,
    rightLabel: z.string(),
    status: z.string(),
  }),
  z.object({
    ...base,
    type: z.literal("fan"),
    cards: z.array(z.string()),
    pills: z.array(z.string()),
  }),
  // imagem ou vídeo real do processo num cartão; sem src, mostra um número grande (ex.: o custo)
  z.object({
    ...base,
    type: z.literal("midia"),
    kicker: z.string().optional(), // ex.: "Passo 1", sobre o cartão
    src: z.string().optional(),
    video: z.boolean().optional(),
    from: z.number().optional(), // segundo do vídeo onde a cena começa
    largura: z.number().optional(), // px do cartão; a altura sai da proporção
    proporcao: z.number().optional(), // largura / altura da mídia
    numero: z.string().optional(),
    sub: z.string().optional(), // linha pequena sob o número
    continua: z.boolean().optional(), // mesma mídia da cena anterior: entra sem animação
    z0: z.number().optional(), // segundos que a mídia já está na tela (o empurrão de câmera segue sem pular)
  }),
  z.object({
    ...base,
    type: z.literal("cta"),
    kicker: z.string(),
    word: z.string(),
    sub: z.string(),
    bubbleKicker: z.string(),
    bubbleTitle: z.string(),
    bubbleStatus: z.string(),
  }),
]);

export const explainerSchema = z.object({
  durationInSeconds: z.number().min(1),
  label: z.string(),
  handle: z.string(),
  audio: z.string().optional(),
  selo: z.string().optional(), // "feito com IA": todo vídeo leva
  scenes: z.array(scene).min(1),
});

export type ExplainerProps = z.infer<typeof explainerSchema>;
export type Scene = z.infer<typeof scene>;
export type Icon = z.infer<typeof icon>;
