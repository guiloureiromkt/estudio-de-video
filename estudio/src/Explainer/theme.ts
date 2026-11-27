import { FONT, ESCURO, MARCA, MOLDES, RGB } from "../tema";

// Medido no reel do @thaleslaray (DdZIhviOnaC, 1080×1920) em 24/09/2026: o fundo creme quadriculado.
// Cor de destaque e fonte vêm do tema do estúdio (src/tema.ts).
export const C = {
  bg: MARCA.claro, // o fundo claro do tema (o creme medido no reel de referência era #FAF3E6)
  grid: `rgba(${RGB.escuro},.07)`,
  ink: MARCA.escuro,
  ghost: `rgba(${RGB.escuro},.18)`,
  accent: ESCURO.destaque,
  card: MOLDES.cartao.fundo,
  cardLine: MOLDES.cartao.linha,
  cardText: MOLDES.cartao.texto,
  muted: MOLDES.cartao.apagado,
  accentRgb: RGB.principal,
  fotos: MOLDES.cartao.fotos,
};

// "sans" = corpo · "mono" = rótulos e números (as duas na fonte do tema). Os nomes ficaram pra não mexer nas cenas.
export const sans = FONT.corpo;
export const mono = FONT.display;
