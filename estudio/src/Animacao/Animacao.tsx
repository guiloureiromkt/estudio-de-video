import { z } from "zod";
import { Audio, Video } from "@remotion/media";
import { AbsoluteFill, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { FONT, ESCURO, SEM_NEGRITO_FALSO } from "../tema";

// Clipes em tela cheia: seus vídeos (ou clipes feitos em outro molde) em sequência, com fusão curta,
// a voz por baixo e a legenda palavra por palavra.
export const animacaoSchema = z.object({
  durationInSeconds: z.number().min(1),
  audio: z.string(),
  clips: z.array(z.object({ src: z.string(), start: z.number(), duration: z.number(), from: z.number().optional() })),
  words: z.array(z.object({ text: z.string(), start: z.number(), end: z.number() })),
  wordsPerCard: z.number().int().min(1).max(8),
  handle: z.string(),
  selo: z.string(),
});
export type AnimacaoProps = z.infer<typeof animacaoSchema>;

const src = (s: string) => (s.startsWith("http") ? s : staticFile(s));
const FUSAO = 0.35;

const Clipe: React.FC<{ c: AnimacaoProps["clips"][number] }> = ({ c }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const d = c.duration * fps;
  const f = FUSAO * fps;
  const opacity = interpolate(frame, [0, f, d - f, d], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  // leve empurrão de câmera pra não parecer parado
  const zoom = interpolate(frame, [0, d], [1.0, 1.06]);
  return (
    <AbsoluteFill style={{ opacity }}>
      <Video
        src={src(c.src)}
        muted
        trimBefore={Math.round((c.from ?? 0) * fps)}
        // o <Video> do @remotion/media ignora objectFit: largura cheia + centro vertical faz o "cover"
        // (clipe 9:16 numa tela 9:16 ou 4:5)
        style={{ position: "absolute", left: 0, width: "100%", height: "auto", top: "50%", transform: `translateY(-50%) scale(${zoom})` }}
      />
    </AbsoluteFill>
  );
};

const Legenda: React.FC<Pick<AnimacaoProps, "words" | "wordsPerCard">> = ({ words, wordsPerCard }) => {
  const frame = useCurrentFrame();
  const { fps, height } = useVideoConfig();
  const t = frame / fps;
  const cards: (typeof words)[] = [];
  for (let i = 0; i < words.length; i += wordsPerCard) cards.push(words.slice(i, i + wordsPerCard));
  const card = cards.find((c) => t >= c[0].start - 0.05 && t <= c[c.length - 1].end + 0.25);
  if (!card) return null;
  return (
    <div style={{ position: "absolute", left: 0, right: 0, bottom: Math.round(height * 0.156), display: "flex", justifyContent: "center" }}>
      <div
        style={{
          maxWidth: 900,
          padding: "18px 30px",
          borderRadius: 18,
          backgroundColor: "rgba(14,10,28,.82)",
          border: `1px solid ${ESCURO.fio}`,
          fontFamily: FONT.corpo,
          fontWeight: 700,
          fontSize: 54,
          lineHeight: 1.15,
          textAlign: "center",
          color: ESCURO.texto,
        }}
      >
        {card.map((w, i) => {
          const on = t >= w.start && t <= w.end + 0.08;
          return (
            <span key={i} style={{ color: on ? ESCURO.destaque : undefined }}>
              {w.text}
              {i < card.length - 1 ? " " : ""}
            </span>
          );
        })}
      </div>
    </div>
  );
};

export const Animacao: React.FC<AnimacaoProps> = (p) => {
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill style={{ ...SEM_NEGRITO_FALSO, backgroundColor: ESCURO.fundo }}>
      {p.clips.map((c, i) => (
        <Sequence key={i} from={Math.round(c.start * fps)} durationInFrames={Math.round(c.duration * fps)}>
          <Clipe c={c} />
        </Sequence>
      ))}
      <Audio src={src(p.audio)} />
      <Legenda words={p.words} wordsPerCard={p.wordsPerCard} />
      <div style={{ position: "absolute", top: 90, left: 60, fontFamily: FONT.display, fontSize: 20, letterSpacing: 4, textTransform: "uppercase", color: ESCURO.olho, border: `1.5px solid ${ESCURO.olho}`, borderRadius: 999, padding: "10px 20px" }}>
        {p.selo}
      </div>
      <div style={{ position: "absolute", bottom: 90, right: 60, fontFamily: FONT.display, fontSize: 22, letterSpacing: 3, color: ESCURO.textoApoio }}>@{p.handle}</div>
    </AbsoluteFill>
  );
};
