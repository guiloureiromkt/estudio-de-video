import { z } from "zod";
import { Audio } from "@remotion/media";
import { AbsoluteFill, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { CaseCard, STAGE } from "../CaseCard/CaseCard";
import { cameraKeyframe } from "../CaseCard/schema";
import { FONT, ESCURO, SEM_NEGRITO_FALSO } from "../tema";

// CaseCard com voz (referência @claudeai): o palco pastel com a janela e a câmera virtual,
// no meio de uma tela vertical da marca. Uma cena por trecho da fala, legenda palavra por palavra embaixo.
export const caseVozSchema = z.object({
  durationInSeconds: z.number().min(1),
  audio: z.string(),
  palavras: z.array(z.object({ text: z.string(), start: z.number(), end: z.number() })),
  wordsPerCard: z.number().int().min(1).max(8),
  serie: z.string(),
  titulo: z.string(), // "*destaque*" sai em magenta
  stageColor: z.string(),
  cenas: z.array(z.object({
    start: z.number(),
    duration: z.number(),
    src: z.string(),
    viewportWidth: z.number(),
    viewportHeight: z.number(),
    nota: z.string().optional(), // ex.: "Reconstituição", aparece sob o palco
    camera: z.array(cameraKeyframe).min(1), // t relativo ao início da cena
  })),
  handle: z.string(),
  selo: z.string(),
});
export type CaseVozProps = z.infer<typeof caseVozSchema>;

const src = (s: string) => (s.startsWith("http") ? s : staticFile(s));
const TOPO = 330; // onde o palco começa na tela vertical

const Titulo: React.FC<{ texto: string }> = ({ texto }) => (
  <>
    {texto.split(/(\*[^*]+\*)/).map((c, i) =>
      c.startsWith("*") ? <span key={i} style={{ color: ESCURO.destaque }}>{c.slice(1, -1)}</span> : <span key={i}>{c}</span>,
    )}
  </>
);

const Legenda: React.FC<Pick<CaseVozProps, "palavras" | "wordsPerCard">> = ({ palavras, wordsPerCard }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const cards: (typeof palavras)[] = [];
  for (let i = 0; i < palavras.length; i += wordsPerCard) cards.push(palavras.slice(i, i + wordsPerCard));
  const card = cards.find((c) => t >= c[0].start - 0.05 && t <= c[c.length - 1].end + 0.25);
  if (!card) return null;
  return (
    <div style={{ position: "absolute", left: 60, right: 60, top: TOPO + STAGE + 70, textAlign: "center", fontFamily: FONT.corpo, fontSize: 52, lineHeight: 1.2, color: ESCURO.texto }}>
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
  );
};

const Nota: React.FC<{ texto: string; dur: number }> = ({ texto, dur }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const o = interpolate(frame / fps, [0, 0.4, dur - 0.3, dur], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: TOPO + STAGE + 14, textAlign: "center", opacity: o }}>
      <span style={{ fontFamily: FONT.display, fontSize: 22, letterSpacing: 4, textTransform: "uppercase", color: ESCURO.olho, border: `1.5px solid ${ESCURO.olho}`, borderRadius: 999, padding: "8px 18px" }}>{texto}</span>
    </div>
  );
};

export const CaseVoz: React.FC<CaseVozProps> = (p) => {
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill style={{ ...SEM_NEGRITO_FALSO, backgroundColor: ESCURO.fundo }}>
      <div style={{ position: "absolute", top: 70, left: 0, right: 0, textAlign: "center" }}>
        <span style={{ fontFamily: FONT.display, fontSize: 22, letterSpacing: 5, textTransform: "uppercase", color: ESCURO.texto, border: `1.5px solid ${ESCURO.destaque}`, background: "rgba(232,24,122,.14)", borderRadius: 999, padding: "10px 22px" }}>{p.serie}</span>
      </div>
      <div style={{ position: "absolute", top: 140, left: 60, right: 60, textAlign: "center", fontFamily: FONT.display, fontSize: 64, lineHeight: 1.05, textTransform: "uppercase", color: ESCURO.texto }}>
        <Titulo texto={p.titulo} />
      </div>
      <div style={{ position: "absolute", top: TOPO, left: 0, width: STAGE, height: STAGE, overflow: "hidden" }}>
        {p.cenas.map((c, i) => (
          <Sequence key={i} from={Math.round(c.start * fps)} durationInFrames={Math.round(c.duration * fps)} layout="none">
            <AbsoluteFill style={{ width: STAGE, height: STAGE }}>
              <CaseCard
                media={{ type: "image", src: c.src, viewportWidth: c.viewportWidth, viewportHeight: c.viewportHeight }}
                durationInSeconds={c.duration}
                stageColor={p.stageColor}
                windowColor="#ffffff"
                caption=""
                handle={p.handle}
                creditPrefix=""
                note=""
                showCursor={false}
                camera={c.camera}
                clicks={[]}
                semFaixa
              />
            </AbsoluteFill>
          </Sequence>
        ))}
      </div>
      {p.cenas.map((c, i) =>
        c.nota ? (
          <Sequence key={`n${i}`} from={Math.round(c.start * fps)} durationInFrames={Math.round(c.duration * fps)} layout="none">
            <Nota texto={c.nota} dur={c.duration} />
          </Sequence>
        ) : null,
      )}
      <Audio src={src(p.audio)} />
      <Legenda palavras={p.palavras} wordsPerCard={p.wordsPerCard} />
      <div style={{ position: "absolute", bottom: 70, left: 60, fontFamily: FONT.display, fontSize: 20, letterSpacing: 4, textTransform: "uppercase", color: ESCURO.olho, border: `1.5px solid ${ESCURO.olho}`, borderRadius: 999, padding: "10px 20px" }}>{p.selo}</div>
      <div style={{ position: "absolute", bottom: 80, right: 60, fontFamily: FONT.display, fontSize: 22, letterSpacing: 3, color: ESCURO.textoApoio }}>@{p.handle}</div>
    </AbsoluteFill>
  );
};
