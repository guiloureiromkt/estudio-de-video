import { FONT, ESCURO, MARCA } from "../tema";

// Medido no reel do @thaleslaray (DdZIhviOnaC, 1080×1920) em 24/09/2026: o fundo creme quadriculado.
// Cor de destaque e fonte vêm do tema do estúdio (src/tema.ts).
export const C = {
  bg: MARCA.claro, // o fundo claro do tema (o creme medido no reel de referência era #FAF3E6)
  grid: "rgba(60,45,20,.08)",
  ink: MARCA.escuro,
  ghost: "rgba(26,26,26,.18)",
  accent: ESCURO.destaque,
  card: "#1E242C",
  cardLine: "rgba(255,255,255,.08)",
  cardText: "#E8E4DC",
  muted: "#8C857A",
};

// "sans" = corpo · "mono" = rótulos e números (as duas na fonte do tema). Os nomes ficaram pra não mexer nas cenas.
export const sans = FONT.corpo;
export const mono = FONT.display;
