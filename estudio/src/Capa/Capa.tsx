import { z } from "zod";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { FONT } from "../tema";

// Capa de feed: o boneco numa cena da matéria + letreiro ousado.
// Não segue o design system: o único trabalho dela é parar o dedo no feed.
// Vira o primeiro quadro do vídeo (ReelMisto.capa) e a capa do Reel.
// Letreiro no peso 900 da fonte do tema (src/tema.ts).
const fontFamily = FONT.titulo;

export const capaSchema = z.object({
  imagem: z.string(),
  // cada linha é um bloco do letreiro; "faixa" = linha em tarja inclinada (o destaque)
  linhas: z.array(z.object({ texto: z.string(), tamanho: z.number(), cor: z.string().optional(), faixa: z.string().optional() })).min(1),
  topo: z.number().default(170), // onde o letreiro começa (px)
  // a grade do perfil mostra só o miolo 3:4 (corta 240 px em cima e embaixo): letreiro e rosto ficam dentro dele
  desce: z.number().default(0), // empurra a ilustração pra baixo, abrindo espaço pro letreiro
  fundo: z.string().default("#000000"), // cor que preenche o espaço aberto em cima (a do fundo da ilustração)
});
export type CapaProps = z.infer<typeof capaSchema>;

const contorno = (cor: string, px: number) =>
  Array.from({ length: 16 }, (_, i) => {
    const a = (i / 16) * Math.PI * 2;
    return `${(Math.cos(a) * px).toFixed(1)}px ${(Math.sin(a) * px).toFixed(1)}px 0 ${cor}`;
  }).join(", ");

export const Capa: React.FC<CapaProps> = ({ imagem, linhas, topo, desce, fundo }) => (
  <AbsoluteFill style={{ backgroundColor: fundo }}>
    <Img src={imagem.startsWith("http") ? imagem : staticFile(imagem)} style={{ position: "absolute", left: 0, top: desce, width: "100%", height: "100%", objectFit: "cover" }} />
    <div style={{ position: "absolute", top: topo, left: 50, right: 50, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
      {linhas.map((l, i) =>
        l.faixa ? (
          <div key={i} style={{ transform: "rotate(-3deg)", backgroundColor: l.faixa, padding: "4px 30px 10px", marginTop: 14, boxShadow: "0 14px 0 rgba(0,0,0,.85)" }}>
            <div style={{ fontFamily, fontWeight: 900, fontSize: l.tamanho, lineHeight: 1, color: l.cor ?? "#fff", textTransform: "uppercase", letterSpacing: 1 }}>{l.texto}</div>
          </div>
        ) : (
          <div key={i} style={{ fontFamily, fontWeight: 900, fontSize: l.tamanho, lineHeight: 0.95, color: l.cor ?? "#fff", textTransform: "uppercase", textAlign: "center",
            letterSpacing: 1, textShadow: `${contorno("#000", 9)}, 0 16px 0 #000` }}>{l.texto}</div>
        ),
      )}
    </div>
  </AbsoluteFill>
);
