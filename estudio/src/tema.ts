import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";

// TEMA DO ESTÚDIO — o único arquivo que você precisa mudar para os moldes saírem com a sua marca.
//
// 1. Troque as cores de MARCA pelas da sua marca (hex, como "#2F5BEA").
// 2. Se quiser outra fonte, ponha o arquivo .woff2 em public/fontes/ e troque FAMILIA e os loadFont lá embaixo.
// 3. Rode `npx remotion studio` e confira em todos os moldes: a mesma cor aparece em todos.
//
// Os moldes leem os papéis (ESCURO, CLARO), nunca as cores direto. Assim, trocar uma cor aqui muda todos.

export const MARCA = {
  principal: "#2F5BEA", // destaque: palavra marcada, número grande, botão, barra
  secundaria: "#1FA37A", // detalhe: selo, linha pequena acima do título
  claro: "#F4F4F2", // fundo das peças claras
  escuro: "#141414", // fundo das peças escuras e texto sobre o claro
  cinza: "#9A9A9A", // rodapé, texto apagado
  apoio: "#4A4A4A", // texto secundário sobre o claro
  branco: "#FFFFFF",
};

// Mesmas cores em formato "r, g, b", para os moldes que usam transparência (rgba).
export const RGB = {
  principal: "47, 91, 234",
  secundaria: "31, 163, 122",
  escuro: "20, 20, 20",
};

// Papéis de cor. ESCURO é o padrão dos vídeos (fundo escuro, texto branco); CLARO serve às composições claras.
export const ESCURO = {
  fundo: MARCA.escuro,
  fundo2: "#262626", // superfície elevada sobre o fundo
  texto: MARCA.branco,
  textoApoio: "#D6D6D6",
  fio: "rgba(255,255,255,.13)",
  destaque: MARCA.principal,
  olho: MARCA.secundaria,
  rodape: MARCA.cinza,
  barra: MARCA.principal,
};

export const CLARO = {
  fundo: MARCA.claro,
  fundo2: "#FFFFFF",
  texto: MARCA.escuro,
  textoApoio: MARCA.apoio,
  fio: `rgba(${RGB.escuro},.12)`,
  destaque: MARCA.principal,
  olho: MARCA.secundaria,
  rodape: MARCA.cinza,
  barra: MARCA.principal,
};

// Fonte: Inter (licença SIL Open Font License, livre para uso comercial), arquivo variável com todos os pesos.
// SEM_NEGRITO_FALSO impede o navegador de engordar a letra por conta própria quando falta um peso.
const FAMILIA = { titulo: "Inter", corpo: "Inter" };
export const FONT = {
  display: "'Inter', Arial, sans-serif",
  titulo: "'Inter', Arial, sans-serif",
  corpo: "'Inter', Arial, sans-serif",
  mono: "ui-monospace, 'DejaVu Sans Mono', monospace",
};
export const SEM_NEGRITO_FALSO = { fontSynthesis: "style" } as const;

loadFont({ family: FAMILIA.titulo, url: staticFile("fontes/inter.woff2"), weight: "100 900" });

// O ponto da marca: um círculo chapado na cor principal.
export const ponto = (size: number) => ({
  width: size,
  height: size,
  borderRadius: "50%",
  background: MARCA.principal,
});
