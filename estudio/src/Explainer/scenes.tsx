import { Img, OffthreadVideo, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { C, mono } from "./theme";
import { MARCA, RGB } from "../tema";
import type { Icon, Scene } from "./schema";

// Relógio local da cena: segundos desde o início dela.
const useT = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return { t: frame / fps, frame, fps };
};

const appear = (frame: number, fps: number, delaySec: number) =>
  spring({ frame: frame - delaySec * fps, fps, config: { damping: 200 }, durationInFrames: Math.round(0.45 * fps) });

const Spark: React.FC<{ size: number; color?: string }> = ({ size, color = C.accent }) => (
  <svg width={size} height={size} viewBox="-50 -50 100 100">
    {Array.from({ length: 12 }).map((_, i) => (
      <rect
        key={i}
        x={-4}
        y={-44}
        width={8}
        height={i % 2 ? 34 : 44}
        rx={4}
        fill={color}
        transform={`rotate(${i * 30})`}
      />
    ))}
  </svg>
);

export const IconTile: React.FC<{ icon: Icon; size: number; glow?: number }> = ({ icon, size, glow = 0 }) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: size * 0.24,
      backgroundColor: icon.dark ? C.card : "transparent",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      boxShadow: icon.dark
        ? `0 18px 40px rgba(${RGB.escuro},.22), 0 0 0 ${3 * glow}px ${C.accent}, 0 0 ${36 * glow}px rgba(${C.accentRgb},${0.45 * glow})`
        : "none",
    }}
  >
    {icon.kind === "spark" ? (
      <Spark size={size * 0.55} />
    ) : icon.kind === "emoji" ? (
      <span style={{ fontSize: size * 0.52, lineHeight: 1 }}>{icon.value}</span>
    ) : (
      <span style={{ fontFamily: mono, fontWeight: 700, fontSize: size * 0.2, color: icon.dark ? C.cardText : C.ink, letterSpacing: 2 }}>
        {icon.value}
      </span>
    )}
  </div>
);

const MonoLabel: React.FC<{ children: React.ReactNode; color?: string; size?: number; style?: React.CSSProperties }> = ({
  children,
  color = C.accent,
  size = 22,
  style,
}) => (
  <div style={{ fontFamily: mono, fontSize: size, letterSpacing: size * 0.18, textTransform: "uppercase", color, ...style }}>
    {children}
  </div>
);

// Cartão cinza-claro que imita uma peça gerada (carrossel, anúncio): só blocos, sem texto real.
const Skeleton: React.FC<{ w: number; h: number; tone: string; delay: number }> = ({ w, h, tone, delay }) => {
  const { frame, fps } = useT();
  const s = appear(frame, fps, delay);
  return (
    <div
      style={{
        width: w,
        height: h,
        borderRadius: 10,
        backgroundColor: tone,
        padding: w * 0.09,
        boxSizing: "border-box",
        opacity: s,
        transform: `scale(${0.85 + 0.15 * s})`,
        display: "flex",
        flexDirection: "column",
        gap: h * 0.05,
        justifyContent: "flex-end",
      }}
    >
      <div style={{ height: h * 0.06, width: "80%", borderRadius: 4, backgroundColor: "rgba(0,0,0,.55)" }} />
      <div style={{ height: h * 0.06, width: "55%", borderRadius: 4, backgroundColor: C.accent }} />
      <div style={{ height: h * 0.035, width: "70%", borderRadius: 4, backgroundColor: "rgba(0,0,0,.2)" }} />
    </div>
  );
};

