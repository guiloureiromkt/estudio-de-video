import { Video } from "@remotion/media";
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import type { SplitScreenProps } from "./schema";
import { FONT, ESCURO, SEM_NEGRITO_FALSO } from "../tema";

const fontFamily = FONT.titulo;
const mono = FONT.mono;

// Tela dividida (referência: @leobeckerdesign DctHkgRzWaF, @obrunookamoto DdaQgargxpK):
// tela em cima, pessoa embaixo, emenda em degradê e legenda na costura.
const W = 1080;
// altura da tela de cima: metade no 9:16; no 4:5 (carrossel) a tela ganha um pouco mais que a pessoa
const alturaTopo = (h: number) => (h / W > 1.6 ? h / 2 : Math.round(h * 0.56));
const SEAM = 220; // altura do degradê que funde as duas metades

const src = (s: string) => (s.startsWith("http") ? s : staticFile(s));

const Captions: React.FC<Pick<SplitScreenProps, "words" | "wordsPerCard" | "accent" | "skin">> = ({ words, wordsPerCard, accent, skin }) => {
  const marca = skin === "marca";
  const frame = useCurrentFrame();
  const { fps, height } = useVideoConfig();
  const HALF = alturaTopo(height);
  const t = frame / fps;
  // agrupa as palavras em cartões de N; o cartão ativo é o que contém o tempo atual
  const cards: (typeof words)[] = [];
  for (let i = 0; i < words.length; i += wordsPerCard) cards.push(words.slice(i, i + wordsPerCard));
  const card = cards.find((c) => t >= c[0].start - 0.05 && t <= c[c.length - 1].end + 0.25);
  if (!card) return null;
  const pop = interpolate(t, [card[0].start - 0.05, card[0].start + 0.1], [0.85, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div
      style={{
        position: "absolute",
        top: HALF - 64,
        left: 0,
        right: 0,
        display: "flex",
        justifyContent: "center",
        transform: `scale(${pop})`,
      }}
    >
      <div
        style={{
          maxWidth: 900,
          padding: "18px 30px",
          borderRadius: 18,
          backgroundColor: marca ? "rgba(14,10,28,.86)" : "rgba(10,10,12,.82)",
          border: `1px solid ${marca ? ESCURO.fio : "rgba(255,255,255,.12)"}`,
          fontFamily: marca ? FONT.corpo : fontFamily,
          fontWeight: marca ? 700 : 800,
          fontSize: 54,
          lineHeight: 1.15,
          textAlign: "center",
          color: marca ? ESCURO.texto : "#F5F2EC",
          letterSpacing: marca ? 0 : -0.5,
        }}
      >
        {card.map((w, i) => {
          const on = t >= w.start && t <= w.end + 0.08;
          return (
            <span key={i} style={{ color: on ? accent : undefined, fontWeight: on && marca ? 700 : undefined }}>
              {w.text}
              {i < card.length - 1 ? " " : ""}
            </span>
          );
        })}
      </div>
    </div>
  );
};

export const SplitScreen: React.FC<SplitScreenProps> = (p) => {
  const frame = useCurrentFrame();
  const { durationInFrames, height } = useVideoConfig();
  const HALF = alturaTopo(height);
  const BAIXO = height - HALF;
  const scroll = interpolate(frame, [0, durationInFrames], [p.top.scrollFrom, p.top.scrollTo], { extrapolateRight: "clamp" });
  // o rosto fica na parte de baixo: desloca o vídeo 9:16 pra que focusY caia no centro dela
  // no 4:5 a parte de baixo é menor: o zoom encolhe junto (nunca abaixo da largura cheia)
  // e o rosto centra na área visível abaixo da costura
  const noveDezesseis = height / W > 1.6;
  const zoom = noveDezesseis ? p.bottom.zoom : Math.max(1, (p.bottom.zoom * BAIXO) / 960);
  const centro = noveDezesseis ? BAIXO / 2 : (BAIXO + SEAM / 2) / 2;
  const bottomH = ((W * 16) / 9) * zoom; // proporção do vídeo do avatar, não da tela
  const offsetY = Math.min(0, Math.max(BAIXO - bottomH, centro - p.bottom.focusY * bottomH));
  const offsetX = (W - W * zoom) / 2;
  return (
    <AbsoluteFill style={{ ...(p.skin === "marca" ? SEM_NEGRITO_FALSO : {}), backgroundColor: p.skin === "marca" ? ESCURO.fundo : "#0A0A0C" }}>
      <div style={{ position: "absolute", top: 0, left: 0, width: W, height: HALF, overflow: "hidden" }}>
        {p.top.type === "image" ? (
          <Img src={src(p.top.src)} style={{ position: "absolute", left: 0, top: -scroll, width: W }} />
        ) : (
          // o <Video> do @remotion/media ignora objectFit: cover; largura cheia + centro vertical faz o corte
          <Video
            src={src(p.top.src)}
            muted
            style={{ position: "absolute", left: 0, width: W, height: "auto", top: "50%", transform: "translateY(-50%)" }}
          />
        )}
      </div>
      <div style={{ position: "absolute", top: HALF, left: 0, width: W, height: BAIXO, overflow: "hidden" }}>
        <div style={{ position: "absolute", left: offsetX, top: offsetY, width: W * zoom, height: bottomH }}>
          <Video src={src(p.bottom.src)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </div>
      </div>
      {/* costura: a tela se dissolve no escuro e o escuro se dissolve na pessoa */}
      <div
        style={{
          position: "absolute",
          top: HALF - SEAM / 2,
          left: 0,
          width: W,
          height: SEAM,
          background: p.skin === "marca"
            ? "linear-gradient(180deg, rgba(20,20,20,0) 0%, rgba(20,20,20,.94) 45%, rgba(20,20,20,.94) 55%, rgba(20,20,20,0) 100%)"
            : "linear-gradient(180deg, rgba(10,10,12,0) 0%, rgba(10,10,12,.92) 45%, rgba(10,10,12,.92) 55%, rgba(10,10,12,0) 100%)",
        }}
      />
      <Captions words={p.words} wordsPerCard={p.wordsPerCard} accent={p.accent} skin={p.skin} />
      {p.selo ? (
        <div style={{ position: "absolute", top: 90, left: 60, fontFamily: FONT.display, fontSize: 20, letterSpacing: 4, textTransform: "uppercase", color: ESCURO.olho, border: `1.5px solid ${ESCURO.olho}`, borderRadius: 999, padding: "10px 20px" }}>
          {p.selo}
        </div>
      ) : null}
      {p.handle ? (
        <div style={{ position: "absolute", bottom: 70, right: 60, fontFamily: p.skin === "marca" ? FONT.display : mono, fontSize: 22, letterSpacing: 3, color: p.skin === "marca" ? ESCURO.textoApoio : "rgba(255,255,255,.7)" }}>
          @{p.handle}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};
