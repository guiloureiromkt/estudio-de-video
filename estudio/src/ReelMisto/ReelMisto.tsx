import { z } from "zod";
import { AbsoluteFill, Img, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Abertura, Fechamento } from "../Vinhetas";
import { SplitScreen } from "../SplitScreen/SplitScreen";
import { splitScreenSchema } from "../SplitScreen/schema";
import { Animacao, animacaoSchema } from "../Animacao/Animacao";
import { TextoAtras, textoAtrasSchema } from "../TextoAtras/TextoAtras";
import { CaseVoz, caseVozSchema } from "../CaseVoz/CaseVoz";
import { Explainer } from "../Explainer/Explainer";
import { FakeUI } from "../FakeUI/FakeUI";
import { fakeUISchema } from "../FakeUI/schema";
import { explainerSchema } from "../Explainer/schema";

// Reel em blocos: abertura (opcional) + blocos de tela dividida ou animação + fechamento (opcional).
// O mesmo roteiro sai como reel único (todos os blocos) ou como slides de carrossel (um bloco por render).
const bloco = z.discriminatedUnion("tipo", [
  z.object({ tipo: z.literal("split"), props: splitScreenSchema }),
  z.object({ tipo: z.literal("animacao"), props: animacaoSchema }),
  z.object({ tipo: z.literal("atras"), props: textoAtrasSchema }),
  z.object({ tipo: z.literal("case"), props: caseVozSchema }),
  z.object({ tipo: z.literal("explica"), props: explainerSchema }),
  z.object({ tipo: z.literal("fakeui"), props: fakeUISchema }),
]);

export const reelMistoSchema = z.object({
  abertura: z.object({ serie: z.string(), titulo: z.string(), segundos: z.number() }).optional(),
  // capa de feed como 1º quadro: imagem cheia por cima do começo, com a fala já rodando;
  // não empurra os blocos (diferente da abertura), então não cria segundo mudo
  capa: z.object({ src: z.string(), segundos: z.number() }).optional(),
  blocos: z.array(bloco).min(1),
  fechamento: z.object({ frase: z.string(), handle: z.string(), selo: z.string(), segundos: z.number() }).optional(),
});
export type ReelMistoProps = z.infer<typeof reelMistoSchema>;

export const CRUZA = 0.3; // a abertura se dissolve por cima do primeiro bloco

export const duracaoReelMisto = (p: ReelMistoProps) =>
  (p.abertura ? p.abertura.segundos - CRUZA : 0) +
  p.blocos.reduce((s, b) => s + b.props.durationInSeconds, 0) +
  (p.fechamento ? p.fechamento.segundos : 0);

const CapaInicial: React.FC<{ src: string; segundos: number }> = ({ src, segundos }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const saida = interpolate(frame, [(segundos - 0.15) * fps, segundos * fps], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ opacity: saida }}>
      <Img src={src.startsWith("http") ? src : staticFile(src)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
    </AbsoluteFill>
  );
};

export const ReelMisto: React.FC<ReelMistoProps> = (p) => {
  const { fps } = useVideoConfig();
  let t = p.abertura ? p.abertura.segundos - CRUZA : 0;
  const itens = p.blocos.map((b, i) => {
    const from = Math.round(t * fps);
    const dur = Math.round(b.props.durationInSeconds * fps);
    t += b.props.durationInSeconds;
    return (
      <Sequence key={i} from={from} durationInFrames={dur}>
        {b.tipo === "split" ? <SplitScreen {...b.props} /> : b.tipo === "atras" ? <TextoAtras {...b.props} /> : b.tipo === "case" ? <CaseVoz {...b.props} /> : b.tipo === "explica" ? <Explainer {...b.props} /> : b.tipo === "fakeui" ? <FakeUI {...b.props} /> : <Animacao {...b.props} />}
      </Sequence>
    );
  });
  return (
    <AbsoluteFill style={{ backgroundColor: "#141414" }}>
      {itens}
      {p.abertura ? (
        <Sequence durationInFrames={Math.round(p.abertura.segundos * fps)}>
          <Abertura serie={p.abertura.serie} titulo={p.abertura.titulo} />
        </Sequence>
      ) : null}
      {p.capa ? (
        <Sequence durationInFrames={Math.round(p.capa.segundos * fps)}>
          <CapaInicial src={p.capa.src} segundos={p.capa.segundos} />
        </Sequence>
      ) : null}
      {p.fechamento ? (
        <Sequence from={Math.round(t * fps)} durationInFrames={Math.round(p.fechamento.segundos * fps)}>
          <Fechamento frase={p.fechamento.frase} handle={p.fechamento.handle} selo={p.fechamento.selo} />
        </Sequence>
      ) : null}
    </AbsoluteFill>
  );
};