const Terminal: React.FC<{ scene: Extract<Scene, { type: "terminal" }> }> = ({ scene }) => {
  const { t, frame, fps } = useT();
  const typed = Math.floor(interpolate(t, [0.15, 0.15 + scene.prompt.length * 0.03], [0, scene.prompt.length], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  }));
  const statusAt = 0.25 + scene.prompt.length * 0.03;
  const statusOn = t > statusAt;
  const resultAt = statusAt + 0.35;
  const fail = scene.result === "fail" ? appear(frame, fps, resultAt + 0.45) : 0;
  const tones = C.fotos;
  return (
    <div style={{ width: 760, borderRadius: 26, backgroundColor: C.card, boxShadow: `0 30px 70px rgba(${RGB.escuro},.28)`, overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "22px 28px", borderBottom: `1px solid ${C.cardLine}` }}>
        <div style={{ width: 14, height: 14, borderRadius: 7, backgroundColor: C.accent }} />
        <MonoLabel color={C.cardText} size={20}>{scene.title}</MonoLabel>
      </div>
      <div style={{ padding: "26px 28px 30px", minHeight: 360, boxSizing: "border-box" }}>
        <div style={{ fontFamily: mono, fontSize: 24, color: C.cardText, padding: "14px 18px", borderRadius: 10, border: `1px solid ${C.cardLine}` }}>
          <span style={{ color: C.accent }}>{"> "}</span>
          {scene.prompt.slice(0, typed)}
          <span style={{ opacity: frame % 20 < 10 ? 1 : 0 }}>▍</span>
        </div>
        {statusOn ? (
          <div style={{ fontFamily: mono, fontSize: 19, color: C.muted, marginTop: 18 }}>
            <span style={{ color: C.accent }}>● </span>
            {scene.status}
          </div>
        ) : null}
        {scene.result !== "none" && t > resultAt ? (
          scene.result === "grid" ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginTop: 22 }}>
              {tones.map((tone, i) => (
                <Skeleton key={i} w={220} h={150} tone={tone} delay={resultAt + i * 0.12} />
              ))}
            </div>
          ) : (
            <div style={{ position: "relative", width: 250, margin: "22px auto 0" }}>
              <Skeleton w={250} h={300} tone={C.fotos[0]} delay={resultAt} />
              <svg width={250} height={300} style={{ position: "absolute", left: 0, top: 0, opacity: fail }}>
                <rect width={250} height={300} rx={10} fill={`rgba(${RGB.escuro},.45)`} />
                <path d="M40 40 L210 260 M210 40 L40 260" stroke={C.accent} strokeWidth={10} strokeLinecap="round" />
              </svg>
            </div>
          )
        ) : null}
      </div>
    </div>
  );
};

const Plug: React.FC = () => (
  <svg width={150} height={110} viewBox="0 0 150 110">
    <path d="M0 80 C 40 110, 70 90, 78 62" stroke={C.ink} strokeWidth={6} fill="none" strokeLinecap="round" />
    <rect x={62} y={28} width={44} height={44} rx={8} fill={C.ink} />
    <rect x={106} y={38} width={26} height={7} rx={3} fill={C.muted} />
    <rect x={106} y={55} width={26} height={7} rx={3} fill={C.muted} />
  </svg>
);

const Pair: React.FC<{ scene: Extract<Scene, { type: "pair" }> }> = ({ scene }) => {
  const { frame, fps } = useT();
  const a = appear(frame, fps, 0);
  const b = appear(frame, fps, 0.25);
  const slide = interpolate(b, [0, 1], [60, 0]);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 26 }}>
      <div style={{ opacity: a, transform: `scale(${0.8 + 0.2 * a})` }}>
        <IconTile icon={scene.left} size={260} />
      </div>
      {scene.symbol === "plug" ? (
        <div style={{ opacity: b, transform: `translateX(${-slide}px)` }}>
          <Plug />
        </div>
      ) : (
        <div style={{ fontFamily: mono, fontSize: 90, color: C.ink, opacity: b }}>{scene.symbol}</div>
      )}
      <div style={{ opacity: b, transform: `translateX(${slide}px) scale(${0.85 + 0.15 * b})` }}>
        <IconTile icon={scene.right} size={300} />
      </div>
    </div>
  );
};

