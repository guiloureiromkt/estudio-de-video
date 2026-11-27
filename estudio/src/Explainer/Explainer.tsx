import { Audio } from "@remotion/media";
import { AbsoluteFill, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Illustration } from "./scenes";
import { C, mono, sans } from "./theme";
import { SEM_NEGRITO_FALSO } from "../tema";
import type { ExplainerProps, Scene } from "./schema";

// "texto normal *destaque*" → palavras com a marca de destaque
const splitCaption = (caption: string) => {
  const words: { text: string; accent: boolean }[] = [];
  caption.split(/(\*[^*]+\*)/).forEach((chunk) => {
    const accent = chunk.startsWith("*") && chunk.endsWith("*");
    chunk
      .replace(/\*/g, "")
      .split(/\s+/)
      .filter(Boolean)
      .forEach((text) => words.push({ text, accent }));
  });
  return words;
};

// A legenda entra palavra por palavra, de cinza-fantasma à cor final; o destaque vai na última linha.
const Caption: React.FC<{ scene: Scene }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const words = splitCaption(scene.caption);
  const times = scene.wordTimes ?? words.map((_, i) => (i * scene.duration * 0.55) / Math.max(1, words.length));
  const firstAccent = words.findIndex((w) => w.accent);
  const render = (list: typeof words, offset: number) =>
    list.map((w, i) => {
      const at = (times[offset + i] ?? 0) * fps;
      const p = interpolate(frame, [at, at + 5], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      if (frame < at - 1) return null;
      return (
        <span key={offset + i} style={{ color: w.accent ? C.accent : C.ink, opacity: 0.2 + 0.8 * p }}>
          {w.text}{" "}
        </span>
      );
    });
  const head = firstAccent === -1 ? words : words.slice(0, firstAccent);
  const tail = firstAccent === -1 ? [] : words.slice(firstAccent);
  return (
    <div style={{ fontFamily: sans, fontSize: 64, lineHeight: 1.12, letterSpacing: -1, textAlign: "center", padding: "0 90px" }}>
      {head.length ? <div>{render(head, 0)}</div> : null}
      {tail.length ? <div>{render(tail, head.length)}</div> : null}
    </div>
  );
};

const SceneView: React.FC<{ scene: Scene; seguida?: boolean }> = ({ scene, seguida }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const total = scene.duration * fps;
  // saída curta (6 quadros) pra a próxima ilustração entrar limpa
  const out = seguida ? 1 : interpolate(frame, [total - 6, total], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ opacity: out }}>
      {/* a cena de mídia ganha mais altura (o vídeo em pé dos clipes precisa), e a legenda desce junto */}
      <div style={{ position: "absolute", top: scene.type === "midia" ? 250 : 380, left: 0, right: 0, height: scene.type === "midia" ? 960 : 700, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Illustration scene={scene} />
      </div>
      {scene.type !== "cta" ? (
        <div style={{ position: "absolute", top: scene.type === "midia" ? 1270 : 1110, left: 0, right: 0 }}>
          <Caption scene={scene} />
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

export const Explainer: React.FC<ExplainerProps> = (props) => {
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill
      style={{
        backgroundColor: C.bg,
        backgroundImage: `radial-gradient(circle at 50% 38%, rgba(255,255,255,.55), transparent 42%), linear-gradient(${C.grid} 1px, transparent 1px), linear-gradient(90deg, ${C.grid} 1px, transparent 1px)`,
        backgroundSize: "100% 100%, 60px 60px, 60px 60px",
        fontFamily: sans,
        ...SEM_NEGRITO_FALSO,
      }}
    >
      {props.audio ? <Audio src={props.audio.startsWith("http") ? props.audio : staticFile(props.audio)} /> : null}
      <div style={{ position: "absolute", top: 100, left: 96, display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{ width: 10, height: 10, backgroundColor: C.accent }} />
        <div style={{ fontFamily: mono, fontSize: 21, letterSpacing: 4, color: C.muted, textTransform: "uppercase" }}>{props.label}</div>
      </div>
      {props.selo ? (
        <div style={{ position: "absolute", top: 86, right: 96, fontFamily: mono, fontSize: 20, letterSpacing: 4, textTransform: "uppercase", color: C.accent, border: `1.5px solid ${C.accent}`, borderRadius: 999, padding: "10px 20px" }}>
          {props.selo}
        </div>
      ) : null}
      <div style={{ position: "absolute", bottom: 90, right: 96, fontFamily: mono, fontSize: 20, letterSpacing: 4, color: C.muted, textTransform: "uppercase" }}>
        @{props.handle}
      </div>
      {props.scenes.map((s, i) => (
        <Sequence key={i} from={Math.round(s.start * fps)} durationInFrames={Math.round(s.duration * fps)} layout="none">
          <SceneView scene={s} seguida={props.scenes[i + 1]?.type === "midia" && (props.scenes[i + 1] as { continua?: boolean }).continua} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
