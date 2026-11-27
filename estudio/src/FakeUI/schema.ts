import { z } from "zod";
import { zColor } from "@remotion/zod-types";

// Toda tela tem início e duração em segundos; as telas se sobrepõem por fusão (0,3 s).
const base = { start: z.number().min(0), duration: z.number().min(0.5) };

export const screen = z.discriminatedUnion("type", [
  // "DIA 18 /30" + calendário que acende até `value`
  z.object({
    ...base,
    type: z.literal("counter"),
    pill: z.string(),
    prefix: z.string(),
    value: z.number().int().min(0),
    total: z.number().int().min(1),
  }),
  // título grande em caixa-alta com sublinhado de destaque
  z.object({ ...base, type: z.literal("title"), lines: z.array(z.string()).min(1).max(3), size: z.number().optional() }),
  // cartão de checagem: repositório real, a promessa da legenda (riscada) e o fato
  z.object({
    ...base,
    type: z.literal("check"),
    // fonte do cartão: "github.com/" + repo (padrão) ou outro prefixo (ex.: "" pra notícia)
    prefix: z.string().optional(),
    claimLabel: z.string().optional(),
    repo: z.string(),
    stars: z.string(),
    claim: z.string(),
    real: z.string(),
  }),
  // pesquisa: número grande que conta até o valor, barras de comparação e a fonte embaixo
  z.object({
    ...base,
    type: z.literal("stat"),
    pill: z.string(),
    value: z.number().min(0).max(100), // o número grande, em %
    label: z.string(), // o que o número mede, em uma ou duas linhas
    bars: z.array(z.object({ label: z.string(), value: z.number().min(0).max(100), em: z.number().optional(), destaque: z.boolean().optional() })).max(3),
    source: z.string(),
  }),
  // fatura que se monta: cada linha entra no seu segundo (relativo à tela) e o total vai somando
  z.object({
    ...base,
    type: z.literal("fatura"),
    titulo: z.string(),
    itens: z.array(z.object({
      label: z.string(),
      sub: z.string().optional(),
      valor: z.number(), // US$; 0 com valorTexto = linha informativa, não soma
      valorTexto: z.string().optional(),
      em: z.number(),
      destaque: z.boolean().optional(),
    })).min(1).max(5),
  }),
  // linha que se desenha + contadores
  z.object({
    ...base,
    type: z.literal("chart"),
    pill: z.string(),
    points: z.array(z.number()).min(2),
    delta: z.string(),
    stats: z.array(z.object({ label: z.string(), value: z.string() })).max(3),
  }),
  // app falso: prompt digitando → progresso → resultado
  z.object({
    ...base,
    type: z.literal("app"),
    step: z.string(),
    app: z.string(),
    badge: z.string(),
    prompt: z.string(),
    highlight: z.string(),
    button: z.string(),
    output: z.string(),
  }),
]);

export const fakeUISchema = z.object({
  skin: z.enum(["tudor", "marca"]).optional(),
  durationInSeconds: z.number().min(1),
  accent: zColor(),
  number: zColor(),
  audio: z.string().optional(),
  // legenda palavra por palavra, selo e @ (quando o FakeUI é o vídeo inteiro, não só a metade de cima)
  words: z.array(z.object({ text: z.string(), start: z.number(), end: z.number() })).optional(),
  wordsPerCard: z.number().int().min(1).max(8).optional(),
  selo: z.string().optional(),
  handle: z.string().optional(),
  screens: z.array(screen).min(1),
});

export type FakeUIProps = z.infer<typeof fakeUISchema>;
export type Screen = z.infer<typeof screen>;