const Flow: React.FC<{ scene: Extract<Scene, { type: "flow" }> }> = ({ scene }) => {
  const { t, frame, fps } = useT();
  const nodes = [appear(frame, fps, 0), appear(frame, fps, 0.2), appear(frame, fps, 0.4)];
  const line = interpolate(t, [0.6, 1.1], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const ok = appear(frame, fps, 1.2);
  const dots = Math.floor(interpolate(t, [0.5, 1.2], [0, 12], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
  const Node = ({ i, children }: { i: number; children: React.ReactNode }) => (
    <div style={{ opacity: nodes[i], transform: `translateY(${(1 - nodes[i]) * 30}px)` }}>{children}</div>
  );
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 26 }}>
      <div style={{ display: "flex", alignItems: "center" }}>
        <Node i={0}>
          <IconTile icon={scene.left} size={200} glow={ok} />
        </Node>
        <div style={{ width: 34, height: 4, backgroundColor: C.accent, transform: `scaleX(${line})`, transformOrigin: "left" }} />
        <Node i={1}>
          <div
            style={{
              width: 300,
              padding: "26px 26px",
              borderRadius: 18,
              backgroundColor: C.card,
              boxShadow: `0 18px 40px rgba(${RGB.escuro},.22), 0 0 0 ${3 * ok}px ${C.accent}`,
            }}
          >
            <MonoLabel color={C.muted} size={17}>{scene.kicker}</MonoLabel>
            <div style={{ fontFamily: mono, fontWeight: 700, fontSize: 26, color: C.cardText, marginTop: 12, letterSpacing: 2 }}>
              {scene.title}
            </div>
            <div style={{ fontFamily: mono, fontSize: 22, color: C.accent, marginTop: 14, letterSpacing: 6 }}>
              {"•".repeat(dots)}
            </div>
          </div>
        </Node>
        <div style={{ width: 34, height: 4, backgroundColor: C.accent, transform: `scaleX(${line})`, transformOrigin: "left" }} />
        <Node i={2}>
          <IconTile icon={scene.right} size={200} glow={ok} />
        </Node>
      </div>
      <div style={{ display: "flex", width: 740, justifyContent: "space-between" }}>
        <MonoLabel style={{ opacity: nodes[0] }}>{scene.leftLabel}</MonoLabel>
        <MonoLabel style={{ opacity: nodes[2] }}>{scene.rightLabel}</MonoLabel>
      </div>
      <MonoLabel style={{ opacity: ok }}>{scene.status}</MonoLabel>
    </div>
  );
};

const Fan: React.FC<{ scene: Extract<Scene, { type: "fan" }> }> = ({ scene }) => {
  const { frame, fps } = useT();
  const n = scene.cards.length;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 34 }}>
      <div style={{ position: "relative", width: 820, height: 330 }}>
        {scene.cards.map((tone, i) => {
          const s = appear(frame, fps, i * 0.35);
          const x = (i - (n - 1) / 2) * 250;
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: 410 - 130 + x * s,
                top: 20,
                opacity: s,
                transform: `rotate(${(i - (n - 1) / 2) * 4 * s}deg)`,
                filter: `drop-shadow(0 18px 30px rgba(${RGB.escuro},.25))`,
              }}
            >
              <Skeleton w={260} h={300} tone={tone} delay={i * 0.35} />
            </div>
          );
        })}
      </div>
      <div style={{ display: "flex", gap: 16 }}>
        {scene.pills.map((p, i) => {
          const s = appear(frame, fps, 0.2 + i * 0.35);
          return (
            <div
              key={p}
              style={{
                opacity: s,
                transform: `scale(${0.7 + 0.3 * s})`,
                backgroundColor: C.accent,
                color: MARCA.branco,
                borderRadius: 40,
                padding: "10px 24px",
                fontFamily: mono,
                fontWeight: 700,
                fontSize: 19,
                letterSpacing: 3,
                textTransform: "uppercase",
              }}
            >
              {p}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const Cta: React.FC<{ scene: Extract<Scene, { type: "cta" }> }> = ({ scene }) => {
  const { t, frame, fps } = useT();
  const w = appear(frame, fps, 0);
  const sub = appear(frame, fps, 0.5);
  const bubble = appear(frame, fps, 0.9);
  const sent = t > 1.9;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <MonoLabel color={C.muted} size={26} style={{ letterSpacing: 12, opacity: w }}>{scene.kicker}</MonoLabel>
      <div
        style={{
          fontWeight: 800,
          fontSize: 300,
          letterSpacing: -8,
          color: C.accent,
          lineHeight: 1,
          marginTop: 14,
          opacity: w,
          transform: `scale(${1.15 - 0.15 * w})`,
          filter: `blur(${(1 - w) * 12}px)`,
        }}
      >
        {scene.word}
      </div>
      <div style={{ fontSize: 30, fontWeight: 500, color: C.ink, marginTop: 20, opacity: sub }}>{scene.sub}</div>
      <div
        style={{
          marginTop: 44,
          width: 470,
          padding: "26px 30px",
          borderRadius: 22,
          backgroundColor: C.card,
          boxShadow: `0 24px 50px rgba(${RGB.escuro},.25)`,
          opacity: bubble,
          transform: `translateY(${(1 - bubble) * 30}px)`,
          display: "flex",
          gap: 22,
          alignItems: "center",
          position: "relative",
        }}
      >
        <div style={{ border: `2px solid ${C.accent}`, borderRadius: 8, padding: "8px 12px" }}>
          <MonoLabel color={C.muted} size={12}>{scene.bubbleKicker}</MonoLabel>
        </div>
        <div>
          <div style={{ fontFamily: mono, fontWeight: 700, fontSize: 24, color: C.cardText, opacity: sent ? 1 : 0.15 }}>
            {scene.bubbleTitle}
          </div>
          <MonoLabel size={16} style={{ marginTop: 6, opacity: sent ? 1 : 0 }}>{scene.bubbleStatus}</MonoLabel>
        </div>
        <div style={{ position: "absolute", left: 36, bottom: -14, width: 28, height: 28, backgroundColor: C.card, transform: "rotate(45deg)" }} />
      </div>
    </div>
  );
};

const arquivo = (s: string) => (s.startsWith("http") ? s : staticFile(s));

// Imagem ou vídeo real num cartão escuro com sombra, empurrão lento de câmera; ou um número grande.
const Midia: React.FC<{ scene: Extract<Scene, { type: "midia" }> }> = ({ scene }) => {
  const { t, frame, fps } = useT();
  const s = scene.continua ? 1 : appear(frame, fps, 0.05);
  const kick = scene.continua ? 1 : appear(frame, fps, 0.25);
  if (!scene.src) {
    return (
      <div style={{ textAlign: "center", opacity: s, transform: `scale(${0.8 + 0.2 * s})` }}>
        {scene.kicker ? <MonoLabel size={24} style={{ marginBottom: 24, opacity: kick }}>{scene.kicker}</MonoLabel> : null}
        <div style={{ fontFamily: mono, fontSize: 210, lineHeight: 1, letterSpacing: -4, color: C.accent }}>{scene.numero}</div>
        {scene.sub ? <div style={{ fontFamily: mono, fontSize: 30, letterSpacing: 5, color: C.muted, marginTop: 28, textTransform: "uppercase" }}>{scene.sub}</div> : null}
      </div>
    );
  }
  const ratio = scene.proporcao ?? 1;
  // cabe em 900 × 880 (a área da cena de mídia tem 960 de altura, e o rótulo ocupa o resto)
  const largura = Math.min(scene.largura ?? 900, 900, 880 * ratio);
  const altura = largura / ratio;
  const zoom = 1 + 0.008 * ((scene.z0 ?? 0) + t); // ritmo fixo por segundo: a cena que continua não dá salto
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 22 }}>
      {scene.kicker ? <MonoLabel size={24} style={{ opacity: kick, transform: `translateY(${(1 - kick) * 12}px)` }}>{scene.kicker}</MonoLabel> : null}
      <div
        style={{
          width: largura,
          height: altura,
          borderRadius: 26,
          overflow: "hidden",
          backgroundColor: C.card,
          boxShadow: `0 30px 70px rgba(${RGB.escuro},.30)`,
          opacity: s,
          transform: `translateY(${(1 - s) * 40}px) scale(${0.92 + 0.08 * s})`,
        }}
      >
        <div style={{ width: "100%", height: "100%", transform: `scale(${zoom})` }}>
          {scene.video ? (
            <OffthreadVideo src={arquivo(scene.src)} muted startFrom={Math.round((scene.from ?? 0) * fps)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            <Img src={arquivo(scene.src)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          )}
        </div>
      </div>
    </div>
  );
};

export const Illustration: React.FC<{ scene: Scene }> = ({ scene }) => {
  switch (scene.type) {
    case "terminal":
      return <Terminal scene={scene} />;
    case "pair":
      return <Pair scene={scene} />;
    case "flow":
      return <Flow scene={scene} />;
    case "fan":
      return <Fan scene={scene} />;
    case "cta":
      return <Cta scene={scene} />;
    case "midia":
      return <Midia scene={scene} />;
  }
};
